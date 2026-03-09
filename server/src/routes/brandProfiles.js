import { Router } from 'express';
import { randomBytes } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import supabase from '../lib/supabase.js';

const router = Router();
router.use(requireAuth);

function generateSlug() {
  return randomBytes(8).toString('hex');
}

async function upsertUser(clerkUserId) {
  const { error } = await supabase
    .from('users')
    .upsert({ clerk_user_id: clerkUserId }, { onConflict: 'clerk_user_id' });
  if (error) throw error;
}

// GET /api/brand-profiles — list all profiles for the authenticated user
router.get('/', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('id, slug, name, website, industry, founded_year, summary, status, steps_completed, created_at')
      .eq('clerk_user_id', req.clerkUserId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ profiles: data });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// GET /api/brand-profiles/:slug — get a single profile
router.get('/:slug', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);
    const { data, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('clerk_user_id', req.clerkUserId)
      .eq('slug', req.params.slug)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: data });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/brand-profiles — create a new profile
router.post('/', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);
    const {
      name, website, industry, foundedYear, summary,
      problem, solution, usps, valueProposition,
      primaryKeywords, relatedKeywords, lsiKeywords,
      longtailKeywords, llmQuestions, blogThemes,
      status, stepsCompleted,
    } = req.body;

    const slug = generateSlug();
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        clerk_user_id: req.clerkUserId,
        slug,
        name:              name              || '',
        website:           website           || '',
        industry:          industry          || '',
        founded_year:      foundedYear       || '',
        summary:           summary           || '',
        problem:           problem           || '',
        solution:          solution          || '',
        usps:              usps              || '',
        value_proposition: valueProposition  || '',
        status:            status            || 'complete',
        steps_completed:   stepsCompleted    ?? 6,
        primary_keywords:  primaryKeywords   || [],
        related_keywords:  relatedKeywords   || [],
        lsi_keywords:      lsiKeywords       || [],
        longtail_keywords: longtailKeywords  || [],
        llm_questions:     llmQuestions      || [],
        blog_themes:       blogThemes        || [],
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ profile: data });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// PUT /api/brand-profiles/:slug — update an existing profile
router.put('/:slug', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);
    const {
      name, website, industry, foundedYear, summary,
      problem, solution, usps, valueProposition,
      primaryKeywords, relatedKeywords, lsiKeywords,
      longtailKeywords, llmQuestions, blogThemes,
      status, stepsCompleted,
    } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (name              !== undefined) updates.name              = name;
    if (website           !== undefined) updates.website           = website;
    if (industry          !== undefined) updates.industry          = industry;
    if (foundedYear       !== undefined) updates.founded_year      = foundedYear;
    if (summary           !== undefined) updates.summary           = summary;
    if (problem           !== undefined) updates.problem           = problem;
    if (solution          !== undefined) updates.solution          = solution;
    if (usps              !== undefined) updates.usps              = usps;
    if (valueProposition  !== undefined) updates.value_proposition = valueProposition;
    if (status            !== undefined) updates.status            = status;
    if (stepsCompleted    !== undefined) updates.steps_completed   = stepsCompleted;
    if (primaryKeywords   !== undefined) updates.primary_keywords  = primaryKeywords;
    if (relatedKeywords   !== undefined) updates.related_keywords  = relatedKeywords;
    if (lsiKeywords       !== undefined) updates.lsi_keywords      = lsiKeywords;
    if (longtailKeywords  !== undefined) updates.longtail_keywords = longtailKeywords;
    if (llmQuestions      !== undefined) updates.llm_questions     = llmQuestions;
    if (blogThemes        !== undefined) updates.blog_themes       = blogThemes;

    const { data, error } = await supabase
      .from('brand_profiles')
      .update(updates)
      .eq('clerk_user_id', req.clerkUserId)
      .eq('slug', req.params.slug)
      .select()
      .single();
    if (error || !data) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile: data });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// DELETE /api/brand-profiles/:slug — delete a profile
router.delete('/:slug', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);
    const { error } = await supabase
      .from('brand_profiles')
      .delete()
      .eq('clerk_user_id', req.clerkUserId)
      .eq('slug', req.params.slug);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
});

