import { createPortal } from 'react-dom';
import styles from './LogoutModal.module.css';

export default function DeleteModal({ onConfirm, onCancel }) {
  return createPortal(
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title}>Delete</p>
        <p className={styles.message}>
          This will permanently remove this item from your list. This action cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.logoutBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
