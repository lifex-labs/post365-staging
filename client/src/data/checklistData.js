const crossPillar = {
  title: 'Cross-pillar quality checks',
  items: [
    'Read through the final draft and verify there is no orphan section (a heading with fewer than 2 sentences of content beneath it).',
    'Confirm every outbound link URL is complete, starts with https://, and points to a real, currently active page.',
    'Validate all JSON-LD schema blocks using a linter or manual syntax check before publishing.',
    'Ensure the post has a clear introduction (problem or hook), a structured body, and a conclusion with a call to action or summary.',
    'Check that the tone is consistent throughout: professional, direct, and free of filler phrases like "in today\'s world" or "it goes without saying."',
  ],
};

export const aeoSections = [
  {
    title: 'Question targeting',
    items: [
      'Identify the primary question the blog answers and state it explicitly in an H2 or H3 heading.',
      'Include 3 to 5 secondary "People Also Ask" style questions as subheadings throughout the post.',
      'Place a concise, direct answer (40 to 60 words) immediately after each question heading, before any elaboration.',
      'Use the exact natural-language phrasing a user would speak or type into a voice assistant.',
    ],
  },
  {
    title: 'Featured snippet formatting',
    items: [
      'Structure the lead answer in a "snippet-ready" format: a self-contained paragraph, a numbered list, or a definition that can be extracted without surrounding context.',
      'For process or how-to topics, use ordered lists with clear step labels so an AI can parse each step independently.',
      'For comparison topics, include a concise HTML table with clearly labeled columns and rows.',
      'Keep the primary snippet-target paragraph under 300 characters when possible.',
    ],
  },
  {
    title: 'Structured data and markup',
    items: [
      'Write a JSON-LD FAQ schema block containing at least 3 question-and-answer pairs drawn from the blog content.',
      'If the post is a how-to guide, write a JSON-LD HowTo schema block with named steps, tools, and estimated time.',
      'Include a JSON-LD Article schema block with headline, author name, datePublished, dateModified, and description fields.',
      'Ensure every schema block is syntactically valid JSON and uses schema.org vocabulary.',
    ],
  },
  {
    title: 'Conversational and voice-ready language',
    items: [
      'Write answers using first-person-plural or second-person address ("you can," "here is how") to mirror conversational queries.',
      'Avoid jargon in the lead answer sentence; define technical terms inline on first use.',
      'Use short, declarative sentences in answer paragraphs so AI assistants can quote them cleanly.',
      'Include a one-sentence "TL;DR" or summary callout at the top of the post that directly answers the title question.',
    ],
  },
  {
    title: 'Source attribution for AI crawlers',
    items: [
      'Cite specific statistics, studies, or data points with inline attribution (author, organization, year).',
      'Link each citation to the original source URL so AI systems can verify provenance.',
      'Prefer .gov, .edu, and peer-reviewed sources for factual claims to increase trust signals for answer engines.',
    ],
  },
  crossPillar,
];

export const geoSections = [
  {
    title: 'Authoritative and verifiable content',
    items: [
      'Include at least 3 outbound links to high-authority, third-party sources (.gov, .edu, established industry publications).',
      'Attribute every statistic or data point to a named organization and year of publication.',
      'Avoid vague attributions like "studies show" or "experts say." Name the study, researcher, or institution.',
      'When referencing a framework or methodology, cite the original creator and publication.',
    ],
  },
  {
    title: 'Content depth and uniqueness',
    items: [
      'Provide original analysis, a unique angle, or a proprietary framework that cannot be found by simply aggregating other articles.',
      'Include at least one original example, case study, or worked demonstration per major section.',
      'Address edge cases, exceptions, and nuances that shallow content typically skips.',
      'Add a "Common Mistakes" or "Misconceptions" section that corrects widely repeated but inaccurate claims.',
    ],
  },
  {
    title: 'Quotability and citability',
    items: [
      'Write 2 to 4 standalone, self-contained statements that a generative model could directly quote or paraphrase as a source.',
      'Format key definitions and principles as bold or highlighted callout text so they are easily extractable.',
      'Ensure each major claim is supported by a reason and evidence in the same paragraph so the context travels with the claim.',
      'Use clear topic sentences at the start of each paragraph that summarize the paragraph\'s point.',
    ],
  },
  {
    title: 'Structured and parseable content',
    items: [
      'Use a consistent heading hierarchy (H1 for title, H2 for major sections, H3 for subsections) with no skipped levels.',
      'Include a bulleted or numbered summary at the end of each major H2 section to reinforce key takeaways.',
      'Use descriptive, keyword-rich headings rather than clever or ambiguous ones (prefer "How to Reduce API Latency" over "Speed It Up").',
      'Keep paragraphs to 3 to 5 sentences to aid chunk-level parsing by LLMs.',
    ],
  },
  {
    title: 'Entity clarity and disambiguation',
    items: [
      'On first mention of any person, product, or organization, provide the full name and a brief identifying descriptor.',
      'Avoid pronoun-heavy passages; restate the subject noun when a paragraph shift could create ambiguity.',
      'Define acronyms on first use and avoid using more than one unfamiliar acronym per paragraph.',
    ],
  },
  {
    title: 'Freshness signals',
    items: [
      'Include the publication date and a "last updated" date in the article metadata.',
      'Reference current-year data, events, or version numbers where applicable to signal recency.',
      'Note the time-sensitivity of any advice (e.g., "as of Q1 2026" or "based on the v3.2 release").',
    ],
  },
  crossPillar,
];

