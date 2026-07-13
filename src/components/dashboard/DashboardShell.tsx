import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import type { DashboardNavSection, DashboardProfile, DashboardRole } from '@/types/dashboard';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

const COLLAPSE_KEY = 'sca-sidebar-collapsed';

interface DashboardShellProps {
  role: DashboardRole;
  profile: DashboardProfile;
  navigation: DashboardNavSection[];
  onLogout: () => void;
  children: ReactNode;
}

export default function DashboardShell({
  role,
  profile,
  navigation,
  onLogout,
  children,
}: DashboardShellProps) {
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    return stored === null ? true : stored === '1';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('sca-dashboard-body');
    return () => document.body.classList.remove('sca-dashboard-body');
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      return next;
    });
  };

  const handleToggleMenu = () => {
    if (window.matchMedia('(max-width: 991px)').matches) {
      setMobileOpen((o) => !o);
    } else {
      toggleCollapse();
    }
  };

  return (
    <div
      className={[
        'sca-dashboard',
        isDark ? 'sca-dashboard--dark' : 'sca-dashboard--light',
        collapsed ? 'sca-dashboard--collapsed' : '',
        mobileOpen ? 'sca-dashboard--mobile-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <DashboardSidebar
        sections={navigation}
        collapsed={collapsed}
        onLogout={onLogout}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="sca-dashboard__main">
        <DashboardTopBar
          profile={profile}
          role={role}
          onToggleMenu={handleToggleMenu}
        />
        <div className="sca-dashboard__content">{children}</div>
      </div>

      <button
        type="button"
        className="sca-dashboard__overlay"
        aria-label="Close menu"
        onClick={() => setMobileOpen(false)}
      />
    </div>
  );
}
