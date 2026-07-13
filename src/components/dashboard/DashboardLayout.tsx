import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { DashboardRole } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { buildDashboardNavigation, buildDashboardProfile } from '@/data/dashboardNavigation';
import { canAccessDashboardRole, getDefaultDashboardPath } from '@/utils/dashboardRole';
import DashboardShell from './DashboardShell';
import Loader from '@/components/ui/Loader';

interface DashboardLayoutProps {
  role: DashboardRole;
  children: ReactNode;
}

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessDashboardRole(user.roles, role)) {
    return <Navigate to={getDefaultDashboardPath(user.roles)} replace />;
  }

  const profile = buildDashboardProfile(user, role);
  const navigation = buildDashboardNavigation(user, role);

  return (
    <DashboardShell role={role} profile={profile} navigation={navigation} onLogout={logout}>
      {children}
    </DashboardShell>
  );
}
