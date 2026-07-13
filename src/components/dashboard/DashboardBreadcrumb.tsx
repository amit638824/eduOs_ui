import { Link, useLocation } from 'react-router-dom';

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  'student-dashboard': 'Student',
  'teacher-dashboard': 'Teacher',
  'admin-dashboard': 'Admin',
  'student-enrolled-courses': 'My Tests',
  'student-my-quiz-attempts': 'Attempts',
  'student-reviews': 'Results',
  'student-wishlist': 'Wallet',
  'student-profile': 'Profile',
  'student-message': 'Notifications',
  'student-settings': 'Settings',
  'teacher-profile': 'Profile',
  'teacher-message': 'Notifications',
  'question-bank': 'Question Bank',
  'teacher-course': 'Tests',
  'create-test': 'Create Test',
  'teacher-quiz-attempts': 'Attempts',
  'teacher-reviews': 'Reports',
  'teacher-settings': 'Settings',
  'admin-profile': 'Profile',
  'admin-message': 'Notifications',
  'admin-course': 'All Tests',
  'admin-question-bank': 'Question Bank',
  'admin-quiz-attempts': 'Attempts',
  'admin-reviews': 'Reports',
  'admin-wishlist': 'Payments',
  'admin-users': 'Users',
  'admin-audit': 'Audit Logs',
  'admin-org': 'Organization',
  'admin-branding': 'Branding',
  'admin-sessions': 'Sessions',
  'admin-settings': 'Settings',
  exam: 'Exam',
  'exam-result': 'Result',
  'test-builder': 'Test Builder',
};

export default function DashboardBreadcrumb() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];

  if (parts.length > 1) {
    const segment = parts[1];
    const label = LABELS[segment] ?? segment.replace(/-/g, ' ');
    crumbs.push({ label, href: parts.length > 2 ? `/dashboard/${segment}` : undefined });
    if (parts.length > 2 && parts[0] === 'dashboard') {
      const sub = parts.slice(2).join(' / ');
      if (!['attempt'].includes(parts[2])) {
        crumbs.push({ label: LABELS[parts[2]] ?? sub });
      }
    }
  }

  return (
    <nav className="sca-db-breadcrumb" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={`${c.label}-${i}`} className="sca-db-breadcrumb__item">
          {i > 0 && <span className="sca-db-breadcrumb__sep">/</span>}
          {c.href && i < crumbs.length - 1 ? (
            <Link to={c.href}>{c.label}</Link>
          ) : (
            <span className={i === crumbs.length - 1 ? 'sca-db-breadcrumb__current' : undefined}>
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
