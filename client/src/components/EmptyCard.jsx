import { Plus } from 'lucide-react';
import styles from './EmptyCard.module.css';

export default function EmptyCard({ label, onClick }) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.icon}>
        <Plus size={20} strokeWidth={2} />
      </div>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
