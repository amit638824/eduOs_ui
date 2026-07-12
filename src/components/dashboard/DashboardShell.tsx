import { useState, type ReactNode } from 'react';
import type { DashboardNavSection, DashboardProfile, DashboardRole } from '@/types/dashboard';
import DashboardHero from './DashboardHero';
import DashboardSidebar from './DashboardSidebar';
import DashboardRoleTabs from './DashboardRoleTabs';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboardarea sp_bottom_100">
      <DashboardHero profile={profile} />
      <DashboardRoleTabs activeRole={role} />

      <div className="dashboard">
        <div className="container-fluid full__width__padding">
          <div className="dashboard-mobile-bar">
            <button
              type="button"
              className="dashboard-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="icofont-navigation-menu" />
              Menu
            </button>
            <span className="text-muted small">{profile.name}</span>
          </div>

          <div
            className={`dashboard-sidebar-overlay${sidebarOpen ? ' is-open' : ''}`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden={!sidebarOpen}
          />

          <div className="row">
            <div className={`col-xl-3 col-lg-3 col-md-12 dashboard-sidebar-col${sidebarOpen ? ' is-open' : ''}`}>
              <DashboardSidebar
                sections={navigation}
                onLogout={onLogout}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
            <div className="col-xl-9 col-lg-9 col-md-12 dashboard-content-col">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
