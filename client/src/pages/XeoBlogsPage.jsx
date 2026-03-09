import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Rss, ChevronDown, Search } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import formatDate from '../utils/formatDate';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import styles from './XeoBlogsPage.module.css';

const BLOG_TYPES = [
  'Pillar blog for the theme',
  'Individual blog for a theme',
];

const CATEGORY_COLORS = {
  New:        { backgroundColor: '#eef2ff', color: '#4f46e5' },
  Competitor: { backgroundColor: '#ecfeff', color: '#0891b2' },
  Refresh:    { backgroundColor: '#ecfdf5', color: '#059669' },
  Trending:   { backgroundColor: '#fdf4ff', color: '#c026d3' },
  Product:    { backgroundColor: '#f5f3ff', color: '#7c3aed' },
  Whitepaper: { backgroundColor: '#fff1f2', color: '#e11d48' },
};

const SAMPLE_BLOGS = [
  { title: 'How AI is Transforming B2B Content Marketing',              excerpt: 'AI is fundamentally reshaping how B2B brands plan, produce, and distribute content at scale. From automated drafting to intelligent topic clustering, marketing teams are using AI to reduce production time, maintain brand consistency, and publish more without hiring additional writers.',          category: 'New',        date: 'Mar 1, 2026',  readTime: '6 min' },
  { title: '10 SEO Mistakes That Are Killing Your Organic Traffic',     excerpt: 'Even well-intentioned SEO strategies can backfire. This post breaks down the ten most common mistakes - from keyword cannibalization to slow page speed - that quietly erode your search rankings and explains exactly how to diagnose and fix each one before they do further damage.',    category: 'New',        date: 'Feb 28, 2026', readTime: '8 min' },
  { title: 'The Complete Guide to Competitor Gap Analysis',             excerpt: 'Competitor gap analysis reveals the keywords and topics your rivals rank for that your brand has not yet covered. This guide walks through the full process - from identifying gaps using SEO tools to prioritizing content that can realistically close the ranking difference fast.',   category: 'Competitor', date: 'Feb 25, 2026', readTime: '10 min' },
  { title: 'Why Your Blog Traffic Dropped and How to Fix It',           excerpt: 'A sudden drop in blog traffic can have multiple causes - algorithm updates, index coverage issues, cannibalized keywords, or outdated content. This post helps you systematically diagnose the root cause using Search Console and analytics data, then apply targeted fixes to recover.',  category: 'Refresh',    date: 'Feb 22, 2026', readTime: '5 min' },
  { title: 'Product-Led Growth: Turning Features Into Blog Topics',     excerpt: 'Your product roadmap is a content goldmine most marketing teams overlook. This post shows how to extract high-intent blog topics from product features, use cases, and customer jobs-to-be-done - creating content that attracts search traffic already in a buying mindset.',    category: 'Product',    date: 'Feb 19, 2026', readTime: '7 min' },
  { title: 'GEO vs SEO: What Generative Engine Optimization Means for You', excerpt: 'Generative engine optimization is emerging as a discipline alongside traditional SEO as AI-powered tools like ChatGPT and Perplexity become primary research channels. This post explains what GEO is, how it differs from SEO, and how to structure content to rank in both.', category: 'New',    date: 'Feb 16, 2026', readTime: '9 min' },
  { title: 'How to Turn a Whitepaper Into 10 High-Traffic Blog Posts',  excerpt: 'A single whitepaper or research report contains enough material for a dozen keyword-targeted blog posts. This guide covers how to extract distinct angles, map each to a search query, and repurpose your long-form asset into a steady pipeline of SEO-optimized content.',       category: 'Whitepaper', date: 'Feb 13, 2026', readTime: '6 min' },
  { title: 'Trending Topics Your Audience Is Searching for This Quarter', excerpt: 'Publishing content around timely industry trends can generate significant short-term traffic before competition increases. This post covers how to identify emerging topics early using tools like Google Trends and social listening platforms, and how to publish fast without sacrificing quality.',       category: 'Trending',   date: 'Feb 10, 2026', readTime: '4 min' },
  { title: 'AEO Basics: Answering Questions Your Buyers Are Asking',    excerpt: 'Answer engine optimization focuses on structuring content so AI tools and voice assistants can extract and cite your answers directly. This primer explains the core principles of AEO, how it overlaps with traditional SEO, and practical steps to optimize your existing content for question-based queries.',         category: 'New',        date: 'Feb 7, 2026',  readTime: '5 min' },
  { title: 'Launching a New Feature? Here Is Your Blog Content Plan',   excerpt: 'A product launch is one of the highest-leverage moments to publish SEO content, yet most teams miss it. This post outlines a content plan that maps new feature announcements to the search queries your ideal customers are already making - turning launches into long-term organic traffic drivers.',   category: 'Product',    date: 'Feb 4, 2026',  readTime: '7 min' },
];

