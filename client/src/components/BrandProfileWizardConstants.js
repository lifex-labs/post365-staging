// ===== Colors & orders =====
export const VOLUME_COLORS = {
  High:   { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  Low:    { background: '#fecaca', color: '#991b1b' },
};

export const DIFFICULTY_COLORS = {
  Low:    { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  High:   { background: '#fecaca', color: '#991b1b' },
};

export const VOL_ORDER  = { High: 3, Medium: 2, Low: 1 };
export const DIFF_ORDER = { Low: 1, Medium: 2, High: 3 };

// ===== Context rows =====
export const CONTEXT_ROWS = [
  { key: 'problem',          label: 'Problem',           placeholder: 'What problem does your company solve?' },
  { key: 'solution',         label: 'Solution',          placeholder: 'How does your product or service solve it?' },
  { key: 'usps',             label: 'USPs',              placeholder: 'What makes you uniquely different?' },
  { key: 'valueProposition', label: 'Value proposition', placeholder: 'What is your core value promise?' },
];

export const CONTEXT_LABEL_COLORS = {
  problem:          { background: '#fee2e2', color: '#991b1b' },
  solution:         { background: '#dcfce7', color: '#166534' },
  usps:             { background: '#e0e7ff', color: '#3730a3' },
  valueProposition: { background: '#dbeafe', color: '#1e40af' },
};

// ===== Sample data =====
export const SAMPLE_KEYWORDS = [
  { id: 1,  keyword: 'content marketing platform',      volume: 'High',   difficulty: 'Medium', reason: 'High-intent term actively searched by marketing directors and content leads evaluating tools to centralize and scale their content operations. Users at this stage are typically in an active buying cycle, comparing platforms with feature-rich workflows that support multi-channel publishing, AI writing, and performance analytics.' },
  { id: 2,  keyword: 'AI blog writer',                  volume: 'High',   difficulty: 'Low',    reason: 'Rapidly growing search trend driven by marketing managers seeking to reduce time spent on first-draft blog creation. This keyword captures early-funnel buyers exploring AI-assisted writing tools and positions Post365 as a solution before prospects evaluate competing platforms or enterprise-level alternatives.' },
  { id: 3,  keyword: 'SEO content generation',          volume: 'Medium', difficulty: 'Medium', reason: "Core use case keyword that bridges organic search strategy with AI-assisted content workflows. Attracts marketers who want to produce search-optimized content at volume without hiring additional writers, making it a strong entry point for demonstrating Post365's ability to generate high-ranking blog content at scale." },
  { id: 4,  keyword: 'B2B content strategy',            volume: 'High',   difficulty: 'High',   reason: 'Targets senior decision-makers at mid-market and enterprise companies rebuilding or scaling their content strategy to drive inbound pipeline. Buyers searching this term typically control content budgets and are looking for platforms that align content output directly with revenue goals and sales enablement.' },
  { id: 5,  keyword: 'XEO optimization',                volume: 'Low',    difficulty: 'Low',    reason: "Proprietary term that captures Post365's combined approach to AEO, GEO and SEO in a single content workflow. Building search authority around this term establishes brand leadership in an emerging discipline while attracting progressive marketers actively researching next-generation content strategies beyond traditional optimization." },
  { id: 6,  keyword: 'brand content calendar',          volume: 'Medium', difficulty: 'Low',    reason: 'Searched by marketing leads and content managers planning quarterly content schedules across multiple channels and brand voices. This term signals strong operational buying intent, attracting users who need structured planning tools that connect editorial calendars with publishing workflows and team collaboration features.' },
  { id: 7,  keyword: 'inbound lead generation content', volume: 'Medium', difficulty: 'High',   reason: 'High commercial intent phrase attracting buyers who specifically want content solutions that convert organic traffic into qualified sales leads. Connects Post365 to revenue-driven content goals, making it ideal for targeting CMOs and growth marketers who measure performance through pipeline contribution and conversion metrics.' },
  { id: 8,  keyword: 'AI-powered SEO blogs',            volume: 'High',   difficulty: 'Medium', reason: 'Combines two major demand trends - AI writing automation and search engine optimization - to attract traffic from both SEO practitioners and marketing generalists. Positions Post365 at the intersection of AI capability and organic search performance, targeting users exploring smarter blog production workflows to scale content output.' },
  { id: 9,  keyword: 'generative engine optimization',  volume: 'Low',    difficulty: 'Low',    reason: 'Emerging category keyword as brands race to optimize content for AI-driven discovery platforms like Perplexity, ChatGPT search, and Google AI Overviews. Capturing early search volume for this term builds brand authority in a rapidly growing discipline while attracting progressive marketers investing in future-proof content strategies.' },
  { id: 10, keyword: 'thought leadership content',      volume: 'High',   difficulty: 'High',   reason: "Broad awareness keyword used by B2B brands investing in authority-building content to establish credibility within their industry. Typically represents marketing or communications teams tasked with positioning executive voices online, creating a strong fit for Post365's personal and brand profile features that support executive content at scale." },
];

export const SAMPLE_RELATED_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', relatedKeyword: 'content distribution platform',  volume: 'High',   difficulty: 'Medium' },
  { id: 2,  primaryKeyword: 'content marketing platform', relatedKeyword: 'brand publishing platform',       volume: 'Medium', difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'content marketing platform', relatedKeyword: 'content operations software',     volume: 'Medium', difficulty: 'Medium' },
  { id: 4,  primaryKeyword: 'AI blog writer',             relatedKeyword: 'AI content creation tool',        volume: 'High',   difficulty: 'High'   },
  { id: 5,  primaryKeyword: 'AI blog writer',             relatedKeyword: 'automated blog writing',          volume: 'High',   difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'SEO content generation',     relatedKeyword: 'AI-powered SEO blogs',            volume: 'High',   difficulty: 'Medium' },
  { id: 7,  primaryKeyword: 'SEO content generation',     relatedKeyword: 'SEO content automation',          volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       relatedKeyword: 'enterprise content platform',     volume: 'High',   difficulty: 'High'   },
  { id: 9,  primaryKeyword: 'B2B content strategy',       relatedKeyword: 'multi-channel content hub',       volume: 'Low',    difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'brand content calendar',     relatedKeyword: 'content workflow automation',     volume: 'Medium', difficulty: 'Medium' },
];

export const SAMPLE_LSI_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', lsiKeyword: 'content strategy',              volume: 'High',   difficulty: 'Medium' },
  { id: 2,  primaryKeyword: 'content marketing platform', lsiKeyword: 'editorial calendar',            volume: 'Medium', difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'content marketing platform', lsiKeyword: 'content management system',     volume: 'High',   difficulty: 'High'   },
  { id: 4,  primaryKeyword: 'AI blog writer',             lsiKeyword: 'natural language generation',   volume: 'Low',    difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'AI blog writer',             lsiKeyword: 'large language model',          volume: 'Medium', difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'SEO content generation',     lsiKeyword: 'keyword research',              volume: 'High',   difficulty: 'Medium' },
  { id: 7,  primaryKeyword: 'SEO content generation',     lsiKeyword: 'on-page optimisation',          volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       lsiKeyword: 'demand generation',             volume: 'High',   difficulty: 'High'   },
  { id: 9,  primaryKeyword: 'B2B content strategy',       lsiKeyword: 'thought leadership',            volume: 'High',   difficulty: 'Medium' },
  { id: 10, primaryKeyword: 'brand content calendar',     lsiKeyword: 'content publishing schedule',   volume: 'Low',    difficulty: 'Low'    },
];

