import type { ApiRole } from '@/types/api';
import type { DashboardRole } from '@/types/dashboard';

const ADMIN_ROLES: ApiRole[] = ['super_admin', 'org_admin', 'branch_admin'];
const TEACHER_ROLES: ApiRole[] = ['teacher', 'examiner', 'evaluator'];

export function resolveDashboardRole(apiRoles: string[]): DashboardRole {
  if (apiRoles.some((r) => ADMIN_ROLES.includes(r as ApiRole))) return 'admin';
  if (apiRoles.some((r) => TEACHER_ROLES.includes(r as ApiRole))) return 'teacher';
  return 'student';
}

/** Sidebar/layout role — teachers share the student dashboard experience */
export function resolveLayoutRole(apiRoles: string[]): Extract<DashboardRole, 'admin' | 'student'> {
  if (apiRoles.some((r) => ADMIN_ROLES.includes(r as ApiRole))) return 'admin';
  return 'student';
}

export function getRoleFromPath(pathname: string): DashboardRole {
  if (pathname.includes('/admin-') || pathname.includes('/create-test') || pathname.includes('/test-builder')) {
    return 'admin';
  }
  return 'student';
}

export function canAccessDashboardRole(userRoles: string[], layoutRole: DashboardRole): boolean {
  const allowed = resolveLayoutRole(userRoles);
  if (allowed === 'admin') return layoutRole === 'admin';
  return layoutRole === 'student';
}

export function getDefaultDashboardPath(apiRoles: string[]): string {
  return resolveLayoutRole(apiRoles) === 'admin'
    ? '/dashboard/admin-dashboard'
    : '/dashboard/student-dashboard';
}
