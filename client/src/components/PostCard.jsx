import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import DeleteModal from './DeleteModal';
import styles from './PostCard.module.css';

export default function PostCard({ post, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <article className={styles.card}>
        <div className={styles.meta}>
          <span className={styles.category}>{post.category}</span>
          <span className={styles.date}>{post.date}</span>
        </div>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.footer}>
          <span className={styles.readTime}>{post.readTime} read</span>
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
