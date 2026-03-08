import { Fragment, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Pencil, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import styles from '../pages/NewBrandProfilePage.module.css';
import modalStyles from './LogoutModal.module.css';

// ===== Colors & orders =====
export const VOLUME_COLORS = {
  High:   { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  Low:    { background: '#fecaca', color: '#991b1b' },
};

export const DIFFICULTY_COLORS = {
  Low:    { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  High:   { background: '#fecaca', color: '#991b1b' },
};

export const VOL_ORDER  = { High: 3, Medium: 2, Low: 1 };
export const DIFF_ORDER = { Low: 1, Medium: 2, High: 3 };

// ===== Context rows =====
export const CONTEXT_ROWS = [
  { key: 'problem',          label: 'Problem',           placeholder: 'What problem does your company solve?' },
  { key: 'solution',         label: 'Solution',          placeholder: 'How does your product or service solve it?' },
  { key: 'usps',             label: 'USPs',              placeholder: 'What makes you uniquely different?' },
  { key: 'valueProposition', label: 'Value proposition', placeholder: 'What is your core value promise?' },
];

export const CONTEXT_LABEL_COLORS = {
  problem:          { background: '#fee2e2', color: '#991b1b' },
  solution:         { background: '#dcfce7', color: '#166534' },
  usps:             { background: '#e0e7ff', color: '#3730a3' },
  valueProposition: { background: '#dbeafe', color: '#1e40af' },
};

// ===== Sample data =====
export const SAMPLE_KEYWORDS = [
  { id: 1,  keyword: 'content marketing platform',      volume: 'High',   difficulty: 'Medium', reason: 'High-intent term actively searched by marketing directors and content leads evaluating tools to centralize and scale their content operations. Users at this stage are typically in an active buying cycle, comparing platforms with feature-rich workflows that support multi-channel publishing, AI writing, and performance analytics.' },
  { id: 2,  keyword: 'AI blog writer',                  volume: 'High',   difficulty: 'Low',    reason: 'Rapidly growing search trend driven by marketing managers seeking to reduce time spent on first-draft blog creation. This keyword captures early-funnel buyers exploring AI-assisted writing tools and positions Post365 as a solution before prospects evaluate competing platforms or enterprise-level alternatives.' },
  { id: 3,  keyword: 'SEO content generation',          volume: 'Medium', difficulty: 'Medium', reason: "Core use case keyword that bridges organic search strategy with AI-assisted content workflows. Attracts marketers who want to produce search-optimized content at volume without hiring additional writers, making it a strong entry point for demonstrating Post365's ability to generate high-ranking blog content at scale." },
  { id: 4,  keyword: 'B2B content strategy',            volume: 'High',   difficulty: 'High',   reason: 'Targets senior decision-makers at mid-market and enterprise companies rebuilding or scaling their content strategy to drive inbound pipeline. Buyers searching this term typically control content budgets and are looking for platforms that align content output directly with revenue goals and sales enablement.' },
  { id: 5,  keyword: 'XEO optimization',                volume: 'Low',    difficulty: 'Low',    reason: "Proprietary term that captures Post365's combined approach to AEO, GEO and SEO in a single content workflow. Building search authority around this term establishes brand leadership in an emerging discipline while attracting progressive marketers actively researching next-generation content strategies beyond traditional optimization." },
  { id: 6,  keyword: 'brand content calendar',          volume: 'Medium', difficulty: 'Low',    reason: 'Searched by marketing leads and content managers planning quarterly content schedules across multiple channels and brand voices. This term signals strong operational buying intent, attracting users who need structured planning tools that connect editorial calendars with publishing workflows and team collaboration features.' },
  { id: 7,  keyword: 'inbound lead generation content', volume: 'Medium', difficulty: 'High',   reason: 'High commercial intent phrase attracting buyers who specifically want content solutions that convert organic traffic into qualified sales leads. Connects Post365 to revenue-driven content goals, making it ideal for targeting CMOs and growth marketers who measure performance through pipeline contribution and conversion metrics.' },
  { id: 8,  keyword: 'AI-powered SEO blogs',            volume: 'High',   difficulty: 'Medium', reason: 'Combines two major demand trends - AI writing automation and search engine optimization - to attract traffic from both SEO practitioners and marketing generalists. Positions Post365 at the intersection of AI capability and organic search performance, targeting users exploring smarter blog production workflows to scale content output.' },
  { id: 9,  keyword: 'generative engine optimization',  volume: 'Low',    difficulty: 'Low',    reason: 'Emerging category keyword as brands race to optimize content for AI-driven discovery platforms like Perplexity, ChatGPT search, and Google AI Overviews. Capturing early search volume for this term builds brand authority in a rapidly growing discipline while attracting progressive marketers investing in future-proof content strategies.' },
  { id: 10, keyword: 'thought leadership content',      volume: 'High',   difficulty: 'High',   reason: "Broad awareness keyword used by B2B brands investing in authority-building content to establish credibility within their industry. Typically represents marketing or communications teams tasked with positioning executive voices online, creating a strong fit for Post365's personal and brand profile features that support executive content at scale." },
];

export const SAMPLE_RELATED_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', relatedKeyword: 'content distribution platform',  volume: 'High',   difficulty: 'Medium' },
  { id: 2,  primaryKeyword: 'content marketing platform', relatedKeyword: 'brand publishing platform',       volume: 'Medium', difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'content marketing platform', relatedKeyword: 'content operations software',     volume: 'Medium', difficulty: 'Medium' },
  { id: 4,  primaryKeyword: 'AI blog writer',             relatedKeyword: 'AI content creation tool',        volume: 'High',   difficulty: 'High'   },
  { id: 5,  primaryKeyword: 'AI blog writer',             relatedKeyword: 'automated blog writing',          volume: 'High',   difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'SEO content generation',     relatedKeyword: 'AI-powered SEO blogs',            volume: 'High',   difficulty: 'Medium' },
  { id: 7,  primaryKeyword: 'SEO content generation',     relatedKeyword: 'SEO content automation',          volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       relatedKeyword: 'enterprise content platform',     volume: 'High',   difficulty: 'High'   },
  { id: 9,  primaryKeyword: 'B2B content strategy',       relatedKeyword: 'multi-channel content hub',       volume: 'Low',    difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'brand content calendar',     relatedKeyword: 'content workflow automation',     volume: 'Medium', difficulty: 'Medium' },
];

export const SAMPLE_LSI_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', lsiKeyword: 'content strategy',              volume: 'High',   difficulty: 'Medium' },
  { id: 2,  primaryKeyword: 'content marketing platform', lsiKeyword: 'editorial calendar',            volume: 'Medium', difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'content marketing platform', lsiKeyword: 'content management system',     volume: 'High',   difficulty: 'High'   },
  { id: 4,  primaryKeyword: 'AI blog writer',             lsiKeyword: 'natural language generation',   volume: 'Low',    difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'AI blog writer',             lsiKeyword: 'large language model',          volume: 'Medium', difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'SEO content generation',     lsiKeyword: 'keyword research',              volume: 'High',   difficulty: 'Medium' },
  { id: 7,  primaryKeyword: 'SEO content generation',     lsiKeyword: 'on-page optimisation',          volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       lsiKeyword: 'demand generation',             volume: 'High',   difficulty: 'High'   },
  { id: 9,  primaryKeyword: 'B2B content strategy',       lsiKeyword: 'thought leadership',            volume: 'High',   difficulty: 'Medium' },
  { id: 10, primaryKeyword: 'brand content calendar',     lsiKeyword: 'content publishing schedule',   volume: 'Low',    difficulty: 'Low'    },
];

export const SAMPLE_LONGTAIL_KEYWORDS = [
  { id: 1,  primaryKeyword: 'content marketing platform', longtailKeyword: 'best content marketing platform for startups',       volume: 'Low',    difficulty: 'Low'    },
  { id: 2,  primaryKeyword: 'content marketing platform', longtailKeyword: 'content marketing platform with AI writing',          volume: 'Low',    difficulty: 'Low'    },
  { id: 3,  primaryKeyword: 'AI blog writer',             longtailKeyword: 'best AI blog writing tool for B2B marketers',         volume: 'Low',    difficulty: 'Low'    },
  { id: 4,  primaryKeyword: 'AI blog writer',             longtailKeyword: 'AI tool to write thought leadership articles',         volume: 'Low',    difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'SEO content generation',     longtailKeyword: 'how to create SEO content at scale',                  volume: 'Medium', difficulty: 'Low'    },
  { id: 6,  primaryKeyword: 'SEO content generation',     longtailKeyword: 'how to optimize content for generative AI search',    volume: 'Low',    difficulty: 'Low'    },
  { id: 7,  primaryKeyword: 'B2B content strategy',       longtailKeyword: 'how to build brand authority with content marketing', volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'B2B content strategy',       longtailKeyword: 'B2B inbound lead generation through blog content',   volume: 'Low',    difficulty: 'Medium' },
  { id: 9,  primaryKeyword: 'brand content calendar',     longtailKeyword: 'content calendar software for marketing teams',       volume: 'Medium', difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'XEO optimization',           longtailKeyword: 'how to optimize content for AI search engines',       volume: 'Low',    difficulty: 'Low'    },
];

export const SAMPLE_LLM_QUESTIONS = [
  { id: 1,  primaryKeyword: 'content marketing platform',    llmQuestion: 'What is the best content marketing platform for scaling B2B content in 2025?',              volume: 'High',   difficulty: 'High'   },
  { id: 2,  primaryKeyword: 'content marketing platform',    llmQuestion: 'How does a content marketing platform help reduce time spent on content production?',         volume: 'Medium', difficulty: 'Medium' },
  { id: 3,  primaryKeyword: 'AI blog writer',                llmQuestion: 'Can AI write high-quality blog posts that rank on Google?',                                   volume: 'High',   difficulty: 'Medium' },
  { id: 4,  primaryKeyword: 'AI blog writer',                llmQuestion: 'What is the best AI tool to write thought leadership articles for executives?',               volume: 'Medium', difficulty: 'Low'    },
  { id: 5,  primaryKeyword: 'SEO content generation',        llmQuestion: 'How do I use AI to generate SEO-optimized blog content at scale?',                           volume: 'Medium', difficulty: 'Medium' },
  { id: 6,  primaryKeyword: 'B2B content strategy',          llmQuestion: 'What is the most effective content strategy for B2B inbound lead generation?',               volume: 'High',   difficulty: 'High'   },
  { id: 7,  primaryKeyword: 'B2B content strategy',          llmQuestion: 'How do I build a content strategy that drives measurable pipeline for B2B SaaS?',            volume: 'Medium', difficulty: 'Medium' },
  { id: 8,  primaryKeyword: 'XEO optimization',              llmQuestion: 'What is XEO optimization and how does it combine SEO, AEO, and GEO?',                        volume: 'Low',    difficulty: 'Low'    },
  { id: 9,  primaryKeyword: 'generative engine optimization', llmQuestion: 'How do I optimize my content to appear in ChatGPT and Perplexity search results?',          volume: 'Medium', difficulty: 'Low'    },
  { id: 10, primaryKeyword: 'thought leadership content',    llmQuestion: 'How do I create thought leadership content that builds credibility and drives inbound leads?', volume: 'High',   difficulty: 'Medium' },
];

// ===== Sort icon =====
export function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={11} className={styles.sortIconOff} />;
  return dir === 'asc'
    ? <ChevronUp size={11} className={styles.sortIconOn} />
    : <ChevronDown size={11} className={styles.sortIconOn} />;
}

