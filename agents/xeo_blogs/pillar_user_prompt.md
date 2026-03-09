# ==============================================================================
# USER PROMPT TEMPLATE: AEO + GEO + SEO Pillar Blog Writing Agent (Sonnet 4.6)
# ==============================================================================
#
# PURPOSE:
#   This is the user message template for pillar blog post generation.
#   It injects all runtime variables that change per pillar post.
#
# USAGE:
#   1. Replace every {{VARIABLE}} placeholder with actual values at runtime.
#   2. Send this as the "user" role message in the Anthropic API call.
#   3. The system prompt (pillar_system_prompt.md) must be set in the "system" field.
#
# VARIABLE REFERENCE:
#   {{BLOG_THEME_NAME}}         - String. The overarching content theme.
#   {{BLOG_THEME_SUMMARY}}      - String. 2-3 sentences describing the theme.
#   {{PRIMARY_KEYWORDS}}         - String. Comma-separated primary keywords.
#   {{RELATED_KEYWORDS}}         - String. Comma-separated related keywords.
#   {{LSI_KEYWORDS}}             - String. Comma-separated LSI keywords.
#   {{LONG_TAIL_KEYWORDS}}       - String. Comma-separated long-tail keywords.
#   {{KEY_LLM_QUESTIONS}}        - String. Newline-separated questions.
#   {{AEO_CHECKLIST}}            - String. The user's selected AEO items.
#   {{GEO_CHECKLIST}}            - String. The user's selected GEO items.
#   {{SEO_CHECKLIST}}            - String. The user's selected SEO items.
#
# NOTE: Unlike individual blog posts, pillar posts do NOT receive a blog topic
#   name or description. The theme name and summary ARE the topic. The agent
#   derives the H1, title tag, and full structure from the theme context alone.
#
# CHECKLIST FORMAT:
#   Each checklist variable should be a newline-separated list of the items
#   the user has checked. Only include items the user selected. Example:
#
#   {{AEO_CHECKLIST}} might resolve to:
#     - Identify the primary question and state it in an H2 or H3 heading.
#     - Include 3 to 5 secondary questions as subheadings.
#     - Place a concise direct answer immediately after each question heading.
#     - Write a JSON-LD FAQ schema block with at least 3 Q&A pairs.
#
# ==============================================================================


# --- BEGIN USER PROMPT ---

Write a comprehensive pillar blog post for the theme described below. This is
the main, definitive post for this entire theme. It should cover the full
breadth of the theme, introduce every major subtopic, and serve as the central
hub page that links out to individual cluster posts for deeper dives.

Follow every instruction in your system prompt exactly. Return your entire
response as a single JSON object matching the output schema defined in your
system prompt.


# ==============================================================================
# THEME CONTEXT
# ==============================================================================
# This is the theme your pillar post must comprehensively cover. The theme name
# can inform the H1 heading (you may refine it to be more compelling while
# keeping the primary keyword in the first 5 words). The summary defines the
# scope and angle of the pillar post.

<theme>
  <name>{{BLOG_THEME_NAME}}</name>
  <summary>{{BLOG_THEME_SUMMARY}}</summary>
</theme>


# ==============================================================================
# KEYWORD INPUTS
# ==============================================================================
# Use these keywords according to the placement rules in your system prompt.
#
# - Primary keywords go in the title, H1, first 100 words, at least two H2s,
#   and at ~1-1.5% density.
# - Related keywords should appear in H2/H3 headings and body paragraphs.
#   Since pillar posts cover more subtopics, distribute related keywords
#   across more sections.
# - LSI keywords add topical depth. Spread them naturally across sections.
# - Long-tail keywords work best in question-style subheadings and FAQ answers.

<keywords>
  <primary>{{PRIMARY_KEYWORDS}}</primary>
  <related>{{RELATED_KEYWORDS}}</related>
  <lsi>{{LSI_KEYWORDS}}</lsi>
  <long_tail>{{LONG_TAIL_KEYWORDS}}</long_tail>
</keywords>


