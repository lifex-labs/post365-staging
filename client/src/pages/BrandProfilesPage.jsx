import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import { BRAND_PROFILES } from '../data/brandProfiles';
import styles from './BrandProfilesPage.module.css';

export default function BrandProfilesPage() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState(BRAND_PROFILES);
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
          <div key={profile.id} className={styles.card} onClick={() => navigate(`/brand-profiles/view/${profile.slug}`)}>
            <div className={styles.cardHeader}>
              <span className={`${styles.statusTag} ${isComplete ? styles.statusComplete : styles.statusDraft}`}>
                {isComplete ? 'Complete' : 'Draft'}
              </span>
              <span className={styles.cardDate}>{profile.date}</span>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.cardName} title={profile.name}>{profile.name}</h3>
              {profile.summary && <p className={styles.cardDesc} title={profile.summary}>{profile.summary}</p>}
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.cardContextual} />
              <div className={styles.cardActions}>
                <button
                  className={styles.iconBtn}
                  title="Edit"
                  onClick={e => { e.stopPropagation(); navigate(`/brand-profiles/edit/${profile.slug}`); }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                  onClick={e => { e.stopPropagation(); setDeletingId(profile.id); }}
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
