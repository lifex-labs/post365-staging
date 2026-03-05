import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import styles from './ProfilesPage.module.css';

const SAMPLE_PROFILES = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    website: 'techcorp.io',
    industry: 'Software Development',
    brandTone: 'Authoritative',
    targetAudience: 'CTOs and engineering leads at mid-market enterprises',
    usp: 'Enterprise-grade AI automation for complex multi-system workflows',
    date: 'Feb 28, 2026',
  },
  {
    id: 2,
    name: 'StyleHive',
    website: 'stylehive.com',
    industry: 'E-commerce',
    brandTone: 'Friendly',
    targetAudience: 'Fashion-forward millennials and Gen Z shoppers aged 20 to 35',
    usp: 'Curated sustainable fashion collections at accessible price points',
    date: 'Feb 20, 2026',
  },
  {
    id: 3,
    name: 'GrowthMind',
    website: 'growthmind.co',
    industry: 'Marketing & Advertising',
    brandTone: 'Conversational',
    targetAudience: 'Startup founders and growth marketers at early-stage companies',
    usp: '',
    date: 'Feb 15, 2026',
  },
  {
    id: 4,
    name: 'MedTrack',
    website: 'medtrack.health',
    industry: 'Healthcare Technology',
    brandTone: 'Professional',
    targetAudience: 'Hospital administrators and clinical care teams in acute care settings',
    usp: 'Real-time patient flow optimization that reduces wait times by 40%',
    date: 'Feb 10, 2026',
  },
  {
    id: 5,
    name: 'LearnForge',
    website: 'learnforge.io',
    industry: 'EdTech',
    brandTone: 'Inspiring',
    targetAudience: 'Corporate L&D managers and HR teams at companies with 500 or more employees',
    usp: 'Adaptive learning paths that cut new hire onboarding time in half',
    date: 'Feb 5, 2026',
  },
];

export default function ProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(SAMPLE_PROFILES);
  const [deletingId, setDeletingId] = useState(null);

  function handleDelete(id) {
    setProfiles(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Brand profiles</h1>
          <p className={styles.description}>Manage your company brand profiles for content generation and targeting.</p>
        </div>
        <button className={styles.newBtn} onClick={() => navigate('/brand-profiles/new')}>
          <Plus size={14} strokeWidth={2.5} />
          New profile
        </button>
      </header>

      <div className={styles.grid}>
        {profiles.map(profile => {
          const isComplete = !!(profile.name && profile.website && profile.industry && profile.targetAudience && profile.usp);
          return (
          <div key={profile.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.websiteRow}>
                <span className={styles.websiteTag}>{profile.website}</span>
                <span className={styles.cardDate}>{profile.date}</span>
              </div>
              <span className={styles.cardName}>{profile.name}</span>
            </div>

            <div className={styles.fields}>
              <span className={styles.fieldLabel}>Industry:</span>
              <span className={styles.fieldValue}>{profile.industry}</span>
              <span className={styles.fieldLabel}>Brand tone:</span>
              <span className={styles.fieldValue}>{profile.brandTone}</span>
              <span className={styles.fieldLabel}>Target audience:</span>
              <span className={styles.fieldValueMulti}>{profile.targetAudience}</span>
              {profile.usp && <>
                <span className={styles.fieldLabel}>USP:</span>
                <span className={styles.fieldValueMulti}>{profile.usp}</span>
              </>}
            </div>

            <div className={styles.cardFooter}>
              <span className={`${styles.statusTag} ${isComplete ? styles.statusComplete : styles.statusDraft}`}>
                {isComplete ? 'Complete' : 'Draft'}
              </span>
              <div className={styles.cardActions}>
                <button className={styles.iconBtn} title="Edit">
                  <Pencil size={13} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={() => setDeletingId(profile.id)}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {deletingId !== null && (
        <DeleteModal
          onConfirm={() => { handleDelete(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
