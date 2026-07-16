import type { ApiRole } from '@/types/api';
import type { DashboardRole } from '@/types/dashboard';

const ADMIN_ROLES: ApiRole[] = ['super_admin', 'org_admin', 'branch_admin'];
const TEACHER_ROLES: ApiRole[] = ['teacher', 'examiner', 'evaluator'];

export function resolveDashboardRole(apiRoles: string[]): DashboardRole {
  if (apiRoles.some((r) => ADMIN_ROLES.includes(r as ApiRole))) return 'admin';
  if (apiRoles.some((r) => TEACHER_ROLES.includes(r as ApiRole))) return 'teacher';
  return 'student';
}

/** Sidebar/layout role — admin, teacher, and student each get their own experience */
export function resolveLayoutRole(apiRoles: string[]): DashboardRole {
  return resolveDashboardRole(apiRoles);
}

export function isSuperAdmin(apiRoles: string[]): boolean {
  return apiRoles.includes('super_admin');
}

export function isOrgAdmin(apiRoles: string[]): boolean {
  return apiRoles.includes('org_admin') || apiRoles.includes('branch_admin');
}

export function getRoleFromPath(pathname: string): DashboardRole {
  if (
    pathname.includes('/admin-') ||
    pathname.includes('/create-test') ||
    pathname.includes('/test-builder') ||
    pathname.includes('/question-bank')
  ) {
    if (pathname.includes('/teacher-')) return 'teacher';
    return 'admin';
  }
  if (pathname.includes('/teacher-')) return 'teacher';
  return 'student';
}

export function canAccessDashboardRole(userRoles: string[], layoutRole: DashboardRole): boolean {
  const allowed = resolveLayoutRole(userRoles);
  return allowed === layoutRole;
}

/** Shared exam-authoring pages (create test, question bank, builder) for admin + teacher */
export function canAuthorExams(apiRoles: string[]): boolean {
  const role = resolveLayoutRole(apiRoles);
  return role === 'admin' || role === 'teacher';
}

export function getDefaultDashboardPath(apiRoles: string[]): string {
  const role = resolveLayoutRole(apiRoles);
  if (role === 'admin') return '/dashboard/admin-dashboard';
  if (role === 'teacher') return '/dashboard/teacher-dashboard';
  return '/dashboard/student-dashboard';
}

export function getTestsListPath(apiRoles: string[]): string {
  const role = resolveLayoutRole(apiRoles);
  if (role === 'admin') return '/dashboard/admin-course';
  if (role === 'teacher') return '/dashboard/teacher-course';
  return '/dashboard/student-enrolled-courses';
}
