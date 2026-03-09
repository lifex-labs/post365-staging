import { useState } from 'react';
import { Plus, X, Lock, Pencil, Trash2, PenLine, Target, RefreshCw, TrendingUp, Rocket, FileText } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import EmptyCard from '../components/EmptyCard';
import formatDate from '../utils/formatDate';
import styles from './BrandArticlesPage.module.css';

const ARTICLE_OPTIONS = [
  { icon: PenLine,    label: 'Write a new article',          desc: 'Write original, keyword-targeted articles from scratch optimized for search, AI engine visibility, and brand authority.',           iconBg: '#4f46e5', iconColor: '#ffffff' },
  { icon: Target,     label: 'Competitor gap article',       desc: 'Identify topics competitors rank for but your brand is missing, then publish superior content to capture that traffic.',         iconBg: '#0891b2', iconColor: '#ffffff', locked: true },
  { icon: RefreshCw,  label: 'Refresh existing article',     desc: 'Update outdated articles with new data, keywords, and AEO/GEO signals to recover lost rankings and improve performance.',          iconBg: '#059669', iconColor: '#ffffff', locked: true },
  { icon: TrendingUp, label: 'Trending topic article',       desc: 'Rapidly publish articles around breaking news or trends in your industry to capture short-term traffic spikes.',                   iconBg: '#c026d3', iconColor: '#ffffff', locked: true },
  { icon: Rocket,     label: 'Product and feature launch',   desc: 'Create SEO-optimized articles that contextualize new product launches within broader search queries customers are already making.', iconBg: '#7c3aed', iconColor: '#ffffff', locked: true },
  { icon: FileText,   label: 'Create from whitepaper',       desc: 'Transform whitepapers, case studies, or webinars into structured articles optimized for organic and AI-driven discovery.',        iconBg: '#e11d48', iconColor: '#ffffff', locked: true },
];

const CATEGORY_COLORS = {
  Sample:     { backgroundColor: 'var(--blue-bg)', color: 'var(--blue)' },
  New:        { backgroundColor: '#eef2ff', color: '#4f46e5' },
  Competitor: { backgroundColor: '#ecfeff', color: '#0891b2' },
  Refresh:    { backgroundColor: '#ecfdf5', color: '#059669' },
  Trending:   { backgroundColor: '#fdf4ff', color: '#c026d3' },
  Product:    { backgroundColor: '#f5f3ff', color: '#7c3aed' },
  Whitepaper: { backgroundColor: '#fff1f2', color: '#e11d48' },
};

const SAMPLE_ARTICLES = [
  { title: 'How AI is transforming B2B content marketing', excerpt: 'AI is fundamentally reshaping how B2B brands plan, produce, and distribute content at scale. From automated drafting to intelligent topic clustering, marketing teams are using AI to reduce production time, maintain brand consistency, and publish more without hiring additional writers.', category: 'Sample', date: 'Mar 1, 2026', readTime: '6 min' },
];

export default function BrandArticlesPage() {
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState('Write a new article');
  const [deletingIndex, setDeletingIndex] = useState(null);

  function handleClose() {
    setModalOpen(false);
    setSelected('Write a new article');
  }

  function handleSelect() {
    handleClose();
  }

  function handleDelete() {
    setArticles(prev => prev.filter((_, i) => i !== deletingIndex));
    setDeletingIndex(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Brand articles</h1>
          <p className={styles.description}>Write and manage brand articles for inbound traffic and leads.</p>
        </div>
        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          <Plus size={14} strokeWidth={2.5} />
          Brand article
        </button>
      </header>

      <div className={styles.grid}>
        {articles.length === 0 ? (
          <EmptyCard label="Create brand article" onClick={() => setModalOpen(true)} />
        ) : articles.map((article, i) => (
          <article key={i} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.tag} style={CATEGORY_COLORS[article.category]}>{article.category}</span>
              <span className={styles.date}>{formatDate(article.date)}</span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle} title={article.title}>{article.title}</h3>
              <p className={styles.excerpt} title={article.excerpt}>{article.excerpt}</p>
            </div>
            <div className={styles.cardFooter}>
              <div className={styles.cardContextual}>
                <span className={styles.readTime}>{article.readTime} read</span>
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
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Create brand article</span>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.optionGrid}>
              {ARTICLE_OPTIONS.map(({ icon: Icon, label, desc, iconBg, iconColor, locked }) => (
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
