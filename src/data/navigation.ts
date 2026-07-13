import type { ApiUser } from '@/types/api';
import type { NavItem } from '@/types/content';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';

/** Public site header — flat links only (no dropdowns) */
export const publicNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Online Tests', href: '/exams' },
  { label: 'For Institutes', href: '/schools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

/** Resolve flat nav items for the marketing site header */
export function resolveHeaderNavigation(
  user: ApiUser | null,
  pathname: string,
): NavItem[] {
  const onDashboard = pathname.startsWith('/dashboard');

  if (!user) {
    return publicNavigation;
  }

  if (onDashboard) {
    return [
      { label: 'Back to Website', href: '/' },
      { label: 'Online Tests', href: '/exams' },
      { label: 'Dashboard', href: getDefaultDashboardPath(user.roles) },
    ];
  }

  return [
    ...publicNavigation,
    { label: 'Dashboard', href: getDefaultDashboardPath(user.roles) },
  ];
}

/** Mobile drawer account links */
export interface AccountLink {
  label: string;
  href: string;
  action?: 'logout';
}

export function buildAccountLinks(user: ApiUser | null): AccountLink[] {
  if (!user) {
    return [
      { label: 'Login', href: '/login' },
      { label: 'Create Account', href: '/register' },
    ];
  }

  const dashboardRoot = getDefaultDashboardPath(user.roles);
  const roleSegment = dashboardRoot.includes('admin')
    ? 'admin'
    : dashboardRoot.includes('teacher')
      ? 'teacher'
      : 'student';

  return [
    { label: 'My Dashboard', href: dashboardRoot },
    { label: 'My Profile', href: `/dashboard/${roleSegment}-profile` },
    { label: 'Account Settings', href: `/dashboard/${roleSegment}-settings` },
    { label: 'Logout', href: '/login', action: 'logout' },
  ];
}

/** @deprecated Use resolveHeaderNavigation */
export const mainNavigation = publicNavigation;
