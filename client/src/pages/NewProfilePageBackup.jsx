import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import styles from './NewProfilePageBackup.module.css';

const STEPS = [
  'Foundational company details',
  'Primary brand & business keywords',
  'Related & long tail keywords',
  'Important LLM prompt questions',
  'Specific instructions and notes',
];

const STEP_DESCS = [
  'Company name, website, industry and tone',
  'Core keywords defining your brand and business',
  'Extended keywords and long-tail search terms',
  'Questions to guide AI content generation',
  'Custom rules, tone guidelines and notes',
];

const SCAN_LINES = [
  'Resolving domain availability',
  'Loading homepage HTML',
  'Reading meta title and description',
  'Extracting Open Graph tags',
  'Scanning hero copy and headlines',
  'Identifying primary value propositions',
  'Mapping site navigation structure',
  'Reading product and service pages',
  'Detecting industry vertical signals',
  'Identifying business model type',
  'Analysing tone of voice',
  'Extracting primary brand keywords',
  'Reading target audience signals',
  'Scanning About and Team pages',
  'Pulling USP and differentiator language',
  'Checking blog and resources section',
  'Extracting long-tail keyword candidates',
  'Detecting competitor references and positioning',
  'Inferring brand personality signals',
  'Compiling final brand profile',
];

const isValidWebsite = (value) =>
  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(value.trim());