// POST /api/brand-profiles/seed — create one sample profile for the authenticated user
router.post('/seed', async (req, res) => {
  try {
    await upsertUser(req.clerkUserId);

    const { data: existing } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('clerk_user_id', req.clerkUserId)
      .eq('name', 'TechCorp Solutions')
      .maybeSingle();

    if (existing) {
      return res.json({ message: 'Seed profile already exists', alreadyExists: true });
    }

    const slug = generateSlug();
    const { data, error } = await supabase
      .from('brand_profiles')
      .insert({
        clerk_user_id:     req.clerkUserId,
        slug,
        name:              'TechCorp Solutions',
        website:           'techcorp.io',
        industry:          'Software Development',
        founded_year:      '2019',
        summary:           'TechCorp Solutions builds enterprise AI automation software that connects complex multi-system workflows for mid-market and large organisations. The platform reduces manual engineering overhead and accelerates deployment cycles across cloud, hybrid, and on-premise environments.',
        problem:           'Enterprise engineering teams waste thousands of hours manually connecting disparate systems, managing brittle integrations, and dealing with deployment inconsistencies across cloud, hybrid, and on-premise environments. This slows release cycles and increases operational costs.',
        solution:          'TechCorp provides an AI-powered automation platform that intelligently maps and connects multi-system workflows, eliminating manual integration work and enabling continuous deployment across any infrastructure with minimal engineering overhead.',
        usps:              'AI-driven workflow mapping that adapts to infrastructure changes automatically. Unified control plane for cloud, hybrid, and on-premise deployments. Enterprise-grade security with role-based access and full audit trails built in by default.',
        value_proposition: 'TechCorp gives enterprise engineering teams the fastest path from complex, fragmented systems to unified, automated workflows - reducing deployment time, cutting integration costs, and eliminating the operational drag that slows product delivery.',
        status:            'complete',
        steps_completed:   6,
        primary_keywords: [
          { id: 1, keyword: 'enterprise workflow automation',    volume: 'High',   difficulty: 'High',   reason: 'Core category keyword capturing engineering leaders evaluating automation platforms for complex system integrations.' },
          { id: 2, keyword: 'AI integration platform',          volume: 'High',   difficulty: 'Medium', reason: 'High-intent term sought by CTOs and architects looking for AI-assisted tools to unify disparate enterprise systems.' },
          { id: 3, keyword: 'multi-system deployment automation', volume: 'Medium', difficulty: 'Medium', reason: 'Targets DevOps and platform engineering teams managing deployments across cloud and on-premise infrastructure.' },
          { id: 4, keyword: 'enterprise CI/CD platform',        volume: 'High',   difficulty: 'High',   reason: 'Captures buyers comparing enterprise-grade CI/CD tools with advanced workflow automation and security features.' },
          { id: 5, keyword: 'cloud hybrid deployment tool',     volume: 'Medium', difficulty: 'Low',    reason: 'Lower competition keyword attracting mid-market teams with mixed cloud and on-premise infrastructure.' },
        ],
        related_keywords: [
          { id: 1, primaryKeyword: 'enterprise workflow automation',    relatedKeyword: 'business process automation software', volume: 'High',   difficulty: 'High'   },
          { id: 2, primaryKeyword: 'enterprise workflow automation',    relatedKeyword: 'workflow orchestration platform',      volume: 'Medium', difficulty: 'Medium' },
          { id: 3, primaryKeyword: 'AI integration platform',          relatedKeyword: 'API integration automation',           volume: 'High',   difficulty: 'Medium' },
          { id: 4, primaryKeyword: 'AI integration platform',          relatedKeyword: 'intelligent middleware solution',       volume: 'Low',    difficulty: 'Low'    },
          { id: 5, primaryKeyword: 'enterprise CI/CD platform',        relatedKeyword: 'DevOps automation toolchain',          volume: 'High',   difficulty: 'High'   },
        ],
        lsi_keywords: [
          { id: 1, primaryKeyword: 'enterprise workflow automation',    lsiKeyword: 'process orchestration',       volume: 'Medium', difficulty: 'Medium' },
          { id: 2, primaryKeyword: 'enterprise workflow automation',    lsiKeyword: 'robotic process automation',  volume: 'High',   difficulty: 'High'   },
          { id: 3, primaryKeyword: 'AI integration platform',          lsiKeyword: 'system integration layer',    volume: 'Low',    difficulty: 'Low'    },
          { id: 4, primaryKeyword: 'enterprise CI/CD platform',        lsiKeyword: 'continuous delivery pipeline', volume: 'High',  difficulty: 'Medium' },
          { id: 5, primaryKeyword: 'cloud hybrid deployment tool',     lsiKeyword: 'infrastructure as code',      volume: 'High',   difficulty: 'High'   },
        ],
        longtail_keywords: [
          { id: 1, primaryKeyword: 'enterprise workflow automation',    longtailKeyword: 'best enterprise workflow automation platform for large organisations',            volume: 'Low', difficulty: 'Low' },
          { id: 2, primaryKeyword: 'AI integration platform',          longtailKeyword: 'AI-powered platform to connect enterprise systems without custom code',           volume: 'Low', difficulty: 'Low' },
          { id: 3, primaryKeyword: 'multi-system deployment automation', longtailKeyword: 'how to automate deployment across cloud and on-premise environments',           volume: 'Low', difficulty: 'Low' },
          { id: 4, primaryKeyword: 'enterprise CI/CD platform',        longtailKeyword: 'enterprise CI/CD platform with role-based access and audit trails',              volume: 'Low', difficulty: 'Low' },
          { id: 5, primaryKeyword: 'cloud hybrid deployment tool',     longtailKeyword: 'tools for managing hybrid cloud and on-premise deployment pipelines',            volume: 'Low', difficulty: 'Low' },
        ],
        llm_questions: [
          { id: 1, primaryKeyword: 'enterprise workflow automation',    llmQuestion: 'What is the best enterprise workflow automation platform for connecting multi-system environments?',           volume: 'High',   difficulty: 'High'   },
          { id: 2, primaryKeyword: 'AI integration platform',          llmQuestion: 'How does an AI integration platform reduce manual engineering overhead in large organisations?',              volume: 'Medium', difficulty: 'Medium' },
          { id: 3, primaryKeyword: 'multi-system deployment automation', llmQuestion: 'How do I automate deployments across cloud, hybrid, and on-premise infrastructure?',                       volume: 'Medium', difficulty: 'Medium' },
          { id: 4, primaryKeyword: 'enterprise CI/CD platform',        llmQuestion: 'What enterprise CI/CD platforms support hybrid and on-premise deployments with built-in security?',          volume: 'High',   difficulty: 'High'   },
          { id: 5, primaryKeyword: 'cloud hybrid deployment tool',     llmQuestion: 'What tools help engineering teams manage consistent deployments across cloud and on-premise environments?',  volume: 'Medium', difficulty: 'Low'    },
        ],
        blog_themes: [
          {
            id: 1,
            primaryKeyword: 'enterprise workflow automation',
            theme: "The engineering leader's guide to enterprise workflow automation in 2026",
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            summary: 'A comprehensive guide for CTOs and platform engineering leads on evaluating, selecting, and implementing enterprise workflow automation platforms. Covers key criteria, common pitfalls, and how AI-driven orchestration reduces integration overhead at scale.',
            keywords: {
              primary:      ['enterprise workflow automation', 'AI integration platform'],
              related:      ['workflow orchestration platform', 'business process automation software'],
              lsi:          ['process orchestration', 'system integration layer'],
              longtail:     ['best enterprise workflow automation platform for large organisations'],
              llmQuestions: ['What is the best enterprise workflow automation platform for connecting multi-system environments?'],
            },
          },
          {
            id: 2,
            primaryKeyword: 'AI integration platform',
            theme: 'How AI integration platforms eliminate manual engineering work in enterprise environments',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            summary: 'An in-depth look at how AI-powered integration platforms are replacing brittle, hand-coded middleware in enterprise tech stacks. Explores real-world use cases where intelligent workflow mapping reduces integration time from weeks to hours.',
            keywords: {
              primary:      ['AI integration platform', 'enterprise workflow automation'],
              related:      ['API integration automation', 'intelligent middleware solution'],
              lsi:          ['system integration layer', 'robotic process automation'],
              longtail:     ['AI-powered platform to connect enterprise systems without custom code'],
              llmQuestions: ['How does an AI integration platform reduce manual engineering overhead in large organisations?'],
            },
          },
          {
            id: 3,
            primaryKeyword: 'enterprise CI/CD platform',
            theme: 'Choosing an enterprise CI/CD platform: what engineering teams get wrong',
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            summary: 'Most enterprise CI/CD platform evaluations focus on feature checklists and miss the critical factors that determine long-term success. This guide covers the five decisions that separate high-performing deployment pipelines from ones that slow teams down.',
            keywords: {
              primary:      ['enterprise CI/CD platform', 'multi-system deployment automation'],
              related:      ['DevOps automation toolchain'],
              lsi:          ['continuous delivery pipeline', 'infrastructure as code'],
              longtail:     ['enterprise CI/CD platform with role-based access and audit trails'],
              llmQuestions: ['What enterprise CI/CD platforms support hybrid and on-premise deployments with built-in security?'],
            },
          },
        ],
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ profile: data, message: 'Seed profile created' });
  } catch (err) {
    console.error('[brand-profiles]', err.code || err.message);
    res.status(500).json({ error: 'Failed to create seed profile' });
  }
});

export default router;
