import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiX, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useOrgScope } from '@/context/OrgScopeContext';
import type { DashboardProfile, DashboardRole } from '@/types/dashboard';
import { platformService } from '@/services';
import { REALTIME_NOTIFICATION_EVENT, type RealtimeNotificationDetail } from '@/lib/realtime';
import OrgSwitcher from './OrgSwitcher';

interface DashboardTopBarProps {
  profile: DashboardProfile;
  role: DashboardRole;
  collapsed?: boolean;
  onToggleMenu: () => void;
  menuOpen?: boolean;
}

function notificationsHref(role: DashboardRole) {
  if (role === 'student') return '/dashboard/student-message';
  if (role === 'teacher') return '/dashboard/teacher-message';
  return '/dashboard/admin-message';
}

export default function DashboardTopBar({
  profile,
  role,
  collapsed = false,
  onToggleMenu,
  menuOpen = false,
}: DashboardTopBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isSuperAdmin, scopeReady, selectedOrgId } = useOrgScope();
  const [unread, setUnread] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const profileHref = `/dashboard/${role}-profile`;
  const settingsHref = `/dashboard/${role}-settings`;

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (isSuperAdmin && !scopeReady) return;
    let cancelled = false;
    platformService
      .getUnreadCount()
      .then((count) => {
        if (!cancelled) setUnread(count);
      })
      .catch(() => {
        if (!cancelled) setUnread(0);
      });

    const onRealtime = (event: Event) => {
      const detail = (event as CustomEvent<RealtimeNotificationDetail>).detail;
      if (typeof detail?.unreadCount === 'number' && !cancelled) {
        setUnread(detail.unreadCount);
      }
    };
    window.addEventListener(REALTIME_NOTIFICATION_EVENT, onRealtime);
    return () => {
      cancelled = true;
      window.removeEventListener(REALTIME_NOTIFICATION_EVENT, onRealtime);
    };
  }, [isSuperAdmin, scopeReady, selectedOrgId]);

  return (
    <header className="sca-db-header">
      <div className="sca-db-header__left">
        <button
          type="button"
          className={`sca-db-icon-btn sca-db-icon-btn--menu${menuOpen ? ' is-open' : ''}`}
          onClick={onToggleMenu}
          aria-label={menuOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={menuOpen ? 'Close menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
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
          <FiBell size={18} strokeWidth={2.1} aria-hidden />
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

        {/* User Profile Dropdown */}
        <div className="sca-db-user-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="sca-db-user"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
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
              className={`sca-db-user__caret${dropdownOpen ? ' is-open' : ''}`}
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="sca-db-user-menu" role="menu">
              <div className="sca-db-user-menu__header">
                <img src={profile.image} alt="" className="sca-db-user-menu__avatar" />
                <div className="sca-db-user-menu__header-info">
                  <span className="sca-db-user-menu__name">{profile.name}</span>
                  <span className="sca-db-user-menu__email">
                    {user?.email || (role === 'admin' ? 'admin@mindsprint.com' : '')}
                  </span>
                </div>
              </div>

              <div className="sca-db-user-menu__divider" />

              <Link
                to={profileHref}
                className="sca-db-user-menu__item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <FiUser size={16} />
                <span>Profile</span>
              </Link>

              <Link
                to={settingsHref}
                className="sca-db-user-menu__item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <FiSettings size={16} />
                <span>Settings</span>
              </Link>

              <div className="sca-db-user-menu__divider" />

              <button
                type="button"
                className="sca-db-user-menu__item sca-db-user-menu__item--danger"
                role="menuitem"
                onClick={handleLogout}
              >
                <FiLogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
