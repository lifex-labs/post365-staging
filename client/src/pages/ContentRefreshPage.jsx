import { Plus } from 'lucide-react';
import EmptyCard from '../components/EmptyCard';
import styles from './ContentRefreshPage.module.css';

export default function ContentRefreshPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Content refresh</h1>
          <p className={styles.description}>Refresh and optimize your existing content to improve rankings and traffic.</p>
        </div>
        <button className={styles.newBtn}>
          <Plus size={15} strokeWidth={2.5} />
          Content refresh
        </button>
      </header>
      <div className={styles.grid}>
        <EmptyCard label="Refresh existing blog" onClick={() => {}} />
      </div>
    </div>
  );
}
