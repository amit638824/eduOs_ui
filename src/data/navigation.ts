import type { NavItem } from '@/types/content';

export const mainNavigation: NavItem[] = [
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
  {
    label: 'Dashboard',
    href: '/dashboard/student-dashboard',
    children: [
      { label: 'Student Dashboard', href: '/dashboard/student-dashboard' },
      { label: 'My Profile', href: '/dashboard/student-profile' },
      { label: 'My Tests', href: '/dashboard/student-enrolled-courses' },
      { label: 'My Attempts', href: '/dashboard/student-my-quiz-attempts' },
      { label: 'Teacher Portal', href: '/dashboard/teacher-dashboard' },
      { label: 'Admin Panel', href: '/dashboard/admin-dashboard' },
    ],
  },
];