export default function NewProfilePageBackup() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('intro'); // 'intro' | 'scanning' | 'step1'
  const [website, setWebsite] = useState('');
  const [lines, setLines] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const bottomRef = useRef(null);
  const websiteInputRef = useRef(null);

  const [form, setForm] = useState({
    companyName: '',
    companyWebsite: '',
    industry: '',
    brandTone: '',
    summary: '',
    targetAudience: '',
    problem: '',
    solution: '',
    usp: '',
    valueProposition: '',
  });

  const canScan = isValidWebsite(website);

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    if (screen !== 'scanning') return;
    setLines([]);
    let cancelled = false;

    const timer = setTimeout(() => {
      if (!cancelled) setScreen('step1');
    }, 2000);

    (async () => {
      for (let i = 0; i < SCAN_LINES.length; i++) {
        if (cancelled) return;
        const full = SCAN_LINES[i];
        setLines(prev => [...prev, { full, shown: '', done: false }]);
        for (let c = 1; c <= full.length; c++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, 18));
          setLines(prev => prev.map((l, li) => li === i ? { ...l, shown: full.slice(0, c) } : l));
        }
        if (cancelled) return;
        setLines(prev => prev.map((l, li) => li === i ? { ...l, done: true } : l));
        await new Promise(r => setTimeout(r, 280));
      }
    })();

    return () => { cancelled = true; clearTimeout(timer); };
  }, [screen]);

  useEffect(() => {
    if (screen === 'intro') websiteInputRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  function handleScan() {
    if (canScan) setScreen('scanning');
  }

  function handleCancelScan() {
    setScreen('intro');
    setLines([]);
  }

  // ===== Step 1 full-page layout =====
  if (screen === 'step1') {
    return (
      <div className={styles.page}>
        <header className={styles.s1Header}>
          <div className={styles.s1HeaderRow}>
            <div className={styles.s1HeaderText}>
              <h1 className={styles.s1Title}>Company details</h1>
              <p className={styles.s1Desc}>Fill in your company's foundational details. This information powers all content generation across your brand profile.</p>
            </div>
            <div className={styles.s1HeaderBtns}>
              <button className={styles.s1BackBtn} onClick={() => navigate('/brand-profiles')}>
                <ChevronLeft size={14} strokeWidth={2.5} />
                Go back
              </button>
              <button className={styles.s1NextBtn}>
                Next step
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </header>

        <div className={styles.s1Card}>
          <div className={styles.s1Cols}>
            {/* Col 1: Step nav */}
            <div className={styles.s1ColNav}>
              <div className={styles.navGroup}>
                {STEPS.map((step, i) => (
                  <button
                    key={i}
                    className={`${styles.navItem} ${i === activeStep ? styles.navItemActive : ''}`}
                    onClick={() => setActiveStep(i)}
                  >
                    <div className={styles.navItemIcon}>{i + 1}</div>
                    <div className={styles.navItemText}>
                      <span className={styles.navItemLabel}>{step}</span>
                      <span className={styles.navItemDesc}>{STEP_DESCS[i]}</span>
                    </div>
                    <ChevronRight size={15} className={styles.navChevron} />
                  </button>
                ))}
              </div>
            </div>

            {/* Col 2: Basic details */}
            <div className={`${styles.s1Col} ${styles.s1ColPadded}`}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Company name</label>
                <input
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
                <label className={styles.fieldLabel}>Brand tone</label>
                <input
                  className={styles.fieldInput}
                  type="text"
                  value={form.brandTone}
                  onChange={e => updateForm('brandTone', e.target.value)}
                  placeholder="e.g. professional, friendly, bold"
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
              <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                <label className={styles.fieldLabel}>Target audience</label>
                <textarea
                  className={styles.fieldTextarea}
                  value={form.targetAudience}
                  onChange={e => updateForm('targetAudience', e.target.value)}
                  placeholder="Who your product or service is for"
                />
              </div>
            </div>

            {/* Col 3: Positioning */}
            <div className={`${styles.s1Col} ${styles.s1ColPadded}`}>
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
                <label className={styles.fieldLabel}>USP</label>
                <textarea
                  className={styles.fieldTextarea}
                  value={form.usp}
                  onChange={e => updateForm('usp', e.target.value)}
                  placeholder="What makes you uniquely different?"
                />
              </div>
              <div className={`${styles.fieldGroup} ${styles.fieldGroupFlex}`}>
                <label className={styles.fieldLabel}>Value proposition</label>
                <textarea
                  className={styles.fieldTextarea}
                  value={form.valueProposition}
                  onChange={e => updateForm('valueProposition', e.target.value)}
                  placeholder="The core value you deliver to customers"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ===== Intro / Scanning layout =====
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/brand-profiles')}>
          <ChevronLeft size={14} />
          Brand profiles
        </button>
      </div>

      <div className={styles.center}>
        {screen === 'intro' && (
          <div className={styles.cardWrapper}>
            <div className={styles.card}>
              <div className={styles.iconCircle}>
                <Plus size={14} strokeWidth={2.5} />
              </div>

              <h2 className={styles.cardTitle}>Create a brand profile</h2>
              <p className={styles.cardDesc}>
                We'll follow a simple process to create your brand profile. It should take just a few minutes.
              </p>

              <hr className={styles.divider} />

              <div className={styles.steps}>
                {STEPS.map((step, i) => (
                  <div key={i} className={styles.step}>
                    <div className={styles.stepCircle}>{i + 1}</div>
                    <span className={styles.stepLabel}>{step}</span>
                  </div>
                ))}
              </div>

              <input
                className={styles.websiteInput}
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                ref={websiteInputRef}
                onKeyDown={e => { if (e.key === 'Enter') handleScan(); }}
                placeholder="Enter your company website"
              />

              <div className={styles.btnRow}>
                <button className={styles.manualBtn} onClick={() => setScreen('step1')}>
                  Enter manually
                </button>
                <span
                  className={styles.scanBtnWrapper}
                  title={!canScan ? 'Enter a valid website URL to enable AI scan' : undefined}
                >
                  <button className={styles.scanBtn} disabled={!canScan} onClick={handleScan}>
                    <Sparkles size={13} strokeWidth={2} />
                    AI scan
                  </button>
                </span>
              </div>
            </div>
          </div>
        )}

        {screen === 'scanning' && (
          <div className={styles.cardWrapper}>
            <div className={styles.scanCard}>
              <div className={styles.scanHeader}>
                <span className={styles.scanHeaderTitle}>
                  <Sparkles size={12} strokeWidth={2} />
                  Scanning {website}
                </span>
              </div>

              <div className={styles.scanBody}>
                {lines.map((line, i) => (
                  <div key={i} className={styles.scanLine}>
                    <span className={line.done ? styles.dotDone : styles.dotActive} />
                    <span className={styles.scanText}>{line.shown}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className={styles.scanFooter}>
                <button className={styles.cancelScanBtn} onClick={handleCancelScan}>
                  Cancel scan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
