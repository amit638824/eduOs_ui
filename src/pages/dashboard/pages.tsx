import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import AdminExamGuide from '@/components/dashboard/AdminExamGuide';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
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
import type { OrgAnalytics, StudentStats } from '@/types/examination';

export function StudentDashboardHome() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .getMyStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

  return (
    <>
      <DashboardPageHeader
        badge="Student Portal"
        title="Dashboard"
        subtitle="Quick access to your tests, attempts, results and wallet."
      />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title">
          <h4>Quick Actions</h4>
        </div>
        <div className="edtp-quick-actions">
          <Link to="/dashboard/student-enrolled-courses" className="edtp-quick-action">
            <i className="icofont-book-alt" />
            My Tests
          </Link>
          <Link to="/dashboard/student-my-quiz-attempts" className="edtp-quick-action">
            <i className="icofont-ui-clock" />
            Attempts
          </Link>
          <Link to="/dashboard/student-reviews" className="edtp-quick-action">
            <i className="icofont-certificate-alt-1" />
            Results
          </Link>
          <Link to="/dashboard/student-wishlist" className="edtp-quick-action">
            <i className="icofont-wallet" />
            Wallet
          </Link>
          <Link to="/exams" className="edtp-quick-action">
            <i className="icofont-search" />
            Browse
          </Link>
        </div>
      </div>
      <DashboardCounters
        title="Summary"
        counters={[
          { value: String(stats?.assigned_tests ?? '—'), label: 'Assigned Tests', icon: '/img/counter/counter__1.png' },
          { value: String(stats?.in_progress ?? '—'), label: 'In Progress', icon: '/img/counter/counter__2.png' },
          { value: String(stats?.results ?? '—'), label: 'Results', icon: '/img/counter/counter__3.png' },
        ]}
      />
      <DashboardFeedbackTable title="Recent Test Feedbacks" rows={feedbackRows} />
    </>
  );
}

export function TeacherDashboardHome() {
  const [stats, setStats] = useState<OrgAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .getAnalyticsOverview()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

  return (
    <>
      <DashboardPageHeader
        badge="Teacher Portal"
        title="Dashboard"
        subtitle="Manage question bank, create tests and review student attempts."
      />
      <DashboardCounters
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
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setStatsLoading(true);
    examinationService
      .getAnalyticsOverview()
      .then(setExamStats)
      .catch(() => setExamStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useDashboardLoadingEffect(loading || statsLoading);

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
      <DashboardPageHeader
        badge="Admin Portal"
        title={organization ? organization.name : 'Admin Dashboard'}
        subtitle={
          organization
            ? `Managing ${organization.name} — students, teachers, exams and results stay org-scoped.`
            : 'Manage exams, users, payments and organization settings.'
        }
      />
      <AdminExamGuide />
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
