# ==============================================================================
# USER PROMPT TEMPLATE: Blog Topic Generator (Haiku 4.5)
# ==============================================================================
#
# PURPOSE:
#   This is the user message template for the topic generation step.
#   It injects all runtime variables that define the theme and keyword context.
#
# PIPELINE POSITION:
#   Step 1 (THIS PROMPT) - Generate blog topics for a given theme.
#   Step 2 (blog writing) - The user picks a topic from the output, and its
#     "name" and "description" fields feed into the blog writing prompts as
#     {{BLOG_TOPIC_NAME}} and {{BLOG_TOPIC_DESCRIPTION}}.
#
# USAGE:
#   1. Replace every {{VARIABLE}} placeholder with actual values at runtime.
#   2. Send this as the "user" role message in the Anthropic API call.
#   3. The system prompt (system_prompt_topic_gen.txt) must be set in the
#      "system" field.
#
# VARIABLE REFERENCE:
#   {{BLOG_THEME_NAME}}         - String. The overarching content theme.
#   {{BLOG_THEME_SUMMARY}}      - String. 2-3 sentences describing the theme.
#   {{PRIMARY_KEYWORDS}}         - String. Comma-separated primary keywords.
#   {{RELATED_KEYWORDS}}         - String. Comma-separated related keywords.
#   {{LSI_KEYWORDS}}             - String. Comma-separated LSI keywords.
#   {{LONG_TAIL_KEYWORDS}}       - String. Comma-separated long-tail keywords.
#   {{KEY_LLM_QUESTIONS}}        - String. Newline-separated questions.
#   {{EXISTING_TOPICS}}          - String. Newline-separated existing topic names.
#
# API CALL EXAMPLE (Python):
#
#   import anthropic
#   import json
#
#   client = anthropic.Anthropic()
#
#   # Load prompts
#   with open("system_prompt_topic_gen.txt", "r") as f:
#       system_prompt = f.read()
#
#   with open("user_prompt_topic_gen.txt", "r") as f:
#       user_prompt_template = f.read()
#
#   # Inject variables
#   user_prompt = user_prompt_template
#   user_prompt = user_prompt.replace("{{BLOG_THEME_NAME}}", "Cloud Security")
#   user_prompt = user_prompt.replace("{{BLOG_THEME_SUMMARY}}", "Covers best practices...")
#   user_prompt = user_prompt.replace("{{PRIMARY_KEYWORDS}}", "cloud security, zero trust")
#   user_prompt = user_prompt.replace("{{RELATED_KEYWORDS}}", "CSPM, SASE, CNAPP")
#   user_prompt = user_prompt.replace("{{LSI_KEYWORDS}}", "data protection, access control")
#   user_prompt = user_prompt.replace("{{LONG_TAIL_KEYWORDS}}", "how to implement zero trust in AWS")
#   user_prompt = user_prompt.replace("{{KEY_LLM_QUESTIONS}}", "What is zero trust?\nHow does...")
#
#   response = client.messages.create(
#       model="claude-haiku-4-5-20251001",
#       max_tokens=4096,
#       system=system_prompt,
#       messages=[
#           {"role": "user", "content": user_prompt}
#       ]
#   )
#
#   # Parse the JSON output
#   topics = json.loads(response.content[0].text)
#
#   # Hand off a selected topic to the blog writing step
#   selected = topics["topics"][0]
#   blog_topic_name = selected["name"]
#   blog_topic_description = selected["description"]
#
# ==============================================================================


# --- BEGIN USER PROMPT ---

Generate blog topic ideas based on the inputs below. Follow
every instruction in your system prompt exactly. Return your entire response
as a single JSON object matching the output schema defined in your system
prompt.


# ==============================================================================
# THEME CONTEXT
# ==============================================================================
# This is the overarching content theme. All topics must fall within this
# theme. Use the summary to understand the editorial angle and audience.

<theme>
  <n>{{BLOG_THEME_NAME}}</n>
  <summary>{{BLOG_THEME_SUMMARY}}</summary>
</theme>


# ==============================================================================
# KEYWORD INPUTS
# ==============================================================================
# Distribute these keywords across the full topic set. Each topic should
# naturally align with at least one primary keyword and one or two
# secondary or long-tail keywords.
#
# - Primary keywords: The main terms the content strategy targets. Every
#   topic should connect to at least one.
# - Related keywords: Closely associated terms. Use these to shape topic
#   angles and H2-level subtopics within future blog posts.
# - LSI keywords: Semantically related terms that add topical depth.
#   These help ensure the topic set covers the full semantic field.
# - Long-tail keywords: Specific, multi-word phrases that reflect real
#   user queries. These often make strong question-format topic titles.

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
# are likely to encounter from users on this theme.
#
# Your topic set must cover as many of these questions as possible. Each
# question should be answerable by at least one proposed topic.
#
# Strategies:
#   - A question can become a topic title directly if it's broad enough
#     for a full blog post.
#   - Narrow questions can be grouped under a broader topic that answers
#     several related questions in one post.
#   - Track which questions each topic addresses in the
#     "llm_questions_addressed" field.
#   - List any uncovered questions in the "llm_questions_not_covered"
#     field of generation_metadata so the user can decide if more topics
#     are needed.

<llm_questions>
{{KEY_LLM_QUESTIONS}}
</llm_questions>


<existing_topics>
{{EXISTING_TOPICS}}
</existing_topics>


# ==============================================================================
# FINAL REMINDERS
# ==============================================================================

<reminders>

1. OUTPUT FORMAT: Return only a valid JSON object. No markdown code fences.
   No text before or after the JSON. The response must start with { and end
   with }.

2. WRITING QUALITY: Titles and descriptions must read as if written by a
   human strategist. Vary sentence structure. Use contractions. Be specific.
   The goal is natural, non-robotic language that would score under 30%
   AI-written on ZeroGPT.

3. PUNCTUATION: Do not use em-dash or en-dash characters anywhere in the
   output. Use commas, colons, parentheses, or separate sentences instead.

4. NO NUMERICAL CITATIONS: Do not use markers like [1], (2), or superscript
   numbers anywhere.

5. DISTINCT TOPICS: Every topic must be clearly different from every other
   topic. If two topics would answer the same core question or target the
   same long-tail keyword, merge them or sharpen each to cover a distinct
   angle.

6. KEYWORD DISTRIBUTION: Spread keywords across the full set. Do not
   concentrate all primary keywords into the first few topics.

7. QUESTION COVERAGE: Track LLM question coverage carefully. Flag any
   uncovered questions in generation_metadata.llm_questions_not_covered.

8. CONTENT TYPE MIX: Use at least 3 different content types (how-to,
   explainer, comparison, list, strategy, troubleshooting, case-study)
   across the topic set.

9. NO REPETITION: Do not generate any topic that duplicates or substantially
   overlaps with the existing topics listed above. Every new topic must cover
   a distinct angle not already represented.

10. SENTENCE CASE: Use sentence case for all text output. Do not capitalize
   the first letter of every word. Only capitalize proper nouns, brand names,
   acronyms, and the first word of a sentence.

</reminders>


# --- END USER PROMPT ---

