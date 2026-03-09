import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, Rss, Plus, BotMessageSquare, Globe, Search, Square, SquareCheck, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import { aeoSections, geoSections, seoSections } from '../data/checklistData';
import formatDate from '../utils/formatDate';
import styles from './NewXeoBlogPage.module.css';

export default function NewXeoBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useBrandProfilesApi();

  if (!location.state) return <Navigate to="/new-xeo-blogs" replace />;

  const profileSlug = location.state?.profileSlug;
  const themeId = location.state?.themeId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(null);

  // Blog topics state (loaded from DB)
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [addDraft, setAddDraft] = useState({ name: '', description: '' });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMethod, setAddMethod] = useState('');
  const [step, setStep] = useState(1);
  const [uncheckedItems, setUncheckedItems] = useState(new Set());

  // Generating state (shared by blog writing and topic generation)
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [generateMode, setGenerateMode] = useState(''); // 'blog' or 'topics'
  const [generateError, setGenerateError] = useState('');
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  function toggleCheck(key) {
    setUncheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleAddTopic() {
    setAddModalOpen(true);
    setAddMethod('');
  }

  function handleAddModalClose() {
    setAddModalOpen(false);
    setAddMethod('');
  }

  function handleAddModalSelect() {
    setAddModalOpen(false);
    if (addMethod === 'manual') {
      setIsAdding(true);
      setAddDraft({ name: '', description: '' });
    }
    if (addMethod === 'ai') {
      handleGenerateTopics();
    }
    setAddMethod('');
  }

  async function handleGenerateTopics() {
    const payload = {
      theme: {
        name:    theme?.theme   || '',
        summary: theme?.summary || '',
      },
      keywords: {
        primary:  theme?.keywords?.primary  || [],
        related:  theme?.keywords?.related  || [],
        lsi:      theme?.keywords?.lsi      || [],
        longtail: theme?.keywords?.longtail || [],
      },
      llmQuestions:   theme?.keywords?.llmQuestions || [],
      existingTopics: topics.map(t => t.name),
    };

    setGenerateError('');
    setGenerateMode('topics');
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await api.generateTopics(payload, controller.signal);
      setIsGenerating(false);
      setGenerateMode('');
      const aiTopics = (res.result?.topics || []).map(t => ({
        brand_profile_id: profile?.id,
        theme_id:         Number(themeId),
        name:             t.name,
        description:      t.description || '',
        content_type:     t.content_type || null,
        source:           'ai',
      }));
      if (aiTopics.length > 0) {
        const saved = await api.createTopics(aiTopics);
        setTopics(prev => [...(saved.topics || []), ...prev]);
      }
    } catch (err) {
      setIsGenerating(false);
      setGenerateMode('');
      if (err.name === 'AbortError') return;
      console.error('[xeo-blog] Topic generation failed:', err.message);
      setGenerateError('Topic generation ran into an issue. Please try again.');
    }
  }

  async function handleAddSave() {
    if (!addDraft.name.trim()) return;
    try {
      const saved = await api.createTopics([{
        brand_profile_id: profile?.id,
        theme_id:         Number(themeId),
        name:             addDraft.name.trim(),
        description:      addDraft.description.trim(),
        source:           'manual',
      }]);
      setTopics(prev => [...(saved.topics || []), ...prev]);
    } catch {
      // Silently fail - topic won't appear
    }
    setIsAdding(false);
    setAddDraft({ name: '', description: '' });
  }

  function handleAddCancel() {
    setIsAdding(false);
    setAddDraft({ name: '', description: '' });
  }

  useEffect(() => {
    if (!profileSlug) { setLoading(false); setTopicsLoading(false); return; }
    api.getProfile(profileSlug)
      .then(res => {
        const p = res.profile;
        setProfile(p);
        const themes = p?.blog_themes || [];
        const match = themes.find(t => String(t.id) === themeId);
        if (match) setTheme(match);

        // Load topics from DB
        if (p?.id && themeId) {
          api.listTopics(p.id, themeId)
            .then(topicRes => setTopics(topicRes.topics || []))
            .catch(() => {})
            .finally(() => setTopicsLoading(false));
        } else {
          setTopicsLoading(false);
        }
      })
      .catch(() => { setTopicsLoading(false); })
      .finally(() => setLoading(false));
  }, [profileSlug, themeId]);

  // Animate progress bar while generating
  useEffect(() => {
    if (!isGenerating) {
      setGenerateProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }
    setGenerateProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setGenerateProgress(p => {
        if (p >= 90) { clearInterval(progressIntervalRef.current); return 90; }
        return p + 1;
      });
    }, 950);
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [isGenerating]);

  function handleCancelGenerate() { setShowCancelConfirm(true); }
  function handleKeepGenerating() { setShowCancelConfirm(false); }
  function handleConfirmCancel() {
    abortControllerRef.current?.abort();
    setShowCancelConfirm(false);
    setIsGenerating(false);
  }

  // Collect checked items from a checklist
  function getCheckedItems(prefix, sections) {
    const items = [];
    sections.forEach((sec, si) => {
      sec.items.forEach((item, ii) => {
        const key = `${prefix}-${si}-${ii}`;
        if (!uncheckedItems.has(key)) items.push(item);
      });
    });
    return items;
  }

  async function handleCreate() {
    const selectedTopic = topics.find(t => t.id === selectedTopicId);

    const selectedChecklists = {
      aeo: getCheckedItems('aeo', aeoSections),
      geo: getCheckedItems('geo', geoSections),
      seo: getCheckedItems('seo', seoSections),
    };

    const agentPayload = {
      theme: {
        name:    theme?.theme   || '',
        summary: theme?.summary || '',
      },
      topic: {
        name:        selectedTopic?.name        || '',
        description: selectedTopic?.description || '',
      },
      keywords: {
        primary:  theme?.keywords?.primary      || [],
        related:  theme?.keywords?.related      || [],
        lsi:      theme?.keywords?.lsi          || [],
        longtail: theme?.keywords?.longtail     || [],
      },
      llmQuestions: theme?.keywords?.llmQuestions || [],
      checklists: selectedChecklists,
    };

    setGenerateError('');
    setGenerateMode('blog');
    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await api.generateBlog(agentPayload, controller.signal);
      setIsGenerating(false);
      setGenerateMode('');

      // Count words from actual content
      const c = res.result?.content || {};
      const allText = [
        c.tldr,
        c.introduction,
        ...(c.sections || []).flatMap(s => [s.body, ...(s.subsections || []).map(sub => sub.body)]),
        c.conclusion,
        ...(res.result?.faq || []).map(f => f.answer),
      ].filter(Boolean).join(' ');
      const wordCount = allText.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

      // Save blog to DB
      const blogRes = await api.createBlog({
        brand_profile_id:     profile?.id,
        topic_id:             selectedTopic?.id || null,
        title:                selectedTopic?.name || 'Untitled blog',
        excerpt:              selectedTopic?.description || '',
        blog_data:            res.result,
        checklist_selections: selectedChecklists,
        word_count:           wordCount,
      });

      navigate(`/new-xeo-blogs/${blogRes.blog.slug}`, {
        state: {
          blogName: selectedTopic?.name || 'Untitled blog',
          blogExcerpt: selectedTopic?.description || '',
          blogSlug: blogRes.blog.slug,
          blogData: res.result,
        },
      });
    } catch (err) {
      setIsGenerating(false);
      setGenerateMode('');
      if (err.name === 'AbortError') return;
      console.error('[xeo-blog] Generation failed:', err.message);
      setGenerateError('Blog generation ran into an issue. Please try again.');
    }
  }

  const checklists = [
    { id: 'aeo', icon: BotMessageSquare, color: '#1e293b', name: 'AEO checklist', desc: 'Optimize content for AI engine answers', sections: aeoSections },
    { id: 'geo', icon: Globe, color: '#4f46e5', name: 'GEO checklist', desc: 'Optimize content for generative engine results', sections: geoSections },
    { id: 'seo', icon: Search, color: '#0f766e', name: 'SEO checklist', desc: 'Optimize content for search engine rankings', sections: seoSections },
  ];

  if (step === 2) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>New individual blog</h1>
            <p className={styles.description}>Select optimization checklists for your blog</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.cancelBtn} onClick={() => navigate('/new-xeo-blogs')}>
              Cancel
            </button>
            <button className={styles.cancelBtn} onClick={() => setStep(1)}>
              Back
            </button>
            <button className={styles.nextBtn} onClick={handleCreate}>
              Next
            </button>
          </div>
        </header>

        <div className={styles.checklistGrid}>
          {checklists.map(cl => (
            <div key={cl.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.iconSquare} style={{ background: cl.color }}>
                  <cl.icon size={14} strokeWidth={2} />
                </div>
                <h2 className={styles.cardTitle}>{cl.name}</h2>
                <p className={styles.cardDesc}>{cl.desc}</p>
                <div className={styles.cardScroll}>
                  {cl.sections.map((sec, si) => (
                    <div key={si} className={styles.section}>
                      <h3 className={styles.sectionTitle}>{sec.title}</h3>
                      <table className={styles.checkTable}>
                        <tbody>
                          {sec.items.map((item, ii) => {
                            const key = `${cl.id}-${si}-${ii}`;
                            const checked = !uncheckedItems.has(key);
                            return (
                              <tr key={key} className={styles.checkRow} onClick={() => toggleCheck(key)}>
                                <td className={styles.checkIconCell}>
                                  {checked
                                    ? <SquareCheck size={15} strokeWidth={2} className={styles.checkIcon} />
                                    : <Square size={15} strokeWidth={2} className={styles.checkIcon} />
                                  }
                                </td>
                                <td className={`${styles.checkTextCell} ${!checked ? styles.checkTextUnchecked : ''}`}>
                                  {item}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isGenerating && createPortal(
          <div className={styles.generateBackdrop}>
            <div className={styles.generateModal}>
              <div className={styles.generateIcon}>
                <Loader2 size={20} strokeWidth={2} className={styles.spinnerIcon} />
              </div>
              <p className={styles.generateTitle}>{generateMode === 'topics' ? 'Generating topics' : 'Writing your blog'}</p>
              <p className={styles.generateDesc}>{generateMode === 'topics' ? 'Our AI agents are generating blog topic ideas. This can take up to 5 minutes. Please do not close this window.' : 'Our AI agents are generating your New XEO blog post. This can take up to 5 minutes. Please do not close this window.'}</p>
              <div className={styles.generateProgressTrack}>
                <div className={styles.generateProgressFill} style={{ width: `${generateProgress}%` }} />
              </div>
              <div className={styles.generateActions}>
                <button className={styles.generateCancelBtn} onClick={handleCancelGenerate}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {showCancelConfirm && createPortal(
          <div className={styles.generateBackdrop} style={{ zIndex: 1010 }}>
            <div className={styles.confirmModal}>
              <p className={styles.confirmTitle}>Cancel generation?</p>
              <p className={styles.confirmDesc}>The blog is being generated. If you cancel now, no content will be saved and you will need to start again.</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmKeepBtn} onClick={handleKeepGenerating}>Keep generating</button>
                <button className={styles.confirmStopBtn} onClick={handleConfirmCancel}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {generateError && createPortal(
          <div className={styles.generateBackdrop}>
            <div className={styles.confirmModal}>
              <p className={styles.confirmTitle}>Generation failed</p>
              <p className={styles.confirmDesc}>{generateError}</p>
              <div className={styles.confirmActions}>
                <button className={styles.confirmKeepBtn} onClick={() => setGenerateError('')}>OK</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New individual blog</h1>
          <p className={styles.description}>Configure and generate an individual blog for your theme</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/new-xeo-blogs')}>
            Cancel
          </button>
          <button className={styles.nextBtn} disabled={!selectedTopicId} onClick={() => setStep(2)}>
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
                  Add topic
                </button>
              </div>
              <button className={`${styles.addBlogBtn} ${styles.addBlogBtnMobile}`} onClick={handleAddTopic} disabled={isAdding}>
                <Plus size={13} strokeWidth={2.5} />
                Add topic
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
                {topics.map(topic => {
                  const done = topic.blog_written;
                  return (
                    <div
                      key={topic.id}
                      className={`${styles.topicRow} ${done ? styles.topicRowDone : ''}`}
                      onClick={() => !done && setSelectedTopicId(topic.id)}
                    >
                      <div className={styles.topicRadioCol}>
                        <input
                          type="radio"
                          name="selectedTopic"
                          className={styles.topicRadio}
                          checked={selectedTopicId === topic.id}
                          onChange={() => !done && setSelectedTopicId(topic.id)}
                          disabled={done}
                        />
                      </div>
                      <div className={styles.topicContent}>
                        <p className={`${styles.topicName} ${done ? styles.topicTextDone : ''}`}>{topic.name}</p>
                        {topic.description && (
                          <p className={`${styles.topicDescription} ${done ? styles.topicTextDone : ''}`}>{topic.description}</p>
                        )}
                        {done && <span className={styles.completeTag}>Complete</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {isGenerating && generateMode === 'topics' && createPortal(
        <div className={styles.generateBackdrop}>
          <div className={styles.generateModal}>
            <div className={styles.generateIcon}>
              <Loader2 size={20} strokeWidth={2} className={styles.spinnerIcon} />
            </div>
            <p className={styles.generateTitle}>Generating topics</p>
            <p className={styles.generateDesc}>Our AI agents are generating blog topic ideas. This can take up to 5 minutes. Please do not close this window.</p>
            <div className={styles.generateProgressTrack}>
              <div className={styles.generateProgressFill} style={{ width: `${generateProgress}%` }} />
            </div>
            <div className={styles.generateActions}>
              <button className={styles.generateCancelBtn} onClick={handleCancelGenerate}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCancelConfirm && generateMode === 'topics' && createPortal(
        <div className={styles.generateBackdrop} style={{ zIndex: 1010 }}>
          <div className={styles.confirmModal}>
            <p className={styles.confirmTitle}>Cancel generation?</p>
            <p className={styles.confirmDesc}>Topics are being generated. If you cancel now, no topics will be added.</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmKeepBtn} onClick={handleKeepGenerating}>Keep generating</button>
              <button className={styles.confirmStopBtn} onClick={handleConfirmCancel}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {addModalOpen && createPortal(
        <div className={styles.addBackdrop} onClick={handleAddModalClose}>
          <div className={styles.addModal} onClick={e => e.stopPropagation()}>
            <div className={styles.addModalIcon}>
              <Rss size={15} strokeWidth={2} />
            </div>

            <div className={styles.addModalHeading}>
              <h2 className={styles.addModalTitle}>Add blog topic</h2>
              <p className={styles.addModalDesc}>Choose how you want to add a new blog topic</p>
            </div>

            <div className={styles.addModalFields}>
              <div className={styles.addModalRadioGroup}>
                <label className={styles.addModalRadioLabel} onClick={() => setAddMethod('ai')}>
                  <input
                    type="radio"
                    name="addMethod"
                    className={styles.addModalRadioInput}
                    checked={addMethod === 'ai'}
                    onChange={() => setAddMethod('ai')}
                  />
                  <div className={styles.addModalRadioContent}>
                    <span className={styles.addModalRadioName}>Ask AI</span>
                    <span className={styles.addModalRadioDesc}>Let AI generate blog topics based on your theme, keywords, and LLM questions automatically</span>
                  </div>
                </label>
                <label className={styles.addModalRadioLabel} onClick={() => setAddMethod('manual')}>
                  <input
                    type="radio"
                    name="addMethod"
                    className={styles.addModalRadioInput}
                    checked={addMethod === 'manual'}
                    onChange={() => setAddMethod('manual')}
                  />
                  <div className={styles.addModalRadioContent}>
                    <span className={styles.addModalRadioName}>Write manually</span>
                    <span className={styles.addModalRadioDesc}>Type your own blog topic name and description to add it to the list</span>
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.addModalActions}>
              <button className={styles.addModalCancelBtn} onClick={handleAddModalClose}>Cancel</button>
              <button className={styles.addModalSelectBtn} onClick={handleAddModalSelect} disabled={!addMethod}>Select</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
