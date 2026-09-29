import { useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { DashboardLoadingProvider, useDashboardLoading } from '@/context/DashboardLoadingContext';
import { useOrgScope } from '@/context/OrgScopeContext';
import type { DashboardNavSection, DashboardProfile, DashboardRole } from '@/types/dashboard';
import LoaderInner from '@/components/ui/LoaderInner';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';

const COLLAPSE_KEY = 'sca-sidebar-collapsed-v2';

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
    <DashboardLoadingProvider>
      <DashboardShellInner
        role={role}
        profile={profile}
        navigation={navigation}
        onLogout={onLogout}
      >
        {children}
      </DashboardShellInner>
    </DashboardLoadingProvider>
  );
}

function DashboardShellInner({
  role,
  profile,
  navigation,
  onLogout,
  children,
}: DashboardShellProps) {
  const { isDark } = useTheme();
  const { loading } = useDashboardLoading();
  const { selectedOrgId, isSuperAdmin, scopeReady, loading: orgLoading, organizations } =
    useOrgScope();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(COLLAPSE_KEY);
    // Default: sidebar open (expanded)
    return stored === null ? false : stored === '1';
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

  // Remount panels when superadmin switches org so data reloads for that tenant
  const contentKey = isSuperAdmin ? selectedOrgId ?? 'no-org' : 'tenant';
  const waitingForOrg = isSuperAdmin && !scopeReady;
  const noOrganizations =
    isSuperAdmin && scopeReady && !selectedOrgId && organizations.length === 0;

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
          menuOpen={mobileOpen}
          onToggleMenu={handleToggleMenu}
        />
        <div className="sca-dashboard__content" key={contentKey}>
          {(loading || waitingForOrg || orgLoading) && <LoaderInner />}
          {noOrganizations ? (
            <div className="sca-empty-state" style={{ padding: '2rem' }}>
              <h2>No organization selected</h2>
              <p>Create or approve an organization first, then pick it from the Organization switcher.</p>
            </div>
          ) : waitingForOrg ? null : (
            children
          )}
        </div>
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
