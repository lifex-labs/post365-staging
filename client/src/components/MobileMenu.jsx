import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutList, Rss, Newspaper, User, Settings, Power, X, PenLine, UserRound, CalendarDays } from 'lucide-react';
import { useClerk } from '@clerk/react';
import LogoutModal from './LogoutModal';
import styles from './MobileMenu.module.css';

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
      { path: '/brand-calendar',  label: 'Brand calendar', icon: CalendarDays },
      { path: '/xeo-blogs',        label: 'XEO blogs',       icon: Rss          },
      { path: '/brand-articles',  label: 'Brand articles',  icon: Newspaper    },
      { path: '/brand-posts',     label: 'Brand posts',     icon: LayoutList   },
      { path: '/brand-profiles',  label: 'Brand profiles', icon: User         },
    ],
  },
];

export default function MobileMenu({ isOpen, onClose }) {
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogoutConfirm = () => {
    signOut(() => navigate('/sign-in'));
  };

  if (!isOpen && !showLogoutModal) return null;

  return createPortal(
    <>
      {isOpen && (
        <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      )}
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Menu</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
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
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.divider} />

        <div className={styles.secondaryNav}>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>

          <button className={styles.logoutRow} onClick={() => setShowLogoutModal(true)}>
            <Power size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>,
    document.body
  );
}
