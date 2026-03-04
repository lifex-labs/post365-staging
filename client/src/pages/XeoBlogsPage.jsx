import { useState } from 'react';
import { Plus, X, Lock, Pencil, Trash2, PenLine, Target, RefreshCw, TrendingUp, Rocket, FileText } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import styles from './XeoBlogsPage.module.css';

const BLOG_OPTIONS = [
  { icon: PenLine,    label: 'Write a new blog',            desc: 'Write original, keyword-targeted blogs from scratch optimized for search, AI engine visibility, and brand authority.',           iconBg: '#4f46e5', iconColor: '#ffffff' },
  { icon: Target,     label: 'Competitor gap blog',         desc: 'Identify topics competitors rank for but your brand is missing, then publish superior content to capture that traffic.',         iconBg: '#0891b2', iconColor: '#ffffff', locked: true },
  { icon: RefreshCw,  label: 'Refresh existing blog',       desc: 'Update outdated posts with new data, keywords, and AEO/GEO signals to recover lost rankings and improve performance.',          iconBg: '#059669', iconColor: '#ffffff', locked: true },
  { icon: TrendingUp, label: 'Trending topic blog',         desc: 'Rapidly publish blogs around breaking news or trends in your industry to capture short-term traffic spikes.',                   iconBg: '#c026d3', iconColor: '#ffffff', locked: true },
  { icon: Rocket,     label: 'Product & feature launch',    desc: 'Create SEO-optimized blogs that contextualize new product launches within broader search queries customers are already making.', iconBg: '#7c3aed', iconColor: '#ffffff', locked: true },
  { icon: FileText,   label: 'Create from whitepaper',      desc: 'Transform whitepapers, case studies, or webinars into structured blogs optimized for organic and AI-driven discovery.',        iconBg: '#e11d48', iconColor: '#ffffff', locked: true },
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
  { title: 'How AI is Transforming B2B Content Marketing',              excerpt: 'AI is reshaping how brands create, distribute, and optimize content at scale.',          category: 'New',        date: 'Mar 1, 2026',  readTime: '6 min' },
  { title: '10 SEO Mistakes That Are Killing Your Organic Traffic',     excerpt: 'Avoid these common pitfalls that silently drain your search rankings and visibility.',    category: 'New',        date: 'Feb 28, 2026', readTime: '8 min' },
  { title: 'The Complete Guide to Competitor Gap Analysis',             excerpt: 'Find the topics your competitors rank for that you are missing and close the gap fast.',   category: 'Competitor', date: 'Feb 25, 2026', readTime: '10 min' },
  { title: 'Why Your Blog Traffic Dropped and How to Fix It',           excerpt: 'Diagnose the root causes of traffic loss and apply targeted fixes to recover rankings.',  category: 'Refresh',    date: 'Feb 22, 2026', readTime: '5 min' },
  { title: 'Product-Led Growth: Turning Features Into Blog Topics',     excerpt: 'Use your product features as a content engine to attract high-intent search traffic.',    category: 'Product',    date: 'Feb 19, 2026', readTime: '7 min' },
  { title: 'GEO vs SEO: What Generative Engine Optimization Means for You', excerpt: 'Learn how to optimize content for AI-driven discovery alongside traditional search.', category: 'New',    date: 'Feb 16, 2026', readTime: '9 min' },
  { title: 'How to Turn a Whitepaper Into 10 High-Traffic Blog Posts',  excerpt: 'Repurpose long-form research into a steady stream of SEO-optimized blog content.',       category: 'Whitepaper', date: 'Feb 13, 2026', readTime: '6 min' },
  { title: 'Trending Topics Your Audience Is Searching for This Quarter', excerpt: 'Capture short-term traffic spikes by publishing around timely industry topics.',       category: 'Trending',   date: 'Feb 10, 2026', readTime: '4 min' },
  { title: 'AEO Basics: Answering Questions Your Buyers Are Asking',    excerpt: 'Structure your content to appear in AI answer engines and voice search results.',         category: 'New',        date: 'Feb 7, 2026',  readTime: '5 min' },
  { title: 'Launching a New Feature? Here Is Your Blog Content Plan',   excerpt: 'Contextualize product launches within search queries your ideal customers are making.',   category: 'Product',    date: 'Feb 4, 2026',  readTime: '7 min' },
];

export default function XeoBlogsPage() {
  const [blogs, setBlogs] = useState(SAMPLE_BLOGS);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState('Write a new blog');
  const [deletingIndex, setDeletingIndex] = useState(null);

  function handleClose() {
    setModalOpen(false);
    setSelected('Write a new blog');
  }

  function handleSelect() {
    // proceed with selected option
    handleClose();
  }

  function handleDelete() {
    setBlogs(prev => prev.filter((_, i) => i !== deletingIndex));
    setDeletingIndex(null);
  }

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
            <div className={styles.cardMeta}>
              <span className={styles.tag} style={CATEGORY_COLORS[blog.category]}>{blog.category}</span>
              <span className={styles.date}>{blog.date}</span>
            </div>
            <h3 className={styles.cardTitle}>{blog.title}</h3>
            <p className={styles.excerpt}>{blog.excerpt}</p>
            <div className={styles.cardFooter}>
              <span className={styles.readTime}>{blog.readTime} read</span>
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
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Create XEO blog</span>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.optionGrid}>
              {BLOG_OPTIONS.map(({ icon: Icon, label, desc, iconBg, iconColor, locked }) => (
                <button
                  key={label}
                  className={`${styles.option} ${selected === label ? styles.optionSelected : ''} ${locked ? styles.optionLocked : ''}`}
                  onClick={() => !locked && setSelected(label)}
                >
                  {locked && <Lock size={12} className={styles.lockIcon} />}
                  <div className={styles.optionIcon} style={{ background: iconBg, color: iconColor }}><Icon size={13} strokeWidth={2} /></div>
                  <div className={styles.optionText}>
                    <span className={styles.optionLabel}>{label}</span>
                    <span className={styles.optionDesc}>{desc}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleClose}>Cancel</button>
              <button className={styles.selectBtn} onClick={handleSelect} disabled={!selected}>Select</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