export const seoSections = [
  {
    title: 'Title and meta tags',
    items: [
      'Write a title tag under 60 characters that contains the primary keyword within the first 5 words.',
      'Write a meta description between 140 and 155 characters that includes the primary keyword and a clear value proposition or call to action.',
      'Ensure the H1 tag matches or closely mirrors the title tag and appears exactly once on the page.',
      'Write an og:title and og:description for social sharing that are distinct from but consistent with the meta tags.',
    ],
  },
  {
    title: 'Keyword strategy',
    items: [
      'Place the primary keyword in the first 100 words of the body text.',
      'Use the primary keyword in at least one H2 heading.',
      'Include 3 to 5 semantically related secondary keywords distributed naturally across the body.',
      'Use LSI (latent semantic indexing) terms and synonyms to avoid keyword stuffing while maintaining topical relevance.',
      'Maintain a keyword density of roughly 1% to 1.5% for the primary keyword.',
    ],
  },
  {
    title: 'URL and slug',
    items: [
      'Write a URL slug that is lowercase, hyphen-separated, under 60 characters, and contains the primary keyword.',
      'Remove stop words (a, an, the, of, in) from the slug unless they are essential for meaning.',
    ],
  },
  {
    title: 'Content structure and readability',
    items: [
      'Write a total word count of at least 1,500 words for standard topics and 2,500+ for comprehensive guides.',
      'Use H2 and H3 subheadings every 200 to 350 words to break up content and create a scannable structure.',
      'Write in short paragraphs (3 to 5 sentences) and use transition phrases to maintain flow.',
      'Target a Flesch Reading Ease score of 60 or above (8th to 9th grade level) for general audiences.',
      'Include a table of contents with anchor links at the top for posts over 2,000 words.',
    ],
  },
  {
    title: 'Internal and external linking',
    items: [
      'Include 3 to 5 internal links to other relevant posts or pages on the same domain (use placeholder URLs if the sitemap is not provided, and flag them for the publisher to update).',
      'Include 2 to 4 outbound links to credible, authoritative third-party sources relevant to the topic.',
      'Use descriptive anchor text for all links; never use "click here" or "read more" as the full anchor.',
      'Ensure external links are set to open in a new tab (target="_blank" with rel="noopener noreferrer").',
    ],
  },
  {
    title: 'Image optimization (text-level)',
    items: [
      'Write descriptive, keyword-relevant alt text for every image placeholder (under 125 characters each).',
      'Include a suggested file name for each image that is lowercase, hyphen-separated, and descriptive (e.g., "api-latency-benchmark-chart.png").',
      'Add a caption or figure description beneath data-driven images or infographics.',
    ],
  },
  {
    title: 'Technical on-page elements',
    items: [
      'Write canonical URL markup pointing to the preferred version of the page.',
      'Include hreflang tags if the content targets a specific language or regional audience.',
      'Add Open Graph and Twitter Card meta tags with title, description, image, and type fields.',
      'Write a robots meta tag set to "index, follow" (or specify noindex/nofollow if intentionally restricted).',
    ],
  },
  {
    title: 'Content freshness and evergreen signals',
    items: [
      'Include a visible "Published on" and "Last Updated" date within the article body or front matter.',
      'Write content that separates time-sensitive facts (with explicit dates) from evergreen principles so the post can be partially updated without a full rewrite.',
      'Avoid undated references like "recently," "this year," or "nowadays" without specifying the actual date or year.',
    ],
  },
  crossPillar,
];
