import type { ApiUser } from '@/types/api';
import type { DashboardNavSection, DashboardProfile, DashboardRole } from '@/types/dashboard';
import { resolveImageUrl } from '@/utils/image';

const base = '/dashboard';

function fullName(user: ApiUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

const defaultImages: Record<DashboardRole, string> = {
  student: '/img/teacher/teacher__2.png',
  teacher: '/img/dashbord/dashbord__2.jpg',
  admin: '/img/dashbord/dashbord__2.jpg',
};

export function buildDashboardProfile(user: ApiUser, role: DashboardRole): DashboardProfile {
  const name = fullName(user);

  const profiles: Record<DashboardRole, Omit<DashboardProfile, 'name'>> = {
    student: {
      role: 'student',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.student,
      innerClass: 'student__dashboard__inner',
      stats: [
        { icon: 'icofont-book-alt', text: 'My Tests & Enrollment' },
        { icon: 'icofont-certificate-alt-1', text: 'Results & Rank' },
      ],
      cta: { label: 'Start a Test', href: `${base}/student-enrolled-courses` },
    },
    teacher: {
      role: 'teacher',
      greeting: 'Hello',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.teacher,
      showRating: true,
      cta: { label: 'Create New Test', href: `${base}/create-test` },
    },
    admin: {
      role: 'admin',
      greeting: 'Hello',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.admin,
      innerClass: 'admin__dashboard__inner',
      showRating: true,
      cta: { label: 'Manage Users', href: `${base}/admin-users` },
    },
  };

  return { name, ...profiles[role] };
}

const logoutItem = { label: 'Logout', href: '/login', icon: 'logout', action: 'logout' as const };

/**
 * Phase 1 sidebar menus — only modules that exist in the platform.
 * Student / Teacher / Admin items match doc walkthrough scenes.
 */
export function buildDashboardNavigation(user: ApiUser, role: DashboardRole): DashboardNavSection[] {
  const name = fullName(user);

  if (role === 'teacher') {
    return [
      {
        title: `Teacher — ${name}`,
        items: [
          { label: 'Dashboard', href: `${base}/teacher-dashboard`, icon: 'home' },
          { label: 'My Profile', href: `${base}/teacher-profile`, icon: 'user' },
          { label: 'Notifications', href: `${base}/teacher-message`, icon: 'message' },
          { label: 'Question Bank', href: `${base}/question-bank`, icon: 'quiz' },
          { label: 'My Tests', href: `${base}/teacher-course`, icon: 'monitor' },
          { label: 'Create Test', href: `${base}/create-test`, icon: 'course' },
          { label: 'Test Attempts', href: `${base}/teacher-quiz-attempts`, icon: 'quiz' },
          { label: 'Reports & Analytics', href: `${base}/teacher-reviews`, icon: 'star' },
        ],
      },
      {
        title: 'Account',
        className: 'mt-40',
        items: [
          { label: 'Settings', href: `${base}/teacher-settings`, icon: 'settings' },
          logoutItem,
        ],
      },
    ];
  }

  if (role === 'admin') {
    return [
      {
        title: `Admin — ${name}`,
        items: [
          { label: 'Dashboard', href: `${base}/admin-dashboard`, icon: 'home' },
          { label: 'My Profile', href: `${base}/admin-profile`, icon: 'user' },
          { label: 'Notifications', href: `${base}/admin-message`, icon: 'message' },
          { label: 'All Tests', href: `${base}/admin-course`, icon: 'course' },
          { label: 'Question Bank', href: `${base}/admin-question-bank`, icon: 'quiz' },
          { label: 'All Attempts', href: `${base}/admin-quiz-attempts`, icon: 'quiz' },
          { label: 'Reports', href: `${base}/admin-reviews`, icon: 'star' },
          { label: 'Payments', href: `${base}/admin-wishlist`, icon: 'cart' },
          { label: 'User Management', href: `${base}/admin-users`, icon: 'user' },
          { label: 'Audit Logs', href: `${base}/admin-audit`, icon: 'assignment' },
        ],
      },
      {
        title: 'Organization',
        className: 'mt-40',
        items: [
          { label: 'Org Structure', href: `${base}/admin-org`, icon: 'course' },
          { label: 'Branding', href: `${base}/admin-branding`, icon: 'settings' },
          { label: 'Sessions & MFA', href: `${base}/admin-sessions`, icon: 'monitor' },
          { label: 'Settings', href: `${base}/admin-settings`, icon: 'settings' },
          logoutItem,
        ],
      },
    ];
  }

  return [
    {
      title: `Student — ${name}`,
      items: [
        { label: 'Dashboard', href: `${base}/student-dashboard`, icon: 'home' },
        { label: 'My Profile', href: `${base}/student-profile`, icon: 'user' },
        { label: 'Notifications', href: `${base}/student-message`, icon: 'message' },
        { label: 'My Tests', href: `${base}/student-enrolled-courses`, icon: 'bookmark' },
        { label: 'My Attempts', href: `${base}/student-my-quiz-attempts`, icon: 'quiz' },
        { label: 'Results', href: `${base}/student-reviews`, icon: 'star' },
        { label: 'Wallet', href: `${base}/student-wishlist`, icon: 'cart' },
        { label: 'Settings', href: `${base}/student-settings`, icon: 'settings' },
        logoutItem,
      ],
    },
  ];
}

export function buildProfileFields(user: ApiUser) {
  return [
    { label: 'Registration Date', value: user.createdAt ? new Date(user.createdAt).toLocaleString('en-US') : '—' },
    { label: 'First Name', value: user.firstName },
    { label: 'Last Name', value: user.lastName },
    { label: 'Username', value: user.email.split('@')[0] },
    { label: 'Email', value: user.email },
    { label: 'Phone Number', value: user.phone ?? '—' },
    { label: 'Role', value: user.roles.join(', ') },
    { label: 'Status', value: user.status },
    {
      label: 'Organization ID',
      value: user.organizationId ?? 'Platform user',
    },
  ];
}
