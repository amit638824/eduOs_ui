import type { NavItem } from '@/types/content';

export const mainNavigation: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Practice Tests',
    href: '/exams',
    children: [
      { label: 'SAT & ACT Prep', href: '/exams/sat-act' },
      { label: 'AP Exams', href: '/exams/ap', badge: 'Popular' },
      { label: 'State Assessments', href: '/exams/state' },
      { label: 'Certifications', href: '/exams/certification' },
    ],
  },
  { label: 'For Schools', href: '/schools' },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Dashboard',
    href: '/dashboard/student-dashboard',
    children: [
      { label: 'Student Dashboard', href: '/dashboard/student-dashboard' },
      { label: 'My Exam Results', href: '/dashboard/student-enrolled-courses' },
      { label: 'Instructor Portal', href: '/dashboard/instructor-dashboard' },
      { label: 'Admin Panel', href: '/dashboard/admin-dashboard' },
    ],
  },
];
