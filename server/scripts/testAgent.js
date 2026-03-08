import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const PROMPTS_DIR = path.join(__dirname, '../../agents/brand_profiles');
const TEST_URL    = 'https://getreplies.ai/';

function stripComments(text) {
  return text
    .split('\n')
    .filter(line => !line.trimStart().startsWith('#'))
    .join('\n')
    .trim();
}

async function run() {
  console.log(`Testing agent with URL: ${TEST_URL}`);
  console.log('Loading prompts...');

  const [rawSystem, rawUser] = await Promise.all([
    readFile(path.join(PROMPTS_DIR, 'system_prompt.md'), 'utf-8'),
    readFile(path.join(PROMPTS_DIR, 'user_prompt.md'),   'utf-8'),
  ]);

  const systemPrompt = stripComments(rawSystem);
  const userPrompt   = stripComments(rawUser).replace('{{URL}}', TEST_URL);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  console.log('Calling Claude Sonnet 4.6 with web_search...');
  console.log('(This may take 30-90 seconds)\n');

  const initialUserMessage = { role: 'user', content: userPrompt };
  let messages = [initialUserMessage];
  const MAX_CONTINUATIONS = 5;
  let finalText = null;

  for (let i = 0; i < MAX_CONTINUATIONS; i++) {
    const stream   = client.messages.stream({
      model:      'claude-sonnet-4-6',
      max_tokens: 64000,
      tools:      [{ type: 'web_search_20250305', name: 'web_search' }],
      system:     systemPrompt,
      messages,
    });

    // Stream progress dots so the terminal doesn't look frozen
    stream.on('text', () => process.stdout.write('.'));

    const response = await stream.finalMessage();
    console.log(`\nIteration ${i + 1} — stop_reason: ${response.stop_reason}`);

    if (response.stop_reason === 'end_turn') {
      finalText = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      break;
    }

    if (response.stop_reason === 'pause_turn') {
      messages = [
        initialUserMessage,
        { role: 'assistant', content: response.content },
      ];
      continue;
    }

    // Unexpected stop reason
    const textBlock = response.content.find(b => b.type === 'text');
    if (textBlock?.text) { finalText = textBlock.text; break; }
    throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
  }

  if (!finalText) throw new Error('Agent did not produce a text response.');

  // Extract JSON
  const match = finalText.match(/\{[\s\S]*\}/);
  if (!match) {
    console.error('\n--- RAW RESPONSE (no JSON found) ---');
    console.log(finalText);
    throw new Error('No JSON object found in response.');
  }

  const result = JSON.parse(match[0]);

  console.log('\n=== RESULT STRUCTURE ===');
  console.log('business_analysis keys:', Object.keys(result.business_analysis || {}));
  console.log('primary_keywords count:', result.primary_keywords?.length);
  console.log('related_keywords count:', result.related_keywords?.length);
  console.log('lsi_keywords count:    ', result.lsi_keywords?.length);
  console.log('long_tail_keywords count:', result.long_tail_keywords?.length);
  console.log('key_llm_questions count:', result.key_llm_questions?.length);
  console.log('blog_themes count:     ', result.blog_themes?.length);

  console.log('\n=== BUSINESS ANALYSIS ===');
  console.log(JSON.stringify(result.business_analysis, null, 2));

  console.log('\n=== PRIMARY KEYWORDS (first 3) ===');
  console.log(JSON.stringify(result.primary_keywords?.slice(0, 3), null, 2));

  console.log('\n=== BLOG THEMES (first 2) ===');
  console.log(JSON.stringify(result.blog_themes?.slice(0, 2), null, 2));

  console.log('\n=== FULL JSON (saved to testAgent_output.json) ===');
  const { writeFile } = await import('fs/promises');
  await writeFile(
    path.join(__dirname, 'testAgent_output.json'),
    JSON.stringify(result, null, 2),
    'utf-8'
  );
  console.log('Full output saved to server/scripts/testAgent_output.json');
}

run().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
