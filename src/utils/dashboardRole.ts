import type { ApiRole } from '@/types/api';
import type { DashboardRole } from '@/types/dashboard';

const ADMIN_ROLES: ApiRole[] = ['super_admin', 'org_admin', 'branch_admin'];
const TEACHER_ROLES: ApiRole[] = ['teacher', 'examiner', 'evaluator'];

export function resolveDashboardRole(apiRoles: string[]): DashboardRole {
  if (apiRoles.some((r) => ADMIN_ROLES.includes(r as ApiRole))) return 'admin';
  if (apiRoles.some((r) => TEACHER_ROLES.includes(r as ApiRole))) return 'teacher';
  return 'student';
}

export function getRoleFromPath(pathname: string): DashboardRole {
  if (pathname.includes('/admin-')) return 'admin';
  if (
    pathname.includes('/teacher-') ||
    pathname.includes('/create-test') ||
    pathname.includes('/become-a-teacher')
  ) {
    return 'teacher';
  }
  return 'student';
}

export function canAccessDashboardRole(userRoles: string[], layoutRole: DashboardRole): boolean {
  const userRole = resolveDashboardRole(userRoles);
  if (userRole === 'admin') return true;
  if (userRole === 'teacher') return layoutRole !== 'admin';
  return layoutRole === 'student';
}

export function getDefaultDashboardPath(apiRoles: string[]): string {
  const role = resolveDashboardRole(apiRoles);
  if (role === 'admin') return '/dashboard/admin-dashboard';
  if (role === 'teacher') return '/dashboard/teacher-dashboard';
  return '/dashboard/student-dashboard';
}
