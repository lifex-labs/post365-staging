import { Router } from 'express';
import { randomBytes } from 'crypto';
import { requireAuth } from '../middleware/auth.js';
import supabase from '../lib/supabase.js';

const router = Router();
router.use(requireAuth);

function generateSlug() {
  return randomBytes(8).toString('hex');
}

// ─── TOPICS ─────────────────────────────────────────────────────────────────

// GET /api/xeo-blogs/topics?profileId=&themeId=
router.get('/topics', async (req, res) => {
  try {
    const { profileId, themeId } = req.query;
    if (!profileId || !themeId) {
      return res.status(400).json({ error: 'profileId and themeId are required' });
    }
    const { data, error } = await supabase
      .from('xeo_blog_topics')
      .select('*')
      .eq('clerk_user_id', req.clerkUserId)
      .eq('brand_profile_id', profileId)
      .eq('theme_id', themeId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ topics: data });
  } catch (err) {
    console.error('[xeo-blogs] Fetch topics failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// POST /api/xeo-blogs/topics — create one or more topics
router.post('/topics', async (req, res) => {
  try {
    const { topics } = req.body;
    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: 'topics array is required' });
    }
    const rows = topics.map(t => ({
      clerk_user_id:    req.clerkUserId,
      brand_profile_id: t.brand_profile_id,
      theme_id:         t.theme_id,
      name:             t.name,
      description:      t.description || '',
      content_type:     t.content_type || null,
      source:           t.source || 'manual',
    }));
    const { data, error } = await supabase
      .from('xeo_blog_topics')
      .insert(rows)
      .select();
    if (error) throw error;
    res.status(201).json({ topics: data });
  } catch (err) {
    console.error('[xeo-blogs] Create topics failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to create topics' });
  }
});

// DELETE /api/xeo-blogs/topics/:id
router.delete('/topics/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('xeo_blog_topics')
      .delete()
      .eq('clerk_user_id', req.clerkUserId)
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[xeo-blogs] Delete topic failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// PATCH /api/xeo-blogs/topics/:id — mark blog_written
router.patch('/topics/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.blog_written !== undefined) updates.blog_written = req.body.blog_written;
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;

    const { data, error } = await supabase
      .from('xeo_blog_topics')
      .update(updates)
      .eq('clerk_user_id', req.clerkUserId)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error || !data) return res.status(404).json({ error: 'Topic not found' });
    res.json({ topic: data });
  } catch (err) {
    console.error('[xeo-blogs] Update topic failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// ─── BLOGS ──────────────────────────────────────────────────────────────────

// GET /api/xeo-blogs — list all blogs for the user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('xeo_blogs')
      .select('id, slug, title, excerpt, status, word_count, blog_type, theme_name, created_at, updated_at, brand_profiles(name)')
      .eq('clerk_user_id', req.clerkUserId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ blogs: data });
  } catch (err) {
    console.error('[xeo-blogs] Fetch blogs failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// GET /api/xeo-blogs/:slug — get a single blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('xeo_blogs')
      .select('*, brand_profiles(name, website, industry, founded_year, summary, primary_keywords, related_keywords, lsi_keywords, longtail_keywords, llm_questions), xeo_blog_topics(name, description, content_type)')
      .eq('clerk_user_id', req.clerkUserId)
      .eq('slug', req.params.slug)
      .single();
    if (error || !data) return res.status(404).json({ error: 'Blog not found' });
    res.json({ blog: data });
  } catch (err) {
    console.error('[xeo-blogs] Fetch blog failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// POST /api/xeo-blogs — create a new blog
router.post('/', async (req, res) => {
  try {
    const { brand_profile_id, topic_id, title, excerpt, blog_data, checklist_selections, word_count, blog_type, theme_name } = req.body;
    if (!brand_profile_id || !title) {
      return res.status(400).json({ error: 'brand_profile_id and title are required' });
    }
    const slug = generateSlug();
    const { data, error } = await supabase
      .from('xeo_blogs')
      .insert({
        clerk_user_id:        req.clerkUserId,
        brand_profile_id,
        topic_id:             topic_id || null,
        slug,
        title,
        excerpt:              excerpt || '',
        blog_data:            blog_data || {},
        checklist_selections: checklist_selections || {},
        word_count:           word_count || 0,
        blog_type:            blog_type || 'individual',
        theme_name:           theme_name || null,
        status:               'draft',
      })
      .select()
      .single();
    if (error) throw error;

    // Mark the topic as blog_written if topic_id provided
    if (topic_id) {
      await supabase
        .from('xeo_blog_topics')
        .update({ blog_written: true })
        .eq('clerk_user_id', req.clerkUserId)
        .eq('id', topic_id);
    }

    res.status(201).json({ blog: data });
  } catch (err) {
    console.error('[xeo-blogs] Create blog failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// DELETE /api/xeo-blogs/:slug
router.delete('/:slug', async (req, res) => {
  try {
    const { error } = await supabase
      .from('xeo_blogs')
      .delete()
      .eq('clerk_user_id', req.clerkUserId)
      .eq('slug', req.params.slug);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('[xeo-blogs] Delete blog failed:', err.code || err.message);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

export default router;
