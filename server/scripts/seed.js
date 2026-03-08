import 'dotenv/config';
import { createClerkClient } from '@clerk/backend';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function run() {
  // 1. Get first user from Clerk
  const { data: users } = await clerk.users.getUserList({ limit: 10 });
  if (!users || users.length === 0) {
    console.error('No users found in Clerk. Sign in to the app first.');
    process.exit(1);
  }
  const user = users[0];
  const clerkUserId = user.id;
  const email = user.emailAddresses?.[0]?.emailAddress || null;
  console.log(`Using Clerk user: ${clerkUserId} (${email})`);

  // 2. Upsert user
  const { error: userErr } = await supabase
    .from('users')
    .upsert({ clerk_user_id: clerkUserId, email }, { onConflict: 'clerk_user_id' });
  if (userErr) { console.error('User upsert failed:', userErr.message); process.exit(1); }

  // 3. Check if seed profile already exists
  const { data: existing } = await supabase
    .from('brand_profiles')
    .select('id, slug')
    .eq('clerk_user_id', clerkUserId)
    .eq('name', 'TechCorp Solutions')
    .maybeSingle();

  if (existing) {
    console.log(`Seed profile already exists — slug: ${existing.slug}`);
    process.exit(0);
  }

  // 4. Insert brand profile
  const slug = randomBytes(8).toString('hex');
  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const { data: profile, error: profileErr } = await supabase
    .from('brand_profiles')
    .insert({
      clerk_user_id:     clerkUserId,
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
        { id: 1, keyword: 'enterprise workflow automation',      volume: 'High',   difficulty: 'High',   reason: 'Core category keyword capturing engineering leaders evaluating automation platforms for complex system integrations.' },
        { id: 2, keyword: 'AI integration platform',            volume: 'High',   difficulty: 'Medium', reason: 'High-intent term sought by CTOs and architects looking for AI-assisted tools to unify disparate enterprise systems.' },
        { id: 3, keyword: 'multi-system deployment automation', volume: 'Medium', difficulty: 'Medium', reason: 'Targets DevOps and platform engineering teams managing deployments across cloud and on-premise infrastructure.' },
        { id: 4, keyword: 'enterprise CI/CD platform',          volume: 'High',   difficulty: 'High',   reason: 'Captures buyers comparing enterprise-grade CI/CD tools with advanced workflow automation and security features.' },
        { id: 5, keyword: 'cloud hybrid deployment tool',       volume: 'Medium', difficulty: 'Low',    reason: 'Lower competition keyword attracting mid-market teams with mixed cloud and on-premise infrastructure.' },
      ],
      related_keywords: [
        { id: 1, primaryKeyword: 'enterprise workflow automation',      relatedKeyword: 'business process automation software', volume: 'High',   difficulty: 'High'   },
        { id: 2, primaryKeyword: 'enterprise workflow automation',      relatedKeyword: 'workflow orchestration platform',      volume: 'Medium', difficulty: 'Medium' },
        { id: 3, primaryKeyword: 'AI integration platform',            relatedKeyword: 'API integration automation',           volume: 'High',   difficulty: 'Medium' },
        { id: 4, primaryKeyword: 'AI integration platform',            relatedKeyword: 'intelligent middleware solution',       volume: 'Low',    difficulty: 'Low'    },
        { id: 5, primaryKeyword: 'enterprise CI/CD platform',          relatedKeyword: 'DevOps automation toolchain',          volume: 'High',   difficulty: 'High'   },
      ],
      lsi_keywords: [
        { id: 1, primaryKeyword: 'enterprise workflow automation',      lsiKeyword: 'process orchestration',        volume: 'Medium', difficulty: 'Medium' },
        { id: 2, primaryKeyword: 'enterprise workflow automation',      lsiKeyword: 'robotic process automation',   volume: 'High',   difficulty: 'High'   },
        { id: 3, primaryKeyword: 'AI integration platform',            lsiKeyword: 'system integration layer',     volume: 'Low',    difficulty: 'Low'    },
        { id: 4, primaryKeyword: 'enterprise CI/CD platform',          lsiKeyword: 'continuous delivery pipeline', volume: 'High',   difficulty: 'Medium' },
        { id: 5, primaryKeyword: 'cloud hybrid deployment tool',       lsiKeyword: 'infrastructure as code',       volume: 'High',   difficulty: 'High'   },
      ],
      longtail_keywords: [
        { id: 1, primaryKeyword: 'enterprise workflow automation',      longtailKeyword: 'best enterprise workflow automation platform for large organisations',           volume: 'Low', difficulty: 'Low' },
        { id: 2, primaryKeyword: 'AI integration platform',            longtailKeyword: 'AI-powered platform to connect enterprise systems without custom code',          volume: 'Low', difficulty: 'Low' },
        { id: 3, primaryKeyword: 'multi-system deployment automation', longtailKeyword: 'how to automate deployment across cloud and on-premise environments',            volume: 'Low', difficulty: 'Low' },
        { id: 4, primaryKeyword: 'enterprise CI/CD platform',          longtailKeyword: 'enterprise CI/CD platform with role-based access and audit trails',             volume: 'Low', difficulty: 'Low' },
        { id: 5, primaryKeyword: 'cloud hybrid deployment tool',       longtailKeyword: 'tools for managing hybrid cloud and on-premise deployment pipelines',           volume: 'Low', difficulty: 'Low' },
      ],
      llm_questions: [
        { id: 1, primaryKeyword: 'enterprise workflow automation',      llmQuestion: 'What is the best enterprise workflow automation platform for connecting multi-system environments?',          volume: 'High',   difficulty: 'High'   },
        { id: 2, primaryKeyword: 'AI integration platform',            llmQuestion: 'How does an AI integration platform reduce manual engineering overhead in large organisations?',             volume: 'Medium', difficulty: 'Medium' },
        { id: 3, primaryKeyword: 'multi-system deployment automation', llmQuestion: 'How do I automate deployments across cloud, hybrid, and on-premise infrastructure?',                        volume: 'Medium', difficulty: 'Medium' },
        { id: 4, primaryKeyword: 'enterprise CI/CD platform',          llmQuestion: 'What enterprise CI/CD platforms support hybrid and on-premise deployments with built-in security?',         volume: 'High',   difficulty: 'High'   },
        { id: 5, primaryKeyword: 'cloud hybrid deployment tool',       llmQuestion: 'What tools help engineering teams manage consistent deployments across cloud and on-premise environments?', volume: 'Medium', difficulty: 'Low'    },
      ],
      blog_themes: [
        {
          id: 1,
          primaryKeyword: 'enterprise workflow automation',
          theme: "The engineering leader's guide to enterprise workflow automation in 2026",
          date: now,
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
          date: now,
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
          date: now,
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
    .select('slug')
    .single();

  if (profileErr) { console.error('Profile insert failed:', profileErr.message); process.exit(1); }

  console.log(`Seed profile created successfully!`);
  console.log(`  Name: TechCorp Solutions`);
  console.log(`  Slug: ${profile.slug}`);
  console.log(`  URL:  /brand-profiles/view/${profile.slug}`);
}

run();