export const SAMPLE_LONGTAIL_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', longtailKeyword: 'best content marketing platform for startups',       volume: 'Low',    difficulty: 'Low'    },
  { id: 2,  primaryKeyword: 'content marketing platform', longtailKeyword: 'content marketing platform with AI writing',          volume: 'Low',    difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'AI blog writer',             longtailKeyword: 'best AI blog writing tool for B2B marketers',         volume: 'Low',    difficulty: 'Low'    },
  { id: 4,  primaryKeyword: 'AI blog writer',             longtailKeyword: 'AI tool to write thought leadership articles',         volume: 'Low',    difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'SEO content generation',     longtailKeyword: 'how to create SEO content at scale',                  volume: 'Medium', difficulty: 'Low'    },
  { id: 6,  primaryKeyword: 'SEO content generation',     longtailKeyword: 'how to optimize content for generative AI search',    volume: 'Low',    difficulty: 'Low'    },
  { id: 7,  primaryKeyword: 'B2B content strategy',       longtailKeyword: 'how to build brand authority with content marketing', volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       longtailKeyword: 'B2B inbound lead generation through blog content',   volume: 'Low',    difficulty: 'Medium' },
  { id: 9,  primaryKeyword: 'brand content calendar',     longtailKeyword: 'content calendar software for marketing teams',       volume: 'Medium', difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'XEO optimization',           longtailKeyword: 'how to optimize content for AI search engines',       volume: 'Low',    difficulty: 'Low'    },
];

export const SAMPLE_LLM_QUESTIONS = [
  { id: 1,  primaryKeyword: 'content marketing platform',    llmQuestion: 'What is the best content marketing platform for scaling B2B content in 2025?',              volume: 'High',   difficulty: 'High'   },
  { id: 2,  primaryKeyword: 'content marketing platform',    llmQuestion: 'How does a content marketing platform help reduce time spent on content production?',         volume: 'Medium', difficulty: 'Medium' },
  { id: 3,  primaryKeyword: 'AI blog writer',                llmQuestion: 'Can AI write high-quality blog posts that rank on Google?',                                   volume: 'High',   difficulty: 'Medium' },
  { id: 4,  primaryKeyword: 'AI blog writer',                llmQuestion: 'What is the best AI tool to write thought leadership articles for executives?',               volume: 'Medium', difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'SEO content generation',        llmQuestion: 'How do I use AI to generate SEO-optimized blog content at scale?',                           volume: 'Medium', difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'B2B content strategy',          llmQuestion: 'What is the most effective content strategy for B2B inbound lead generation?',               volume: 'High',   difficulty: 'High'   },
  { id: 7,  primaryKeyword: 'B2B content strategy',          llmQuestion: 'How do I build a content strategy that drives measurable pipeline for B2B SaaS?',            volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'XEO optimization',              llmQuestion: 'What is XEO optimization and how does it combine SEO, AEO, and GEO?',                        volume: 'Low',    difficulty: 'Low'    },
  { id: 9,  primaryKeyword: 'generative engine optimization', llmQuestion: 'How do I optimize my content to appear in ChatGPT and Perplexity search results?',          volume: 'Medium', difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'thought leadership content',    llmQuestion: 'How do I create thought leadership content that builds credibility and drives inbound leads?', volume: 'High',   difficulty: 'Medium' },
];
