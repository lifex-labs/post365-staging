# =============================================================================
# USER PROMPT: Blog Theme Identifier for AEO + GEO + SEO
# =============================================================================
# This prompt is sent as the user message in each API call.
# {{URL}} is replaced with the actual website URL before sending.
# {{WEBSITE_CONTENT}} is replaced with the scraped page text before sending.
# =============================================================================


Here is the website URL:

{{URL}}


Here is the full text content scraped from that website:

---
{{WEBSITE_CONTENT}}
---


# -----------------------------------------------------------------------------
# INSTRUCTIONS
# These mirror the system prompt workflow but are written as direct asks.
# They act as reinforcement so the model does not skip or compress any step.
# -----------------------------------------------------------------------------

Using only the website content above, follow your full workflow:

1. Understand the business. Extract the basic details: company name (as used on the website), industry/category, founded year (check the content carefully - return null if not found), and a one-sentence summary (max 25 words). Then write out the problem, solution, USP, and value proposition - keep each to exactly 30 words.

2. Identify all primary keywords for this business. Be exhaustive. Cover every relevant angle. For each keyword, give your reason for picking it (30 words), plus volume and difficulty estimates.

3. Identify all related keywords for every primary keyword. These are synonyms, alternate terms, and close variations. Include volume and difficulty. Sort by primary keyword, then related keyword.

4. Identify all LSI keywords for every primary keyword. These are contextually associated terms, not synonyms. Include volume and difficulty. Sort by primary keyword, then LSI keyword.

5. Identify all long tail keywords for every primary keyword. These are specific multi-word phrases with clear intent. Include volume and difficulty. Sort by primary keyword, then long tail keyword.

6. Identify all key LLM questions for every primary keyword. Think about what people ask ChatGPT, Gemini, Perplexity, and Claude about these topics. Include volume and difficulty. Sort by primary keyword, then question.

7. Create blog themes that pull together primary keywords, related keywords, LSI keywords, long tail keywords, and LLM questions into coherent blog topics. Each theme summary must be exactly 50 words. Map every keyword and question back to the theme it belongs to.


# -----------------------------------------------------------------------------
# REMINDERS
# These repeat the most commonly missed rules from the system prompt.
# Keeps them top of mind since the user message is processed last.
# -----------------------------------------------------------------------------

Reminders:

- Write in simple English. Short sentences. Natural, human tone.
- No em-dashes. No en-dashes. Use commas or periods instead.
- Use sentence case everywhere. Do not capitalize the first letter of every word. Only capitalize proper nouns, brand names, acronyms, and the first word of a sentence.
- Keep the writing under 30% AI score on ZeroGPT. Vary sentence structure. Use contractions. Sound like a real person.
- Return the entire result as a single valid JSON object following the schema defined in your instructions.
