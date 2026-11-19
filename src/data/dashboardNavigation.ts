import type { ApiUser } from '@/types/api';
import type {
  DashboardNavSection,
  DashboardProfile,
  DashboardRole,
} from '@/types/dashboard';
import { resolveImageUrl } from '@/utils/image';
import { isOrgStaff, isSuperAdmin } from '@/utils/dashboardRole';
import { formatDateTime } from '@/utils/dateFormat';

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

  const profiles: Record<
    DashboardRole,
    Omit<DashboardProfile, 'name'>
  > = {
    student: {
      role: 'student',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.student,
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
      image: resolveImageUrl(user.avatarUrl) || defaultImages.teacher,
      showRating: true,
      cta: {
        label: 'Create Test',
        href: `${base}/create-test`,
      },
    },

    admin: {
      role: 'admin',
      greeting: 'Hello',
      image: resolveImageUrl(user.avatarUrl) || defaultImages.admin,
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

const logoutItem = {
  label: 'Logout',
  href: '/login',
  icon: 'logout',
  action: 'logout' as const,
};

/**
 * Normal role-based sidebar menu (all items directly visible):
 *
 * - Admin: Core → Organization → Exam Setup → Management & Reports → Account
 * - Teacher: Core → Exam Setup → Monitoring & Reports → Account
 * - Student: Tests, Assignments, Calendar, Results, Certificates, Account
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
          id: 'core',
          title: 'CORE',
          items: [
            {
              label: 'Dashboard',
              href: `${base}/admin-dashboard`,
              icon: 'home',
            },
          ],
        },

        {
          id: 'organization',
          title: 'ORGANIZATION',
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
          id: 'exam_setup',
          title: 'EXAM SETUP',
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
              label: 'Create Test',
              href: `${base}/create-test`,
              icon: 'plus',
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
          ],
        },

        {
          id: 'priority',
          title: 'MANAGEMENT & REPORTS',
          items: [
            {
              label: 'Attempts',
              href: `${base}/admin-quiz-attempts`,
              icon: 'clock',
            },
            {
              label: 'Flagged Attempts',
              href: `${base}/admin-flagged-attempts`,
              icon: 'flag',
              badge: 'Review',
              badgeVariant: 'danger',
            },
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

        {
          id: 'pinned_bottom',
          className: 'sca-db-sidebar__group--pinned',
          items: [
            {
              label: 'Settings',
              href: `${base}/admin-settings`,
              icon: 'settings',
            },
            {
              label: 'Profile',
              href: `${base}/admin-profile`,
              icon: 'user',
            },
            {
              label: 'Notifications',
              href: `${base}/admin-message`,
              icon: 'notifications',
              badgeVariant: 'danger',
            },
            logoutItem,
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
          id: 'core',
          title: 'CORE',
          items: [
            {
              label: 'Dashboard',
              href: `${base}/admin-dashboard`,
              icon: 'home',
            },
          ],
        },

        {
          id: 'organization',
          title: 'ORGANIZATION',
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
          id: 'exam_setup',
          title: 'EXAM SETUP',
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
              label: 'Create Test',
              href: `${base}/create-test`,
              icon: 'plus',
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
          ],
        },

        {
          id: 'priority',
          title: 'MANAGEMENT & REPORTS',
          items: [
            {
              label: 'Attempts',
              href: `${base}/admin-quiz-attempts`,
              icon: 'clock',
            },
            {
              label: 'Flagged Attempts',
              href: `${base}/admin-flagged-attempts`,
              icon: 'flag',
              badge: 'Review',
              badgeVariant: 'danger',
            },
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
          id: 'pinned_bottom',
          className: 'sca-db-sidebar__group--pinned',
          items: [
            {
              label: 'Settings',
              href: `${base}/admin-settings`,
              icon: 'settings',
            },
            {
              label: 'Profile',
              href: `${base}/admin-profile`,
              icon: 'user',
            },
            {
              label: 'Notifications',
              href: `${base}/admin-message`,
              icon: 'notifications',
              badgeVariant: 'danger',
            },
            logoutItem,
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
        id: 'core',
        title: 'CORE',
        items: [
          {
            label: 'Dashboard',
            href: `${base}/admin-dashboard`,
            icon: 'home',
          },
        ],
      },

      {
        id: 'organization',
        title: 'ORGANIZATION',
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
        ],
      },

      {
        id: 'exam_setup',
        title: 'EXAM SETUP',
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
            label: 'Create Test',
            href: `${base}/create-test`,
            icon: 'plus',
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
        ],
      },

      {
        id: 'priority',
        title: 'MANAGEMENT & REPORTS',
        items: [
          {
            label: 'Attempts',
            href: `${base}/admin-quiz-attempts`,
            icon: 'clock',
          },
          {
            label: 'Flagged Attempts',
            href: `${base}/admin-flagged-attempts`,
            icon: 'flag',
            badge: 'Review',
            badgeVariant: 'danger',
          },
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
        id: 'pinned_bottom',
        className: 'sca-db-sidebar__group--pinned',
        items: [
          {
            label: 'Settings',
            href: `${base}/admin-settings`,
            icon: 'settings',
          },
          {
            label: 'Profile',
            href: `${base}/admin-profile`,
            icon: 'user',
          },
          {
            label: 'Notifications',
            href: `${base}/admin-message`,
            icon: 'notifications',
          },
          logoutItem,
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
        id: 'core',
        title: 'CORE',
        items: [
          {
            label: 'Dashboard',
            href: `${base}/teacher-dashboard`,
            icon: 'home',
          },
        ],
      },

      {
        id: 'exam_setup',
        title: 'EXAM SETUP',
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
            label: 'Create Test',
            href: `${base}/create-test`,
            icon: 'plus',
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
        ],
      },

      {
        id: 'priority',
        title: 'MONITORING & REPORTS',
        items: [
          {
            label: 'Flagged Attempts',
            href: `${base}/teacher-flagged-attempts`,
            icon: 'flag',
            badge: 'Review',
            badgeVariant: 'danger',
          },
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

      {
        id: 'pinned_bottom',
        className: 'sca-db-sidebar__group--pinned',
        items: [
          {
            label: 'Settings',
            href: `${base}/teacher-settings`,
            icon: 'settings',
          },
          {
            label: 'Profile',
            href: `${base}/teacher-profile`,
            icon: 'user',
          },
          {
            label: 'Notifications',
            href: `${base}/teacher-message`,
            icon: 'notifications',
          },
          logoutItem,
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
      title: '',
      items: [
        {
          label: 'Dashboard',
          href: `${base}/student-dashboard`,
          icon: 'home',
        },

        {
          label: 'Profile',
          href: `${base}/student-profile`,
          icon: 'user',
        },

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

        {
          label: 'Notifications',
          href: `${base}/student-message`,
          icon: 'notifications',
        },

        {
          label: 'Settings',
          href: `${base}/student-settings`,
          icon: 'settings',
        },

        logoutItem,
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
      value: user.phone ?? '—',
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
