import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutList, Rss, Newspaper, Building2, RefreshCw, Settings, Power, PenLine, UserRound, CalendarDays } from 'lucide-react';
import { useClerk } from '@clerk/react';
import LogoutModal from './LogoutModal';
import mainLogo from '../assets/main-logo-black.svg';
import styles from './NavSidebar.module.css';

const NAV_SECTIONS = [
  {
    label: 'Personal',
    items: [
      { path: '/personal-calendar', label: 'Personal calendar', icon: CalendarDays },
      { path: '/personal-posts',    label: 'Personal posts',    icon: PenLine      },
      { path: '/personal-profiles', label: 'Personal profiles', icon: UserRound    },
    ],
  },
  {
    label: 'Company',
    items: [
      { path: '/brand-calendar', label: 'Brand calendar', icon: CalendarDays },
      { path: '/new-xeo-blogs',    label: 'New XEO blogs',   icon: Rss          },
      { path: '/content-refresh', label: 'Content refresh', icon: RefreshCw   },
      { path: '/brand-articles',  label: 'Brand articles',  icon: Newspaper    },
      { path: '/brand-posts',     label: 'Brand posts',     icon: LayoutList   },
      { path: '/brand-profiles', label: 'Brand profiles', icon: Building2    },
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
