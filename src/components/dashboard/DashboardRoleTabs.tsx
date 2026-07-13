import { Link } from 'react-router-dom';
import type { DashboardRole } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { resolveDashboardRole } from '@/utils/dashboardRole';

const tabs: { role: DashboardRole; label: string; href: string }[] = [
  { role: 'student', label: 'Student', href: '/dashboard/student-dashboard' },
  { role: 'teacher', label: 'Teacher', href: '/dashboard/teacher-dashboard' },
  { role: 'admin', label: 'Admin', href: '/dashboard/admin-dashboard' },
];

interface DashboardRoleTabsProps {
  activeRole: DashboardRole;
}

export default function DashboardRoleTabs({ activeRole }: DashboardRoleTabsProps) {
  const { user } = useAuth();
  const userRole = user ? resolveDashboardRole(user.roles) : 'student';

  const visibleTabs = tabs.filter((tab) => {
    if (userRole === 'admin') return true;
    if (userRole === 'teacher') return tab.role !== 'admin';
    return tab.role === 'student';
  });

  if (visibleTabs.length <= 1) return null;

  return (
    <div className="sca-db-role-tabs">
      {visibleTabs.map((tab) => (
        <Link
          key={tab.role}
          className={`sca-db-role-tabs__item${activeRole === tab.role ? ' sca-db-role-tabs__item--active' : ''}`}
          to={tab.href}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
