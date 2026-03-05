import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Sparkles } from 'lucide-react';
import styles from './NewProfilePage.module.css';

const STEPS = [
  'Foundational company details',
  'Primary brand & business keywords',
  'Related keywords & long tail keywords',
  'Important LLM prompt questions',
  'Specific instructions and notes',
];

const isValidWebsite = (value) =>
  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(value.trim());

export default function NewProfilePage() {
  const navigate = useNavigate();
  const [website, setWebsite] = useState('');

  const canScan = isValidWebsite(website);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <button className={styles.backBtn} onClick={() => navigate('/brand-profiles')}>
          <ChevronLeft size={14} />
          Brand profiles
        </button>
      </div>

      <div className={styles.center}>
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
            placeholder="Enter your company website"
          />

          <div className={styles.btnRow}>
            <button className={styles.manualBtn} onClick={() => navigate('/brand-profiles')}>
              Enter manually
            </button>
            <span
              className={styles.scanBtnWrapper}
              title={!canScan ? 'Enter a valid website URL to enable AI scan' : undefined}
            >
              <button className={styles.scanBtn} disabled={!canScan}>
                <Sparkles size={13} strokeWidth={2} />
                AI scan
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
