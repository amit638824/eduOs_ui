import { useMemo } from 'react';
import {
  DashboardCounters,
  DashboardFeedbackTable,
  DashboardProfileContent,
  DashboardMessageContent,
  DashboardCoursesContent,
  DashboardWishlistContent,
  DashboardQuizAttemptsContent,
  DashboardAssignmentsContent,
  DashboardReviewsContent,
  DashboardOrderHistoryContent,
  DashboardAnnouncementsContent,
  DashboardSettingsContent,
  DashboardCreateCourseContent,
  DashboardBecomeInstructorContent,
} from '@/components/dashboard/content/DashboardContent';
import { feedbackRows } from '@/data/dashboardData';
import { useOrganization } from '@/hooks/useOrganization';

export function StudentDashboardHome() {
  return (
    <>
      <DashboardCounters
        title="Summary"
        counters={[
          { value: '12', suffix: '+', label: 'Enrolled Tests', icon: '/img/counter/counter__1.png' },
          { value: '08', suffix: '+', label: 'Active Tests', icon: '/img/counter/counter__2.png' },
          { value: '05', label: 'Completed Tests', icon: '/img/counter/counter__3.png' },
        ]}
      />
      <DashboardFeedbackTable title="Recent Test Feedbacks" rows={feedbackRows} />
    </>
  );
}

export function TeacherDashboardHome() {
  return (
    <>
      <DashboardCounters
        title="Teacher Dashboard"
        counters={[
          { value: '18', suffix: '+', label: 'Tests Created', icon: '/img/counter/counter__1.png' },
          { value: '2.4k', suffix: '+', label: 'Total Students', icon: '/img/counter/counter__2.png' },
          { value: '4.8', label: 'Avg Rating', icon: '/img/counter/counter__3.png' },
        ]}
      />
      <DashboardFeedbackTable title="Top Performing Tests" rows={feedbackRows} />
    </>
  );
}

export function AdminDashboardHome() {
  const { organization, branches, organizations, loading, error } = useOrganization();

  const counters = useMemo(() => {
    if (organization) {
      return [
        {
          value: String(branches.length),
          label: 'Branches',
          icon: '/img/counter/counter__1.png',
        },
        {
          value: String(organizations.length || 1),
          label: 'Organizations',
          icon: '/img/counter/counter__2.png',
        },
        {
          value: organization.isActive ? 'Active' : 'Inactive',
          label: 'Org Status',
          icon: '/img/counter/counter__3.png',
        },
      ];
    }
    return [
      { value: '—', label: 'Branches', icon: '/img/counter/counter__1.png' },
      { value: '—', label: 'Organizations', icon: '/img/counter/counter__2.png' },
      { value: '—', label: 'Org Status', icon: '/img/counter/counter__3.png' },
    ];
  }, [organization, branches.length, organizations.length]);

  const tableRows = useMemo(() => {
    if (branches.length) {
      return branches.map((branch) => ({
        name: branch.name,
        enrolled: branch.code ?? '—',
        rating: branch.isActive ? 5 : 3,
      }));
    }
    return feedbackRows;
  }, [branches]);

  return (
    <>
      {error && (
        <div className="dashboard__content__wraper sp_bottom_20">
          <p className="login__error">{error}</p>
        </div>
      )}
      <DashboardCounters
        title={organization ? `${organization.name} Overview` : loading ? 'Loading...' : 'Admin Overview'}
        counters={counters}
      />
      <DashboardFeedbackTable
        title={branches.length ? 'Branch List' : 'Platform Analytics'}
        rows={tableRows}
      />
    </>
  );
}

export {
  DashboardProfileContent,
  DashboardMessageContent,
  DashboardCoursesContent,
  DashboardWishlistContent,
  DashboardQuizAttemptsContent,
  DashboardAssignmentsContent,
  DashboardReviewsContent,
  DashboardOrderHistoryContent,
  DashboardAnnouncementsContent,
  DashboardSettingsContent,
  DashboardCreateCourseContent,
  DashboardBecomeInstructorContent,
};
