import type { ApiUser } from '@/types/api';
import type { NavItem } from '@/types/content';
import { getDefaultDashboardPath, resolveDashboardRole } from '@/utils/dashboardRole';

const base = '/dashboard';

/** Shown to everyone WITHOUT login — marketing / public site only */
export const publicNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Practice Tests',
    href: '/exams',
    children: [
      { label: 'SAT & ACT Prep', href: '/exams/sat-act' },
      { label: 'AP Exams', href: '/exams/ap', badge: 'Popular' },
      { label: 'AP & IB Exams', href: '/exams/ap-ib' },
      { label: 'State Assessments', href: '/exams/state' },
      { label: 'Certifications', href: '/exams/certification' },
    ],
  },
  { label: 'For Schools', href: '/schools' },
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
    { label: 'Practice Tests', href: '/exams' },
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
