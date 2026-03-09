import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText, Link2, Image, Code, ExternalLink, HelpCircle, ShieldCheck, Download, Info } from 'lucide-react';
import DOMPurify from 'dompurify';
import DeleteModal from '../components/DeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import styles from './XeoBlogPage.module.css';

function sanitize(html) {
  return { __html: DOMPurify.sanitize(html || '', { ADD_ATTR: ['target'] }) };
}

function MetadataSection({ metadata }) {
  if (!metadata) return null;
  const rows = [
    ['Title tag',         metadata.title_tag],
    ['Meta description',  metadata.meta_description],
    ['URL slug',          metadata.url_slug],
    ['Primary keyword',   metadata.primary_keyword],
    ['Secondary keywords', (metadata.secondary_keywords || []).join(', ')],
    ['OG title',          metadata.og_title],
    ['OG description',    metadata.og_description],
    ['Twitter title',     metadata.twitter_title],
    ['Twitter description', metadata.twitter_description],
    ['Published',         metadata.published_date],
    ['Last updated',      metadata.last_updated_date],
  ].filter(([, v]) => v);

  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>Metadata</h2>
      <p className={styles.tabDescription}>SEO and social sharing tags for this blog post</p>
      <table className={styles.metaTable}>
        <tbody>
          {rows.map(([label, val]) => (
            <tr key={label}>
              <td className={styles.metaLabel}>{label}</td>
              <td className={styles.metaValue}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ContentSection({ content }) {
  if (!content) return null;
  return (
    <div className={styles.blogSection}>
      {content.tldr && (
        <div className={styles.tldr}>
          <span className={styles.tldrLabel}>TL;DR</span>
          <div className={styles.tldrText} dangerouslySetInnerHTML={sanitize(content.tldr)} />
        </div>
      )}

      {content.h1 && <h3 className={styles.contentH1}>{content.h1}</h3>}

      {content.introduction && (
        <div className={styles.contentBlock}>
          <h4 className={styles.contentLabel}>Introduction</h4>
          <div className={styles.contentText} dangerouslySetInnerHTML={sanitize(content.introduction)} />
        </div>
      )}

      {(content.sections || []).map((sec, i) => (
        <div key={i} className={styles.contentBlock}>
          <h4 className={styles.contentH2}>{sec.h2}</h4>
          {sec.body && <div className={styles.contentText} dangerouslySetInnerHTML={sanitize(sec.body)} />}
          {(sec.subsections || []).map((sub, j) => (
            <div key={j} className={styles.subBlock}>
              <h5 className={styles.contentH3}>{sub.h3}</h5>
              {sub.body && <div className={styles.contentText} dangerouslySetInnerHTML={sanitize(sub.body)} />}
            </div>
          ))}
        </div>
      ))}

      {content.conclusion && (
        <div className={styles.contentBlock}>
          <h4 className={styles.contentH2}>Conclusion</h4>
          <div className={styles.contentText} dangerouslySetInnerHTML={sanitize(content.conclusion)} />
        </div>
      )}
    </div>
  );
}

function EeatSection({ eeat }) {
  if (!eeat) return null;
  const groups = [
    { label: 'Author bio',  desc: 'A short biography that establishes the author as a credible voice on this topic', value: eeat.author_bio },
    { label: 'Experience',   desc: 'First-hand experience signals that demonstrate real-world knowledge of the subject matter', items: eeat.experience_signals },
    { label: 'Expertise',    desc: 'Indicators of deep subject knowledge including qualifications, skills and domain understanding', items: eeat.expertise_indicators },
    { label: 'Authority',    desc: 'External sources and references that establish the author as a recognized authority', items: eeat.authority_sources },
    { label: 'Trust',        desc: 'Elements that build reader confidence in the accuracy and reliability of the content', items: eeat.trust_elements },
  ];
  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>E-E-A-T signals</h2>
      <p className={styles.tabDescription}>Experience, expertise, authoritativeness and trust signals for this post</p>
      {groups.map(({ label, desc, value, items }) => {
        if (value) {
          return (
            <div key={label} className={styles.eeatGroup}>
              <h3 className={styles.eeatLabel}>{label}</h3>
              <p className={styles.eeatDesc}>{desc}</p>
              <p className={styles.eeatText}>{value}</p>
            </div>
          );
        }
        if (!items || items.length === 0) return null;
        return (
          <div key={label} className={styles.eeatGroup}>
            <h3 className={styles.eeatLabel}>{label}</h3>
            <p className={styles.eeatDesc}>{desc}</p>
            <ul className={styles.eeatList}>
              {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function FaqSection({ faq }) {
  if (!faq || faq.length === 0) return null;
  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>FAQs</h2>
      <p className={styles.tabDescription}>Commonly asked questions and answers about this topic</p>
      <div className={styles.faqList}>
        {faq.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <p className={styles.faqQ}>{item.question}</p>
            <div className={styles.faqA} dangerouslySetInnerHTML={sanitize(item.answer)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LinksSection({ internal, external }) {
  const hasInternal = internal && internal.length > 0;
  const hasExternal = external && external.length > 0;
  if (!hasInternal && !hasExternal) return null;

  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>Links</h2>
      <p className={styles.tabDescription}>Internal and external link suggestions for this post</p>

      {hasInternal && (
        <>
          <h3 className={styles.subHeading}>Internal links</h3>
          <p className={styles.subDesc}>Suggested links to other pages on your site to improve navigation and SEO</p>
          <table className={styles.linksTable}>
            <thead>
              <tr>
                <th>Anchor text</th>
                <th>Target page</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {internal.map((l, i) => (
                <tr key={i}>
                  <td>{l.anchor_text}</td>
                  <td>{l.context}</td>
                  <td>{l.placement_section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {hasExternal && (
        <>
          <h3 className={styles.subHeading}>External links</h3>
          <p className={styles.subDesc}>Credible third-party sources to reference for improved authority and trust</p>
          <table className={styles.linksTable}>
            <thead>
              <tr>
                <th>Source</th>
                <th>Anchor text</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {external.map((l, i) => (
                <tr key={i}>
                  <td>
                    <div className={styles.extSource}>
                      <span>{l.source_name}</span>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </td>
                  <td>{l.anchor_text}</td>
                  <td>{l.placement_section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function ImagesSection({ images }) {
  if (!images || images.length === 0) return null;
  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>Image suggestions</h2>
      <p className={styles.tabDescription}>Recommended images with placement, alt text and file names</p>
      <div className={styles.imageCallout}>
        These are AI-generated image suggestions, not actual images. Use the placement, alt text and file name recommendations below as a guide to source or create images manually for your blog post.
      </div>
      <table className={styles.linksTable}>
        <thead>
          <tr>
            <th>Placement</th>
            <th>Alt text</th>
            <th>File name</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img, i) => (
            <tr key={i}>
              <td>{img.suggested_placement}</td>
              <td>{img.alt_text}</td>
              <td className={styles.mono}>{img.file_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchemaSection({ schema }) {
  if (!schema) return null;
  const blocks = [
    ['Blog schema', 'JSON-LD structured data that helps search engines understand your blog post', schema.article],
    ['FAQ schema', 'Enables rich FAQ snippets in search results for question and answer pairs', schema.faq],
    ['HowTo schema', 'Structured markup for step-by-step instructions displayed in search results', schema.howto],
  ].filter(([,, v]) => v && v !== 'null');

  if (blocks.length === 0) return null;

  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>Schema markup</h2>
      <p className={styles.tabDescription}>Structured data markup for search engine rich results</p>
      {blocks.map(([label, desc, obj]) => (
        <div key={label} className={styles.schemaBlock}>
          <h3 className={styles.schemaHeading}>{label}</h3>
          <p className={styles.schemaDesc}>{desc}</p>
          <pre className={styles.codeBlock}>{JSON.stringify(obj, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

function AboutSection({ brandProfile, blogTopic, blogType }) {
  if (!brandProfile && !blogTopic) return null;

  const typeLabel = blogType === 'pillar' ? 'Pillar' : 'Individual';

  const profileRows = brandProfile ? [
    ['Name',         brandProfile.name],
    ['Website',      brandProfile.website],
    ['Industry',     brandProfile.industry],
    ['Founded year', brandProfile.founded_year],
    ['Summary',      brandProfile.summary],
    ['Blog type',    typeLabel],
  ].filter(([, v]) => v) : [];

  const topicRows = blogTopic ? [
    ['Topic',        blogTopic.name],
    ['Description',  blogTopic.description],
    ['Content type', blogTopic.content_type],
  ].filter(([, v]) => v) : [];

  const bulletList = arr => Array.isArray(arr) && arr.length > 0 ? arr : null;
  const keywordSections = brandProfile ? [
    ['Primary keywords',  bulletList(brandProfile.primary_keywords)],
    ['Related keywords',  bulletList(brandProfile.related_keywords)],
    ['LSI keywords',      bulletList(brandProfile.lsi_keywords)],
    ['Longtail keywords', bulletList(brandProfile.longtail_keywords)],
    ['Key LLM questions', bulletList(brandProfile.llm_questions)],
  ].filter(([, v]) => v) : [];

  return (
    <div className={styles.blogSection}>
      <h2 className={styles.tabHeading}>About</h2>
      <p className={styles.tabDescription}>Brand profile and blog topic details for this post</p>

      {profileRows.length > 0 && (
        <div className={styles.aboutGroup}>
          <h3 className={styles.aboutGroupLabel}>Brand profile</h3>
          <p className={styles.aboutGroupDesc}>The brand profile used to generate this blog</p>
          <table className={styles.aboutTable}>
            <tbody>
              {profileRows.map(([label, val]) => (
                <tr key={label}>
                  <td className={styles.aboutLabel}>{label}</td>
                  <td className={styles.aboutValue}>
                    {label === 'Blog type' ? <span className={styles.blogTypeTag}>{val}</span> : val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(topicRows.length > 0 || keywordSections.length > 0) && (
        <div className={styles.aboutGroup}>
          <h3 className={styles.aboutGroupLabel}>Blog topic</h3>
          <p className={styles.aboutGroupDesc}>The topic selected for this blog</p>
          <table className={styles.aboutTable}>
            <tbody>
              {topicRows.map(([label, val]) => (
                <tr key={label}>
                  <td className={styles.aboutLabel}>{label}</td>
                  <td className={styles.aboutValue}>{val}</td>
                </tr>
              ))}
              {keywordSections.map(([label, items]) => (
                <tr key={label}>
                  <td className={styles.aboutLabel}>{label}</td>
                  <td className={styles.aboutValue}>
                    <ul className={styles.aboutBulletList}>
                      {items.map((item, i) => <li key={i}>{typeof item === 'object' ? (item.keyword || item.question || item.text || JSON.stringify(item)) : item}</li>)}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function XeoBlogPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const api = useBrandProfilesApi();
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(!location.state?.blogData);
  const isCreation = !!location.state?.blogData;

  const [blogName, setBlogName] = useState(location.state?.blogName || 'Untitled blog');
  const [blogExcerpt, setBlogExcerpt] = useState(location.state?.blogExcerpt || '');
  const [blogSlug, setBlogSlug] = useState(location.state?.blogSlug || slug);
  const [blogData, setBlogData] = useState(location.state?.blogData || null);
  const [brandProfile, setBrandProfile] = useState(null);
  const [blogTopic, setBlogTopic] = useState(null);
  const [blogType, setBlogType] = useState('individual');

  // Load from DB if no router state
  useEffect(() => {
    if (location.state?.blogData) return;
    api.getBlog(slug)
      .then(res => {
        const b = res.blog;
        setBlogName(b.title);
        setBlogExcerpt(b.excerpt);
        setBlogSlug(b.slug);
        setBlogData(b.blog_data);
        setBrandProfile(b.brand_profiles || null);
        setBlogTopic(b.xeo_blog_topics || null);
        setBlogType(b.blog_type || 'individual');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleDelete() {
    try {
      await api.deleteBlog(blogSlug);
    } catch {}
    setShowDelete(false);
    navigate('/new-xeo-blogs');
  }

  function handleFinish() {
    navigate('/new-xeo-blogs');
  }

  const [exporting, setExporting] = useState(false);
  const tabContentRef = useRef(null);

  // Strip HTML tags to plain text, convert <li> to bullet points, <br>/<p> to newlines
  function stripHtml(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '  - ')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<th[^>]*>/gi, '')
      .replace(/<td[^>]*>/gi, '  |  ')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  // Write text to PDF with auto page breaks
  function pdfWriter(pdf, margin, maxW, pageH) {
    let y = margin;
    const lineH = 5;
    const checkPage = (needed) => {
      if (y + needed > pageH - margin) { pdf.addPage(); y = margin; }
    };
    return {
      getY: () => y,
      heading(text, size) {
        checkPage(size * 0.8 + 8);
        y += 6;
        pdf.setFontSize(size);
        pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(text, maxW);
        lines.forEach(line => { checkPage(lineH + 2); pdf.text(line, margin, y); y += size * 0.45; });
        y += 4;
      },
      label(text) {
        checkPage(12);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100);
        pdf.text(text.toUpperCase(), margin, y);
        y += 5;
        pdf.setTextColor(0);
      },
      desc(text) {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(120);
        const lines = pdf.splitTextToSize(text, maxW);
        lines.forEach(line => { checkPage(lineH); pdf.text(line, margin, y); y += 4; });
        y += 4;
        pdf.setTextColor(0);
      },
      para(text) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30);
        const lines = pdf.splitTextToSize(stripHtml(text), maxW);
        lines.forEach(line => { checkPage(lineH); pdf.text(line, margin, y); y += lineH; });
        y += 4;
        pdf.setTextColor(0);
      },
      gap(n) { y += n; },
      separator() { checkPage(8); y += 3; pdf.setDrawColor(200); pdf.line(margin, y, margin + maxW, y); y += 5; },
      row(label, value) {
        checkPage(12);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100);
        pdf.text(label, margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30);
        const valLines = pdf.splitTextToSize(value || '', maxW - 50);
        valLines.forEach((line, i) => { if (i > 0) { y += 4; checkPage(5); } pdf.text(line, margin + 50, y); });
        y += 6;
        pdf.setTextColor(0);
      },
      mono(text) {
        pdf.setFontSize(8);
        pdf.setFont('courier', 'normal');
        pdf.setTextColor(30);
        const lines = pdf.splitTextToSize(text, maxW);
        lines.forEach(line => { checkPage(4); pdf.text(line, margin, y); y += 3.5; });
        y += 4;
        pdf.setTextColor(0);
        pdf.setFont('helvetica', 'normal');
      },
    };
  }

  // Write tab data directly to a jsPDF document
  function writeTabPdf(pdf, tabId, data) {
    const margin = 15;
    const maxW = 210 - margin * 2; // A4 width minus margins
    const pageH = 297; // A4 height
    const w = pdfWriter(pdf, margin, maxW, pageH);

    if (tabId === 'content') {
      const c = data.content;
      if (!c) return false;
      if (c.tldr) {
        w.label('TL;DR');
        w.para(c.tldr);
        w.separator();
      }
      if (c.h1) w.heading(c.h1, 16);
      if (c.introduction) w.para(c.introduction);
      (c.sections || []).forEach(sec => {
        if (sec.h2) { w.separator(); w.heading(sec.h2, 13); }
        if (sec.body) w.para(sec.body);
        (sec.subsections || []).forEach(sub => {
          if (sub.h3) w.heading(sub.h3, 11);
          if (sub.body) w.para(sub.body);
        });
      });
      if (c.conclusion) { w.separator(); w.heading('Conclusion', 13); w.para(c.conclusion); }
      return true;
    }

    if (tabId === 'metadata') {
      const m = data.metadata;
      if (!m) return false;
      w.heading('Metadata', 14);
      w.desc('SEO and social sharing tags for this blog post');
      const rows = [
        ['Title tag', m.title_tag], ['Meta description', m.meta_description], ['URL slug', m.url_slug],
        ['Primary keyword', m.primary_keyword], ['Secondary keywords', (m.secondary_keywords || []).join(', ')],
        ['OG title', m.og_title], ['OG description', m.og_description],
        ['Twitter title', m.twitter_title], ['Twitter description', m.twitter_description],
        ['Published', m.published_date], ['Last updated', m.last_updated_date],
      ].filter(([, v]) => v);
      rows.forEach(([label, val]) => w.row(label, val));
      return true;
    }

    if (tabId === 'faq') {
      const faq = data.faq;
      if (!faq || faq.length === 0) return false;
      w.heading('FAQs', 14);
      w.desc('Commonly asked questions and answers about this topic');
      faq.forEach((item, i) => {
        if (i > 0) w.separator();
        w.heading(item.question, 11);
        w.para(item.answer);
      });
      return true;
    }

    if (tabId === 'links') {
      const il = data.internal_links || [];
      const el = data.external_links || [];
      if (il.length === 0 && el.length === 0) return false;
      w.heading('Links', 14);
      w.desc('Internal and external link suggestions for this post');
      if (il.length > 0) {
        w.heading('Internal links', 11);
        il.forEach(l => { w.row('Anchor', l.anchor_text); w.row('Target', l.context); w.row('Section', l.placement_section); w.gap(3); });
      }
      if (el.length > 0) {
        w.separator();
        w.heading('External links', 11);
        el.forEach(l => { w.row('Source', l.source_name); w.row('Anchor', l.anchor_text); w.row('Section', l.placement_section); w.gap(3); });
      }
      return true;
    }

    if (tabId === 'images') {
      const imgs = data.images || [];
      if (imgs.length === 0) return false;
      w.heading('Image suggestions', 14);
      w.desc('Recommended images with placement, alt text and file names');
      w.para('These are AI-generated image suggestions, not actual images. Use the recommendations below as a guide to source or create images manually.');
      imgs.forEach((img, i) => {
        if (i > 0) w.separator();
        w.row('Placement', img.suggested_placement);
        w.row('Alt text', img.alt_text);
        w.row('File name', img.file_name);
      });
      return true;
    }

    if (tabId === 'schema') {
      const s = data.schema_markup;
      if (!s) return false;
      w.heading('Schema markup', 14);
      w.desc('Structured data markup for search engine rich results');
      const blocks = [
        ['Blog schema', s.article],
        ['FAQ schema', s.faq],
        ['HowTo schema', s.howto],
      ].filter(([, v]) => v && v !== 'null');
      blocks.forEach(([label, obj]) => {
        w.heading(label, 11);
        w.mono(JSON.stringify(obj, null, 2));
      });
      return true;
    }

    if (tabId === 'eeat') {
      const e = data.eeat;
      if (!e) return false;
      w.heading('E-E-A-T signals', 14);
      w.desc('Experience, expertise, authoritativeness and trust signals');
      const groups = [
        { label: 'Author bio', value: e.author_bio },
        { label: 'Experience', items: e.experience_signals },
        { label: 'Expertise', items: e.expertise_indicators },
        { label: 'Authority', items: e.authority_sources },
        { label: 'Trust', items: e.trust_elements },
      ];
      groups.forEach((g, i) => {
        if (i > 0) w.separator();
        w.heading(g.label, 11);
        if (g.value) w.para(g.value);
        if (g.items && g.items.length > 0) g.items.forEach(it => w.para('- ' + it));
      });
      return true;
    }

    if (tabId === 'about') {
      if (!brandProfile && !blogTopic) return false;
      w.heading('About', 14);
      w.desc('Brand profile and blog topic details for this post');

      if (brandProfile) {
        const typeLabel = blogType === 'pillar' ? 'Pillar' : 'Individual';
        w.heading('Brand profile', 11);
        w.desc('The brand profile used to generate this blog');
        const profileRows = [
          ['Name', brandProfile.name],
          ['Website', brandProfile.website],
          ['Industry', brandProfile.industry],
          ['Founded year', brandProfile.founded_year],
          ['Summary', brandProfile.summary],
          ['Blog type', typeLabel],
        ].filter(([, v]) => v);
        profileRows.forEach(([label, val]) => w.row(label, val));
      }

      if (blogTopic || brandProfile) {
        w.separator();
        w.heading('Blog topic', 11);
        w.desc('The topic selected for this blog');
        if (blogTopic) {
          const topicRows = [
            ['Topic', blogTopic.name],
            ['Description', blogTopic.description],
            ['Content type', blogTopic.content_type],
          ].filter(([, v]) => v);
          topicRows.forEach(([label, val]) => w.row(label, val));
        }
        if (brandProfile) {
          const bulletList = arr => Array.isArray(arr) && arr.length > 0 ? arr : null;
          const kwSections = [
            ['Primary keywords', bulletList(brandProfile.primary_keywords)],
            ['Related keywords', bulletList(brandProfile.related_keywords)],
            ['LSI keywords', bulletList(brandProfile.lsi_keywords)],
            ['Longtail keywords', bulletList(brandProfile.longtail_keywords)],
            ['Key LLM questions', bulletList(brandProfile.llm_questions)],
          ].filter(([, v]) => v);
          kwSections.forEach(([label, items]) => {
            const text = items.map(item => {
              const val = typeof item === 'object' ? (item.keyword || item.question || item.text || JSON.stringify(item)) : item;
              return '  - ' + val;
            }).join('\n');
            w.row(label, text);
          });
        }
      }

      return true;
    }

    return false;
  }

  const handleDownload = useCallback(async () => {
    if (!blogData || exporting) return;
    setExporting(true);

    try {
      const [{ default: jsPDF }, { default: JSZip }, { saveAs }] = await Promise.all([
        import('jspdf'),
        import('jszip'),
        import('file-saver'),
      ]);

      const zip = new JSZip();

      const tabConfigs = [
        { id: 'content',  label: 'Content' },
        { id: 'metadata', label: 'Metadata' },
        { id: 'faq',      label: 'FAQs' },
        { id: 'links',    label: 'Links' },
        { id: 'images',   label: 'Images' },
        { id: 'schema',   label: 'Schema' },
        { id: 'eeat',     label: 'EEAT' },
        { id: 'about',    label: 'About' },
      ];

      for (const tab of tabConfigs) {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const hasContent = writeTabPdf(pdf, tab.id, blogData);
        if (!hasContent) continue;
        zip.file(`${tab.label}.pdf`, pdf.output('blob'));
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const safeName = (blogName || 'blog').replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '-');
      saveAs(blob, `${safeName}.zip`);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [blogData, exporting, blogName, brandProfile, blogTopic, blogType]);

  const tabs = [
    { id: 'content',  label: 'Content',  icon: FileText },
    { id: 'metadata', label: 'Metadata', icon: Code },
    { id: 'faq',      label: 'FAQs',     icon: HelpCircle },
    { id: 'links',    label: 'Links',    icon: Link2 },
    { id: 'images',   label: 'Images',   icon: Image },
    { id: 'schema',   label: 'Schema',   icon: Code },
    { id: 'eeat',     label: 'E-E-A-T',  icon: ShieldCheck },
    { id: 'about',    label: 'About',    icon: Info },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{blogName}</h1>
          <p className={styles.description}>AI-generated New XEO blog with AEO, GEO and SEO optimization</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.deleteBtn} onClick={() => setShowDelete(true)}>
            Delete
          </button>
          {isCreation ? (
            <button className={styles.finishBtn} onClick={handleFinish}>
              Finish
            </button>
          ) : (
            <button className={styles.backBtn} onClick={handleFinish}>
              Back
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className={styles.card}>
          <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner />
          </div>
        </div>
      ) : blogData ? (
        <div className={styles.card}>
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
              disabled={exporting}
            >
              <Download size={13} strokeWidth={2} />
              <span className={styles.tabLabel}>{exporting ? 'Exporting...' : 'Download'}</span>
            </button>
          </div>

          <div className={styles.tabContent} ref={tabContentRef}>
            {activeTab === 'content'  && <div className={styles.contentWrap}><ContentSection content={blogData.content} /></div>}
            {activeTab === 'metadata' && <MetadataSection metadata={blogData.metadata} />}
            {activeTab === 'faq'      && <div className={styles.contentWrap}><FaqSection faq={blogData.faq} /></div>}
            {activeTab === 'links'    && <LinksSection internal={blogData.internal_links} external={blogData.external_links} />}
            {activeTab === 'images'   && <ImagesSection images={blogData.images} />}
            {activeTab === 'schema'   && <SchemaSection schema={blogData.schema_markup} />}
            {activeTab === 'eeat'     && <div className={styles.contentWrap}><EeatSection eeat={blogData.eeat} /></div>}
            {activeTab === 'about'    && <div className={styles.contentWrap}><AboutSection brandProfile={brandProfile} blogTopic={blogTopic} blogType={blogType} /></div>}

            {blogData.word_count_estimate && (
              <div className={styles.wordCount}>
                Estimated word count: {blogData.word_count_estimate.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.emptyCard}>
            <p className={styles.emptyText}>No blog data available</p>
          </div>
        </div>
      )}

      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
