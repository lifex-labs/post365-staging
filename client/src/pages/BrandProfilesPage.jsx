import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DeleteModal from '../components/DeleteModal';
import EmptyCard from '../components/EmptyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBrandProfilesApi } from '../hooks/useBrandProfilesApi';
import formatDate from '../utils/formatDate';
import styles from './BrandProfilesPage.module.css';

export default function BrandProfilesPage() {
  const navigate = useNavigate();
  const api = useBrandProfilesApi();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);

  useEffect(() => {
    api.listProfiles()
      .then(res => setProfiles(res.profiles))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(slug) {
    try {
      await api.deleteProfile(slug);
      setProfiles(prev => prev.filter(p => p.slug !== slug));
    } catch {
      // silently ignore
    }
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

      {loading ? (
        <div className={styles.grid}>
          <div className={styles.cardLoading}><LoadingSpinner /></div>
        </div>
      ) : profiles.length === 0 ? (
        <div className={styles.grid}>
          <EmptyCard label="Create brand profile" onClick={() => navigate('/brand-profiles/new')} />
        </div>
      ) : (
        <div className={styles.grid}>
          {profiles.map(profile => {
            const isComplete = profile.status === 'complete';
            return (
              <div key={profile.id} className={styles.card} onClick={() => navigate(`/brand-profiles/view/${profile.slug}`)}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.statusTag} ${isComplete ? styles.statusComplete : styles.statusDraft}`}>
                    {isComplete ? 'Complete' : 'Draft'}
                  </span>
                  <span className={styles.cardDate}>{formatDate(profile.created_at)}</span>
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
                      onClick={e => { e.stopPropagation(); setDeletingSlug(profile.slug); }}
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
      )}

      {deletingSlug !== null && (
        <DeleteModal
          onConfirm={() => { handleDelete(deletingSlug); setDeletingSlug(null); }}
          onCancel={() => setDeletingSlug(null)}
        />
      )}
    </div>
  );
}
