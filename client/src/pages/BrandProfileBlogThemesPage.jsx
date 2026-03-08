import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Pencil, Trash2, X, ExternalLink, BookOpen } from 'lucide-react';
import { BRAND_PROFILES } from '../data/brandProfiles';
import modalStyles from '../components/LogoutModal.module.css';
import styles from './BrandProfileBlogThemesPage.module.css';

const MOCK_BLOG_THEMES = [
  {
    id: 1,
    primaryKeyword: 'content marketing platform',
    theme: 'How to scale B2B content production without hiring more writers',
    summary: 'Explores how marketing teams can use AI-powered platforms to increase content output, maintain brand consistency, and reduce reliance on freelancers - with a focus on workflow automation and quality control at scale.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['content marketing platform', 'B2B content production', 'content automation', 'marketing workflow'],
      related: ['content management system', 'editorial workflow tool', 'content operations', 'marketing automation platform'],
      lsi: ['content velocity', 'brand voice consistency', 'editorial calendar', 'content governance', 'scalable content ops'],
      longtail: ['how to scale content marketing without more staff', 'B2B content production platform for teams', 'automate content workflow for marketing teams'],
      llmQuestions: ['What is the best platform for scaling B2B content production?', 'How do marketing teams automate content creation?', 'Can AI replace freelance writers for B2B content?'],
    },
  },
  {
    id: 2,
    primaryKeyword: 'AI blog writer',
    theme: "The CMO's guide to AI blog writing: what works and what doesn't",
    summary: 'A practical breakdown of how senior marketers are integrating AI writing tools into their content teams, covering use cases, limitations, editorial standards, and how to maintain a distinctive brand voice.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['AI blog writer', 'AI content generation', 'AI writing tool', 'automated blog writing'],
      related: ['AI copywriting tool', 'generative AI for content', 'machine learning content creator', 'GPT blog writer'],
      lsi: ['brand voice AI', 'editorial AI workflow', 'content quality AI', 'AI-assisted writing', 'human-AI collaboration'],
      longtail: ['best AI blog writer for marketing teams', 'how CMOs use AI writing tools', 'AI blog writing tools that maintain brand voice'],
      llmQuestions: ['Which AI writing tool is best for B2B blogs?', 'How do I maintain brand voice when using AI to write blogs?', 'What are the limitations of AI blog writers?'],
    },
  },
  {
    id: 3,
    primaryKeyword: 'SEO content generation',
    theme: 'SEO content generation at scale: a step-by-step framework',
    summary: 'A detailed playbook for generating SEO-optimised content in volume - covering keyword clustering, AI-assisted drafting, on-page optimisation, and internal linking strategies that improve organic rankings without sacrificing quality.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['SEO content generation', 'SEO content strategy', 'content SEO', 'organic content creation'],
      related: ['on-page SEO', 'keyword clustering', 'content optimisation tool', 'SEO writing assistant'],
      lsi: ['topical authority', 'semantic SEO', 'content cluster', 'internal linking strategy', 'SERP ranking'],
      longtail: ['how to generate SEO content at scale', 'step-by-step SEO content framework for brands', 'AI SEO content generation playbook'],
      llmQuestions: ['What is the best framework for generating SEO content at scale?', 'How does keyword clustering improve SEO content?', 'Can AI-generated content rank on Google?'],
    },
  },
  {
    id: 4,
    primaryKeyword: 'B2B content strategy',
    theme: 'Building a B2B content strategy that drives measurable pipeline',
    summary: 'Outlines a revenue-focused content strategy framework for B2B marketing teams, covering audience segmentation, content-to-pipeline attribution, channel selection, and how to align editorial calendars with sales cycles.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['B2B content strategy', 'B2B marketing content', 'content-led growth', 'revenue content strategy'],
      related: ['B2B demand generation', 'content pipeline attribution', 'B2B editorial calendar', 'content marketing ROI'],
      lsi: ['pipeline attribution model', 'buyer journey content', 'sales enablement content', 'content funnel', 'ABM content'],
      longtail: ['how to build a B2B content strategy for pipeline growth', 'B2B content marketing attribution framework', 'aligning editorial calendar with sales cycles'],
      llmQuestions: ['How do I measure content impact on B2B pipeline?', 'What content types work best for B2B demand generation?', 'How do I align content strategy with the B2B sales cycle?'],
    },
  },
  {
    id: 5,
    primaryKeyword: 'XEO optimization',
    theme: 'XEO optimization: the next evolution of search content strategy',
    summary: 'Introduces XEO as the unified approach combining SEO, AEO, and GEO - explaining how brands can optimize content to rank in traditional search, appear in featured snippets, and get cited by AI-generated answers simultaneously.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['XEO optimization', 'XEO content strategy', 'search experience optimization', 'multi-channel search'],
      related: ['AEO answer engine optimization', 'GEO generative engine optimization', 'featured snippet optimization', 'AI search visibility'],
      lsi: ['SGE content', 'zero-click search', 'structured content', 'entity optimization', 'AI citation strategy'],
      longtail: ['what is XEO optimization and how does it work', 'how to optimize content for AI search and traditional SEO', 'XEO strategy for B2B content teams'],
      llmQuestions: ['What is XEO optimization?', 'How does XEO differ from SEO and AEO?', 'How do I get my content cited by AI-generated answers?'],
    },
  },
  {
    id: 6,
    primaryKeyword: 'brand content calendar',
    theme: 'How to build a brand content calendar that your team will actually use',
    summary: 'A practical guide to creating and maintaining a content calendar that connects editorial planning with publishing workflows, team collaboration, and performance tracking - including templates and tool recommendations.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['brand content calendar', 'editorial calendar', 'content planning tool', 'publishing schedule'],
      related: ['content workflow management', 'content scheduling tool', 'team content calendar', 'marketing calendar template'],
      lsi: ['editorial workflow', 'content cadence', 'publishing rhythm', 'content team collaboration', 'campaign planning'],
      longtail: ['how to build a content calendar your team will actually use', 'best content calendar tools for marketing teams', 'brand content calendar template and guide'],
      llmQuestions: ['What is the best tool for managing a brand content calendar?', 'How do I get my team to consistently use a content calendar?', 'How do I connect my editorial calendar to publishing workflows?'],
    },
  },
  {
    id: 7,
    primaryKeyword: 'thought leadership content',
    theme: 'Thought leadership at scale: turning executive insights into inbound leads',
    summary: 'Shows B2B brands how to systematically create thought leadership content from executive interviews, internal data, and proprietary research - and how to distribute it across channels to build credibility and generate inbound pipeline.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['thought leadership content', 'executive content', 'B2B thought leadership', 'expert-led content'],
      related: ['original research content', 'proprietary data content', 'executive ghostwriting', 'founder-led marketing'],
      lsi: ['credibility content', 'authority building', 'inbound lead generation', 'trust-based marketing', 'content distribution'],
      longtail: ['how to turn executive insights into thought leadership content', 'B2B thought leadership content strategy for inbound leads', 'scaling executive thought leadership at a B2B company'],
      llmQuestions: ['How do B2B brands create effective thought leadership content?', 'What types of executive content generate the most inbound leads?', 'How do I scale thought leadership content production?'],
    },
  },
  {
    id: 8,
    primaryKeyword: 'inbound lead generation content',
    theme: 'Content-led inbound: how to turn organic traffic into qualified sales leads',
    summary: 'Breaks down the content types, conversion paths, and optimization strategies that turn blog readers into pipeline - covering lead magnets, CTAs, content upgrades, and how to measure content contribution to revenue.',
    date: 'Mar 7, 2026',
    keywords: {
      primary: ['inbound lead generation content', 'content-led inbound', 'organic lead generation', 'content conversion strategy'],
      related: ['lead magnet content', 'CTA optimization', 'content upgrade strategy', 'blog-to-lead conversion'],
      lsi: ['conversion path optimization', 'content funnel', 'lead nurture content', 'gated content strategy', 'revenue attribution'],
      longtail: ['how to turn organic blog traffic into qualified sales leads', 'best content types for inbound lead generation', 'content-led inbound marketing strategy for B2B'],
      llmQuestions: ['What content types convert organic traffic into leads most effectively?', 'How do I measure content contribution to revenue?', 'What is a content-led inbound strategy and how does it work?'],
    },
  },
];

