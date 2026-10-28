import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { useOrgScope } from '@/context/OrgScopeContext';
import type { DashboardProfile, DashboardRole } from '@/types/dashboard';
import { platformService } from '@/services';
import HamburgerIcon from '@/components/ui/HamburgerIcon';
import OrgSwitcher from './OrgSwitcher';

interface DashboardTopBarProps {
  profile: DashboardProfile;
  role: DashboardRole;
  onToggleMenu: () => void;
  menuOpen?: boolean;
}

function notificationsHref(role: DashboardRole) {
  if (role === 'student') return '/dashboard/student-message';
  if (role === 'teacher') return '/dashboard/teacher-message';
  return '/dashboard/admin-message';
}

export default function DashboardTopBar({ profile, role, onToggleMenu, menuOpen = false }: DashboardTopBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { isSuperAdmin, scopeReady, selectedOrgId } = useOrgScope();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (isSuperAdmin && !scopeReady) return;
    let cancelled = false;
    const load = () => {
      platformService
        .getUnreadCount()
        .then((count) => {
          if (!cancelled) setUnread(count);
        })
        .catch(() => {
          if (!cancelled) setUnread(0);
        });
    };
    load();
    const timer = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [isSuperAdmin, scopeReady, selectedOrgId]);

  return (
    <header className="sca-db-header">
      <div className="sca-db-header__left">
        <button
          type="button"
          className="sca-db-icon-btn sca-db-icon-btn--menu sca-hamburger-btn"
          onClick={onToggleMenu}
          aria-label="Toggle sidebar menu"
          aria-expanded={menuOpen}
        >
          <HamburgerIcon open={menuOpen} />
        </button>

        <div className="sca-db-search">
          <svg
            className="sca-db-search-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16"
            height="16"
          >
            <circle cx="9" cy="9" r="6" />
            <line x1="13.5" y1="13.5" x2="18" y2="18" />
          </svg>
          <input
            type="text"
            placeholder="Search tests, students, or topics..."
            aria-label="Search dashboard"
          />
          <kbd className="sca-db-search-kbd">Ctrl + K</kbd>
        </div>
      </div>

      <div className="sca-db-header__center">
        <OrgSwitcher />
      </div>

      <div className="sca-db-header__right">
        <Link
          to={notificationsHref(role)}
          className="sca-db-icon-btn sca-db-notif-btn"
          aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="18"
            height="18"
          >
            <path d="M15 14c.7-1 1-2.2 1-3.5V8a6 6 0 10-12 0v2.5C4 11.8 4.3 13 5 14h10z" />
            <path d="M8 17a2 2 0 004 0" />
          </svg>
          {unread > 0 && <span className="sca-db-notif-btn__badge">{unread > 99 ? '99+' : unread}</span>}
        </Link>
        <button
          type="button"
          className="sca-db-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <circle cx="10" cy="10" r="4" />
              <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="18"
              height="18"
            >
              <path d="M17.29 13.71A8 8 0 116.29 2.71 8.003 8.003 0 0017.29 13.71z" />
            </svg>
          )}
        </button>
        <Link to={`/dashboard/${role}-profile`} className="sca-db-user">
          <img src={profile.image} alt="" className="sca-db-user__avatar" />
          <div className="sca-db-user__info">
            <span className="sca-db-user__name">{profile.name}</span>
            <span className="sca-db-user__role">
              {role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Faculty' : 'Student'}
            </span>
          </div>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            width="14"
            height="14"
            className="sca-db-user__caret"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </header>
  );
}
