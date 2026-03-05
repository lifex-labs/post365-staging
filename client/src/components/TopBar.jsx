import { Menu } from 'lucide-react';
import mainLogo from '../assets/main-logo-black.svg';
import styles from './TopBar.module.css';

export default function TopBar({ onMenuOpen }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <img src={mainLogo} alt="Post365" height={18} />
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