/* ---- Searchable dropdown ---- */
function SearchableSelect({ label, placeholder, options, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.selectWrap} ref={ref}>
        <button
          type="button"
          className={`${styles.selectTrigger} ${disabled ? styles.selectDisabled : ''}`}
          onClick={() => !disabled && setOpen(prev => !prev)}
          disabled={disabled}
        >
          <span className={selected ? styles.selectValue : styles.selectPlaceholder}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown size={14} className={styles.selectChevron} />
        </button>
        {open && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownSearch}>
              <Search size={13} className={styles.dropdownSearchIcon} />
              <input
                className={styles.dropdownInput}
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.dropdownList}>
              {filtered.length === 0 && (
                <div className={styles.dropdownEmpty}>No results</div>
              )}
              {filtered.map(o => (
                <button
                  key={o.value}
                  type="button"
                  className={`${styles.dropdownItem} ${o.value === value ? styles.dropdownItemActive : ''}`}
                  onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function XeoBlogsPage() {
  const navigate = useNavigate();
  const api = useBrandProfilesApi();
  const [blogs, setBlogs] = useState(SAMPLE_BLOGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);

  // Modal form state
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [blogThemes, setBlogThemes] = useState([]);

  // Fetch brand profiles when modal opens
  useEffect(() => {
    if (!modalOpen) return;
    api.listProfiles()
      .then(res => setProfiles(res.profiles || []))
      .catch(() => setProfiles([]));
  }, [modalOpen]);

  // Fetch full profile (with blog_themes) when a profile is selected
  useEffect(() => {
    if (!selectedProfile) { setBlogThemes([]); return; }
    api.getProfile(selectedProfile)
      .then(res => {
        const themes = (res.profile?.blog_themes || [])
          .slice()
          .sort((a, b) => a.theme.localeCompare(b.theme));
        setBlogThemes(themes);
      })
      .catch(() => setBlogThemes([]));
  }, [selectedProfile]);

  // Reset dependent fields when parent changes
  function handleProfileChange(val) {
    setSelectedProfile(val);
    setSelectedTheme('');
    setSelectedType('');
  }

  function handleThemeChange(val) {
    setSelectedTheme(val);
    setSelectedType('');
  }

  function handleClose() {
    setModalOpen(false);
    setSelectedProfile('');
    setSelectedTheme('');
    setSelectedType('');
  }

  function handleNext() {
    if (selectedType === 'Individual blog for a theme') {
      const state = {
        profileSlug: selectedProfile,
        themeId: selectedTheme,
        type: selectedType,
      };
      handleClose();
      navigate('/xeo-blogs/new-individual-blog', { state });
    }
    // Pillar blog path will be defined later
  }

  function handleDelete() {
    setBlogs(prev => prev.filter((_, i) => i !== deletingIndex));
    setDeletingIndex(null);
  }

  const canNext = selectedProfile && selectedTheme && selectedType;

  const profileOptions = profiles
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => ({ value: p.slug, label: p.name }));

  const themeOptions = blogThemes.map(t => ({ value: String(t.id), label: t.theme }));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>XEO blogs</h1>
          <p className={styles.description}>Write AEO + GEO + SEO blogs for inbound traffic and leads.</p>
        </div>
        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          XEO blog
</button>
      </header>

      <div className={styles.grid}>
        {blogs.map((blog, i) => (
          <article key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.tag} style={CATEGORY_COLORS[blog.category]}>{blog.category}</span>
              <span className={styles.date}>{formatDate(blog.date)}</span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle} title={blog.title}>{blog.title}</h3>
              <p className={styles.excerpt} title={blog.excerpt}>{blog.excerpt}</p>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardContextual}>
                <span className={styles.readTime}>{blog.readTime} read</span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.iconBtn} title="Edit"><Pencil size={13} /></button>
                <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={() => setDeletingIndex(i)}><Trash2 size={13} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {deletingIndex !== null && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeletingIndex(null)}
        />
      )}

      {modalOpen && (
        <div className={styles.backdrop} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <Rss size={15} strokeWidth={2} />
            </div>

            <div className={styles.modalHeading}>
              <h2 className={styles.modalTitle}>Create XEO blog</h2>
              <p className={styles.modalDesc}>Select a brand profile, theme, and blog type</p>
            </div>

            <div className={styles.modalFields}>
              <SearchableSelect
                label="Brand profile"
                placeholder="Select a brand profile"
                options={profileOptions}
                value={selectedProfile}
                onChange={handleProfileChange}
              />
              <SearchableSelect
                label="Blog theme"
                placeholder="Select a blog theme"
                options={themeOptions}
                value={selectedTheme}
                onChange={handleThemeChange}
                disabled={!selectedProfile}
              />
              <div className={`${styles.field} ${!selectedProfile || !selectedTheme ? styles.fieldDisabled : ''}`}>
                <label className={styles.radioFieldLabel}>Blog type</label>
                <p className={styles.radioFieldDesc}>Select blog format for this theme</p>
                <div className={styles.radioGroup}>
                  {BLOG_TYPES.map(t => (
                    <label key={t} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="blogType"
                        className={styles.radioInput}
                        value={t}
                        checked={selectedType === t}
                        onChange={() => setSelectedType(t)}
                        disabled={!selectedProfile || !selectedTheme}
                      />
                      <span className={styles.radioText}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
              <button className={styles.nextBtn} onClick={handleNext} disabled={!canNext}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
