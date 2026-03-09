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
  New:        { backgroundColor: '#eef2ff', color: '#4f46e5' },
  Competitor: { backgroundColor: '#ecfeff', color: '#0891b2' },
  Refresh:    { backgroundColor: '#ecfdf5', color: '#059669' },
  Trending:   { backgroundColor: '#fdf4ff', color: '#c026d3' },
  Product:    { backgroundColor: '#f5f3ff', color: '#7c3aed' },
  Whitepaper: { backgroundColor: '#fff1f2', color: '#e11d48' },
};

const SAMPLE_ARTICLES = [
  { title: 'How AI is Transforming B2B Content Marketing',              excerpt: 'AI is fundamentally reshaping how B2B brands plan, produce, and distribute content at scale. From automated drafting to intelligent topic clustering, marketing teams are using AI to reduce production time, maintain brand consistency, and publish more without hiring additional writers.',          category: 'New',        date: 'Mar 1, 2026',  readTime: '6 min' },
  { title: '10 SEO Mistakes That Are Killing Your Organic Traffic',     excerpt: 'Even well-intentioned SEO strategies can backfire. This post breaks down the ten most common mistakes - from keyword cannibalization to slow page speed - that quietly erode your search rankings and explains exactly how to diagnose and fix each one before they do further damage.',    category: 'New',        date: 'Feb 28, 2026', readTime: '8 min' },
  { title: 'The Complete Guide to Competitor Gap Analysis',             excerpt: 'Competitor gap analysis reveals the keywords and topics your rivals rank for that your brand has not yet covered. This guide walks through the full process - from identifying gaps using SEO tools to prioritizing content that can realistically close the ranking difference fast.',   category: 'Competitor', date: 'Feb 25, 2026', readTime: '10 min' },
  { title: 'Why Your Article Traffic Dropped and How to Fix It',        excerpt: 'A sudden drop in article traffic can have multiple causes - algorithm updates, index coverage issues, cannibalized keywords, or outdated content. This post helps you systematically diagnose the root cause using Search Console and analytics data, then apply targeted fixes to recover.',  category: 'Refresh',    date: 'Feb 22, 2026', readTime: '5 min' },
  { title: 'Product-Led Growth: Turning Features Into Article Topics',  excerpt: 'Your product roadmap is a content goldmine most marketing teams overlook. This post shows how to extract high-intent article topics from product features, use cases, and customer jobs-to-be-done - creating content that attracts search traffic already in a buying mindset.',    category: 'Product',    date: 'Feb 19, 2026', readTime: '7 min' },
  { title: 'GEO vs SEO: What Generative Engine Optimization Means for You', excerpt: 'Generative engine optimization is emerging as a discipline alongside traditional SEO as AI-powered tools like ChatGPT and Perplexity become primary research channels. This post explains what GEO is, how it differs from SEO, and how to structure content to rank in both.', category: 'New',    date: 'Feb 16, 2026', readTime: '9 min' },
  { title: 'How to Turn a Whitepaper Into 10 High-Traffic Articles',    excerpt: 'A single whitepaper or research report contains enough material for a dozen keyword-targeted articles. This guide covers how to extract distinct angles, map each to a search query, and repurpose your long-form asset into a steady pipeline of SEO-optimized content.',       category: 'Whitepaper', date: 'Feb 13, 2026', readTime: '6 min' },
  { title: 'Trending Topics Your Audience Is Searching for This Quarter', excerpt: 'Publishing content around timely industry trends can generate significant short-term traffic before competition increases. This post covers how to identify emerging topics early using tools like Google Trends and social listening platforms, and how to publish fast without sacrificing quality.',       category: 'Trending',   date: 'Feb 10, 2026', readTime: '4 min' },
  { title: 'AEO Basics: Answering Questions Your Buyers Are Asking',    excerpt: 'Answer engine optimization focuses on structuring content so AI tools and voice assistants can extract and cite your answers directly. This primer explains the core principles of AEO, how it overlaps with traditional SEO, and practical steps to optimize your existing content for question-based queries.',         category: 'New',        date: 'Feb 7, 2026',  readTime: '5 min' },
  { title: 'Launching a New Feature? Here Is Your Article Content Plan', excerpt: 'A product launch is one of the highest-leverage moments to publish SEO content, yet most teams miss it. This post outlines a content plan that maps new feature announcements to the search queries your ideal customers are already making - turning launches into long-term organic traffic drivers.',   category: 'Product',    date: 'Feb 4, 2026',  readTime: '7 min' },
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
