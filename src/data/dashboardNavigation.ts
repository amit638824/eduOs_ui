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
      cta: { label: 'My Tests', href: `${base}/student-enrolled-courses` },
    },
    admin: {
      role: 'admin',
      greeting: 'Hello',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.admin,
      innerClass: 'admin__dashboard__inner',
      showRating: true,
      cta: { label: 'Create Test', href: `${base}/create-test` },
    },
  };

  return { name, ...profiles[role] };
}

const logoutItem = { label: 'Logout', href: '/login', icon: 'logout', action: 'logout' as const };

/**
 * Phase 1 sidebar — admin exam flow first, platform settings grouped below.
 */
export function buildDashboardNavigation(_user: ApiUser, role: DashboardRole): DashboardNavSection[] {
  if (role === 'admin') {
    return [
      {
        title: 'Examinations',
        items: [
          { label: 'Dashboard', href: `${base}/admin-dashboard`, icon: 'home' },
          { label: 'Question Bank', href: `${base}/admin-question-bank`, icon: 'quiz' },
          { label: 'Create Test', href: `${base}/create-test`, icon: 'course' },
          { label: 'All Tests', href: `${base}/admin-course`, icon: 'monitor' },
          { label: 'Attempts', href: `${base}/admin-quiz-attempts`, icon: 'assignment' },
          { label: 'Reports', href: `${base}/admin-reviews`, icon: 'star' },
        ],
      },
      {
        title: 'Management',
        items: [
          { label: 'Users', href: `${base}/admin-users`, icon: 'user' },
          { label: 'Payments', href: `${base}/admin-wishlist`, icon: 'cart' },
          { label: 'Organization', href: `${base}/admin-org`, icon: 'course' },
          { label: 'Audit Logs', href: `${base}/admin-audit`, icon: 'assignment' },
          { label: 'Sessions', href: `${base}/admin-sessions`, icon: 'monitor' },
          { label: 'Branding', href: `${base}/admin-branding`, icon: 'settings' },
          { label: 'Settings', href: `${base}/admin-settings`, icon: 'settings' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'My Profile', href: `${base}/admin-profile`, icon: 'user' },
          { label: 'Notifications', href: `${base}/admin-message`, icon: 'message' },
          logoutItem,
        ],
      },
    ];
  }

  return [
    {
      title: '',
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