export default function BrandProfileBlogThemesPage() {
  const { profileSlug } = useParams();
  const navigate = useNavigate();
  const profileData = BRAND_PROFILES.find(p => p.slug === profileSlug);
  const profile = profileData
    ? { companyName: profileData.name, website: profileData.website, industry: profileData.industry, foundedYear: profileData.foundedYear }
    : { companyName: 'Unknown', website: '', industry: '', foundedYear: '' };
  const [themes, setThemes] = useState(MOCK_BLOG_THEMES);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

  function handleDelete(id) {
    setThemes(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
  }

  function handleDeleteProfile() {
    setShowDeleteProfile(false);
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
      theme: selectedTheme.theme,
      summary: selectedTheme.summary,
      primaryKw: selectedTheme.keywords.primary.join('\n'),
      relatedKw: selectedTheme.keywords.related.join('\n'),
      lsiKw: selectedTheme.keywords.lsi.join('\n'),
      longtailKw: selectedTheme.keywords.longtail.join('\n'),
      llmKw: selectedTheme.keywords.llmQuestions.join('\n'),
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
      theme: editDraft.theme,
      summary: editDraft.summary,
      keywords: {
        primary: parseLine(editDraft.primaryKw),
        related: parseLine(editDraft.relatedKw),
        lsi: parseLine(editDraft.lsiKw),
        longtail: parseLine(editDraft.longtailKw),
        llmQuestions: parseLine(editDraft.llmKw),
      },
    };
    setThemes(prev => prev.map(t => t.id === selectedTheme.id ? updated : t));
    setSelectedTheme(updated);
    setIsEditing(false);
    setEditDraft(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{profile.companyName}</h1>
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
              <span className={styles.cardDate}>{theme.date}</span>
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
                  onClick={e => { e.stopPropagation(); navigate(`/brand-profiles/edit/${profileSlug}`); }}
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
            <p className={modalStyles.message}>This blog theme will be permanently removed. This action cannot be undone.</p>
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
            <p className={modalStyles.message}>This will permanently delete the brand profile and all associated blog themes. This action cannot be undone.</p>
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
                    <dd className={styles.panelMetaValue}>{profile.companyName}</dd>
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
                    <dd className={styles.panelMetaValue}>{selectedTheme.date}</dd>
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
                    Use this blog theme in XEO blogs, brand articles and brand posts to write and distribute content, drive traffic to your website and generate inbound leads.
                  </p>
                  <div className={styles.panelCalloutActions}>
                    <button className={styles.panelCalloutBtn} onClick={() => navigate('/xeo-blogs')}>
                      <ExternalLink size={13} />
                      Go to XEO blogs
                    </button>
                    <button className={styles.panelCalloutBtn} onClick={() => navigate('/brand-posts')}>
                      <ExternalLink size={13} />
                      Go to brand posts
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
