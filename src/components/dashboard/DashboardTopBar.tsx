import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
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
  const [unread, setUnread] = useState(0);

  useEffect(() => {
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
  }, []);

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
          <i className="icofont-search" />
          <input
            type="text"
            placeholder="Search tests, students, or topics..."
            aria-label="Search dashboard"
          />
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
          <i className="icofont-notification" />
          {unread > 0 && <span className="sca-db-notif-btn__badge">{unread > 99 ? '99+' : unread}</span>}
        </Link>
        <button
          type="button"
          className="sca-db-icon-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          <i className={isDark ? 'icofont-sun' : 'icofont-moon'} />
        </button>
        <Link to={`/dashboard/${role}-profile`} className="sca-db-user">
          <img src={profile.image} alt="" className="sca-db-user__avatar" />
          <div className="sca-db-user__info">
            <span className="sca-db-user__name">{profile.name}</span>
            <span className="sca-db-user__role">
              {role === 'admin' ? 'Administrator' : role === 'teacher' ? 'Faculty' : 'Student'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
