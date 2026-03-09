import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { BookOpen, BotMessageSquare, Globe, Search, Square, SquareCheck, Loader2, FileText, Code, HelpCircle, Link2, Image, ShieldCheck, Download } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import { aeoSections, geoSections, seoSections } from '../data/checklistData';
import formatDate from '../utils/formatDate';
import styles from './NewPillarBlogPage.module.css';

// Convert title case to sentence case, preserving acronyms (SEO, AI) and
// mixed-case proper nouns (LinkedIn, YouTube). Only lowercases words that
// are simple title-cased (e.g. "Build" -> "build") after the first word.
function toSentenceCase(str) {
  if (!str) return '';
  const words = str.split(' ');
  return words.map((word, i) => {
    if (i === 0) return word; // keep first word as-is
    // Keep words that are all-caps (acronyms like SEO, AI, E-E-A-T)
    if (word === word.toUpperCase()) return word;
    // Keep words with mixed internal caps (LinkedIn, YouTube, WordPress)
    if (word.slice(1) !== word.slice(1).toLowerCase()) return word;
    // Simple title-cased word -> lowercase
    return word.toLowerCase();
  }).join(' ');
}

export default function NewPillarBlogPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useBrandProfilesApi();

  if (!location.state) return <Navigate to="/new-xeo-blogs" replace />;

  const profileSlug = location.state?.profileSlug;
  const themeId = location.state?.themeId;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [theme, setTheme] = useState(null);
  const [step, setStep] = useState(1);
  const [uncheckedItems, setUncheckedItems] = useState(new Set());

  // Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [generateError, setGenerateError] = useState('');
  const abortControllerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Blog result state (step 3)
  const [blogData, setBlogData] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [exporting, setExporting] = useState(false);

  function toggleCheck(key) {
    setUncheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
    const selectedChecklists = {
      aeo: getCheckedItems('aeo', aeoSections),
      geo: getCheckedItems('geo', geoSections),
      seo: getCheckedItems('seo', seoSections),
    };

    setGenerateError('');
    setIsGenerating(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Call pillar blog generation API
      const res = await api.generatePillarBlog({
        theme: { name: theme.theme, summary: theme.summary },
        keywords: theme.keywords,
        llmQuestions: theme.keywords?.llmQuestions || [],
        checklists: selectedChecklists,
      }, controller.signal);

      const result = res.result;
      if (!result) throw new Error('No result returned');

      // Count words
      const allText = [
        result.introduction, result.conclusion, result.tldr,
        ...(result.body || []).map(s => s.content),
        ...(result.faq || []).map(f => f.answer),
      ].filter(Boolean).join(' ');
      const wordCount = allText.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;

      // Save to database
      const blogRes = await api.createBlog({
        brand_profile_id: profile.id,
        title: toSentenceCase(result.title_tag || result.h1 || theme.theme),
        excerpt: result.meta_description || '',
        blog_data: result,
        checklist_selections: selectedChecklists,
        word_count: wordCount,
        blog_type: 'pillar',
        theme_name: theme.theme,
      });

      setIsGenerating(false);
      navigate(`/new-xeo-blogs/${blogRes.blog.slug}`);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[pillar-blog] Generation error:', err);
      setIsGenerating(false);
      setGenerateError(err.message || 'Pillar blog generation failed. Please try again.');
    }
  }

  // Download handler (placeholder - no data yet)
  const handleDownload = useCallback(async () => {
    if (!blogData || exporting) return;
    // Will be implemented when LLM integration is added
  }, [blogData, exporting]);

  const checklists = [
    { id: 'aeo', icon: BotMessageSquare, color: '#1e293b', name: 'AEO checklist', desc: 'Optimize content for AI engine answers', sections: aeoSections },
    { id: 'geo', icon: Globe, color: '#4f46e5', name: 'GEO checklist', desc: 'Optimize content for generative engine results', sections: geoSections },
    { id: 'seo', icon: Search, color: '#0f766e', name: 'SEO checklist', desc: 'Optimize content for search engine rankings', sections: seoSections },
  ];

  const tabs = [
    { id: 'content',  label: 'Content',  icon: FileText },
    { id: 'metadata', label: 'Metadata', icon: Code },
    { id: 'faq',      label: 'FAQs',     icon: HelpCircle },
    { id: 'links',    label: 'Links',    icon: Link2 },
    { id: 'images',   label: 'Images',   icon: Image },
    { id: 'schema',   label: 'Schema',   icon: Code },
    { id: 'eeat',     label: 'E-E-A-T',  icon: ShieldCheck },
  ];

  // Step 3: Blog result with tabs
  if (step === 3) {
    const themeName = theme?.theme || 'Pillar blog';
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>{themeName}</h1>
            <p className={styles.description}>AI-generated pillar blog with AEO, GEO and SEO optimization</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.cancelBtn} onClick={() => setStep(2)}>
              Back
            </button>
            <button className={styles.nextBtn} onClick={() => navigate('/new-xeo-blogs')}>
              Finish
            </button>
          </div>
        </header>

        <div className={styles.resultCard}>
          <div className={styles.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={13} strokeWidth={2} />
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
            <div className={styles.tabBarSpacer} />
            <button
              className={styles.downloadBtn}
              onClick={handleDownload}
              disabled={exporting || !blogData}
            >
              <Download size={13} strokeWidth={2} />
              <span className={styles.tabLabel}>{exporting ? 'Exporting...' : 'Download'}</span>
            </button>
          </div>

          <div className={styles.tabContent}>
            <div className={styles.emptyTab}>
              <p className={styles.emptyTabText}>No content yet. LLM integration coming soon.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Checklists
  if (step === 2) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>New pillar blog</h1>
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
              <p className={styles.generateTitle}>Writing your pillar blog</p>
              <p className={styles.generateDesc}>Our AI agents are generating your pillar blog post. This can take up to 5 minutes. Please do not close this window.</p>
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

  // Step 1: Theme card only
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New pillar blog</h1>
          <p className={styles.description}>Review your blog theme and generate a pillar post</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.cancelBtn} onClick={() => navigate('/new-xeo-blogs')}>
            Cancel
          </button>
          <button className={styles.nextBtn} disabled={!theme} onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      </header>

      <div className={styles.themeGrid}>
        <div className={styles.card}>
          {loading ? (
            <div className={styles.cardLoading}><LoadingSpinner /></div>
          ) : (
            <div className={styles.cardInner}>
              <div className={styles.iconSquare} style={{ background: '#1e293b' }}>
                <BookOpen size={14} strokeWidth={2} />
              </div>
              <h2 className={styles.cardTitle}>Blog theme</h2>
              <p className={styles.cardDesc}>Selected theme and keyword context for this pillar post</p>

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
      </div>
    </div>
  );
}
