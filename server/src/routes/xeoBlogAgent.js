import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Prompt files live at repo root: agents/xeo_blogs/
const PROMPTS_DIR = path.join(__dirname, '../../../agents/xeo_blogs');

// Strip markdown comment lines (lines beginning with #) from prompt files
function stripComments(text) {
  return text
    .split('\n')
    .filter(line => !line.trimStart().startsWith('#'))
    .join('\n')
    .trim();
}

// Attempt to repair truncated JSON by closing open brackets/braces
function repairJson(raw) {
  try { return JSON.parse(raw); } catch {}
  let fixed = raw;
  // Remove trailing comma before closing bracket/brace
  fixed = fixed.replace(/,\s*$/, '');
  // Count open vs close for [] and {}
  let braces = 0, brackets = 0, inString = false, escaped = false;
  for (const ch of fixed) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }
  // Close any unterminated string
  if (inString) fixed += '"';
  // Append missing closers
  while (brackets > 0) { fixed += ']'; brackets--; }
  while (braces > 0)   { fixed += '}'; braces--; }
  return JSON.parse(fixed);
}

// POST /api/xeo-blog-agent/generate
// Body: { theme, topic, keywords, llmQuestions, checklists }
router.post('/generate', requireAuth, async (req, res) => {
  const { theme, topic, keywords, llmQuestions, checklists } = req.body;

  // Validate required fields
  if (!theme?.name || !topic?.name) {
    return res.status(400).json({ error: 'Theme name and topic name are required.' });
  }

  try {
    // Load and clean prompt files in parallel
    const [rawSystem, rawUser] = await Promise.all([
      readFile(path.join(PROMPTS_DIR, 'individual_system_prompt.md'), 'utf-8'),
      readFile(path.join(PROMPTS_DIR, 'individual_user_prompt.md'),   'utf-8'),
    ]);

    // Convert arrays to prompt-expected formats
    const primaryKw  = (keywords?.primary  || []).join(', ');
    const relatedKw  = (keywords?.related  || []).join(', ');
    const lsiKw      = (keywords?.lsi      || []).join(', ');
    const longtailKw = (keywords?.longtail || []).join(', ');
    const questions  = (llmQuestions        || []).join('\n');
    const aeoList    = (checklists?.aeo     || []).map(i => '- ' + i).join('\n');
    const geoList    = (checklists?.geo     || []).map(i => '- ' + i).join('\n');
    const seoList    = (checklists?.seo     || []).map(i => '- ' + i).join('\n');

    const systemPrompt = stripComments(rawSystem);
    const userPrompt   = stripComments(rawUser)
      .replace('{{BLOG_THEME_NAME}}',       theme.name          || '')
      .replace('{{BLOG_THEME_SUMMARY}}',    theme.summary       || '')
      .replace('{{BLOG_TOPIC_NAME}}',       topic.name          || '')
      .replace('{{BLOG_TOPIC_DESCRIPTION}}', topic.description  || '')
      .replace('{{PRIMARY_KEYWORDS}}',      primaryKw)
      .replace('{{RELATED_KEYWORDS}}',      relatedKw)
      .replace('{{LSI_KEYWORDS}}',          lsiKw)
      .replace('{{LONG_TAIL_KEYWORDS}}',    longtailKw)
      .replace('{{KEY_LLM_QUESTIONS}}',     questions)
      .replace('{{AEO_CHECKLIST}}',         aeoList)
      .replace('{{GEO_CHECKLIST}}',         geoList)
      .replace('{{SEO_CHECKLIST}}',         seoList);

    // Call Sonnet 4.6
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 64000,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    });
    const response = await stream.finalMessage();

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    if (!text) {
      return res.status(502).json({ error: 'Agent did not return a response. Please try again.' });
    }

    // Extract JSON from the response (with repair for truncated output)
    const match = text.match(/\{[\s\S]*\}?/);
    if (!match) {
      return res.status(502).json({ error: 'Agent did not return valid JSON. Please try again.' });
    }

    const result = repairJson(match[0]);
    return res.json({ result });

  } catch (err) {
    console.error('[xeo-blog-agent] Error:', err.message);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Agent configuration error. Please contact support.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Blog generation failed. Please try again.' });
  }
});

// POST /api/xeo-blog-agent/generate-topics
// Body: { theme, keywords, llmQuestions, existingTopics }
router.post('/generate-topics', requireAuth, async (req, res) => {
  const { theme, keywords, llmQuestions, existingTopics } = req.body;

  if (!theme?.name) {
    return res.status(400).json({ error: 'Theme name is required.' });
  }

  try {
    const [rawSystem, rawUser] = await Promise.all([
      readFile(path.join(PROMPTS_DIR, 'blog_topics_system_prompt.md'), 'utf-8'),
      readFile(path.join(PROMPTS_DIR, 'blog_topics_user_prompt.md'),   'utf-8'),
    ]);

    const primaryKw  = (keywords?.primary  || []).join(', ');
    const relatedKw  = (keywords?.related  || []).join(', ');
    const lsiKw      = (keywords?.lsi      || []).join(', ');
    const longtailKw = (keywords?.longtail || []).join(', ');
    const questions  = (llmQuestions        || []).join('\n');
    const existing   = (existingTopics      || []).map((t, i) => `${i + 1}. ${t}`).join('\n');

    const systemPrompt = stripComments(rawSystem);
    const userPrompt   = stripComments(rawUser)
      .replace('{{BLOG_THEME_NAME}}',    theme.name    || '')
      .replace('{{BLOG_THEME_SUMMARY}}', theme.summary || '')
      .replace('{{PRIMARY_KEYWORDS}}',   primaryKw)
      .replace('{{RELATED_KEYWORDS}}',   relatedKw)
      .replace('{{LSI_KEYWORDS}}',       lsiKw)
      .replace('{{LONG_TAIL_KEYWORDS}}', longtailKw)
      .replace('{{KEY_LLM_QUESTIONS}}',  questions)
      .replace('{{EXISTING_TOPICS}}',    existing || 'None');

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const stream = client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 64000,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    });
    const response = await stream.finalMessage();

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    if (!text) {
      return res.status(502).json({ error: 'Agent did not return a response. Please try again.' });
    }

    const match = text.match(/\{[\s\S]*\}?/);
    if (!match) {
      return res.status(502).json({ error: 'Agent did not return valid JSON. Please try again.' });
    }

    const result = repairJson(match[0]);
    console.log('[xeo-blog-agent] Topics generated:', result?.topics?.length || 0);
    return res.json({ result });

  } catch (err) {
    console.error('[xeo-blog-agent] Topics error:', err.message);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Agent configuration error. Please contact support.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Topic generation failed. Please try again.' });
  }
});

export default router;
