# ==============================================================================
# USER PROMPT TEMPLATE: AEO + GEO + SEO Blog Writing Agent (Haiku 4.5)
# ==============================================================================
#
# PURPOSE:
#   This is the user message template sent alongside the system prompt.
#   It injects all runtime variables that change per blog post.
#
# USAGE:
#   1. Replace every {{VARIABLE}} placeholder with actual values at runtime.
#   2. Send this as the "user" role message in the Anthropic API call.
#   3. The system prompt (system_prompt.txt) must be set in the "system" field.
#
# VARIABLE REFERENCE:
#   {{BLOG_THEME_NAME}}         - String. The overarching content theme.
#   {{BLOG_THEME_SUMMARY}}      - String. 2-3 sentences describing the theme.
#   {{PRIMARY_KEYWORDS}}         - String. Comma-separated primary keywords.
#   {{RELATED_KEYWORDS}}         - String. Comma-separated related keywords.
#   {{LSI_KEYWORDS}}             - String. Comma-separated LSI keywords.
#   {{LONG_TAIL_KEYWORDS}}       - String. Comma-separated long-tail keywords.
#   {{KEY_LLM_QUESTIONS}}        - String. Newline-separated questions.
#   {{BLOG_TOPIC_NAME}}          - String. The specific title/topic of this post.
#   {{BLOG_TOPIC_DESCRIPTION}}   - String. 2-4 sentence description.
#   {{AEO_CHECKLIST}}            - String. The user's selected AEO items.
#   {{GEO_CHECKLIST}}            - String. The user's selected GEO items.
#   {{SEO_CHECKLIST}}            - String. The user's selected SEO items.
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
# API CALL EXAMPLE (Python):
#
#   import anthropic
#
#   client = anthropic.Anthropic()
#
#   # Load prompts
#   with open("system_prompt.txt", "r") as f:
#       system_prompt = f.read()
#
#   with open("user_prompt.txt", "r") as f:
#       user_prompt_template = f.read()
#
#   # Inject variables (example using str.replace or a template engine)
#   user_prompt = user_prompt_template
#   user_prompt = user_prompt.replace("{{BLOG_THEME_NAME}}", "Cloud Security")
#   user_prompt = user_prompt.replace("{{BLOG_TOPIC_NAME}}", "Zero Trust Architecture for Small Teams")
#   # ... repeat for all variables ...
#
#   response = client.messages.create(
#       model="claude-haiku-4-5-20251001",
#       max_tokens=8192,
#       system=system_prompt,
#       messages=[
#           {"role": "user", "content": user_prompt}
#       ]
#   )
#
#   # The response content is a JSON string. Parse it directly.
#   import json
#   blog_json = json.loads(response.content[0].text)
#
# ==============================================================================


# --- BEGIN USER PROMPT ---

Write a complete blog post based on the inputs below. Follow every instruction
in your system prompt exactly. Return your entire response as a single JSON
object matching the output schema defined in your system prompt.


# ==============================================================================
# THEME CONTEXT
# ==============================================================================
# These fields describe the broader content theme this blog belongs to.
# Use them to maintain thematic consistency and choose relevant examples.

<theme>
  <name>{{BLOG_THEME_NAME}}</name>
  <summary>{{BLOG_THEME_SUMMARY}}</summary>
</theme>


# ==============================================================================
# TOPIC DETAILS
# ==============================================================================
# The specific blog post to write. The topic name may be used as-is for the
# H1 heading, or you may refine it to be more compelling while keeping the
# primary keyword in the first 5 words.

<topic>
  <name>{{BLOG_TOPIC_NAME}}</name>
  <description>{{BLOG_TOPIC_DESCRIPTION}}</description>
</topic>


# ==============================================================================
# KEYWORD INPUTS
# ==============================================================================
# Use these keywords according to the placement rules in your system prompt.
#
# - Primary keywords go in the title, H1, first 100 words, at least one H2,
#   and at ~1-1.5% density.
# - Related keywords should appear in H2/H3 headings and body paragraphs.
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
# are likely to encounter from users on this topic. Your blog should directly
# answer as many of these as possible.
#
# Use them as:
#   - H2 or H3 question-format subheadings
#   - FAQ entries in the faq array and JSON-LD FAQPage schema
#   - Snippet-target paragraphs placed right after each question heading
#
# Not every question needs its own section. Some can be answered within
# existing sections. But each question must have a clear, findable answer
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

2. WRITING QUALITY: The text must read as if written by a knowledgeable human
   expert. Vary your sentence length, structure, and openings. Use
   contractions. Be specific rather than generic. Show opinions where
   appropriate. The goal is less than 30% AI-written score on ZeroGPT.

3. PUNCTUATION: Do not use em-dash or en-dash characters anywhere in the
   output. Use commas, colons, parentheses, or separate sentences instead.

4. CITATIONS: Weave source attributions into sentences naturally.
   Example: "A 2024 Forrester study found that..."
   Never use numerical citation markers like [1], (2), or superscript numbers.

5. LINKS: Include real, credible third-party URLs in the external_links array.
   Prefer .gov, .edu, peer-reviewed sources, and established industry
   publications. Every link must start with https://.

6. WORD COUNT: Aim for at least 1,800 words of body content (introduction +
   sections + conclusion combined). More is fine if the topic warrants it.

7. INTERNAL LINKS: Use placeholder format for internal links:
   [INTERNAL: anchor text]({{internal_link_placeholder}})
   Include 3-5 of these and describe what page each should point to in the
   internal_links array.

8. SCHEMA: All JSON-LD blocks in schema_markup must be syntactically valid
   JSON. Double-check bracket and quote matching.

9. NO FILLER: Do not pad sections with generic advice just to hit word count.
   Every paragraph should deliver specific, actionable, or informative value.

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

