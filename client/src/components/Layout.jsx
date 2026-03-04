import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavSidebar from './NavSidebar';
import TopBar from './TopBar';
import MobileMenu from './MobileMenu';
import styles from './Layout.module.css';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <NavSidebar />
      <TopBar onMenuOpen={() => setMenuOpen(true)} />
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
