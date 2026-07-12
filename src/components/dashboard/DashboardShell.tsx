import type { ReactNode } from 'react';
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
  return (
    <div className="dashboardarea sp_bottom_100">
      <DashboardHero profile={profile} />
      <DashboardRoleTabs activeRole={role} />

      <div className="dashboard">
        <div className="container-fluid full__width__padding">
          <div className="row">
            <div className="col-xl-3 col-lg-3 col-md-12">
              <DashboardSidebar sections={navigation} onLogout={onLogout} />
            </div>
            <div className="col-xl-9 col-lg-9 col-md-12">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
