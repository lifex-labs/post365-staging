import { Menu } from 'lucide-react';
import Post365Logo from './Post365Logo';
import styles from './TopBar.module.css';

export default function TopBar({ onMenuOpen }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <Post365Logo size={18} />
        <span className={styles.title}>Post365</span>
      </div>
      <button
        className={styles.menuBtn}
        onClick={onMenuOpen}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
