import { Fragment, useMemo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Sparkles, Building2, Layers, Key, Tags, AlignLeft, HelpCircle, Pencil, Check, X, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './NewBrandProfilePage.module.css';
import modalStyles from '../components/LogoutModal.module.css';

const STEPS = [
  'Overall company details',
  'Primary brand keywords',
  'Related keywords',
  'Long tail keywords',
  'Key LLM questions',
  'Blog themes',
];

const isValidWebsite = (value) =>
  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(value.trim());

const VOLUME_COLORS = {
  High:   { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  Low:    { background: '#fecaca', color: '#991b1b' },
};

const DIFFICULTY_COLORS = {
  Low:    { background: '#a7f3d0', color: '#065f46' },
  Medium: { background: '#fde68a', color: '#92400e' },
  High:   { background: '#fecaca', color: '#991b1b' },
};

const VOL_ORDER  = { High: 3, Medium: 2, Low: 1 };
const DIFF_ORDER = { Low: 1, Medium: 2, High: 3 };

const SAMPLE_KEYWORDS = [
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

const SAMPLE_RELATED_KEYWORDS = [
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

const SAMPLE_LONGTAIL_KEYWORDS = [
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

const SAMPLE_LLM_QUESTIONS = [
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
function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp size={11} className={styles.sortIconOff} />;
  return dir === 'asc'
    ? <ChevronUp size={11} className={styles.sortIconOn} />
    : <ChevronDown size={11} className={styles.sortIconOn} />;
}

// ===== Primary keywords table =====
function KeywordsTable({ className, title, description, icon: Icon, iconClass, initialKeywords }) {
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
            <col /> {/* keyword - content fit */}
            <col /> {/* reason - fills remaining */}
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

// ===== Related / Long tail keywords table (flat, sorted) =====
function GroupedKeywordsTable({ className, title, description, icon: Icon, iconClass, initialData, keywordField, keywordLabel, primaryKeywords, addLabel = 'Add keyword', truncateKeyword = false }) {
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
            <col /> {/* primary keyword - content fit */}
            <col /> {/* keyword - fills remaining */}
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
                    isAdding               ? styles.kwRowNew     : '',
                    isEditing && !isAdding ? styles.kwRowEditing : '',
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
                            {pkOptions.map(pk => <option key={pk} value={pk}>{pk}</option>)}
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <input className={styles.editInput} value={editDraft[keywordField]}
                            onChange={e => setEditDraft(d => ({ ...d, [keywordField]: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder={keywordLabel} autoFocus />
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
                        <td className={styles.tdPrimary}>
                          <div className={styles.cellFit} style={{ fontSize: '14px' }}>{row.primaryKeyword}</div>
                        </td>
                        <td title={truncateKeyword ? row[keywordField] : undefined}>
                          <div className={truncateKeyword ? styles.cellFit : styles.cellClamp} style={{ fontSize: '14px' }}>{row[keywordField]}</div>
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

// ===== Page =====
export default function NewBrandProfilePage() {
  const [website, setWebsite] = useState('');
  const websiteInputRef = useRef(null);
  const canScan = isValidWebsite(website);

  const [form, setForm] = useState({
    companyName: 'Post365',
    companyWebsite: 'post365.ai',
    industry: 'Marketing Technology',
    foundedYear: '2023',
    summary: 'Post365 is an AI-powered content marketing platform that helps B2B brands generate, publish, and optimise content across multiple channels. The platform combines SEO, AEO, and GEO into a single XEO workflow to drive organic traffic and inbound leads at scale.',
    targetAudience: 'Marketing directors, content managers, and growth marketers at B2B SaaS and professional services companies looking to scale content production and improve organic search performance without growing headcount.',
    problem: 'B2B marketing teams struggle to produce enough high-quality, SEO-optimised content to compete organically. Manual content workflows are slow, expensive, and inconsistent - making it hard to maintain publishing cadence while keeping content aligned to brand voice and business goals.',
    solution: 'Post365 automates the entire content workflow from keyword research to published article. AI generates first drafts optimised for XEO, brand profiles ensure consistent voice and targeting, and multi-channel publishing tools help teams ship content faster without sacrificing quality.',
    usps: 'Proprietary XEO optimisation combining SEO, AEO, and GEO in a single workflow. Brand profile system that preserves tone, audience targeting, and messaging consistency at scale. Calendar-driven content planning with built-in performance tracking and multi-channel publishing.',
  });

  const companyNameRef = useRef(null);
  const [step, setStep] = useState('intro');
  const [card1Active, setCard1Active] = useState(true);
  const [card2Active, setCard2Active] = useState(false);
  const [card3Active, setCard3Active] = useState(false);
  const [card4Active, setCard4Active] = useState(false);
  const [card5Active, setCard5Active] = useState(false);
  const [card6Active, setCard6Active] = useState(false);

  useEffect(() => { websiteInputRef.current?.focus(); }, []);
  useEffect(() => {
    if (step === 'details') setTimeout(() => companyNameRef.current?.focus(), 350);
  }, [step]);

  function updateForm(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function transition(hide, showStep, show) {
    hide(false);
    setTimeout(() => { setStep(showStep); requestAnimationFrame(() => show(true)); }, 160);
  }

  const handleAdvance           = () => transition(setCard1Active, 'details',  setCard2Active);
  const handleGoBack            = () => transition(setCard2Active, 'intro',     setCard1Active);
  const handleAdvanceToKeywords = () => transition(setCard2Active, 'keywords',  setCard3Active);
  const handleBackToDetails     = () => transition(setCard3Active, 'details',   setCard2Active);
  const handleAdvanceToRelated  = () => transition(setCard3Active, 'related',   setCard4Active);
  const handleBackToKeywords    = () => transition(setCard4Active, 'keywords',  setCard3Active);
  const handleAdvanceToLongtail     = () => transition(setCard4Active, 'longtail',     setCard5Active);
  const handleBackToRelated         = () => transition(setCard5Active, 'related',      setCard4Active);
  const handleAdvanceToLlmQuestions = () => transition(setCard5Active, 'llmquestions', setCard6Active);
  const handleBackToLongtail        = () => transition(setCard6Active, 'longtail',     setCard5Active);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>New brand profile</h1>
          <p className={styles.description}>Build a complete brand profile to write content that generates inbound leads.</p>
        </div>
        {step === 'details' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={handleGoBack}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToKeywords}>Next</button>
          </div>
        )}
        {step === 'keywords' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={handleBackToDetails}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToRelated}>Next</button>
          </div>
        )}
        {step === 'related' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={handleBackToKeywords}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLongtail}>Next</button>
          </div>
        )}
        {step === 'longtail' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={handleBackToRelated}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLlmQuestions}>Next</button>
          </div>
        )}
        {step === 'llmquestions' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={handleBackToLongtail}>Back</button>
            <button className={styles.saveBtn}>Next</button>
          </div>
        )}
      </header>

      <div className={styles.center}>
        <div className={styles.cardsCol}>

          {/* Card 1 - Intro */}
          {step === 'intro' && (
            <div className={`${styles.card} ${card1Active ? styles.cardActive : ''}`}>
              <div className={styles.iconCircle}>
                <Plus size={14} strokeWidth={2.5} />
              </div>
              <h2 className={styles.cardTitle}>Create a brand profile</h2>
              <p className={styles.cardDesc}>
                We'll follow a simple process to create your brand profile. It should take just a few minutes.
              </p>
              <hr className={styles.divider} />
              <div className={styles.steps}>
                {STEPS.map((s, i) => (
                  <div key={i} className={styles.step}>
                    <div className={styles.stepCircle}>{i + 1}</div>
                    <span className={styles.stepLabel}>{s}</span>
                  </div>
                ))}
              </div>
              <div className={styles.websiteInputWrap}>
                <input
                  className={styles.websiteInput} type="text" value={website}
                  onChange={e => setWebsite(e.target.value)} ref={websiteInputRef}
                  onKeyDown={e => { if (e.key === 'Enter' && canScan) handleAdvance(); }}
                  placeholder="Enter your company website"
                />
                <button className={styles.websiteArrowBtn} disabled={!canScan} onClick={handleAdvance}>
                  <Sparkles size={13} strokeWidth={2} />
                  AI scan
                </button>
              </div>
            </div>
          )}

          {/* Card 2 - Details */}
          {step === 'details' && (
            <div className={`${styles.card2Row} ${card2Active ? styles.card2RowActive : ''}`}>
              <div className={styles.card2Basic}>
                <div className={styles.card2Body}>
                  <div className={`${styles.iconSquare} ${styles.iconSquareBasic}`}><Building2 size={14} strokeWidth={2} /></div>
                  <h2 className={styles.card2Title}>Basic details</h2>
                  <p className={styles.card2Desc}>Core company info for content generation.</p>
                  <div className={styles.card2Fields}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Company name</label>
                      <input ref={companyNameRef} className={styles.fieldInput} type="text" value={form.companyName} onChange={e => updateForm('companyName', e.target.value)} placeholder="e.g. Acme Corp" />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Company website</label>
                      <input className={styles.fieldInput} type="text" value={form.companyWebsite} onChange={e => updateForm('companyWebsite', e.target.value)} placeholder="e.g. acme.com" />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Industry</label>
                      <input className={styles.fieldInput} type="text" value={form.industry} onChange={e => updateForm('industry', e.target.value)} placeholder="e.g. SaaS, retail, healthcare" />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>Founded year</label>
                      <input className={styles.fieldInput} type="text" value={form.foundedYear} onChange={e => updateForm('foundedYear', e.target.value)} placeholder="e.g. 2018" />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                      <label className={styles.fieldLabel}>Summary</label>
                      <textarea className={styles.fieldTextarea} value={form.summary} onChange={e => updateForm('summary', e.target.value)} placeholder="Brief description of what your company does" />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.card2Advanced}>
                <div className={styles.card2Body}>
                  <div className={`${styles.iconSquare} ${styles.iconSquareAdvanced}`}><Layers size={14} strokeWidth={2} /></div>
                  <h2 className={styles.card2Title}>Advanced details</h2>
                  <p className={styles.card2Desc}>Deeper brand context for targeted content.</p>
                  <div className={`${styles.card2Fields} ${styles.card2FieldsFlex}`}>
                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                      <label className={styles.fieldLabel}>Target audience</label>
                      <textarea className={styles.fieldTextarea} value={form.targetAudience} onChange={e => updateForm('targetAudience', e.target.value)} placeholder="Who your product or service is for" />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                      <label className={styles.fieldLabel}>Problem</label>
                      <textarea className={styles.fieldTextarea} value={form.problem} onChange={e => updateForm('problem', e.target.value)} placeholder="What problem does your company solve?" />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                      <label className={styles.fieldLabel}>Solution</label>
                      <textarea className={styles.fieldTextarea} value={form.solution} onChange={e => updateForm('solution', e.target.value)} placeholder="How does your product or service solve it?" />
                    </div>
                    <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                      <label className={styles.fieldLabel}>USPs</label>
                      <textarea className={styles.fieldTextarea} value={form.usps} onChange={e => updateForm('usps', e.target.value)} placeholder="What makes you uniquely different?" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Card 3 - Primary keywords */}
          {step === 'keywords' && (
            <KeywordsTable
              className={`${styles.card3} ${card3Active ? styles.card3Active : ''}`}
              title="Primary keywords"
              description="Primary business and brand keywords for XEO"
              icon={Key}
              iconClass={styles.iconSquareKeywords}
              initialKeywords={SAMPLE_KEYWORDS}
            />
          )}

          {/* Card 4 - Related keywords */}
          {step === 'related' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card4Active ? styles.card3Active : ''}`}
              title="Related keywords"
              description="Keyword variations and closely related search terms sorted by primary keyword."
              icon={Tags}
              iconClass={styles.iconSquareRelated}
              initialData={SAMPLE_RELATED_KEYWORDS}
              keywordField="relatedKeyword"
              keywordLabel="Related keyword"
              primaryKeywords={SAMPLE_KEYWORDS}
            />
          )}

          {/* Card 5 - Long tail keywords */}
          {step === 'longtail' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card5Active ? styles.card3Active : ''}`}
              title="Long tail keywords"
              description="Specific, lower-competition phrases with higher intent sorted by primary keyword."
              icon={AlignLeft}
              iconClass={styles.iconSquareLongtail}
              initialData={SAMPLE_LONGTAIL_KEYWORDS}
              keywordField="longtailKeyword"
              keywordLabel="Long tail keyword"
              primaryKeywords={SAMPLE_KEYWORDS}
            />
          )}

          {/* Card 6 - Key LLM questions */}
          {step === 'llmquestions' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card6Active ? styles.card3Active : ''}`}
              title="Key LLM questions"
              description="Questions users ask AI tools related to your primary keywords - optimize content to be cited in LLM-generated answers."
              icon={HelpCircle}
              iconClass={styles.iconSquareLlm}
              initialData={SAMPLE_LLM_QUESTIONS}
              keywordField="llmQuestion"
              keywordLabel="LLM question"
              primaryKeywords={SAMPLE_KEYWORDS}
              addLabel="Add question"
              truncateKeyword
            />
          )}

        </div>
      </div>
    </div>
  );
}
