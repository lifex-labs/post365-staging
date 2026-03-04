import { useState } from 'react';
import { Info, Link, User, CreditCard, ChevronRight, Power } from 'lucide-react';
import { useClerk } from '@clerk/react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from '../components/LogoutModal';
import styles from './SettingsPage.module.css';

const SETTINGS_ITEMS = [
  { icon: Info,       label: 'About',        desc: 'App version, release notes and legal information' },
  { icon: Link,       label: 'Accounts',     desc: 'Manage your connected social media accounts' },
  { icon: User,       label: 'Profiles',     desc: 'Update your personal and professional profile' },
  { icon: CreditCard, label: 'Subscription', desc: 'Free plan - upgrade for full access' },
];

export default function SettingsPage() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    signOut(() => navigate('/sign-in'));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.description}>Manage your account, billing, notifications, privacy, security and app preferences.</p>
      </header>

      <div className={styles.group}>
        {SETTINGS_ITEMS.map((item) => (
          <button key={item.label} className={styles.item}>
            <div className={styles.itemIcon}>
              <item.icon size={16} />
            </div>
            <div className={styles.itemText}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemDesc}>{item.desc}</span>
            </div>
            <ChevronRight size={15} className={styles.chevron} />
          </button>
        ))}
        <button className={styles.item} onClick={() => setShowLogoutModal(true)}>
          <div className={`${styles.itemIcon} ${styles.logoutIcon}`}>
            <Power size={16} />
          </div>
          <div className={styles.itemText}>
            <span className={`${styles.itemLabel} ${styles.logoutLabel}`}>Logout</span>
          </div>
        </button>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
