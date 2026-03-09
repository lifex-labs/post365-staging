import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Building2, Layers, Key, Tags, AlignLeft, HelpCircle, Pencil, Globe, Link, GitBranch, Loader2, X } from 'lucide-react';
import styles from './NewBrandProfilePage.module.css';
import {
  CONTEXT_ROWS, CONTEXT_LABEL_COLORS,
  SAMPLE_KEYWORDS, SAMPLE_RELATED_KEYWORDS, SAMPLE_LSI_KEYWORDS, SAMPLE_LONGTAIL_KEYWORDS, SAMPLE_LLM_QUESTIONS,
} from '../components/BrandProfileWizardConstants';
import { KeywordsTable, GroupedKeywordsTable } from '../components/BrandProfileWizardShared';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';

const STEPS = [
  'Overall company details',
  'Primary brand keywords',
  'Related keywords',
  'LSI keywords',
  'Long tail keywords',
  'Key LLM questions',
];

const isValidWebsite = (value) =>
  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(value.trim());

function normaliseUrl(raw) {
  const s = raw.trim();
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

function mapAgentResult(result) {
  const ba = result.business_analysis || {};
  return {
    companyName:      ba.company_name      || '',
    industry:         ba.industry          || '',
    foundedYear:      ba.founded_year      || '',
    summary:          ba.summary           || '',
    problem:          ba.problem           || '',
    solution:         ba.solution          || '',
    usps:             ba.usp               || '',
    valueProposition: ba.value_proposition || '',
    primaryKeywords: (result.primary_keywords || []).map(k => ({
      id: k.number, keyword: k.primary_keyword, volume: k.volume, difficulty: k.difficulty, reason: k.reason_for_selection,
    })),
    relatedKeywords: (result.related_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, relatedKeyword: k.related_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    lsiKeywords: (result.lsi_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, lsiKeyword: k.lsi_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    longtailKeywords: (result.long_tail_keywords || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, longtailKeyword: k.long_tail_keyword, volume: k.volume, difficulty: k.difficulty,
    })),
    llmQuestions: (result.key_llm_questions || []).map(k => ({
      id: k.number, primaryKeyword: k.primary_keyword, llmQuestion: k.key_llm_question, volume: k.volume, difficulty: k.difficulty,
    })),
    blogThemes: (result.blog_themes || []).map(t => ({
      id: t.number,
      primaryKeyword: (t.primary_keywords_included || [])[0] || '',
      theme:   t.blog_theme,
      summary: t.blog_theme_summary,
      date:    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      keywords: {
        primary:      t.primary_keywords_included      || [],
        related:      t.related_keywords_included      || [],
        lsi:          t.lsi_keywords_included          || [],
        longtail:     t.long_tail_keywords_included    || [],
        llmQuestions: t.key_llm_questions_included     || [],
      },
    })),
  };
}


export default function NewBrandProfilePage() {
  const navigate = useNavigate();
  const api = useBrandProfilesApi();
  const [urlTags, setUrlTags] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const urlInputRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const canScan = urlTags.length > 0 || isValidWebsite(urlInput);

  function commitUrlInput() {
    const val = urlInput.trim();
    if (!val) return;
    // Split on commas in case the user pasted multiple at once
    const parts = val.split(',').map(s => s.trim()).filter(s => isValidWebsite(s));
    if (parts.length === 0) return;
    setUrlTags(prev => {
      const existing = new Set(prev.map(u => u.toLowerCase()));
      const next = parts.map(normaliseUrl).filter(u => !existing.has(u.toLowerCase()));
      return [...prev, ...next];
    });
    setUrlInput('');
  }

  function removeUrlTag(index) {
    setUrlTags(prev => prev.filter((_, i) => i !== index));
  }

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanError, setScanError] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [form, setForm] = useState({
    companyName: 'Post365',
    companyWebsite: 'post365.ai',
    industry: 'Marketing Technology',
    foundedYear: '2023',
    summary: 'Post365 is an AI-powered content marketing platform that helps B2B brands generate, publish, and optimise content across multiple channels. The platform combines SEO, AEO, and GEO into a single XEO workflow to drive organic traffic and inbound leads at scale.',
    problem: 'B2B marketing teams struggle to produce enough high-quality, SEO-optimised content to compete organically. Manual content workflows are slow, expensive, and inconsistent - making it hard to maintain publishing cadence while keeping content aligned to brand voice and business goals.',
    solution: 'Post365 automates the entire content workflow from keyword research to published article. AI generates first drafts optimised for XEO, brand profiles ensure consistent voice and targeting, and multi-channel publishing tools help teams ship content faster without sacrificing quality.',
    usps: 'Proprietary XEO optimisation combining SEO, AEO, and GEO in a single workflow. Brand profile system that preserves tone, audience targeting, and messaging consistency at scale. Calendar-driven content planning with built-in performance tracking and multi-channel publishing.',
    valueProposition: 'Post365 gives B2B marketing teams the fastest path from keyword strategy to published, search-optimised content - combining AI generation, brand consistency, and XEO in one platform.',
  });

  // Lifted keyword state — preserves data across step transitions and passed to the API on save
  const [keywordsData,  setKeywordsData]  = useState(SAMPLE_KEYWORDS);
  const [relatedData,   setRelatedData]   = useState(SAMPLE_RELATED_KEYWORDS);
  const [lsiData,       setLsiData]       = useState(SAMPLE_LSI_KEYWORDS);
  const [longtailData,  setLongtailData]  = useState(SAMPLE_LONGTAIL_KEYWORDS);
  const [llmData,       setLlmData]       = useState(SAMPLE_LLM_QUESTIONS);
  const [blogThemes,    setBlogThemes]    = useState([]);

  const [contextEditingField, setContextEditingField] = useState(null);
  const [contextEditDraft, setContextEditDraft] = useState('');

  const companyNameRef = useRef(null);
  const [step, setStep] = useState('intro');
  const [card1Active, setCard1Active] = useState(true);
  const [card2Active, setCard2Active] = useState(false);
  const [card3Active, setCard3Active] = useState(false);
  const [card4Active, setCard4Active] = useState(false);
  const [card5Active, setCard5Active] = useState(false);
  const [card6Active, setCard6Active] = useState(false);
  const [card7Active, setCard7Active] = useState(false);

  const [agentProfileSlug, setAgentProfileSlug] = useState(null);
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [newProfileSlug, setNewProfileSlug] = useState(null);
  const buildDone = buildProgress >= 100;

  useEffect(() => { urlInputRef.current?.focus(); }, []);
  useEffect(() => {
    if (step === 'details') setTimeout(() => companyNameRef.current?.focus(), 350);
  }, [step]);
  useEffect(() => {
    if (!showBuildingModal) return;
    setBuildProgress(0);
    const id = setInterval(() => {
      setBuildProgress(p => {
        if (p >= 100) { clearInterval(id); return 100; }
        return p + 1;
      });
    }, 30);
    return () => clearInterval(id);
  }, [showBuildingModal]);

  useEffect(() => {
    if (!isScanning) {
      setScanProgress(0);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }
    setScanProgress(0);
    // Animate to 90 over ~85s (scan typically takes 30-90s)
    scanIntervalRef.current = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) { clearInterval(scanIntervalRef.current); return 90; }
        return p + 1;
      });
    }, 950);
    return () => { if (scanIntervalRef.current) clearInterval(scanIntervalRef.current); };
  }, [isScanning]);

  function updateForm(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function transition(hide, showStep, show) {
    hide(false);
    setTimeout(() => { setStep(showStep); requestAnimationFrame(() => show(true)); }, 160);
  }

  function handleCancelScan() { setShowCancelConfirm(true); }
  function handleKeepScanning() { setShowCancelConfirm(false); }
  function handleConfirmCancel() {
    abortControllerRef.current?.abort();
    setShowCancelConfirm(false);
    setIsScanning(false);
  }

  async function handleAdvance() {
    // Commit any partial input before scanning
    const pendingTags = [...urlTags];
    if (urlInput.trim() && isValidWebsite(urlInput)) {
      pendingTags.push(normaliseUrl(urlInput.trim()));
    }
    if (pendingTags.length === 0) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsScanning(true);
    setScanError(null);
    try {
      const { result, profileSlug } = await api.scanWebsite(pendingTags, controller.signal);
      if (profileSlug) setAgentProfileSlug(profileSlug);
      const mapped = mapAgentResult(result);
      setForm(prev => ({
        ...prev,
        companyWebsite:   pendingTags[0],
        companyName:      mapped.companyName,
        industry:         mapped.industry,
        foundedYear:      mapped.foundedYear,
        summary:          mapped.summary,
        problem:          mapped.problem,
        solution:         mapped.solution,
        usps:             mapped.usps,
        valueProposition: mapped.valueProposition,
      }));
      setKeywordsData(mapped.primaryKeywords);
      setRelatedData(mapped.relatedKeywords);
      setLsiData(mapped.lsiKeywords);
      setLongtailData(mapped.longtailKeywords);
      setLlmData(mapped.llmQuestions);
      setBlogThemes(mapped.blogThemes);
      setScanProgress(100);
      setTimeout(() => {
        setIsScanning(false);
        transition(setCard1Active, 'details', setCard2Active);
      }, 300);
    } catch (err) {
      if (err.name === 'AbortError') return; // user cancelled — don't show error
      console.error('[brand-profile-scan]', err.message);
      let msg = err.message || '';
      try { msg = JSON.parse(msg).error || msg; } catch {}
      if (msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('too many')) {
        setScanError('Rate limit reached. Please wait a minute and try again.');
      } else if (msg.toLowerCase().includes('auth') || msg.includes('401') || msg.includes('403')) {
        setScanError('Authentication error. Please refresh the page and try again.');
      } else {
        setScanError(msg || 'Scan failed. Please try again.');
      }
      setIsScanning(false);
    }
  }
  const handleGoBack            = () => transition(setCard2Active, 'intro',     setCard1Active);
  const handleAdvanceToKeywords = () => transition(setCard2Active, 'keywords',  setCard3Active);
  const handleBackToDetails     = () => transition(setCard3Active, 'details',   setCard2Active);
  const handleAdvanceToRelated  = () => transition(setCard3Active, 'related',   setCard4Active);
  const handleBackToKeywords    = () => transition(setCard4Active, 'keywords',  setCard3Active);
  const handleAdvanceToLsi          = () => transition(setCard4Active, 'lsi',          setCard5Active);
  const handleBackToRelated         = () => transition(setCard5Active, 'related',      setCard4Active);
  const handleAdvanceToLongtail     = () => transition(setCard5Active, 'longtail',     setCard6Active);
  const handleBackToLsi             = () => transition(setCard6Active, 'lsi',          setCard5Active);
  const handleAdvanceToLlmQuestions  = () => transition(setCard6Active, 'llmquestions', setCard7Active);
  const handleBackToLongtail         = () => transition(setCard7Active, 'longtail',     setCard6Active);

  async function handleFinishLlm() {
    setCard7Active(false);
    setTimeout(() => setShowBuildingModal(true), 160);

    try {
      const profileData = {
        name:             form.companyName,
        website:          form.companyWebsite,
        industry:         form.industry,
        foundedYear:      form.foundedYear,
        summary:          form.summary,
        problem:          form.problem,
        solution:         form.solution,
        usps:             form.usps,
        valueProposition: form.valueProposition,
        primaryKeywords:  keywordsData,
        relatedKeywords:  relatedData,
        lsiKeywords:      lsiData,
        longtailKeywords: longtailData,
        llmQuestions:     llmData,
        blogThemes:       blogThemes,
        status:           'complete',
        stepsCompleted:   6,
      };
      const res = agentProfileSlug
        ? await api.updateProfile(agentProfileSlug, profileData)
        : await api.createProfile(profileData);
      setNewProfileSlug(res.profile.slug);
    } catch {
      // If save fails, fall back to profiles list on view
    }
  }

  function handleCancelBuilding() {
    setShowBuildingModal(false);
    setBuildProgress(0);
    requestAnimationFrame(() => setCard7Active(true));
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
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToKeywords}>Next</button>
          </div>
        )}
        {step === 'keywords' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.backBtn} onClick={handleBackToDetails}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToRelated}>Next</button>
          </div>
        )}
        {step === 'related' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.backBtn} onClick={handleBackToKeywords}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLsi}>Next</button>
          </div>
        )}
        {step === 'lsi' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.backBtn} onClick={handleBackToRelated}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLongtail}>Next</button>
          </div>
        )}
        {step === 'longtail' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.backBtn} onClick={handleBackToLsi}>Back</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLlmQuestions}>Next</button>
          </div>
        )}
        {step === 'llmquestions' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.backBtn} onClick={handleBackToLongtail}>Back</button>
            <button className={styles.saveBtn} onClick={handleFinishLlm}>Finish</button>
          </div>
        )}
      </header>

      <div className={styles.center}>
        <div className={styles.cardsCol}>

          {/* Card 1 - Intro */}
          {step === 'intro' && (
            <div className={`${styles.introRow} ${card1Active ? styles.introRowActive : ''}`}>

              {/* Left: info card */}
              <div className={styles.introInfoCard}>
                <div className={`${styles.iconSquare} ${styles.iconSquareInfo}`}>
                  <Globe size={14} strokeWidth={2} />
                </div>
                <h2 className={styles.card2Title}>Create a brand profile</h2>
                <p className={styles.card2Desc}>
                  We'll follow a simple process to create your brand profile. It should take just a few minutes.
                </p>
                <hr className={styles.divider} />
                <ul className={styles.introExamples}>
                  <li className={styles.introExampleItem}>
                    <span className={styles.introExampleTitle}>Home page</span>
                    <span className={styles.introExampleDesc}>Brand positioning, tone and core messaging</span>
                  </li>
                  <li className={styles.introExampleItem}>
                    <span className={styles.introExampleTitle}>Product page</span>
                    <span className={styles.introExampleDesc}>Features, benefits and product-level messaging</span>
                  </li>
                  <li className={styles.introExampleItem}>
                    <span className={styles.introExampleTitle}>Solutions page</span>
                    <span className={styles.introExampleDesc}>How your offering solves customer problems</span>
                  </li>
                  <li className={styles.introExampleItem}>
                    <span className={styles.introExampleTitle}>Services page</span>
                    <span className={styles.introExampleDesc}>Service categories, scope and positioning details</span>
                  </li>
                  <li className={styles.introExampleItem}>
                    <span className={styles.introExampleTitle}>Case study page</span>
                    <span className={styles.introExampleDesc}>Proof points, outcomes and success context</span>
                  </li>
                </ul>
                <p className={styles.introFootnote}>Note: This is an indicative, not exhaustive list.</p>
              </div>

              {/* Right: website URL card */}
              <div className={styles.introWebsiteCard}>
                <div className={`${styles.iconSquare} ${styles.iconSquareWebsite}`}>
                  <Link size={14} strokeWidth={2} />
                </div>
                <h2 className={styles.card2Title}>Website URL</h2>
                <p className={styles.card2Desc}>
                  Enter the URL of the page you want to scan and our AI agents will synthesize the required information.
                </p>
                <hr className={styles.divider} />
                <div className={styles.steps}>
                  {STEPS.map((s, i) => (
                    <div key={i} className={styles.step}>
                      <div className={styles.stepCircle}>{i + 1}</div>
                      <span className={styles.stepLabel}>{s}</span>
                    </div>
                  ))}
                  <div className={styles.step}>
                    <div className={styles.stepCircle}>7</div>
                    <span className={styles.stepLabel}>Blog themes &amp; clusters</span>
                  </div>
                </div>
                <div
                  className={styles.urlTagBox}
                  onClick={() => urlInputRef.current?.focus()}
                >
                  {urlTags.map((tag, i) => (
                    <span key={i} className={styles.urlTag}>
                      {tag}
                      <button
                        className={styles.urlTagRemove}
                        onClick={e => { e.stopPropagation(); removeUrlTag(i); }}
                        tabIndex={-1}
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={urlInputRef}
                    className={styles.urlTagInput}
                    type="text"
                    value={urlInput}
                    onChange={e => { setUrlInput(e.target.value); if (scanError) setScanError(null); }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); if (canScan && !urlInput.trim()) { handleAdvance(); } else { commitUrlInput(); } }
                      if (e.key === ',') { e.preventDefault(); commitUrlInput(); }
                      if (e.key === 'Backspace' && !urlInput && urlTags.length > 0) removeUrlTag(urlTags.length - 1);
                    }}
                    onBlur={commitUrlInput}
                    placeholder={urlTags.length === 0 ? 'Enter a URL, or multiple URLs separated by commas' : 'Add another URL...'}
                  />
                </div>
                <button className={styles.websiteArrowBtn} disabled={!canScan} onClick={handleAdvance}>
                  <Sparkles size={13} strokeWidth={2} />
                  AI scan
                </button>
                {scanError && <p className={styles.scanError}>{scanError}</p>}
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
              <div className={styles.card2ContextCard}>
                <div className={styles.card3Head}>
                  <div className={`${styles.iconSquare} ${styles.iconSquareAdvanced}`}>
                    <Layers size={14} strokeWidth={2} />
                  </div>
                  <h2 className={styles.card2Title}>Brand context</h2>
                  <p className={styles.card2Desc}>Core positioning and differentiation for content generation.</p>
                </div>
                <div className={styles.desktopContextTable}>
                  <div className={styles.tableWrapper}>
                    <table className={`${styles.kwTable} ${styles.contextTable}`}>
                      <colgroup>
                        <col className={styles.colContextLabel} />
                        <col />
                        <col className={styles.colActions} />
                      </colgroup>
                      <tbody className={styles.kwTbody}>
                        {CONTEXT_ROWS.map(({ key, label, placeholder }) => {
                          const isEditing = contextEditingField === key;
                          return (
                            <Fragment key={key}>
                              <tr className={`${styles.kwRow} ${isEditing ? styles.kwRowEditing : ''}`}>
                                <td><span className={styles.kwTag} style={CONTEXT_LABEL_COLORS[key]}>{label}</span></td>
                                <td>
                                  {isEditing ? (
                                    <textarea
                                      className={styles.editContextTextarea}
                                      value={contextEditDraft}
                                      onChange={e => setContextEditDraft(e.target.value)}
                                      placeholder={placeholder}
                                      autoFocus
                                    />
                                  ) : (
                                    <span className={styles.cellClamp}>{form[key]}</span>
                                  )}
                                </td>
                                <td>
                                  <div className={styles.actionsCell}>
                                    {!isEditing && (
                                      <button
                                        className={styles.rowIconBtn}
                                        onClick={() => { setContextEditingField(key); setContextEditDraft(form[key]); }}
                                      >
                                        <Pencil size={13} strokeWidth={2} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              {isEditing && (
                                <tr className={styles.saveCancelRow}>
                                  <td />
                                  <td colSpan={2}>
                                    <div className={styles.saveCancelBtns}>
                                      <button className={styles.cancelTextBtn} onClick={() => setContextEditingField(null)}>Cancel</button>
                                      <button className={styles.saveTextBtn} onClick={() => { updateForm(key, contextEditDraft); setContextEditingField(null); }}>Save</button>
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
                </div>
                <div className={styles.mobileContextFields}>
                  {CONTEXT_ROWS.map(({ key, label, placeholder }) => (
                    <div key={key} className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>{label}</label>
                      <textarea
                        className={styles.fieldTextarea}
                        value={form[key]}
                        onChange={e => updateForm(key, e.target.value)}
                        placeholder={placeholder}
                      />
                    </div>
                  ))}
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
              initialKeywords={keywordsData}
              onDataChange={setKeywordsData}
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
              initialData={relatedData}
              keywordField="relatedKeyword"
              keywordLabel="Related keyword"
              primaryKeywords={keywordsData}
              onDataChange={setRelatedData}
            />
          )}

          {/* Card 5 - LSI keywords */}
          {step === 'lsi' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card5Active ? styles.card3Active : ''}`}
              title="LSI keywords"
              description="Semantically related terms that reinforce topical relevance for each primary keyword."
              icon={GitBranch}
              iconClass={styles.iconSquareLsi}
              initialData={lsiData}
              keywordField="lsiKeyword"
              keywordLabel="LSI keyword"
              primaryKeywords={keywordsData}
              onDataChange={setLsiData}
            />
          )}

          {/* Card 6 - Long tail keywords */}
          {step === 'longtail' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card6Active ? styles.card3Active : ''}`}
              title="Long tail keywords"
              description="Specific, lower-competition phrases with higher intent sorted by primary keyword."
              icon={AlignLeft}
              iconClass={styles.iconSquareLongtail}
              initialData={longtailData}
              keywordField="longtailKeyword"
              keywordLabel="Long tail keyword"
              primaryKeywords={keywordsData}
              onDataChange={setLongtailData}
            />
          )}

          {/* Card 7 - Key LLM questions */}
          {step === 'llmquestions' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card7Active ? styles.card3Active : ''}`}
              title="Key LLM questions"
              description="Questions users ask AI tools related to your primary keywords - optimize content to be cited in LLM-generated answers."
              icon={HelpCircle}
              iconClass={styles.iconSquareLlm}
              initialData={llmData}
              keywordField="llmQuestion"
              keywordLabel="LLM question"
              primaryKeywords={keywordsData}
              addLabel="Add question"
              truncateKeyword
              onDataChange={setLlmData}
            />
          )}

        </div>
      </div>

      {isScanning && createPortal(
        <div className={styles.buildBackdrop}>
          <div className={styles.scanModal}>
            <div className={styles.scanningIcon}>
              <Loader2 size={20} strokeWidth={2} className={styles.spinnerIcon} />
            </div>
            <p className={styles.buildModalTitle}>Scanning your website</p>
            <p className={styles.buildModalDesc}>Our AI agent is reading your website and generating your brand profile. This can take up to 5 minutes. Please do not close this window.</p>
            <div className={`${styles.buildProgressTrack} ${styles.scanProgressTop}`}>
              <div className={styles.buildProgressFill} style={{ width: `${scanProgress}%` }} />
            </div>
            <div className={styles.scanActions}>
              <button className={styles.scanCancelBtn} onClick={handleCancelScan}>Cancel</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCancelConfirm && createPortal(
        <div className={styles.buildBackdrop} style={{ zIndex: 1010 }}>
          <div className={styles.confirmModal}>
            <p className={styles.confirmTitle}>Cancel scan?</p>
            <p className={styles.confirmDesc}>The scan is in progress. If you cancel now, no data will be saved and you'll need to start again.</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmKeepBtn} onClick={handleKeepScanning}>Keep scanning</button>
              <button className={styles.confirmStopBtn} onClick={handleConfirmCancel}>Cancel scan</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showBuildingModal && createPortal(
        <div className={styles.buildBackdrop}>
          <div className={styles.buildModal}>
            <p className={styles.buildModalTitle}>Building your blog themes</p>
            <p className={styles.buildModalDesc}>Analysing your brand profile and generating tailored blog themes and topic clusters for your content strategy.</p>
            <div className={styles.buildProgressTrack}>
              <div className={styles.buildProgressFill} style={{ width: `${buildProgress}%` }} />
            </div>
            <div className={styles.buildModalActions}>
              <button className={styles.buildCancelBtn} onClick={handleCancelBuilding}>Cancel</button>
              <button
                className={styles.buildViewBtn}
                disabled={!buildDone}
                onClick={() => navigate(newProfileSlug ? `/brand-profiles/view/${newProfileSlug}` : '/brand-profiles')}
              >
                View results
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
