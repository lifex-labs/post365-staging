import { Fragment, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, Layers, Key, Tags, AlignLeft, HelpCircle, Pencil, GitBranch } from 'lucide-react';
import { BRAND_PROFILES } from '../data/brandProfiles';
import {
  CONTEXT_ROWS, CONTEXT_LABEL_COLORS,
  SAMPLE_KEYWORDS, SAMPLE_RELATED_KEYWORDS, SAMPLE_LSI_KEYWORDS, SAMPLE_LONGTAIL_KEYWORDS, SAMPLE_LLM_QUESTIONS,
  KeywordsTable, GroupedKeywordsTable,
} from '../components/BrandProfileWizardShared';
import styles from './NewBrandProfilePage.module.css';

export default function EditBrandProfilePage() {
  const { profileSlug } = useParams();
  const navigate = useNavigate();

  const profile = BRAND_PROFILES.find(p => p.slug === profileSlug);

  const companyNameRef = useRef(null);
  const [step, setStep] = useState('details');
  const [card1Active, setCard1Active] = useState(true);
  const [card2Active, setCard2Active] = useState(false);
  const [card3Active, setCard3Active] = useState(false);
  const [card4Active, setCard4Active] = useState(false);
  const [card5Active, setCard5Active] = useState(false);
  const [card6Active, setCard6Active] = useState(false);

  const [form, setForm] = useState(profile ? {
    companyName:      profile.name,
    companyWebsite:   profile.website,
    industry:         profile.industry,
    foundedYear:      profile.foundedYear,
    summary:          profile.summary,
    problem:          profile.problem,
    solution:         profile.solution,
    usps:             profile.usps,
    valueProposition: profile.valueProposition,
  } : {});

  const [contextEditingField, setContextEditingField] = useState(null);
  const [contextEditDraft, setContextEditDraft]       = useState('');

  function updateForm(key, value) { setForm(prev => ({ ...prev, [key]: value })); }

  function transition(hide, showStep, show) {
    hide(false);
    setTimeout(() => { setStep(showStep); requestAnimationFrame(() => show(true)); }, 160);
  }

  const handleAdvanceToKeywords    = () => transition(setCard1Active, 'keywords',     setCard2Active);
  const handleBackToDetails        = () => transition(setCard2Active, 'details',       setCard1Active);
  const handleAdvanceToRelated     = () => transition(setCard2Active, 'related',       setCard3Active);
  const handleBackToKeywords       = () => transition(setCard3Active, 'keywords',      setCard2Active);
  const handleAdvanceToLsi         = () => transition(setCard3Active, 'lsi',           setCard4Active);
  const handleBackToRelated        = () => transition(setCard4Active, 'related',       setCard3Active);
  const handleAdvanceToLongtail    = () => transition(setCard4Active, 'longtail',      setCard5Active);
  const handleBackToLsi            = () => transition(setCard5Active, 'lsi',           setCard4Active);
  const handleAdvanceToLlmQuestions = () => transition(setCard5Active, 'llmquestions', setCard6Active);
  const handleBackToLongtail       = () => transition(setCard6Active, 'longtail',      setCard5Active);

  if (!profile) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Profile not found</h1>
            <p className={styles.description}>The brand profile you are looking for does not exist.</p>
          </div>
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Back</button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Edit brand profile</h1>
          <p className={styles.description}>Update company details and brand context for {profile.name}.</p>
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
            <button className={styles.saveBtn} onClick={handleAdvanceToRelated}>Next</button>
          </div>
        )}
        {step === 'related' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLsi}>Next</button>
          </div>
        )}
        {step === 'lsi' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLongtail}>Next</button>
          </div>
        )}
        {step === 'longtail' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleAdvanceToLlmQuestions}>Next</button>
          </div>
        )}
        {step === 'llmquestions' && (
          <div className={styles.headerBtns}>
            <button className={styles.cancelBtn} onClick={() => navigate('/brand-profiles')}>Cancel</button>
            <button className={styles.saveBtn} onClick={() => navigate('/brand-profiles')}>Finish</button>
          </div>
        )}
      </header>

      <div className={styles.center}>
        <div className={styles.cardsCol}>

          {/* Step 1 - Basic details + Brand context */}
          {step === 'details' && (
            <div className={`${styles.card2Row} ${card1Active ? styles.card2RowActive : ''}`}>
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
                                    <textarea className={styles.editContextTextarea} value={contextEditDraft} onChange={e => setContextEditDraft(e.target.value)} placeholder={placeholder} autoFocus />
                                  ) : (
                                    <span className={styles.cellClamp}>{form[key]}</span>
                                  )}
                                </td>
                                <td>
                                  <div className={styles.actionsCell}>
                                    {!isEditing && (
                                      <button className={styles.rowIconBtn} onClick={() => { setContextEditingField(key); setContextEditDraft(form[key]); }}>
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
                      <textarea className={styles.fieldTextarea} value={form[key]} onChange={e => updateForm(key, e.target.value)} placeholder={placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 - Primary keywords */}
          {step === 'keywords' && (
            <KeywordsTable
              className={`${styles.card3} ${card2Active ? styles.card3Active : ''}`}
              title="Primary keywords"
              description="Primary business and brand keywords for XEO"
              icon={Key}
              iconClass={styles.iconSquareKeywords}
              initialKeywords={SAMPLE_KEYWORDS}
            />
          )}

          {/* Step 3 - Related keywords */}
          {step === 'related' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card3Active ? styles.card3Active : ''}`}
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

          {/* Step 4 - LSI keywords */}
          {step === 'lsi' && (
            <GroupedKeywordsTable
              className={`${styles.card3} ${card4Active ? styles.card3Active : ''}`}
              title="LSI keywords"
              description="Semantically related terms that reinforce topical relevance for each primary keyword."
              icon={GitBranch}
              iconClass={styles.iconSquareLsi}
              initialData={SAMPLE_LSI_KEYWORDS}
              keywordField="lsiKeyword"
              keywordLabel="LSI keyword"
              primaryKeywords={SAMPLE_KEYWORDS}
            />
          )}

          {/* Step 5 - Long tail keywords */}
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

          {/* Step 6 - Key LLM questions */}
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
