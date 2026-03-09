import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import DeleteModal from './DeleteModal';
import formatDate from '../utils/formatDate';
import styles from './PostCard.module.css';

export default function PostCard({ post, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <article className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{formatDate(post.date)}</span>
        </div>
        <div className={styles.cardBody}>
          <h3 className={styles.cardName} title={post.title}>{post.title}</h3>
          <p className={styles.cardDesc} title={post.excerpt}>{post.excerpt}</p>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.cardContextual}>
            <span className={styles.readTime}>{post.readTime} read</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.iconBtn} title="Edit">
              <Pencil size={13} />
            </button>
            <button className={`${styles.iconBtn} ${styles.iconBtnDanger}`} title="Delete" onClick={() => setShowDelete(true)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </article>

      {showDelete && (
        <DeleteModal
          onConfirm={() => { setShowDelete(false); onDelete(post.id); }}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  );
}
