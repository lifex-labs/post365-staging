import { createPortal } from 'react-dom';
import styles from './LogoutModal.module.css';

export default function LogoutModal({ onConfirm, onCancel }) {
  return createPortal(
    <div className={styles.backdrop} onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title}>Logout</p>
        <p className={styles.message}>
          You will be signed out of your Post365 account and redirected to the login screen.
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          <button className={styles.logoutBtn} onClick={onConfirm}>Logout</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