# ==============================================================================
# KEY LLM QUESTIONS
# ==============================================================================
# These are questions that AI models (ChatGPT, Gemini, Perplexity, Claude)
# are likely to encounter from users on this theme. Your pillar post should
# directly answer as many of these as possible.
#
# Use them as:
#   - H2 or H3 question-format subheadings (aim for at least 5)
#   - FAQ entries in the faq array and JSON-LD FAQPage schema
#   - Snippet-target paragraphs placed right after each question heading
#
# Since this is a pillar post covering the full theme, you should be able to
# address most or all of these questions across your sections. Not every
# question needs its own section, but each must have a clear, findable answer
# somewhere in the blog.

<llm_questions>
{{KEY_LLM_QUESTIONS}}
</llm_questions>


# ==============================================================================
# AEO CHECKLIST (Answer Engine Optimization)
# ==============================================================================
# The user has selected the following AEO requirements. Apply each one.
# If a checklist item conflicts with a system prompt rule, the system prompt
# rule takes priority.

<aeo_checklist>
{{AEO_CHECKLIST}}
</aeo_checklist>


# ==============================================================================
# GEO CHECKLIST (Generative Engine Optimization)
# ==============================================================================
# The user has selected the following GEO requirements. Apply each one.
# If a checklist item conflicts with a system prompt rule, the system prompt
# rule takes priority.

<geo_checklist>
{{GEO_CHECKLIST}}
</geo_checklist>


# ==============================================================================
# SEO CHECKLIST (Search Engine Optimization)
# ==============================================================================
# The user has selected the following SEO requirements. Apply each one.
# If a checklist item conflicts with a system prompt rule, the system prompt
# rule takes priority.

<seo_checklist>
{{SEO_CHECKLIST}}
</seo_checklist>


# ==============================================================================
# FINAL REMINDERS
# ==============================================================================
# Read these carefully before you begin writing.

<reminders>

1. OUTPUT FORMAT: Return only a valid JSON object. No markdown code fences
   around it. No text before or after the JSON. The response must start with
   { and end with }.

2. PILLAR SCOPE: This is a pillar post, not a narrow article. Cover the full
   breadth of the theme across 6-10 H2 sections. Each section should
   introduce a distinct subtopic with enough substance to be useful on its
   own, while linking to potential cluster posts for deeper exploration.

3. WRITING QUALITY: The text must read as if written by a knowledgeable human
   expert. Vary your sentence length, structure, and openings. Use
   contractions. Be specific rather than generic. Show opinions where
   appropriate. The goal is less than 30% AI-written score on ZeroGPT.

4. PUNCTUATION: Do not use em-dash or en-dash characters anywhere in the
   output. Use commas, colons, parentheses, or separate sentences instead.

5. CITATIONS: Weave source attributions into sentences naturally.
   Example: "A 2024 Forrester study found that..."
   Never use numerical citation markers like [1], (2), or superscript numbers.

6. LINKS: Include real, credible third-party URLs in the external_links array.
   Prefer .gov, .edu, peer-reviewed sources, and established industry
   publications. Every link must start with https://.
   IMPORTANT: Also embed each external link directly in the blog content HTML
   as an anchor tag: <a href="URL" target="_blank" rel="noopener noreferrer">anchor text</a>.
   Place the link naturally within the relevant section body where the source
   is cited or referenced. Every external link must appear both in the
   external_links array AND as a clickable hyperlink in the content HTML.

7. INTERNAL LINKS: Use placeholder format for internal links:
   [INTERNAL: anchor text]({{internal_link_placeholder}})
   Include 5-8 of these, each pointing to a potential cluster post subtopic.
   Describe what page each should point to in the internal_links array.

8. SCHEMA: All JSON-LD blocks in schema_markup must be syntactically valid
   JSON. Double-check bracket and quote matching.

9. NO FILLER: Every paragraph should deliver specific, actionable, or
   informative value. Do not pad sections with generic advice.

10. SENTENCE CASE: Use sentence case for all text output including headings,
   titles, meta descriptions, FAQ questions, and all other text fields. Do
   not capitalize the first letter of every word. Only capitalize proper
   nouns, brand names, acronyms, and the first word of a sentence.

11. HTML CONTENT: All content fields (introduction, body, conclusion, tldr,
   FAQ answers) must use HTML markup, not markdown. Use <p>, <strong>, <em>,
   <ul>, <ol>, <li>, <table>, <a>, <blockquote> tags. Do not put <h1>, <h2>,
   or <h3> inside body fields - headings are separate JSON fields.

</reminders>


# --- END USER PROMPT ---
