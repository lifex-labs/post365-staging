import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Rss, Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import formatDate from '../utils/formatDate';
import styles from './NewXeoBlogPage.module.css';

export default function NewXeoBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useBrandProfilesApi();

  const profileSlug = location.state?.profileSlug;
  const themeId = location.state?.themeId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(null);

  // Blog topics state
  const [topics, setTopics] = useState([
    { id: 1, name: 'What is corporate gifting and why does it matter for B2B pipeline growth', description: 'Define corporate gifting in a B2B context, explain why relationship-driven outreach outperforms digital-only prospecting, and introduce the business case for a structured gifting program tied to pipeline metrics.' },
    { id: 2, name: 'How to define gifting triggers that align with your sales cycle', description: 'Identify the key moments in a B2B sales cycle where a well-timed gift can accelerate deal velocity, from first meeting follow-ups to closed-won celebrations and renewal touchpoints.' },
    { id: 3, name: 'Setting a corporate gifting budget that scales with revenue goals', description: 'Walk through frameworks for allocating gifting spend by deal size, account tier, and campaign type so marketing and sales leaders can justify budget and forecast ROI confidently.' },
    { id: 4, name: 'Choosing the right gift types for every stage of the buyer journey', description: 'Compare physical gifts, digital gift cards, branded merchandise, and experience-based rewards across awareness, consideration, and decision stages to maximize recipient engagement.' },
    { id: 5, name: 'How to tie gifting to CTA tracking and measure real pipeline impact', description: 'Explain how to embed trackable calls to action inside gifting campaigns using unique URLs, QR codes, and CRM integrations so every gift ties back to pipeline influence and attribution.' },
    { id: 6, name: 'Building a gifting playbook your entire revenue team can follow', description: 'Outline the essential components of an internal gifting playbook including approval workflows, vendor selection, compliance guardrails, and templates that keep execution consistent across reps.' },
    { id: 7, name: 'Lessons from Gartner and McKinsey on relationship-driven outreach', description: 'Summarize key research findings showing that personalized, relationship-first strategies drive higher win rates and larger deal sizes than high-volume impersonal outreach alone.' },
    { id: 8, name: 'Avoiding common corporate gifting mistakes that waste budget', description: 'Cover the most frequent pitfalls including generic gift selection, poor timing, missing personalization, ignoring compliance rules, and failing to follow up after the gift is delivered.' },
    { id: 9, name: 'How to personalize gifts at scale without losing authenticity', description: 'Explore tactics for combining automation with personal touches such as handwritten notes, recipient preference data, and AI-powered gift recommendations that feel genuine even at volume.' },
    { id: 10, name: 'Measuring gifting ROI with a simple dashboard and reporting framework', description: 'Provide a step-by-step guide to building a gifting ROI dashboard that tracks cost per gift, response rate, meetings booked, pipeline influenced, and revenue attributed to gifting campaigns.' },
  ]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addDraft, setAddDraft] = useState({ name: '', description: '' });

  function handleAddTopic() {
    setIsAdding(true);
    setAddDraft({ name: '', description: '' });
  }

  function handleAddSave() {
    if (!addDraft.name.trim()) return;
    const newTopic = {
      id: Date.now(),
      name: addDraft.name.trim(),
      description: addDraft.description.trim(),
    };
    setTopics(prev => [newTopic, ...prev]);
    setIsAdding(false);
    setAddDraft({ name: '', description: '' });
  }

  function handleAddCancel() {
    setIsAdding(false);
    setAddDraft({ name: '', description: '' });
  }

  useEffect(() => {
    if (!profileSlug) { setLoading(false); return; }
    api.getProfile(profileSlug)
      .then(res => {
        const p = res.profile;
        setProfile(p);
        const themes = p?.blog_themes || [];
        const match = themes.find(t => String(t.id) === themeId);
        if (match) setTheme(match);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [profileSlug, themeId]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New individual blog</h1>
          <p className={styles.description}>Configure and generate an individual blog for your theme</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/xeo-blogs')}>
            Cancel
          </button>
          <button className={styles.nextBtn} disabled>
            Next
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Left card - Blog theme details */}
        <div className={`${styles.card} ${styles.cardTheme}`}>
          {loading ? (
            <div className={styles.cardLoading}><LoadingSpinner /></div>
          ) : (
            <div className={styles.cardInner}>
              <div className={styles.iconSquare} style={{ background: '#1e293b' }}>
                <BookOpen size={14} strokeWidth={2} />
              </div>
              <h2 className={styles.cardTitle}>Blog theme</h2>
              <p className={styles.cardDesc}>Selected theme and keyword context for this blog</p>

              {theme && (
                <div className={styles.cardScroll}>
                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Blog theme</h3>
                    <p className={styles.themeText}>{theme.theme}</p>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Blog information</h3>
                    <dl className={styles.meta}>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Company</dt>
                        <dd className={styles.metaValue}>{profile?.name}</dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Website</dt>
                        <dd className={styles.metaValue}>{profile?.website}</dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Industry</dt>
                        <dd className={styles.metaValue}>{profile?.industry}</dd>
                      </div>
                      <div className={styles.metaRow}>
                        <dt className={styles.metaLabel}>Created</dt>
                        <dd className={styles.metaValue}>{formatDate(theme.date)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Summary</h3>
                    <p className={styles.sectionText}>{theme.summary}</p>
                  </div>

                  {theme.keywords?.primary?.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Primary keywords</h3>
                      <ul className={styles.kwList}>
                        {theme.keywords.primary.map((kw, i) => (
                          <li key={i} className={styles.kwItem}>{kw}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {theme.keywords?.related?.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Related keywords</h3>
                      <ul className={styles.kwList}>
                        {theme.keywords.related.map((kw, i) => (
                          <li key={i} className={styles.kwItem}>{kw}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {theme.keywords?.lsi?.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>LSI keywords</h3>
                      <ul className={styles.kwList}>
                        {theme.keywords.lsi.map((kw, i) => (
                          <li key={i} className={styles.kwItem}>{kw}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {theme.keywords?.longtail?.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Long tail keywords</h3>
                      <ul className={styles.kwList}>
                        {theme.keywords.longtail.map((kw, i) => (
                          <li key={i} className={styles.kwItem}>{kw}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {theme.keywords?.llmQuestions?.length > 0 && (
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Key LLM questions</h3>
                      <ul className={styles.kwList}>
                        {theme.keywords.llmQuestions.map((q, i) => (
                          <li key={i} className={styles.kwItem}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right card - Blog topics */}
        <div className={styles.card}>
          {loading ? (
            <div className={styles.cardLoading}><LoadingSpinner /></div>
          ) : (
            <div className={styles.cardInner}>
              <div className={styles.iconSquare} style={{ background: '#4f46e5' }}>
                <Rss size={14} strokeWidth={2} />
              </div>
              <div className={styles.cardHeaderRow}>
                <div>
                  <h2 className={styles.cardTitle}>Blog topics</h2>
                  <p className={styles.cardDesc}>AI-identified topics for the selected blog theme</p>
                </div>
                <button className={`${styles.addBlogBtn} ${styles.addBlogBtnDesktop}`} onClick={handleAddTopic} disabled={isAdding}>
                  <Plus size={13} strokeWidth={2.5} />
                  Add blog
                </button>
              </div>
              <button className={`${styles.addBlogBtn} ${styles.addBlogBtnMobile}`} onClick={handleAddTopic} disabled={isAdding}>
                <Plus size={13} strokeWidth={2.5} />
                Add blog
              </button>
              <div className={styles.topicScroll}>
                {isAdding && (
                  <div className={styles.topicAddRow}>
                    <div className={styles.topicAddFields}>
                      <input
                        className={styles.topicInput}
                        placeholder="Blog name"
                        value={addDraft.name}
                        onChange={e => setAddDraft(prev => ({ ...prev, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddSave(); if (e.key === 'Escape') handleAddCancel(); }}
                        autoFocus
                      />
                      <textarea
                        className={styles.topicTextarea}
                        placeholder="Blog description"
                        value={addDraft.description}
                        onChange={e => setAddDraft(prev => ({ ...prev, description: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Escape') handleAddCancel(); }}
                        rows={2}
                      />
                    </div>
                    <div className={styles.topicAddActions}>
                      <button className={styles.topicCancelBtn} onClick={handleAddCancel}>Cancel</button>
                      <button className={styles.topicSaveBtn} onClick={handleAddSave}>Save</button>
                    </div>
                  </div>
                )}
                {topics.map(topic => (
                  <div key={topic.id} className={styles.topicRow} onClick={() => setSelectedTopicId(topic.id)}>
                    <div className={styles.topicRadioCol}>
                      <input
                        type="radio"
                        name="selectedTopic"
                        className={styles.topicRadio}
                        checked={selectedTopicId === topic.id}
                        onChange={() => setSelectedTopicId(topic.id)}
                      />
                    </div>
                    <div className={styles.topicContent}>
                      <p className={styles.topicName}>{topic.name}</p>
                      {topic.description && (
                        <p className={styles.topicDescription}>{topic.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
