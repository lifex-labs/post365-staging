import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FileText, Link2, Image, Code, ExternalLink, HelpCircle, ShieldCheck } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import styles from './XeoBlogPage.module.css';

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
          <div className={styles.tldrText} dangerouslySetInnerHTML={{ __html: content.tldr }} />
        </div>
      )}

      {content.h1 && <h3 className={styles.contentH1}>{content.h1}</h3>}

      {content.introduction && (
        <div className={styles.contentBlock}>
          <h4 className={styles.contentLabel}>Introduction</h4>
          <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: content.introduction }} />
        </div>
      )}

      {(content.sections || []).map((sec, i) => (
        <div key={i} className={styles.contentBlock}>
          <h4 className={styles.contentH2}>{sec.h2}</h4>
          {sec.body && <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: sec.body }} />}
          {(sec.subsections || []).map((sub, j) => (
            <div key={j} className={styles.subBlock}>
              <h5 className={styles.contentH3}>{sub.h3}</h5>
              {sub.body && <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: sub.body }} />}
            </div>
          ))}
        </div>
      ))}

      {content.conclusion && (
        <div className={styles.contentBlock}>
          <h4 className={styles.contentH2}>Conclusion</h4>
          <div className={styles.contentText} dangerouslySetInnerHTML={{ __html: content.conclusion }} />
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
            <div className={styles.faqA} dangerouslySetInnerHTML={{ __html: item.answer }} />
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
                  <td className={styles.extSource}>
                    <span>{l.source_name}</span>
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                      <ExternalLink size={11} />
                    </a>
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
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleDelete() {
    try {
      await api.deleteBlog(blogSlug);
    } catch {}
    setShowDelete(false);
    navigate('/xeo-blogs');
  }

  function handleFinish() {
    navigate('/xeo-blogs');
  }

  const tabs = [
    { id: 'content',  label: 'Content',  icon: FileText },
    { id: 'metadata', label: 'Metadata', icon: Code },
    { id: 'faq',      label: 'FAQs',     icon: HelpCircle },
    { id: 'links',    label: 'Links',    icon: Link2 },
    { id: 'images',   label: 'Images',   icon: Image },
    { id: 'schema',   label: 'Schema',   icon: Code },
    { id: 'eeat',     label: 'E-E-A-T',  icon: ShieldCheck },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>{blogName}</h1>
          <p className={styles.description}>AI-generated XEO blog with AEO, GEO and SEO optimization</p>
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
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'content'  && <div className={styles.contentWrap}><ContentSection content={blogData.content} /></div>}
            {activeTab === 'metadata' && <MetadataSection metadata={blogData.metadata} />}
            {activeTab === 'faq'      && <div className={styles.contentWrap}><FaqSection faq={blogData.faq} /></div>}
            {activeTab === 'links'    && <LinksSection internal={blogData.internal_links} external={blogData.external_links} />}
            {activeTab === 'images'   && <ImagesSection images={blogData.images} />}
            {activeTab === 'schema'   && <SchemaSection schema={blogData.schema_markup} />}
            {activeTab === 'eeat'     && <div className={styles.contentWrap}><EeatSection eeat={blogData.eeat} /></div>}

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
