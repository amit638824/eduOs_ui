import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import type { DashboardProfile, DashboardRole } from '@/types/dashboard';
import DashboardBreadcrumb from './DashboardBreadcrumb';
import HamburgerIcon from '@/components/ui/HamburgerIcon';

interface DashboardTopBarProps {
  profile: DashboardProfile;
  role: DashboardRole;
  onToggleMenu: () => void;
  menuOpen?: boolean;
}

export default function DashboardTopBar({ profile, role, onToggleMenu, menuOpen = false }: DashboardTopBarProps) {
  const { isDark, toggleTheme } = useTheme();

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
        <DashboardBreadcrumb />
      </div>

      <div className="sca-db-header__right">
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
          <span className="sca-db-user__name">{profile.name}</span>
        </Link>
      </div>
    </header>
  );
}
