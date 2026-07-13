import type { ApiUser } from '@/types/api';
import type { NavItem } from '@/types/content';
import { getDefaultDashboardPath, resolveDashboardRole } from '@/utils/dashboardRole';

const base = '/dashboard';

/** Shown to everyone WITHOUT login — marketing / public site only */
export const publicNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Online Tests',
    href: '/exams',
    children: [
      { label: 'Hardware & Networking', href: '/exams/hardware-networking' },
      { label: 'Computer Application', href: '/exams/computer-application', badge: 'Popular' },
      { label: 'Diploma & Certificate', href: '/exams/diploma' },
      { label: 'CCC & O Level', href: '/exams/govt-it' },
      { label: 'Programming', href: '/exams/programming' },
    ],
  },
  { label: 'For Institutes', href: '/schools' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
];

/** Compact links when logged-in user is on public pages (not inside /dashboard) */
export function buildAuthenticatedPublicNav(user: ApiUser): NavItem[] {
  const role = resolveDashboardRole(user.roles);
  const dashboardRoot = getDefaultDashboardPath(user.roles);

  if (role === 'admin') {
    return [
      { label: 'My Dashboard', href: dashboardRoot },
      { label: 'Users', href: `${base}/admin-users` },
      { label: 'Reports', href: `${base}/admin-reviews` },
      { label: 'Payments', href: `${base}/admin-wishlist` },
    ];
  }

  if (role === 'teacher') {
    return [
      { label: 'My Dashboard', href: dashboardRoot },
      { label: 'Question Bank', href: `${base}/question-bank` },
      { label: 'My Tests', href: `${base}/teacher-course` },
      { label: 'Create Test', href: `${base}/create-test` },
    ];
  }

  return [
    { label: 'My Dashboard', href: dashboardRoot },
    { label: 'My Tests', href: `${base}/student-enrolled-courses` },
    { label: 'My Attempts', href: `${base}/student-my-quiz-attempts` },
    { label: 'Results', href: `${base}/student-reviews` },
    { label: 'Wallet', href: `${base}/student-wishlist` },
  ];
}

/** Inside /dashboard — header shows only exit + role shortcuts (sidebar has full menu) */
export function buildDashboardHeaderNav(user: ApiUser): NavItem[] {
  return [
    { label: 'Back to Website', href: '/' },
    { label: 'Online Tests', href: '/exams' },
    ...buildAuthenticatedPublicNav(user).filter((item) => item.label !== 'My Dashboard'),
  ];
}

/** Resolve which nav items appear in site header */
export function resolveHeaderNavigation(
  user: ApiUser | null,
  pathname: string,
): NavItem[] {
  const onDashboard = pathname.startsWith('/dashboard');

  if (!user) {
    return publicNavigation;
  }

  if (onDashboard) {
    return buildDashboardHeaderNav(user);
  }

  return [...publicNavigation, ...buildAuthenticatedPublicNav(user)];
}

/** Mobile "My Account" dropdown links */
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

  const role = resolveDashboardRole(user.roles);
  const dashboardRoot = getDefaultDashboardPath(user.roles);

  const links: AccountLink[] = [
    { label: 'My Dashboard', href: dashboardRoot },
    { label: 'My Profile', href: `${base}/${role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'student'}-profile` },
    { label: 'Account Settings', href: `${base}/${role === 'admin' ? 'admin' : role === 'teacher' ? 'teacher' : 'student'}-settings` },
    { label: 'Logout', href: '/login', action: 'logout' },
  ];

  return links;
}

/** @deprecated Use resolveHeaderNavigation — kept for any legacy imports */
export const mainNavigation = publicNavigation;
