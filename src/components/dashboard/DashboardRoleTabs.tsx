import { Link } from 'react-router-dom';
import type { DashboardRole } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { resolveDashboardRole } from '@/utils/dashboardRole';

const tabs: { role: DashboardRole; label: string; href: string; apiRoles: string[] }[] = [
  { role: 'student', label: 'Student', href: '/dashboard/student-dashboard', apiRoles: ['student', 'parent'] },
  { role: 'teacher', label: 'Teacher', href: '/dashboard/teacher-dashboard', apiRoles: ['teacher', 'examiner', 'evaluator'] },
  { role: 'admin', label: 'Admin', href: '/dashboard/admin-dashboard', apiRoles: ['super_admin', 'org_admin', 'branch_admin'] },
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

  return (
    <div className="container-fluid full__width__padding dashboard-role-tabs">
      <ul className="nav tab__button__wrap dashboard-role-tabs__list">
        {visibleTabs.map((tab) => (
          <li key={tab.role} className="nav-item">
            <Link
              className={`single__tab__link${activeRole === tab.role ? ' active' : ''}`}
              to={tab.href}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
