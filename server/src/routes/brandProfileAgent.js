import { Router } from 'express';
import { randomBytes } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import * as cheerio from 'cheerio';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import supabase from '../lib/supabase.js';

const router = Router();

// Rate limit: 10 requests per hour per user for agent endpoints
const agentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.clerkUserId || req.ip,
  message: { error: 'Too many requests. Please try again later.' },
});
router.use(agentLimiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Prompt files live at repo root: agents/brand_profiles/
const PROMPTS_DIR = path.join(__dirname, '../../../agents/brand_profiles');

// Strip markdown comment lines (lines beginning with #) from prompt files
function stripComments(text) {
  return text
    .split('\n')
    .filter(line => !line.trimStart().startsWith('#'))
    .join('\n')
    .trim();
}

// Fetch a URL and extract readable text + meta tags using cheerio.
// Returns content even if body text is thin (meta tags alone are useful).
// Throws with a user-facing message only if the page is completely unreachable.
async function scrapeWebsite(url) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Post365Bot/1.0; +https://post365.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(`Could not reach ${url}. Check the URL and try again.`);
  }

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}. Check the URL and try again.`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract meta tags from <head> — present even on JS-rendered SPAs
  const metaTitle       = $('title').first().text().trim();
  const metaDesc        = $('meta[name="description"]').attr('content') || '';
  const ogTitle         = $('meta[property="og:title"]').attr('content') || '';
  const ogDesc          = $('meta[property="og:description"]').attr('content') || '';
  const ogSiteName      = $('meta[property="og:site_name"]').attr('content') || '';
  const twitterTitle    = $('meta[name="twitter:title"]').attr('content') || '';
  const twitterDesc     = $('meta[name="twitter:description"]').attr('content') || '';

  const metaSection = [
    metaTitle    && `Title: ${metaTitle}`,
    ogSiteName   && `Site name: ${ogSiteName}`,
    ogTitle      && ogTitle !== metaTitle && `OG title: ${ogTitle}`,
    metaDesc     && `Meta description: ${metaDesc}`,
    ogDesc       && ogDesc !== metaDesc && `OG description: ${ogDesc}`,
    twitterTitle && twitterTitle !== ogTitle && `Twitter title: ${twitterTitle}`,
    twitterDesc  && twitterDesc !== ogDesc && `Twitter description: ${twitterDesc}`,
  ].filter(Boolean).join('\n');

  // Extract visible body text
  $('script, style, noscript, iframe, svg, nav, footer, header, [aria-hidden="true"]').remove();
  const bodyText = $('body').text()
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const combined = [
    metaSection && `=== Page meta ===\n${metaSection}`,
    bodyText    && `=== Page content ===\n${bodyText}`,
  ].filter(Boolean).join('\n\n');

  if (!combined || combined.length < 50) {
    throw new Error(`No readable content found at ${url}. The page may require JavaScript or block bots.`);
  }

  // Cap at ~40 000 chars to stay within context limits
  return combined.slice(0, 40000);
}

// Scrape multiple URLs in parallel. Returns a single text block with each
// URL's content labelled. Continues even if individual URLs fail — failed
// URLs are noted inline so the LLM knows which pages were skipped.
async function scrapeAll(urls) {
  const results = await Promise.allSettled(urls.map(u => scrapeWebsite(u)));

  const sections = results.map((r, i) => {
    const label = `### Page ${i + 1}: ${urls[i]}`;
    if (r.status === 'fulfilled') return `${label}\n\n${r.value}`;
    return `${label}\n\n[Could not retrieve content: ${r.reason?.message || 'unknown error'}]`;
  });

  // At least one page must have succeeded
  const anySuccess = results.some(r => r.status === 'fulfilled');
  if (!anySuccess) {
    const msgs = results.map((r, i) => `${urls[i]}: ${r.reason?.message || 'failed'}`);
    throw new Error(msgs.join(' | '));
  }

  return sections.join('\n\n---\n\n');
}

// Call Claude Sonnet 4.6 — no tools needed since website content is pre-scraped.
async function runAgent(client, systemPrompt, userPrompt) {
  const stream = client.messages.stream({
    model:      'claude-sonnet-4-6',
    max_tokens: 100000,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userPrompt }],
  });
  const response = await stream.finalMessage();

  const text = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  if (!text) throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
  return text;
}

function generateSlug() {
  return randomBytes(8).toString('hex');
}

async function upsertUser(clerkUserId) {
  const { error } = await supabase
    .from('users')
    .upsert({ clerk_user_id: clerkUserId }, { onConflict: 'clerk_user_id' });
  if (error) throw error;
}

