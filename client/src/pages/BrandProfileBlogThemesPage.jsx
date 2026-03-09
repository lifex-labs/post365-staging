import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, X, ExternalLink, BookOpen } from 'lucide-react';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import modalStyles from '../components/LogoutModal.module.css';
import formatDate from '../utils/formatDate';
import styles from './BrandProfileBlogThemesPage.module.css';

export default function BrandProfileBlogThemesPage() {
  const { profileSlug } = useParams();
  const navigate = useNavigate();
  const api = useBrandProfilesApi();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [themes, setThemes] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

  // Normalize a blog theme from raw agent format to view format, if needed
  function normalizeTheme(t, i) {
    if (t.theme !== undefined) return t; // already normalized
    return {
      id:             t.number ?? i + 1,
      primaryKeyword: (t.primary_keywords_included || [])[0] || '',
      theme:          t.blog_theme   || '',
      summary:        t.blog_theme_summary || '',
      date:           new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      keywords: {
        primary:      t.primary_keywords_included   || [],
        related:      t.related_keywords_included   || [],
        lsi:          t.lsi_keywords_included       || [],
        longtail:     t.long_tail_keywords_included || [],
        llmQuestions: t.key_llm_questions_included  || [],
      },
    };
  }

  useEffect(() => {
    api.getProfile(profileSlug)
      .then(res => {
        setProfile(res.profile);
        setThemes((res.profile.blog_themes || []).map(normalizeTheme));
      })
      .finally(() => setLoading(false));
  }, [profileSlug]);

  async function persistThemes(updatedThemes) {
    try {
      await api.updateProfile(profileSlug, { blogThemes: updatedThemes });
    } catch {
      // silently ignore — UI already reflects the change
    }
  }

  async function handleDeleteProfile() {
    try {
      await api.deleteProfile(profileSlug);
    } finally {
      setShowDeleteProfile(false);
      navigate('/brand-profiles');
    }
  }

  function handleDelete(id) {
    const updatedThemes = themes.filter(t => t.id !== id);
    setThemes(updatedThemes);
    setDeletingId(null);
    persistThemes(updatedThemes);
  }

  function handleCardClick(theme) {
    setSelectedTheme(theme);
    setIsEditing(false);
    setEditDraft(null);
  }

  function handleClosePanel() {
    setSelectedTheme(null);
    setIsEditing(false);
    setEditDraft(null);
  }

  function handleEditOpen() {
    setEditDraft({
      theme:      selectedTheme.theme,
      summary:    selectedTheme.summary,
      primaryKw:  selectedTheme.keywords.primary.join('\n'),
      relatedKw:  selectedTheme.keywords.related.join('\n'),
      lsiKw:      selectedTheme.keywords.lsi.join('\n'),
      longtailKw: selectedTheme.keywords.longtail.join('\n'),
      llmKw:      selectedTheme.keywords.llmQuestions.join('\n'),
    });
    setIsEditing(true);
  }

  function handleEditCancel() {
    setIsEditing(false);
    setEditDraft(null);
  }

  function handleEditSave() {
    const parseLine = str => str.split('\n').map(s => s.trim()).filter(Boolean);
    const updated = {
      ...selectedTheme,
      theme:   editDraft.theme,
      summary: editDraft.summary,
      keywords: {
        primary:      parseLine(editDraft.primaryKw),
        related:      parseLine(editDraft.relatedKw),
        lsi:          parseLine(editDraft.lsiKw),
        longtail:     parseLine(editDraft.longtailKw),
        llmQuestions: parseLine(editDraft.llmKw),
      },
    };
    const updatedThemes = themes.map(t => t.id === selectedTheme.id ? updated : t);
    setThemes(updatedThemes);
    setSelectedTheme(updated);
    setIsEditing(false);
    setEditDraft(null);
    persistThemes(updatedThemes);
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Blog themes</h1>
            <p className={styles.description}>Loading...</p>
          </div>
        </header>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Profile not found</h1>
            <p className={styles.description}>The brand profile you are looking for does not exist.</p>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{profile.name}</h1>
          <p className={styles.description}>Viewing blog themes created for this brand profile.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.headerOutlineBtn} title="Edit profile" onClick={() => navigate(`/brand-profiles/edit/${profileSlug}`)}>
            <Pencil size={13} />
            Edit
          </button>
          <button
            className={`${styles.headerOutlineBtn} ${styles.headerDangerBtn}`}
            title="Delete profile"
            onClick={() => setShowDeleteProfile(true)}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {themes.map(theme => (
          <div
            key={theme.id}
            className={styles.card}
            onClick={() => handleCardClick(theme)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.keywordTag}>{theme.primaryKeyword}</span>
              <span className={styles.cardDate}>{formatDate(theme.date)}</span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardName}>{theme.theme}</h3>
              <p className={styles.cardDesc}>{theme.summary}</p>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardContextual} />
              <div className={styles.cardActions}>
                <button
                  className={styles.iconBtn}
                  title="Edit"
                  onClick={e => { e.stopPropagation(); handleCardClick(theme); handleEditOpen(); }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={e => { e.stopPropagation(); setDeletingId(theme.id); }}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {deletingId !== null && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setDeletingId(null)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete blog theme</p>
            <p className={modalStyles.message}>This blog theme will be permanently removed. This cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setDeletingId(null)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={() => handleDelete(deletingId)}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showDeleteProfile && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowDeleteProfile(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete brand profile</p>
            <p className={modalStyles.message}>This will delete the brand profile and all associated blog themes. This cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteProfile(false)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={handleDeleteProfile}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {selectedTheme !== null && createPortal(
        <div className={styles.panelBackdrop} onClick={handleClosePanel}>
          <aside className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <span className={styles.panelKeywordTag}>{selectedTheme.primaryKeyword}</span>
              <div className={styles.panelHeaderBtns}>
                {!isEditing && (
                  <button className={styles.panelEditBtn} onClick={handleEditOpen} title="Edit">
                    <Pencil size={14} />
                  </button>
                )}
                <button className={styles.panelCloseBtn} onClick={handleClosePanel} title="Close">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.panelTitleBlock}>
                <div className={styles.panelIconSquare}>
                  <BookOpen size={14} />
                </div>
                {isEditing ? (
                  <input
                    className={styles.editInput}
                    value={editDraft.theme}
                    onChange={e => setEditDraft(prev => ({ ...prev, theme: e.target.value }))}
                  />
                ) : (
                  <h2 className={styles.panelThemeTitle}>{selectedTheme.theme}</h2>
                )}
              </div>

              <div className={styles.panelSection}>
                <h3 className={styles.panelSectionTitle}>Blog information</h3>
                <dl className={styles.panelMeta}>
                  <div className={styles.panelMetaRow}>
                    <dt className={styles.panelMetaLabel}>Company</dt>
                    <dd className={styles.panelMetaValue}>{profile.name}</dd>
                  </div>
                  <div className={styles.panelMetaRow}>
                    <dt className={styles.panelMetaLabel}>Website</dt>
                    <dd className={styles.panelMetaValue}>{profile.website}</dd>
                  </div>
                  <div className={styles.panelMetaRow}>
                    <dt className={styles.panelMetaLabel}>Industry</dt>
                    <dd className={styles.panelMetaValue}>{profile.industry}</dd>
                  </div>
                  <div className={styles.panelMetaRow}>
                    <dt className={styles.panelMetaLabel}>Created</dt>
                    <dd className={styles.panelMetaValue}>{formatDate(selectedTheme.date)}</dd>
                  </div>
                </dl>
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>Summary</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.summary}
                    onChange={e => setEditDraft(prev => ({ ...prev, summary: e.target.value }))}
                    rows={4}
                  />
                ) : (
                  <p className={styles.panelSummary}>{selectedTheme.summary}</p>
                )}
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>Primary keywords</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.primaryKw}
                    onChange={e => setEditDraft(prev => ({ ...prev, primaryKw: e.target.value }))}
                    rows={4}
                    placeholder="One keyword per line"
                  />
                ) : (
                  <ul className={styles.panelList}>
                    {selectedTheme.keywords.primary.map((kw, i) => (
                      <li key={i} className={styles.panelListItem}>{kw}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>Related keywords</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.relatedKw}
                    onChange={e => setEditDraft(prev => ({ ...prev, relatedKw: e.target.value }))}
                    rows={4}
                    placeholder="One keyword per line"
                  />
                ) : (
                  <ul className={styles.panelList}>
                    {selectedTheme.keywords.related.map((kw, i) => (
                      <li key={i} className={styles.panelListItem}>{kw}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>LSI keywords</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.lsiKw}
                    onChange={e => setEditDraft(prev => ({ ...prev, lsiKw: e.target.value }))}
                    rows={4}
                    placeholder="One keyword per line"
                  />
                ) : (
                  <ul className={styles.panelList}>
                    {selectedTheme.keywords.lsi.map((kw, i) => (
                      <li key={i} className={styles.panelListItem}>{kw}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>Long tail keywords</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.longtailKw}
                    onChange={e => setEditDraft(prev => ({ ...prev, longtailKw: e.target.value }))}
                    rows={4}
                    placeholder="One keyword per line"
                  />
                ) : (
                  <ul className={styles.panelList}>
                    {selectedTheme.keywords.longtail.map((kw, i) => (
                      <li key={i} className={styles.panelListItem}>{kw}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={`${styles.panelSection} ${styles.panelSectionSpaced}`}>
                <h3 className={styles.panelSectionTitle}>Key LLM questions</h3>
                {isEditing ? (
                  <textarea
                    className={styles.editTextarea}
                    value={editDraft.llmKw}
                    onChange={e => setEditDraft(prev => ({ ...prev, llmKw: e.target.value }))}
                    rows={4}
                    placeholder="One question per line"
                  />
                ) : (
                  <ul className={styles.panelList}>
                    {selectedTheme.keywords.llmQuestions.map((q, i) => (
                      <li key={i} className={styles.panelListItem}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>

              {isEditing ? (
                <div className={styles.editActions}>
                  <button className={styles.editCancelBtn} onClick={handleEditCancel}>Cancel</button>
                  <button className={styles.editSaveBtn} onClick={handleEditSave}>Save</button>
                </div>
              ) : (
                <div className={`${styles.panelCallout} ${styles.panelSectionSpaced}`}>
                  <p className={styles.panelCalloutText}>
                    Use this blog theme in New XEO blogs to write and distribute optimized, high-quality content, drive organic traffic to your website and generate inbound leads that convert into paying customers.
                  </p>
                  <div className={styles.panelCalloutActions}>
                    <button className={styles.panelCalloutBtn} onClick={() => navigate('/new-xeo-blogs')}>
                      <ExternalLink size={13} />
                      Go to New XEO blogs
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>,
        document.body
      )}
    </div>
  );
}
