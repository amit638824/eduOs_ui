import type { ApiUser } from '@/types/api';
import type { DashboardNavSection, DashboardProfile, DashboardRole } from '@/types/dashboard';
import { resolveImageUrl } from '@/utils/image';
import { isSuperAdmin } from '@/utils/dashboardRole';

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
      cta: { label: 'Create Test', href: `${base}/create-test` },
    },
    admin: {
      role: 'admin',
      greeting: 'Hello',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.admin,
      innerClass: 'admin__dashboard__inner',
      showRating: true,
      cta: {
        label: isSuperAdmin(user.roles) ? 'Manage Organization' : 'Add Students',
        href: isSuperAdmin(user.roles) ? `${base}/admin-org` : `${base}/admin-students`,
      },
    },
  };

  return { name, ...profiles[role] };
}

const logoutItem = { label: 'Logout', href: '/login', icon: 'logout', action: 'logout' as const };

/**
 * Role-based sidebar:
 * - Super Admin → full platform access
 * - Org Admin → departments, faculty, students + oversight
 * - Teacher → create tests (dept–subject–topic), question bank
 * - Student → take tests + results
 */
export function buildDashboardNavigation(user: ApiUser, role: DashboardRole): DashboardNavSection[] {
  if (role === 'admin') {
    const superAdmin = isSuperAdmin(user.roles);

    if (superAdmin) {
      return [
        {
          title: 'Platform',
          items: [
            { label: 'Dashboard', href: `${base}/admin-dashboard`, icon: 'home' },
            { label: 'Organizations', href: `${base}/admin-org`, icon: 'course' },
            { label: 'Users', href: `${base}/admin-users`, icon: 'user' },
            { label: 'Audit Logs', href: `${base}/admin-audit`, icon: 'assignment' },
            { label: 'Payments', href: `${base}/admin-wishlist`, icon: 'cart' },
            { label: 'Sessions', href: `${base}/admin-sessions`, icon: 'monitor' },
            { label: 'Settings', href: `${base}/admin-settings`, icon: 'settings' },
          ],
        },
        {
          title: 'Examinations',
          items: [
            { label: 'Question Bank', href: `${base}/admin-question-bank`, icon: 'quiz' },
            { label: 'Create Test', href: `${base}/create-test`, icon: 'course' },
            { label: 'All Tests', href: `${base}/admin-course`, icon: 'monitor' },
            { label: 'Attempts', href: `${base}/admin-quiz-attempts`, icon: 'assignment' },
            { label: 'Reports', href: `${base}/admin-reviews`, icon: 'star' },
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

    // Organization Admin — departments, faculty, students
    return [
      {
        title: 'Organization',
        items: [
          { label: 'Dashboard', href: `${base}/admin-dashboard`, icon: 'home' },
          { label: 'Departments', href: `${base}/admin-org`, icon: 'course' },
          { label: 'Faculty', href: `${base}/admin-faculty`, icon: 'user' },
          { label: 'Students', href: `${base}/admin-students`, icon: 'bookmark' },
        ],
      },
      {
        title: 'Examinations',
        items: [
          { label: 'Question Bank', href: `${base}/admin-question-bank`, icon: 'quiz' },
          { label: 'All Tests', href: `${base}/admin-course`, icon: 'monitor' },
          { label: 'Attempts', href: `${base}/admin-quiz-attempts`, icon: 'assignment' },
          { label: 'Reports', href: `${base}/admin-reviews`, icon: 'star' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'My Profile', href: `${base}/admin-profile`, icon: 'user' },
          { label: 'Notifications', href: `${base}/admin-message`, icon: 'message' },
          { label: 'Settings', href: `${base}/admin-settings`, icon: 'settings' },
          logoutItem,
        ],
      },
    ];
  }

  if (role === 'teacher') {
    return [
      {
        title: 'Teaching',
        items: [
          { label: 'Dashboard', href: `${base}/teacher-dashboard`, icon: 'home' },
          { label: 'Question Bank', href: `${base}/admin-question-bank`, icon: 'quiz' },
          { label: 'Create Test', href: `${base}/create-test`, icon: 'course' },
          { label: 'My Tests', href: `${base}/teacher-course`, icon: 'monitor' },
          { label: 'Reports', href: `${base}/teacher-reviews`, icon: 'star' },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'My Profile', href: `${base}/teacher-profile`, icon: 'user' },
          { label: 'Notifications', href: `${base}/teacher-message`, icon: 'message' },
          { label: 'Settings', href: `${base}/teacher-settings`, icon: 'settings' },
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
        { label: 'My Tests', href: `${base}/student-enrolled-courses`, icon: 'bookmark' },
        { label: 'My Attempts', href: `${base}/student-my-quiz-attempts`, icon: 'quiz' },
        { label: 'Results', href: `${base}/student-reviews`, icon: 'star' },
        { label: 'Notifications', href: `${base}/student-message`, icon: 'message' },
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
