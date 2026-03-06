import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Sparkles, Building2, Layers, Key, Tags, AlignLeft, Pencil, Check, X, Trash2 } from 'lucide-react';
import styles from './NewBrandProfilePage.module.css';
import modalStyles from '../components/LogoutModal.module.css';

const STEPS = [
  'Overall company details',
  'Primary brand keywords',
  'Related keywords (ref: Primary)',
  'Long tail keywords (ref: Primary)',
  'Key LLM questions (ref: Primary)',
  'Specific instructions',
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

const SAMPLE_KEYWORDS = [
  { id: 1,  keyword: 'content marketing platform',      volume: 'High',   difficulty: 'Medium', reason: 'High-intent term actively searched by marketing directors and content leads evaluating tools to centralize and scale their content operations. Users at this stage are typically in an active buying cycle, comparing platforms with feature-rich workflows that support multi-channel publishing, AI writing, and performance analytics.' },
  { id: 2,  keyword: 'AI blog writer',                  volume: 'High',   difficulty: 'Low',    reason: 'Rapidly growing search trend driven by marketing managers seeking to reduce time spent on first-draft blog creation. This keyword captures early-funnel buyers exploring AI-assisted writing tools and positions Post365 as a solution before prospects evaluate competing platforms or enterprise-level alternatives.' },
  { id: 3,  keyword: 'SEO content generation',          volume: 'Medium', difficulty: 'Medium', reason: 'Core use case keyword that bridges organic search strategy with AI-assisted content workflows. Attracts marketers who want to produce search-optimized content at volume without hiring additional writers, making it a strong entry point for demonstrating Post365\'s ability to generate high-ranking blog content at scale.' },
  { id: 4,  keyword: 'B2B content strategy',            volume: 'High',   difficulty: 'High',   reason: 'Targets senior decision-makers at mid-market and enterprise companies rebuilding or scaling their content strategy to drive inbound pipeline. Buyers searching this term typically control content budgets and are looking for platforms that align content output directly with revenue goals and sales enablement.' },
  { id: 5,  keyword: 'XEO optimization',                volume: 'Low',    difficulty: 'Low',    reason: 'Proprietary term that captures Post365\'s combined approach to AEO, GEO and SEO in a single content workflow. Building search authority around this term establishes brand leadership in an emerging discipline while attracting progressive marketers actively researching next-generation content strategies beyond traditional optimization.' },
  { id: 6,  keyword: 'brand content calendar',          volume: 'Medium', difficulty: 'Low',    reason: 'Searched by marketing leads and content managers planning quarterly content schedules across multiple channels and brand voices. This term signals strong operational buying intent, attracting users who need structured planning tools that connect editorial calendars with publishing workflows and team collaboration features.' },
  { id: 7,  keyword: 'inbound lead generation content', volume: 'Medium', difficulty: 'High',   reason: 'High commercial intent phrase attracting buyers who specifically want content solutions that convert organic traffic into qualified sales leads. Connects Post365 to revenue-driven content goals, making it ideal for targeting CMOs and growth marketers who measure performance through pipeline contribution and conversion metrics.' },
  { id: 8,  keyword: 'AI-powered SEO blogs',            volume: 'High',   difficulty: 'Medium', reason: 'Combines two major demand trends - AI writing automation and search engine optimization - to attract traffic from both SEO practitioners and marketing generalists. Positions Post365 at the intersection of AI capability and organic search performance, targeting users exploring smarter blog production workflows to scale content output.' },
  { id: 9,  keyword: 'generative engine optimization',  volume: 'Low',    difficulty: 'Low',    reason: 'Emerging category keyword as brands race to optimize content for AI-driven discovery platforms like Perplexity, ChatGPT search, and Google AI Overviews. Capturing early search volume for this term builds brand authority in a rapidly growing discipline while attracting progressive marketers investing in future-proof content strategies.' },
  { id: 10, keyword: 'thought leadership content',      volume: 'High',   difficulty: 'High',   reason: 'Broad awareness keyword used by B2B brands investing in authority-building content to establish credibility within their industry. Typically represents marketing or communications teams tasked with positioning executive voices online, creating a strong fit for Post365\'s personal and brand profile features that support executive content at scale.' },
];

const SAMPLE_RELATED_KEYWORDS = [
  { id: 1, keyword: 'content distribution platform',  volume: 'High',   difficulty: 'Medium' },
  { id: 2, keyword: 'AI content creation tool',        volume: 'High',   difficulty: 'High'   },
  { id: 3, keyword: 'brand publishing platform',        volume: 'Medium', difficulty: 'Low'    },
  { id: 4, keyword: 'content operations software',      volume: 'Medium', difficulty: 'Medium' },
  { id: 5, keyword: 'automated blog writing',           volume: 'High',   difficulty: 'Medium' },
  { id: 6, keyword: 'multi-channel content hub',        volume: 'Low',    difficulty: 'Low'    },
  { id: 7, keyword: 'enterprise content platform',      volume: 'High',   difficulty: 'High'   },
  { id: 8, keyword: 'content workflow automation',      volume: 'Medium', difficulty: 'Medium' },
];

const SAMPLE_LONGTAIL_KEYWORDS = [
  { id: 1, keyword: 'best AI blog writing tool for B2B marketers',        volume: 'Low',    difficulty: 'Low'    },
  { id: 2, keyword: 'how to create SEO content at scale',                  volume: 'Medium', difficulty: 'Low'    },
  { id: 3, keyword: 'content marketing platform for startups',              volume: 'Low',    difficulty: 'Low'    },
  { id: 4, keyword: 'AI tool to write thought leadership articles',         volume: 'Low',    difficulty: 'Low'    },
  { id: 5, keyword: 'how to optimize content for generative AI search',     volume: 'Low',    difficulty: 'Low'    },
  { id: 6, keyword: 'content calendar software for marketing teams',        volume: 'Medium', difficulty: 'Low'    },
  { id: 7, keyword: 'how to build brand authority with content marketing',  volume: 'Medium', difficulty: 'Medium' },
  { id: 8, keyword: 'B2B inbound lead generation through blog content',     volume: 'Low',    difficulty: 'Medium' },
];

// ===== Reusable keywords table card =====
function KeywordsTable({ className, title, description, icon: Icon, iconClass, initialKeywords, showReason }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [editDraft, setEditDraft] = useState({ keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allSelected = keywords.length > 0 && selectedIds.size === keywords.length;
  const someSelected = selectedIds.size > 0 && !allSelected;
  const colSpan = showReason ? 6 : 5;

  function toggleSelectAll() {
    if (selectedIds.size > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(keywords.map(k => k.id)));
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    if (isNewRow) {
      setKeywords(prev => prev.filter(k => k.id !== editingId));
    }
    setEditingId(null);
    setIsNewRow(false);
  }

  function handleAddRow() {
    const newId = Date.now();
    setKeywords(prev => {
      let updated = prev;
      if (editingId !== null) {
        updated = prev.map(k => k.id === editingId ? { ...k, ...editDraft } : k);
      }
      return [...updated, { id: newId, keyword: '', reason: '', volume: 'Medium', difficulty: 'Medium' }];
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
    <div className={`${className}${!showReason ? ' ' + styles.noReason : ''}`}>
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
            <col className={styles.colKeyword} />
            {showReason && <col className={styles.colReason} />}
            <col className={styles.colVolume} />
            <col className={styles.colDifficulty} />
            <col className={styles.colActions} />
          </colgroup>
          <thead className={styles.kwThead}>
            <tr>
              <th>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Keyword</th>
              {showReason && <th>Reason for selection</th>}
              <th>Volume</th>
              <th>Difficulty</th>
              <th />
            </tr>
          </thead>
          <tbody className={styles.kwTbody}>
            {keywords.map(kw => {
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
                      <input
                        type="checkbox"
                        className={styles.checkboxInput}
                        checked={selectedIds.has(kw.id)}
                        onChange={() => toggleSelect(kw.id)}
                      />
                    </td>

                    {isEditing ? (
                      <>
                        <td className={styles.tdEdit}>
                          <input
                            className={styles.editInput}
                            value={editDraft.keyword}
                            onChange={e => setEditDraft(d => ({ ...d, keyword: e.target.value }))}
                            onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                            placeholder="Enter keyword"
                            autoFocus
                          />
                        </td>
                        {showReason && (
                          <td className={styles.tdEdit}>
                            <input
                              className={styles.editInput}
                              value={editDraft.reason}
                              onChange={e => setEditDraft(d => ({ ...d, reason: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                              placeholder="Reason for selection"
                            />
                          </td>
                        )}
                        <td className={styles.tdEdit}>
                          <select
                            className={styles.editSelect}
                            value={editDraft.volume}
                            onChange={e => setEditDraft(d => ({ ...d, volume: e.target.value }))}
                          >
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                          </select>
                        </td>
                        <td className={styles.tdEdit}>
                          <select
                            className={styles.editSelect}
                            value={editDraft.difficulty}
                            onChange={e => setEditDraft(d => ({ ...d, difficulty: e.target.value }))}
                          >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                          </select>
                        </td>
                        <td>
                          {!isAdding && (
                            <div className={`${styles.actionsCell} ${styles.editIconActions}`}>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnSave}`} onClick={handleEditSave} title="Save">
                                <Check size={13} />
                              </button>
                              <button className={`${styles.rowIconBtn} ${styles.rowIconBtnCancel}`} onClick={handleEditCancel} title="Cancel">
                                <X size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className={styles.tdKeyword}>
                          <div className={styles.cellClamp} style={{ fontSize: '14px' }}>{kw.keyword}</div>
                        </td>
                        {showReason && (
                          <td className={styles.tdReason}>
                            <div className={styles.cellClamp} style={{ fontSize: '13px', color: 'var(--text-2)' }}>{kw.reason}</div>
                          </td>
                        )}
                        <td>
                          <span className={styles.kwTag} style={VOLUME_COLORS[kw.volume]}>{kw.volume}</span>
                        </td>
                        <td>
                          <span className={styles.kwTag} style={DIFFICULTY_COLORS[kw.difficulty]}>{kw.difficulty}</span>
                        </td>
                        <td>
                          <div className={styles.actionsCell}>
                            <button className={styles.rowIconBtn} onClick={() => handleEditStart(kw)} title="Edit">
                              <Pencil size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>

                  {isEditing && (
                    <tr className={`${styles.saveCancelRow} ${!isAdding ? styles.saveCancelRowEdit : ''}`}>
                      <td colSpan={colSpan} className={styles.saveCancelCell}>
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
            <p className={modalStyles.message}>
              The selected keywords will be permanently removed from this profile. This action cannot be undone.
            </p>
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
    companyName: '',
    companyWebsite: '',
    industry: '',
    foundedYear: '',
    summary: '',
    targetAudience: '',
    problem: '',
    solution: '',
    usps: '',
  });

  const companyNameRef = useRef(null);
  const [step, setStep] = useState('intro');
  const [card1Active, setCard1Active] = useState(true);
  const [card2Active, setCard2Active] = useState(false);
  const [card3Active, setCard3Active] = useState(false);
  const [card4Active, setCard4Active] = useState(false);

  useEffect(() => {
    websiteInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (step === 'details') {
      setTimeout(() => companyNameRef.current?.focus(), 350);
    }
  }, [step]);

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleAdvance() {
    setCard1Active(false);
    setTimeout(() => {
      setStep('details');
      requestAnimationFrame(() => setCard2Active(true));
    }, 160);
  }

  function handleGoBack() {
    setCard2Active(false);
    setTimeout(() => {
      setStep('intro');
      requestAnimationFrame(() => setCard1Active(true));
    }, 160);
  }

  function handleAdvanceToKeywords() {
    setCard2Active(false);
    setTimeout(() => {
      setStep('keywords');
      requestAnimationFrame(() => setCard3Active(true));
    }, 160);
  }

  function handleBackToDetails() {
    setCard3Active(false);
    setTimeout(() => {
      setStep('details');
      requestAnimationFrame(() => setCard2Active(true));
    }, 160);
  }

  function handleAdvanceToRelated() {
    setCard3Active(false);
    setTimeout(() => {
      setStep('related');
      requestAnimationFrame(() => setCard4Active(true));
    }, 160);
  }

  function handleBackToKeywords() {
    setCard4Active(false);
    setTimeout(() => {
      setStep('keywords');
      requestAnimationFrame(() => setCard3Active(true));
    }, 160);
  }

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
            <button className={styles.saveBtn}>Next</button>
          </div>
        )}
      </header>

      <div className={styles.center}>
        <div className={styles.cardsCol}>

          {/* Card 1 - Step 1: Website */}
          {step === 'intro' && <div className={`${styles.card} ${card1Active ? styles.cardActive : ''}`}>
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
                className={styles.websiteInput}
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                ref={websiteInputRef}
                onKeyDown={e => { if (e.key === 'Enter' && canScan) handleAdvance(); }}
                placeholder="Enter your company website"
              />
              <button
                className={styles.websiteArrowBtn}
                disabled={!canScan}
                onClick={handleAdvance}
              >
                <Sparkles size={13} strokeWidth={2} />
                AI scan
              </button>
            </div>
          </div>}

          {/* Card 2 row - Basic details + Advanced details */}
          {step === 'details' && <div className={`${styles.card2Row} ${card2Active ? styles.card2RowActive : ''}`}>

            {/* Basic details */}
            <div className={styles.card2Basic}>
              <div className={styles.card2Body}>
                <div className={`${styles.iconSquare} ${styles.iconSquareBasic}`}>
                  <Building2 size={14} strokeWidth={2} />
                </div>
                <h2 className={styles.card2Title}>Basic details</h2>
                <p className={styles.card2Desc}>Core company info for content generation.</p>
                <div className={styles.card2Fields}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Company name</label>
                    <input
                      ref={companyNameRef}
                      className={styles.fieldInput}
                      type="text"
                      value={form.companyName}
                      onChange={e => updateForm('companyName', e.target.value)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Company website</label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      value={form.companyWebsite}
                      onChange={e => updateForm('companyWebsite', e.target.value)}
                      placeholder="e.g. acme.com"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Industry</label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      value={form.industry}
                      onChange={e => updateForm('industry', e.target.value)}
                      placeholder="e.g. SaaS, retail, healthcare"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Founded year</label>
                    <input
                      className={styles.fieldInput}
                      type="text"
                      value={form.foundedYear}
                      onChange={e => updateForm('foundedYear', e.target.value)}
                      placeholder="e.g. 2018"
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                    <label className={styles.fieldLabel}>Summary</label>
                    <textarea
                      className={styles.fieldTextarea}
                      value={form.summary}
                      onChange={e => updateForm('summary', e.target.value)}
                      placeholder="Brief description of what your company does"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced details */}
            <div className={styles.card2Advanced}>
              <div className={styles.card2Body}>
                <div className={`${styles.iconSquare} ${styles.iconSquareAdvanced}`}>
                  <Layers size={14} strokeWidth={2} />
                </div>
                <h2 className={styles.card2Title}>Advanced details</h2>
                <p className={styles.card2Desc}>Deeper brand context for targeted content.</p>
                <div className={`${styles.card2Fields} ${styles.card2FieldsFlex}`}>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                    <label className={styles.fieldLabel}>Target audience</label>
                    <textarea
                      className={styles.fieldTextarea}
                      value={form.targetAudience}
                      onChange={e => updateForm('targetAudience', e.target.value)}
                      placeholder="Who your product or service is for"
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                    <label className={styles.fieldLabel}>Problem</label>
                    <textarea
                      className={styles.fieldTextarea}
                      value={form.problem}
                      onChange={e => updateForm('problem', e.target.value)}
                      placeholder="What problem does your company solve?"
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                    <label className={styles.fieldLabel}>Solution</label>
                    <textarea
                      className={styles.fieldTextarea}
                      value={form.solution}
                      onChange={e => updateForm('solution', e.target.value)}
                      placeholder="How does your product or service solve it?"
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                    <label className={styles.fieldLabel}>USPs</label>
                    <textarea
                      className={styles.fieldTextarea}
                      value={form.usps}
                      onChange={e => updateForm('usps', e.target.value)}
                      placeholder="What makes you uniquely different?"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>}

          {/* Card 3 - Step 2: Primary keywords */}
          {step === 'keywords' && (
            <KeywordsTable
              className={`${styles.card3} ${card3Active ? styles.card3Active : ''}`}
              title="Primary keywords"
              description="Primary business and brand keywords for XEO"
              icon={Key}
              iconClass={styles.iconSquareKeywords}
              initialKeywords={SAMPLE_KEYWORDS}
              showReason={true}
            />
          )}

          {/* Card 4 row - Step 3: Related + Long tail keywords */}
          {step === 'related' && (
            <div className={`${styles.card4Row} ${card4Active ? styles.card4RowActive : ''}`}>
              <KeywordsTable
                className={styles.card4Card}
                title="Related keywords"
                description="Keyword variations and closely related search terms."
                icon={Tags}
                iconClass={styles.iconSquareRelated}
                initialKeywords={SAMPLE_RELATED_KEYWORDS}
                showReason={false}
              />
              <KeywordsTable
                className={styles.card4Card}
                title="Long tail keywords"
                description="Specific, lower-competition phrases with higher intent."
                icon={AlignLeft}
                iconClass={styles.iconSquareLongtail}
                initialKeywords={SAMPLE_LONGTAIL_KEYWORDS}
                showReason={false}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
