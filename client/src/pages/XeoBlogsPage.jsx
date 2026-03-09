import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Rss, ChevronDown, Search, Landmark } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import EmptyCard from '../components/EmptyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import formatDate from '../utils/formatDate';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import styles from './XeoBlogsPage.module.css';

const BLOG_TYPES = [
  { value: 'pillar', name: 'Pillar post', desc: 'Main post that covers the entire theme' },
  { value: 'individual', name: 'Individual post', desc: 'Focused post on one topic in the theme' },
];

const STATUS_COLORS = {
  draft:     { backgroundColor: 'var(--blue-bg)', color: 'var(--blue)' },
  published: { backgroundColor: 'var(--blue-bg)', color: 'var(--blue)' },
};

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
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState(null);

  // Modal form state
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const [blogThemes, setBlogThemes] = useState([]);

  // Load blogs from DB on mount
  useEffect(() => {
    api.listBlogs()
      .then(res => setBlogs(res.blogs || []))
      .catch(() => {})
      .finally(() => setBlogsLoading(false));
  }, []);

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
    const state = {
      profileSlug: selectedProfile,
      themeId: selectedTheme,
      type: selectedType,
    };
    handleClose();
    if (selectedType === 'pillar') {
      navigate('/new-xeo-blogs/new-pillar-blog', { state });
    } else {
      navigate('/new-xeo-blogs/new-individual-blog', { state });
    }
  }

  async function handleDelete() {
    if (!deletingSlug) return;
    try {
      await api.deleteBlog(deletingSlug);
      setBlogs(prev => prev.filter(b => b.slug !== deletingSlug));
    } catch {}
    setDeletingSlug(null);
  }

  const canNext = selectedProfile && selectedTheme && selectedType;

  const profileOptions = profiles
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => ({ value: p.slug, label: p.name }));

  const themeOptions = blogThemes.map(t => ({ value: String(t.id), label: t.theme }));

  function getReadTime(wordCount) {
    const min = Math.max(1, Math.round((wordCount || 0) / 250));
    return `${min} min`;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New XEO blogs</h1>
          <p className={styles.description}>Write AEO + GEO + SEO blogs for inbound traffic and leads.</p>
        </div>
        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          New XEO blog
        </button>
      </header>

      {blogsLoading ? (
        <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
          <LoadingSpinner />
        </div>
      ) : blogs.length === 0 ? (
        <div className={styles.grid}>
          <EmptyCard label="Create New XEO blog" onClick={() => setModalOpen(true)} />
        </div>
      ) : (
        <div className={styles.grid}>
          {blogs.map(blog => (
            <article key={blog.slug} className={styles.card} onClick={() => navigate(`/new-xeo-blogs/${blog.slug}`)}>
              <div className={styles.cardHeader}>
                <span className={styles.tag} style={STATUS_COLORS.draft}>
                  {blog.brand_profiles?.name || 'Unknown'}
                </span>
                <span className={styles.date}>{formatDate(blog.created_at)}</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle} title={blog.title}>{blog.title}</h3>
                {blog.blog_type === 'pillar' ? (
                  <div className={styles.pillarBody} title={`Pillar post: ${blog.theme_name || blog.title}`}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={styles.pillarCircle}>
                        <Landmark size={13} strokeWidth={2} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.excerpt} title={blog.excerpt}>{blog.excerpt}</p>
                )}
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardContextual}>
                  <span className={styles.readTime}>{getReadTime(blog.word_count)} read</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={e => { e.stopPropagation(); setDeletingSlug(blog.slug); }}><Trash2 size={13} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {deletingSlug && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setDeletingSlug(null)}
        />
      )}

      {modalOpen && (
        <div className={styles.backdrop} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <Rss size={15} strokeWidth={2} />
            </div>

            <div className={styles.modalHeading}>
              <h2 className={styles.modalTitle}>Create New XEO blog</h2>
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
                    <label key={t.value} className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="blogType"
                        className={styles.radioInput}
                        value={t.value}
                        checked={selectedType === t.value}
                        onChange={() => setSelectedType(t.value)}
                        disabled={!selectedProfile || !selectedTheme}
                      />
                      <span className={styles.radioTextWrap}>
                        <span className={styles.radioText}>{t.name}</span>
                        <span className={styles.radioDesc}>{t.desc}</span>
                      </span>
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
