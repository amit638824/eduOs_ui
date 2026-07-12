import { useEffect, useMemo, useState } from 'react';
import {
  QuestionBankPanel,
  TestsListPanel,
  StudentTestsPanel,
  AttemptsListPanel,
  ResultsPanel,
  CreateTestPanel,
  ExamAttemptPage,
  ExamResultPage,
  ProfileSettingsApiForm,
} from '@/components/dashboard/examination/ExaminationPanels';
import {
  DashboardCounters,
  DashboardFeedbackTable,
  DashboardProfileContent,
  DashboardMessageContent,
  DashboardWishlistContent,
  DashboardAssignmentsContent,
  DashboardOrderHistoryContent,
  DashboardAnnouncementsContent,
  DashboardBecomeInstructorContent,
  DashboardSettingsContent,
} from '@/components/dashboard/content/DashboardContent';
import { feedbackRows } from '@/data/dashboardData';
import { useOrganization } from '@/hooks/useOrganization';
import { examinationService } from '@/services';
import type { OrgAnalytics } from '@/types/examination';

export function StudentDashboardHome() {
  const [stats, setStats] = useState<OrgAnalytics | null>(null);

  useEffect(() => {
    examinationService.getAnalyticsOverview().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <>
      <DashboardCounters
        title="Summary"
        counters={[
          { value: String(stats?.tests ?? '—'), label: 'Live Tests', icon: '/img/counter/counter__1.png' },
          { value: String(stats?.attempts ?? '—'), label: 'Total Attempts', icon: '/img/counter/counter__2.png' },
          { value: String(stats?.results ?? '—'), label: 'Results', icon: '/img/counter/counter__3.png' },
        ]}
      />
      <DashboardFeedbackTable title="Recent Test Feedbacks" rows={feedbackRows} />
    </>
  );
}

export function TeacherDashboardHome() {
  const [stats, setStats] = useState<OrgAnalytics | null>(null);

  useEffect(() => {
    examinationService.getAnalyticsOverview().then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <>
      <DashboardCounters
        title="Teacher Dashboard"
        counters={[
          { value: String(stats?.tests ?? '—'), label: 'Tests', icon: '/img/counter/counter__1.png' },
          { value: String(stats?.questions ?? '—'), label: 'Questions', icon: '/img/counter/counter__2.png' },
          { value: String(stats?.attempts ?? '—'), label: 'Attempts', icon: '/img/counter/counter__3.png' },
        ]}
      />
      <DashboardFeedbackTable title="Top Performing Tests" rows={feedbackRows} />
    </>
  );
}

export function AdminDashboardHome() {
  const { organization, branches, organizations, loading, error } = useOrganization();
  const [examStats, setExamStats] = useState<OrgAnalytics | null>(null);

  useEffect(() => {
    examinationService.getAnalyticsOverview().then(setExamStats).catch(() => setExamStats(null));
  }, []);

  const counters = useMemo(() => {
    if (examStats) {
      return [
        { value: String(examStats.students), label: 'Students', icon: '/img/counter/counter__1.png' },
        { value: String(examStats.tests), label: 'Tests', icon: '/img/counter/counter__2.png' },
        { value: String(examStats.questions), label: 'Questions', icon: '/img/counter/counter__3.png' },
        { value: String(examStats.attempts), label: 'Attempts', icon: '/img/counter/counter__4.png' },
      ];
    }
    if (organization) {
      return [
        { value: String(branches.length), label: 'Branches', icon: '/img/counter/counter__1.png' },
        { value: String(organizations.length || 1), label: 'Organizations', icon: '/img/counter/counter__2.png' },
        { value: organization.isActive ? 'Active' : 'Inactive', label: 'Org Status', icon: '/img/counter/counter__3.png' },
      ];
    }
    return [
      { value: '—', label: 'Students', icon: '/img/counter/counter__1.png' },
      { value: '—', label: 'Tests', icon: '/img/counter/counter__2.png' },
      { value: '—', label: 'Questions', icon: '/img/counter/counter__3.png' },
    ];
  }, [organization, branches.length, organizations.length, examStats]);

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
  DashboardWishlistContent,
  DashboardAssignmentsContent,
  DashboardOrderHistoryContent,
  DashboardAnnouncementsContent,
  DashboardBecomeInstructorContent,
  DashboardSettingsContent,
  QuestionBankPanel,
  TestsListPanel,
  StudentTestsPanel,
  AttemptsListPanel,
  ResultsPanel,
  CreateTestPanel,
  ExamAttemptPage,
  ExamResultPage,
  ProfileSettingsApiForm,
};
