import { useEffect, useRef, useState } from 'react';
import { Plus, Sparkles, Building2, Layers } from 'lucide-react';
import styles from './NewBrandProfilePage.module.css';

const STEPS = [
  'Foundational company details',
  'Primary brand & business keywords',
  'Related & long tail keywords',
  'Important LLM prompt questions',
  'Specific instructions and notes',
];

const isValidWebsite = (value) =>
  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(value.trim());

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
  const [step, setStep] = useState('intro'); // 'intro' | 'details'
  const [card2Active, setCard2Active] = useState(false);

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
    setStep('details');
    requestAnimationFrame(() => setCard2Active(true));
  }

  function handleGoBack() {
    setCard2Active(false);
    setTimeout(() => setStep('intro'), 200);
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
            <button className={styles.saveBtn}>Next</button>
          </div>
        )}
      </header>

      <div className={styles.center}>
        <div className={styles.cardsCol}>

          {/* Card 1 - Step 1: Website */}
          {step === 'intro' && <div className={styles.card}>
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

            <input
              className={styles.websiteInput}
              type="text"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              ref={websiteInputRef}
              onKeyDown={e => { if (e.key === 'Enter' && canScan) handleAdvance(); }}
              placeholder="Enter your company website"
            />

            <div className={styles.btnRow}>
              <button className={styles.manualBtn} onClick={handleAdvance}>
                Enter manually
              </button>
              <span
                className={styles.scanBtnWrapper}
                title={!canScan ? 'Enter a valid website URL to enable AI scan' : undefined}
              >
                <button className={styles.scanBtn} disabled={!canScan} onClick={handleAdvance}>
                  <Sparkles size={13} strokeWidth={2} />
                  AI scan
                </button>
              </span>
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

        </div>
      </div>
    </div>
  );
}
