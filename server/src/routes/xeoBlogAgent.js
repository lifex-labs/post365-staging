import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsonrepair } from 'jsonrepair';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';

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

// Parse JSON from LLM output, using jsonrepair for malformed responses
function parseJson(raw) {
  try { return JSON.parse(raw); } catch {}
  const repaired = jsonrepair(raw);
  return JSON.parse(repaired);
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

    const result = parseJson(match[0]);
    return res.json({ result });

  } catch (err) {
    console.error('[xeo-blog-agent] Generate failed:', err.code || err.message);

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

    const result = parseJson(match[0]);
    // Topics generated successfully
    return res.json({ result });

  } catch (err) {
    console.error('[xeo-blog-agent] Topics failed:', err.code || err.message);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Agent configuration error. Please contact support.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Topic generation failed. Please try again.' });
  }
});

// POST /api/xeo-blog-agent/generate-pillar
// Body: { theme, keywords, llmQuestions, checklists }
router.post('/generate-pillar', requireAuth, async (req, res) => {
  const { theme, keywords, llmQuestions, checklists } = req.body;

  if (!theme?.name) {
    return res.status(400).json({ error: 'Theme name is required.' });
  }

  try {
    const [rawSystem, rawUser] = await Promise.all([
      readFile(path.join(PROMPTS_DIR, 'pillar_system_prompt.md'), 'utf-8'),
      readFile(path.join(PROMPTS_DIR, 'pillar_user_prompt.md'),   'utf-8'),
    ]);

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
      .replace('{{BLOG_THEME_NAME}}',    theme.name    || '')
      .replace('{{BLOG_THEME_SUMMARY}}', theme.summary || '')
      .replace('{{PRIMARY_KEYWORDS}}',   primaryKw)
      .replace('{{RELATED_KEYWORDS}}',   relatedKw)
      .replace('{{LSI_KEYWORDS}}',       lsiKw)
      .replace('{{LONG_TAIL_KEYWORDS}}', longtailKw)
      .replace('{{KEY_LLM_QUESTIONS}}',  questions)
      .replace('{{AEO_CHECKLIST}}',      aeoList)
      .replace('{{GEO_CHECKLIST}}',      geoList)
      .replace('{{SEO_CHECKLIST}}',      seoList);

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

    const result = parseJson(match[0]);
    // Pillar blog generated successfully
    return res.json({ result });

  } catch (err) {
    console.error('[xeo-blog-agent] Pillar failed:', err.code || err.message);

    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Agent configuration error. Please contact support.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }

    return res.status(500).json({ error: 'Pillar blog generation failed. Please try again.' });
  }
});

export default router;
