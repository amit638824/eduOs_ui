import type { ApiUser } from '@/types/api';
import type {
  DashboardNavSection,
  DashboardProfile,
  DashboardRole,
} from '@/types/dashboard';
import { resolveImageUrl } from '@/utils/image';
import { isOrgStaff, isSuperAdmin } from '@/utils/dashboardRole';
import { formatDateTime } from '@/utils/dateFormat';
import { formatPhoneWithCountryCode } from '@/utils/normalize';

const base = '/dashboard';

function fullName(user: ApiUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

const defaultImages: Record<DashboardRole, string> = {
  student: '/img/teacher/teacher__2.png',
  teacher: '/img/dashbord/dashbord__2.jpg',
  admin: '/img/dashbord/dashbord__2.jpg',
};

export function buildDashboardProfile(
  user: ApiUser,
  role: DashboardRole,
): DashboardProfile {
  const name = fullName(user);
  const cachedAvatar = typeof window !== 'undefined' && user?.id ? (localStorage.getItem(`mindsprint_avatar_${user.id}`) || '') : '';
  const resolvedAvatar = resolveImageUrl(user.avatarUrl) || resolveImageUrl(cachedAvatar);

  const profiles: Record<
    DashboardRole,
    Omit<DashboardProfile, 'name'>
  > = {
    student: {
      role: 'student',
      image: resolvedAvatar || defaultImages.student,
      innerClass: 'student__dashboard__inner',
      stats: [
        {
          icon: 'icofont-book-alt',
          text: 'Tests & Enrollment',
        },
        {
          icon: 'icofont-certificate-alt-1',
          text: 'Results & Rank',
        },
      ],
      cta: {
        label: 'Start a Test',
        href: `${base}/student-enrolled-courses`,
      },
    },

    teacher: {
      role: 'teacher',
      greeting: 'Hello',
      image: resolvedAvatar || defaultImages.teacher,
      showRating: true,
      cta: {
        label: 'Create Test',
        href: `${base}/create-test`,
      },
    },

    admin: {
      role: 'admin',
      greeting: 'Hello',
      image: resolvedAvatar || defaultImages.admin,
      innerClass: 'admin__dashboard__inner',
      showRating: true,
      cta: {
        label: isSuperAdmin(user.roles)
          ? 'Manage Organizations'
          : 'Add Students',

        href: isSuperAdmin(user.roles)
          ? `${base}/admin-organizations`
          : `${base}/admin-students`,
      },
    },
  };

  return {
    name,
    ...profiles[role],
  };
}

/**
 * Normal role-based sidebar menu:
 * Settings, Profile, and Logout are managed in the TopBar user dropdown.
 */
export function buildDashboardNavigation(
  user: ApiUser,
  role: DashboardRole,
): DashboardNavSection[] {
  /*
   * ============================================================
   * ADMIN
   * ============================================================
   */
  if (role === 'admin') {
    const superAdmin = isSuperAdmin(user.roles);

    const staffOnly =
      isOrgStaff(user.roles) &&
      !superAdmin &&
      !user.roles.includes('org_admin');

    /*
     * ----------------------------------------------------------
     * SUPER ADMIN
     * ----------------------------------------------------------
     */
    if (superAdmin) {
      return [
        {
          id: 'dashboard',
          title: 'Dashboard',
          collapsible: true,
          items: [
            {
              label: 'Overview',
              href: `${base}/admin-dashboard`,
              icon: 'home',
            },
          ],
        },
        {
          id: 'administration',
          title: 'Administration',
          collapsible: true,
          items: [
            {
              label: 'Organizations',
              href: `${base}/admin-organizations`,
              icon: 'organizations',
            },
            {
              label: 'Departments',
              href: `${base}/admin-org`,
              icon: 'departments',
            },
            {
              label: 'Teachers',
              href: `${base}/admin-faculty`,
              icon: 'teachers',
            },
            {
              label: 'Students',
              href: `${base}/admin-students`,
              icon: 'students',
            },
            {
              label: 'Users',
              href: `${base}/admin-users`,
              icon: 'users',
            },
          ],
        },
        {
          id: 'assessments',
          title: 'Assessments',
          collapsible: true,
          items: [
            {
              label: 'All Tests',
              href: `${base}/admin-course`,
              icon: 'tests',
            },
            {
              label: 'Question Bank',
              href: `${base}/admin-question-bank`,
              icon: 'quiz',
            },
            {
              label: 'Build with AI',
              href: `${base}/ai-questions`,
              icon: 'spark',
              badge: 'AI',
              badgeVariant: 'purple',
            },
            {
              label: 'Assignments',
              href: `${base}/admin-assignments`,
              icon: 'assignment',
            },
            {
              label: 'Attempts',
              href: `${base}/admin-quiz-attempts`,
              icon: 'clock',
            },
            {
              label: 'Flagged Attempts',
              href: `${base}/admin-flagged-attempts`,
              icon: 'flag',
              badge: '',
              badgeVariant: 'danger',
            },
          ],
        },
        {
          id: 'reports',
          title: 'Reports & Certificates',
          collapsible: true,
          items: [
            {
              label: 'Reports',
              href: `${base}/admin-reviews`,
              icon: 'chart',
            },
            {
              label: 'Certificates',
              href: `${base}/admin-certificates`,
              icon: 'certificate',
            },
          ],
        },
        {
          id: 'system',
          title: 'System & Logs',
          collapsible: true,
          items: [
            {
              label: 'Payments',
              href: `${base}/admin-wishlist`,
              icon: 'payments',
            },
            {
              label: 'Audit Logs',
              href: `${base}/admin-audit`,
              icon: 'audit',
            },
            {
              label: 'Sessions',
              href: `${base}/admin-sessions`,
              icon: 'sessions',
            },
          ],
        },
      ];
    }

    /*
     * ----------------------------------------------------------
     * STAFF
     * ----------------------------------------------------------
     */
    if (staffOnly) {
      return [
        {
          id: 'dashboard',
          title: 'Dashboard',
          collapsible: true,
          items: [
            {
              label: 'Overview',
              href: `${base}/admin-dashboard`,
              icon: 'home',
            },
          ],
        },
        {
          id: 'administration',
          title: 'Administration',
          collapsible: true,
          items: [
            {
              label: 'Departments',
              href: `${base}/admin-org`,
              icon: 'departments',
            },
            {
              label: 'Students',
              href: `${base}/admin-students`,
              icon: 'students',
            },
          ],
        },
        {
          id: 'assessments',
          title: 'Assessments',
          collapsible: true,
          items: [
            {
              label: 'All Tests',
              href: `${base}/admin-course`,
              icon: 'tests',
            },
            {
              label: 'Question Bank',
              href: `${base}/admin-question-bank`,
              icon: 'quiz',
            },
            {
              label: 'Build with AI',
              href: `${base}/ai-questions`,
              icon: 'spark',
              badge: 'AI',
              badgeVariant: 'purple',
            },
            {
              label: 'Assignments',
              href: `${base}/admin-assignments`,
              icon: 'assignment',
            },
            {
              label: 'Attempts',
              href: `${base}/admin-quiz-attempts`,
              icon: 'clock',
            },
            {
              label: 'Flagged Attempts',
              href: `${base}/admin-flagged-attempts`,
              icon: 'flag',
              badge: ' ',
              badgeVariant: 'danger',
            },
          ],
        },
        {
          id: 'reports',
          title: 'Reports & Certificates',
          collapsible: true,
          items: [
            {
              label: 'Reports',
              href: `${base}/admin-reviews`,
              icon: 'chart',
            },
            {
              label: 'Certificates',
              href: `${base}/admin-certificates`,
              icon: 'certificate',
            },
          ],
        },
      ];
    }

    /*
     * ----------------------------------------------------------
     * ORGANIZATION ADMIN
     * ----------------------------------------------------------
     */
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        collapsible: true,
        items: [
          {
            label: 'Overview',
            href: `${base}/admin-dashboard`,
            icon: 'home',
          },
        ],
      },
      {
        id: 'administration',
        title: 'Administration',
        collapsible: true,
        items: [
          {
            label: 'Departments',
            href: `${base}/admin-org`,
            icon: 'departments',
          },
          {
            label: 'Teachers',
            href: `${base}/admin-faculty`,
            icon: 'teachers',
          },
          {
            label: 'Students',
            href: `${base}/admin-students`,
            icon: 'students',
          },
          {
            label: 'Users',
            href: `${base}/admin-users`,
            icon: 'users',
          },
        ],
      },
      {
        id: 'assessments',
        title: 'Assessments',
        collapsible: true,
        items: [
          {
            label: 'All Tests',
            href: `${base}/admin-course`,
            icon: 'tests',
          },
          {
            label: 'Question Bank',
            href: `${base}/admin-question-bank`,
            icon: 'quiz',
          },
          {
            label: 'Build with AI',
            href: `${base}/ai-questions`,
            icon: 'spark',
            badge: 'AI',
            badgeVariant: 'purple',
          },
          {
            label: 'Assignments',
            href: `${base}/admin-assignments`,
            icon: 'assignment',
          },
          {
            label: 'Attempts',
            href: `${base}/admin-quiz-attempts`,
            icon: 'clock',
          },
          {
            label: 'Flagged Attempts',
            href: `${base}/admin-flagged-attempts`,
            icon: 'flag',
            badge: ' ',
            badgeVariant: 'danger',
          },
        ],
      },
      {
        id: 'reports',
        title: 'Reports & Certificates',
        collapsible: true,
        items: [
          {
            label: 'Reports',
            href: `${base}/admin-reviews`,
            icon: 'chart',
          },
          {
            label: 'Certificates',
            href: `${base}/admin-certificates`,
            icon: 'certificate',
          },
        ],
      },
      {
        id: 'system',
        title: 'System & Logs',
        collapsible: true,
        items: [
          {
            label: 'Payments',
            href: `${base}/admin-wishlist`,
            icon: 'payments',
          },
          {
            label: 'Audit Logs',
            href: `${base}/admin-audit`,
            icon: 'audit',
          },
          {
            label: 'Sessions',
            href: `${base}/admin-sessions`,
            icon: 'sessions',
          },
        ],
      },
    ];
  }

  /*
   * ============================================================
   * TEACHER
   * ============================================================
   */
  if (role === 'teacher') {
    return [
      {
        id: 'dashboard',
        title: 'Dashboard',
        collapsible: true,
        items: [
          {
            label: 'Overview',
            href: `${base}/teacher-dashboard`,
            icon: 'home',
          },
        ],
      },
      {
        id: 'assessments',
        title: 'Assessments',
        collapsible: true,
        items: [
          {
            label: 'Tests',
            href: `${base}/teacher-course`,
            icon: 'tests',
          },
          {
            label: 'Question Bank',
            href: `${base}/admin-question-bank`,
            icon: 'quiz',
          },
          {
            label: 'Build with AI',
            href: `${base}/ai-questions`,
            icon: 'spark',
            badge: 'AI',
            badgeVariant: 'purple',
          },
          {
            label: 'Assignments',
            href: `${base}/teacher-assignments`,
            icon: 'assignment',
          },
          {
            label: 'Flagged Attempts',
            href: `${base}/teacher-flagged-attempts`,
            icon: 'flag',
            badge: '',
            badgeVariant: 'danger',
          },
        ],
      },
      {
        id: 'reports',
        title: 'Reports & Certificates',
        collapsible: true,
        items: [
          {
            label: 'Reports',
            href: `${base}/teacher-reviews`,
            icon: 'chart',
          },
          {
            label: 'Certificates',
            href: `${base}/teacher-certificates`,
            icon: 'certificate',
          },
        ],
      },
    ];
  }

  /*
   * ============================================================
   * STUDENT
   * ============================================================
   */
  return [
    {
      id: 'dashboard',
      title: 'Dashboard',
      collapsible: true,
      items: [
        {
          label: 'Overview',
          href: `${base}/student-dashboard`,
          icon: 'home',
        },
      ],
    },
    {
      id: 'academics',
      title: 'Academics',
      collapsible: true,
      items: [
        {
          label: 'Tests',
          href: `${base}/student-enrolled-courses`,
          icon: 'tests',
        },
        {
          label: 'Assignments',
          href: `${base}/student-assignments`,
          icon: 'assignment',
        },
        {
          label: 'Attempts',
          href: `${base}/student-my-quiz-attempts`,
          icon: 'clock',
        },
        {
          label: 'Calendar',
          href: `${base}/student-calendar`,
          icon: 'calendar',
        },
      ],
    },
    {
      id: 'performance',
      title: 'Performance',
      collapsible: true,
      items: [
        {
          label: 'Results',
          href: `${base}/student-reviews`,
          icon: 'chart',
        },
        {
          label: 'Certificates',
          href: `${base}/student-certificates`,
          icon: 'certificate',
        },
      ],
    },
  ];
}

export function buildProfileFields(user: ApiUser) {
  return [
    {
      label: 'Registration Date',
      value: user.createdAt
        ? formatDateTime(user.createdAt)
        : '—',
    },

    {
      label: 'First Name',
      value: user.firstName,
    },

    {
      label: 'Last Name',
      value: user.lastName,
    },

    {
      label: 'Username',
      value: user.email.split('@')[0],
    },

    {
      label: 'Email',
      value: user.email,
    },

    {
      label: 'Phone Number',
      value: user.phone ? formatPhoneWithCountryCode(user.phone) : '—',
    },

    {
      label: 'Role',
      value: user.roles.join(', '),
    },

    {
      label: 'Status',
      value: user.status,
    },

    {
      label: 'Organization ID',
      value: user.organizationId ?? 'Platform user',
    },
  ];
}