// ===== Primary keywords table =====
export function KeywordsTable({ className, title, description, icon: Icon, iconClass, initialKeywords }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [editDraft, setEditDraft] = useState({ keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const allSelected = keywords.length > 0 && selectedIds.size === keywords.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedKeywords = useMemo(() => {
    if (!sortKey) return keywords;
    return [...keywords].sort((a, b) => {
      let av, bv;
      if (sortKey === 'keyword')         { av = a.keyword.toLowerCase();    bv = b.keyword.toLowerCase(); }
      else if (sortKey === 'volume')     { av = VOL_ORDER[a.volume];        bv = VOL_ORDER[b.volume]; }
      else if (sortKey === 'difficulty') { av = DIFF_ORDER[a.difficulty];   bv = DIFF_ORDER[b.difficulty]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [keywords, sortKey, sortDir]);

  function toggleSelectAll() {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(keywords.map(k => k.id)));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleEditStart(kw) {
    setEditingId(kw.id);
    setIsNewRow(false);
    setEditDraft({ keyword: kw.keyword, reason: kw.reason || '', volume: kw.volume, difficulty: kw.difficulty });
  }

  function handleEditSave() {
    setKeywords(prev => prev.map(k => k.id === editingId ? { ...k, ...editDraft } : k));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleEditCancel() {
    if (isNewRow) setKeywords(prev => prev.filter(k => k.id !== editingId));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleAddRow() {
    const newId = Date.now();
    setKeywords(prev => {
      let updated = prev;
      if (editingId !== null) updated = prev.map(k => k.id === editingId ? { ...k, ...editDraft } : k);
      return [{ id: newId, keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' }, ...updated];
    });
    setEditingId(newId);
    setIsNewRow(true);
    setEditDraft({ keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' });
  }

  function handleDeleteSelected() {
    if (editingId && selectedIds.has(editingId)) { setEditingId(null); setIsNewRow(false); }
    setKeywords(prev => prev.filter(k => !selectedIds.has(k.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className={className}>
      <div className={styles.card3Head}>
        <div className={`${styles.iconSquare} ${iconClass}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className={styles.card3HeadRow}>
          <div>
            <h2 className={styles.card2Title}>{title}</h2>
            <p className={styles.card2Desc}>{description}</p>
          </div>
          <div className={styles.card3HeadActions}>
            <button className={styles.addRowBtn} onClick={handleAddRow}>
              <Plus size={13} strokeWidth={2.5} />
              Add keyword
            </button>
            {selectedIds.size > 0 && (
              <button className={styles.deleteSelectedBtn} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} />
                Delete selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.kwTable}>
          <colgroup>
            <col className={styles.colCheck} />
            <col />
            <col />
            <col className={styles.colVolume} />
            <col className={styles.colDifficulty} />
            <col className={styles.colActions} />
          </colgroup>
          <thead className={styles.kwThead}>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkboxInput} checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('keyword')}>
                Keyword <SortIcon active={sortKey === 'keyword'} dir={sortDir} />
              </th>
              <th>Reason for selection</th>
              <th className={styles.sortable} onClick={() => handleSort('volume')}>
                Volume <SortIcon active={sortKey === 'volume'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('difficulty')}>
                Difficulty <SortIcon active={sortKey === 'difficulty'} dir={sortDir} />
              </th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.kwTbody}>
            {sortedKeywords.map(kw => {
              const isEditing = editingId === kw.id;
              const isAdding  = isEditing && isNewRow;
              return (
                <Fragment key={kw.id}>
                  <tr className={[
                    styles.kwRow,
                    isAdding               ? styles.kwRowNew     : '',
                    isEditing && !isAdding ? styles.kwRowEditing : '',
                    selectedIds.has(kw.id) ? styles.kwRowSelected : '',
                  ].filter(Boolean).join(' ')}>
                    <td>
                      <input type="checkbox" className={styles.checkboxInput}
                        checked={selectedIds.has(kw.id)} onChange={() => toggleSelect(kw.id)} />
                    </td>
                    {isEditing ? (
                      <>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft.keyword}
                            onChange={e => setEditDraft(d => ({ ...d, keyword: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder="Enter keyword" autoFocus />
                        </td>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft.reason}
                            onChange={e => setEditDraft(d => ({ ...d, reason: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder="Reason for selection" />
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.volume}
                            onChange={e => setEditDraft(d => ({ ...d, volume: e.target.value }))}>
                            <option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.difficulty}
                            onChange={e => setEditDraft(d => ({ ...d, difficulty: e.target.value }))}>
                            <option>Low</option><option>Medium</option><option>High</option>
                          </select>
                        </td>
                        <td>
                          {!isAdding && (
                            <div className={`${styles.actionsCell} ${styles.editIconActions}`}>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnSave}`} onClick={handleEditSave} title="Save"><Check size={13} /></button>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnCancel}`} onClick={handleEditCancel} title="Cancel"><X size={13} /></button>
                            </div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={styles.tdFit}>
                          <div className={styles.cellFit} style={{ fontSize: '14px' }}>{kw.keyword}</div>
                        </td>
                        <td className={styles.tdReason} title={kw.reason}>
                          <div className={styles.cellClamp} style={{ fontSize: '13px', color: 'var(--text-2)' }}>{kw.reason}</div>
                        </td>
                        <td><span className={styles.kwTag} style={VOLUME_COLORS[kw.volume]}>{kw.volume}</span></td>
                        <td><span className={styles.kwTag} style={DIFFICULTY_COLORS[kw.difficulty]}>{kw.difficulty}</span></td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.rowIconBtn} onClick={() => handleEditStart(kw)} title="Edit"><Pencil size={13} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {isEditing && (
                    <tr className={`${styles.saveCancelRow} ${!isAdding ? styles.saveCancelRowEdit : ''}`}>
                      <td colSpan={6} className={styles.saveCancelCell}>
                        <div className={styles.saveCancelBtns}>
                          <button className={styles.cancelTextBtn} onClick={handleEditCancel}>Cancel</button>
                          <button className={styles.saveTextBtn} onClick={handleEditSave}>Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowDeleteConfirm(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete keywords</p>
            <p className={modalStyles.message}>The selected keywords will be permanently removed from this profile. This action cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={() => { handleDeleteSelected(); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ===== Grouped keywords table (related, LSI, long tail, LLM questions) =====
export function GroupedKeywordsTable({ className, title, description, icon: Icon, iconClass, initialData, keywordField, keywordLabel, primaryKeywords, addLabel = 'Add keyword', truncateKeyword = false }) {
  const [data, setData] = useState(initialData);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [editDraft, setEditDraft] = useState({ primaryKeyword: '', [keywordField]: '', volume: 'Medium', difficulty: 'Medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const pkOptions = useMemo(() =>
    [...new Set(primaryKeywords.map(k => k.keyword))].sort((a, b) => a.localeCompare(b)),
    [primaryKeywords]
  );

  function handleSort(key) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sortedData = useMemo(() => {
    const arr = [...data];
    if (!sortKey) {
      return arr.sort((a, b) => {
        const pkCmp = (a.primaryKeyword || '').localeCompare(b.primaryKeyword || '');
        if (pkCmp !== 0) return pkCmp;
        return (a[keywordField] || '').localeCompare(b[keywordField] || '');
      });
    }
    return arr.sort((a, b) => {
      let av, bv;
      if (sortKey === 'primaryKeyword')  { av = (a.primaryKeyword || '').toLowerCase();  bv = (b.primaryKeyword || '').toLowerCase(); }
      else if (sortKey === keywordField) { av = (a[keywordField]  || '').toLowerCase();  bv = (b[keywordField]  || '').toLowerCase(); }
      else if (sortKey === 'volume')     { av = VOL_ORDER[a.volume];   bv = VOL_ORDER[b.volume]; }
      else if (sortKey === 'difficulty') { av = DIFF_ORDER[a.difficulty]; bv = DIFF_ORDER[b.difficulty]; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, keywordField]);

  const allSelected = data.length > 0 && selectedIds.size === data.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelectAll() {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(data.map(r => r.id)));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function handleEditStart(row) {
    setEditingId(row.id);
    setIsNewRow(false);
    setEditDraft({ primaryKeyword: row.primaryKeyword, [keywordField]: row[keywordField] || '', volume: row.volume, difficulty: row.difficulty });
  }

  function handleEditSave() {
    setData(prev => prev.map(r => r.id === editingId ? { ...r, ...editDraft } : r));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleEditCancel() {
    if (isNewRow) setData(prev => prev.filter(r => r.id !== editingId));
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleAddRow() {
    const newId = Date.now();
    const defaultPk = pkOptions[0] || '';
    setData(prev => {
      let updated = prev;
      if (editingId !== null) updated = prev.map(r => r.id === editingId ? { ...r, ...editDraft } : r);
      return [...updated, { id: newId, primaryKeyword: defaultPk, [keywordField]: '', volume: 'Medium', difficulty: 'Medium' }];
    });
    setEditingId(newId);
    setIsNewRow(true);
    setEditDraft({ primaryKeyword: defaultPk, [keywordField]: '', volume: 'Medium', difficulty: 'Medium' });
  }

  function handleDeleteSelected() {
    if (editingId && selectedIds.has(editingId)) { setEditingId(null); setIsNewRow(false); }
    setData(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  }

  return (
    <div className={`${className} ${styles.grouped}`}>
      <div className={styles.card3Head}>
        <div className={`${styles.iconSquare} ${iconClass}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className={styles.card3HeadRow}>
          <div>
            <h2 className={styles.card2Title}>{title}</h2>
            <p className={styles.card2Desc}>{description}</p>
          </div>
          <div className={styles.card3HeadActions}>
            <button className={styles.addRowBtn} onClick={handleAddRow}>
              <Plus size={13} strokeWidth={2.5} />
              {addLabel}
            </button>
            {selectedIds.size > 0 && (
              <button className={styles.deleteSelectedBtn} onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 size={13} />
                Delete selected ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.kwTable}>
          <colgroup>
            <col className={styles.colCheck} />
            <col />
            <col />
            <col className={styles.colVolume} />
            <col className={styles.colDifficulty} />
            <col className={styles.colActions} />
          </colgroup>
          <thead className={styles.kwThead}>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkboxInput} checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('primaryKeyword')}>
                Primary keyword <SortIcon active={sortKey === 'primaryKeyword'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort(keywordField)}>
                {keywordLabel} <SortIcon active={sortKey === keywordField} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('volume')}>
                Volume <SortIcon active={sortKey === 'volume'} dir={sortDir} />
              </th>
              <th className={styles.sortable} onClick={() => handleSort('difficulty')}>
                Difficulty <SortIcon active={sortKey === 'difficulty'} dir={sortDir} />
              </th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.kwTbody}>
            {sortedData.map(row => {
              const isEditing = editingId === row.id;
              const isAdding  = isEditing && isNewRow;
              return (
                <Fragment key={row.id}>
                  <tr className={[
                    styles.kwRow,
                    isAdding               ? styles.kwRowNew      : '',
                    isEditing && !isAdding ? styles.kwRowEditing  : '',
                    selectedIds.has(row.id) ? styles.kwRowSelected : '',
                  ].filter(Boolean).join(' ')}>
                    <td>
                      <input type="checkbox" className={styles.checkboxInput}
                        checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} />
                    </td>
                    {isEditing ? (
                      <>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.primaryKeyword}
                            onChange={e => setEditDraft(d => ({ ...d, primaryKeyword: e.target.value }))}>
                            {pkOptions.map(pk => <option key={pk}>{pk}</option>)}
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft[keywordField]}
                            onChange={e => setEditDraft(d => ({ ...d, [keywordField]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder={`Enter ${keywordLabel.toLowerCase()}`} autoFocus />
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.volume}
                            onChange={e => setEditDraft(d => ({ ...d, volume: e.target.value }))}>
                            <option>High</option><option>Medium</option><option>Low</option>
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <select className={styles.editSelect} value={editDraft.difficulty}
                            onChange={e => setEditDraft(d => ({ ...d, difficulty: e.target.value }))}>
                            <option>Low</option><option>Medium</option><option>High</option>
                          </select>
                        </td>
                        <td>
                          {!isAdding && (
                            <div className={`${styles.actionsCell} ${styles.editIconActions}`}>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnSave}`} onClick={handleEditSave} title="Save"><Check size={13} /></button>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnCancel}`} onClick={handleEditCancel} title="Cancel"><X size={13} /></button>
                            </div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={truncateKeyword ? styles.tdFit : undefined}>
                          <div className={truncateKeyword ? styles.cellFit : undefined} style={{ fontSize: '14px' }}>{row.primaryKeyword}</div>
                        </td>
                        <td className={styles.tdFit}>
                          <div className={styles.cellFit} style={{ fontSize: '14px' }}>{row[keywordField]}</div>
                        </td>
                        <td><span className={styles.kwTag} style={VOLUME_COLORS[row.volume]}>{row.volume}</span></td>
                        <td><span className={styles.kwTag} style={DIFFICULTY_COLORS[row.difficulty]}>{row.difficulty}</span></td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.rowIconBtn} onClick={() => handleEditStart(row)} title="Edit"><Pencil size={13} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {isEditing && (
                    <tr className={`${styles.saveCancelRow} ${!isAdding ? styles.saveCancelRowEdit : ''}`}>
                      <td colSpan={6} className={styles.saveCancelCell}>
                        <div className={styles.saveCancelBtns}>
                          <button className={styles.cancelTextBtn} onClick={handleEditCancel}>Cancel</button>
                          <button className={styles.saveTextBtn} onClick={handleEditSave}>Save</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDeleteConfirm && createPortal(
        <div className={modalStyles.backdrop} onClick={() => setShowDeleteConfirm(false)}>
          <div className={modalStyles.sheet} onClick={e => e.stopPropagation()}>
            <p className={modalStyles.title}>Delete keywords</p>
            <p className={modalStyles.message}>The selected keywords will be permanently removed from this profile. This action cannot be undone.</p>
            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className={modalStyles.logoutBtn} onClick={() => { handleDeleteSelected(); setShowDeleteConfirm(false); }}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
