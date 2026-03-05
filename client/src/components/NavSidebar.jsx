import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutList, Rss, User, Settings, Power, PenLine, UserRound, CalendarDays } from 'lucide-react';
import { useClerk } from '@clerk/react';
import LogoutModal from './LogoutModal';
import mainLogo from '../assets/main-logo-black.svg';
import styles from './NavSidebar.module.css';

const NAV_SECTIONS = [
  {
    label: 'Personal',
    items: [
      { path: '/personal-posts',    label: 'Personal posts',    icon: PenLine    },
      { path: '/personal-profiles', label: 'Personal profiles', icon: UserRound  },
    ],
  },
  {
    label: 'Company',
    items: [
      { path: '/xeo-blogs', label: 'XEO blogs',       icon: Rss        },
      { path: '/brand-posts',    label: 'Brand posts',    icon: LayoutList },
      { path: '/brand-profiles', label: 'Brand profiles', icon: User       },
    ],
  },
  {
    label: 'Calendars',
    items: [
      { path: '/calendar-company', label: 'Company',         icon: CalendarDays },
      { path: '/calendar-arjun',   label: 'Arjun V. Shenoy', icon: CalendarDays },
      { path: '/calendar-naveen',  label: 'Naveen Prabhu',   icon: CalendarDays },
    ],
  },
];

export default function NavSidebar() {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutConfirm = () => {
    signOut(() => navigate('/sign-in'));
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={mainLogo} alt="Post365" className={styles.logoImg} height={18} />
        </div>

        <nav className={styles.nav}>
          {NAV_SECTIONS.map((section, i) => (
            <div key={section.label} className={styles.section}>
              <span className={`${styles.sectionLabel} ${i === 0 ? styles.sectionLabelFirst : ''}`}>
                {section.label}
              </span>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <item.icon size={15} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Settings size={15} />
            <span>Settings</span>
          </NavLink>
          <button className={styles.logoutBtn} onClick={() => setShowLogoutModal(true)}>
            <Power size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
