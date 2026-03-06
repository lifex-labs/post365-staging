import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import styles from './BrandProfilesPage.module.css';

const SAMPLE_PROFILES = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    website: 'techcorp.io',
    industry: 'Software Development',
    foundedYear: '2019',
    summary: 'TechCorp Solutions builds enterprise AI automation software that connects complex multi-system workflows for mid-market and large organisations. The platform reduces manual engineering overhead and accelerates deployment cycles across cloud, hybrid, and on-premise environments.',
    date: 'Feb 28, 2026',
    status: 'complete',
  },
  {
    id: 2,
    name: 'StyleHive',
    website: 'stylehive.com',
    industry: 'E-commerce',
    foundedYear: '2021',
    summary: 'StyleHive is a curated online fashion marketplace focused on sustainable and ethically sourced clothing. It brings together independent designers and eco-conscious brands, making responsible fashion accessible and affordable for younger consumers.',
    date: 'Feb 20, 2026',
    status: 'draft',
  },
  {
    id: 3,
    name: 'GrowthMind',
    website: 'growthmind.co',
    industry: 'Marketing & Advertising',
    foundedYear: '2020',
    summary: 'GrowthMind is a growth marketing agency that helps early-stage startups build scalable acquisition channels and repeatable revenue systems. The team specialises in data-driven campaign strategy, conversion optimisation, and performance content.',
    date: 'Feb 15, 2026',
    status: 'complete',
  },
  {
    id: 4,
    name: 'MedTrack',
    website: 'medtrack.health',
    industry: 'Healthcare Technology',
    foundedYear: '2018',
    summary: 'MedTrack develops real-time patient flow and operational intelligence software for acute care hospitals. Its platform gives clinical and administrative teams live visibility into bed availability, staffing, and patient status to reduce wait times and improve outcomes.',
    date: 'Feb 10, 2026',
    status: 'draft',
  },
  {
    id: 5,
    name: 'LearnForge',
    website: 'learnforge.io',
    industry: 'EdTech',
    foundedYear: '2016',
    summary: 'LearnForge is an enterprise learning platform that delivers adaptive, role-specific training paths for corporate teams. It integrates with existing HR systems to automate onboarding, compliance training, and ongoing skill development at scale.',
    date: 'Feb 5, 2026',
    status: 'complete',
  },
];

export default function BrandProfilesPage() {
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
          const isComplete = profile.status === 'complete';
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
              <span className={styles.fieldLabel}>Founded:</span>
              <span className={styles.fieldValue}>{profile.foundedYear}</span>
            </div>
            {profile.summary && <p className={styles.cardSummary}>{profile.summary}</p>}

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