// Map agent JSON result to brand_profiles column shapes
function mapResultToColumns(result, url) {
  const ba = result.business_analysis || {};
  return {
    name:              ba.company_name      || '',
    website:           url,
    industry:          ba.industry          || '',
    founded_year:      ba.founded_year      || null,
    summary:           ba.summary           || '',
    problem:           ba.problem           || '',
    solution:          ba.solution          || '',
    usps:              ba.usp               || '',
    value_proposition: ba.value_proposition || '',
    primary_keywords:  (result.primary_keywords || []).map(k => ({
      id: k.number, keyword: k.primary_keyword, volume: k.volume, difficulty: k.difficulty, reason: k.reason_for_selection,
    })),
    related_keywords:  (result.related_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, relatedKeyword: k.related_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    lsi_keywords:      (result.lsi_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, lsiKeyword: k.lsi_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    longtail_keywords: (result.long_tail_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, longtailKeyword: k.long_tail_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    llm_questions:     (result.key_llm_questions || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, llmQuestion: k.key_llm_question, volume: k.volume, difficulty: k.difficulty,
    })),
    blog_themes:       (result.blog_themes || []).map(t => ({
      id:             t.number,
      primaryKeyword: (t.primary_keywords_included || [])[0] || '',
      theme:          t.blog_theme,
      summary:        t.blog_theme_summary,
      date:           new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      keywords: {
        primary:      t.primary_keywords_included   || [],
        related:      t.related_keywords_included   || [],
        lsi:          t.lsi_keywords_included       || [],
        longtail:     t.long_tail_keywords_included || [],
        llmQuestions: t.key_llm_questions_included  || [],
      },
    })),
    agent_raw_output:  result,
  };
}

// POST /api/brand-profile-agent/scan
// Body: { urls: string[] }  — array of one or more validated URLs
// Protected: requires valid Clerk JWT via requireAuth middleware.
router.post('/scan', requireAuth, async (req, res) => {
  const { urls } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: 'At least one valid URL is required.' });
  }

  // Validate and normalise each URL
  const parsedUrls = [];
  for (const raw of urls) {
    if (!raw || typeof raw !== 'string' || raw.trim() === '') continue;
    try {
      const p = new URL(raw.trim());
      if (!['http:', 'https:'].includes(p.protocol)) throw new Error('bad protocol');

      // SSRF protection: block private/internal IPs and localhost
      const hostname = p.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname === '0.0.0.0' ||
        hostname.endsWith('.local') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('169.254.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
      ) {
        return res.status(400).json({ error: 'URLs pointing to internal or private networks are not allowed.' });
      }

      parsedUrls.push(p.toString());
    } catch {
      return res.status(400).json({ error: `Invalid URL: ${raw}. Must be a valid http or https address.` });
    }
  }

  if (parsedUrls.length === 0) {
    return res.status(400).json({ error: 'At least one valid URL is required.' });
  }

  try {
    // Step 1: Scrape all URLs in parallel — fail fast only if ALL fail
    let websiteContent;
    try {
      websiteContent = await scrapeAll(parsedUrls);
    } catch (scrapeErr) {
      return res.status(422).json({ error: scrapeErr.message });
    }

    // Step 2: Load and clean prompt files in parallel
    const [rawSystem, rawUser] = await Promise.all([
      readFile(path.join(PROMPTS_DIR, 'system_prompt.md'), 'utf-8'),
      readFile(path.join(PROMPTS_DIR, 'user_prompt.md'),   'utf-8'),
    ]);

    const currentYear  = new Date().getFullYear().toString();
    const systemPrompt = stripComments(rawSystem)
      .replaceAll('{{CURRENT_YEAR}}', currentYear);
    const userPrompt   = stripComments(rawUser)
      .replace('{{WEBSITE_CONTENT}}', websiteContent)
      .replaceAll('{{CURRENT_YEAR}}', currentYear);

    // Step 3: Run the LLM agent
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const rawText = await runAgent(client, systemPrompt, userPrompt);

    // Extract the JSON object from the model's response
    const match = rawText.match(/\{[\s\S]*\}/);
    if (!match) {
      return res.status(502).json({ error: 'Agent did not return valid JSON. Please try again.' });
    }

    const result = JSON.parse(match[0]);

    // Persist to DB immediately — data is never lost even if user closes the browser
    let profileSlug = null;
    try {
      await upsertUser(req.clerkUserId);
      const slug = generateSlug();
      const columns = mapResultToColumns(result, parsedUrls[0]);
      const { error: dbError } = await supabase
        .from('brand_profiles')
        .insert({
          clerk_user_id:   req.clerkUserId,
          slug,
          status:          'draft',
          steps_completed: 0,
          ...columns,
        });
      if (!dbError) profileSlug = slug;
      else console.error('[brand-profile-agent] DB insert failed:', dbError.code);
    } catch (dbErr) {
      console.error('[brand-profile-agent] DB error:', dbErr.code || dbErr.message);
    }

    return res.json({ result, profileSlug });

  } catch (err) {
    console.error('[brand-profile-agent] Failed:', err.code || err.message);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Agent configuration error. Please contact support.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Agent failed to complete. Please try again.' });
  }
});

export default router;
