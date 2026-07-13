import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardRole } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';
import Loader from '@/components/ui/Loader';
import {
  NotificationsPanel,
  PaymentsPanel,
  UsersManagementPanel,
  ReportsPanel,
  AuditLogPanel,
  SessionsSecurityPanel,
  OrgStructurePanel,
  TestBuilderPanel,
  BrandingSettingsPanel,
} from '@/components/dashboard/admin/PlatformPanels';
import {
  StudentDashboardHome,
  AdminDashboardHome,
  DashboardProfileContent,
  DashboardAssignmentsContent,
  DashboardSettingsContent,
  QuestionBankPanel,
  TestsListPanel,
  StudentTestsPanel,
  AttemptsListPanel,
  ResultsPanel,
  CreateTestPanel,
  ExamAttemptPage,
  ExamResultPage,
} from './pages';

function dash(role: DashboardRole, children: ReactNode) {
  return <DashboardLayout role={role}>{children}</DashboardLayout>;
}

function DashboardRootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultDashboardPath(user.roles)} replace />;
}

export const dashboardRouteElements = (
  <>
    <Route path="/dashboard" element={<DashboardRootRedirect />} />

    {/* Legacy instructor / teacher URLs → student experience */}
    <Route path="/dashboard/instructor-dashboard" element={<Navigate to="/dashboard/student-dashboard" replace />} />
    <Route path="/dashboard/instructor-profile" element={<Navigate to="/dashboard/student-profile" replace />} />
    <Route path="/dashboard/instructor-message" element={<Navigate to="/dashboard/student-message" replace />} />
    <Route path="/dashboard/instructor-course" element={<Navigate to="/dashboard/student-enrolled-courses" replace />} />
    <Route path="/dashboard/instructor-quiz-attempts" element={<Navigate to="/dashboard/student-my-quiz-attempts" replace />} />
    <Route path="/dashboard/instructor-assignments" element={<Navigate to="/dashboard/student-assignments" replace />} />
    <Route path="/dashboard/instructor-announcments" element={<Navigate to="/dashboard/student-dashboard" replace />} />
    <Route path="/dashboard/instructor-reviews" element={<Navigate to="/dashboard/student-reviews" replace />} />
    <Route path="/dashboard/instructor-settings" element={<Navigate to="/dashboard/student-settings" replace />} />
    <Route path="/dashboard/instructor-wishlist" element={<Navigate to="/dashboard/student-wishlist" replace />} />
    <Route path="/dashboard/instructor-my-quiz-attempts" element={<Navigate to="/dashboard/student-my-quiz-attempts" replace />} />
    <Route path="/dashboard/instructor-order-history" element={<Navigate to="/dashboard/student-reviews" replace />} />
    <Route path="/dashboard/instructor-enrolled-courses" element={<Navigate to="/dashboard/student-enrolled-courses" replace />} />
    <Route path="/dashboard/create-course" element={<Navigate to="/dashboard/admin-course" replace />} />
    <Route path="/dashboard/become-an-instructor" element={<Navigate to="/dashboard/student-dashboard" replace />} />

    <Route path="/dashboard/teacher-dashboard" element={<Navigate to="/dashboard/student-dashboard" replace />} />
    <Route path="/dashboard/teacher-profile" element={<Navigate to="/dashboard/student-profile" replace />} />
    <Route path="/dashboard/teacher-message" element={<Navigate to="/dashboard/student-message" replace />} />
    <Route path="/dashboard/teacher-course" element={<Navigate to="/dashboard/student-enrolled-courses" replace />} />
    <Route path="/dashboard/teacher-quiz-attempts" element={<Navigate to="/dashboard/student-my-quiz-attempts" replace />} />
    <Route path="/dashboard/teacher-assignments" element={<Navigate to="/dashboard/student-assignments" replace />} />
    <Route path="/dashboard/teacher-announcments" element={<Navigate to="/dashboard/student-dashboard" replace />} />
    <Route path="/dashboard/teacher-reviews" element={<Navigate to="/dashboard/student-reviews" replace />} />
    <Route path="/dashboard/teacher-settings" element={<Navigate to="/dashboard/student-settings" replace />} />
    <Route path="/dashboard/create-test" element={dash('admin', <CreateTestPanel />)} />
    <Route path="/dashboard/question-bank" element={<Navigate to="/dashboard/admin-question-bank" replace />} />
    <Route path="/dashboard/become-a-teacher" element={<Navigate to="/dashboard/student-dashboard" replace />} />

    {/* Student (also used by teachers) */}
    <Route path="/dashboard/student-dashboard" element={dash('student', <StudentDashboardHome />)} />
    <Route path="/dashboard/student-profile" element={dash('student', <DashboardProfileContent />)} />
    <Route path="/dashboard/student-message" element={dash('student', <NotificationsPanel />)} />
    <Route path="/dashboard/student-enrolled-courses" element={dash('student', <StudentTestsPanel />)} />
    <Route path="/dashboard/student-wishlist" element={dash('student', <PaymentsPanel allowTopUp />)} />
    <Route path="/dashboard/student-reviews" element={dash('student', <ResultsPanel />)} />
    <Route path="/dashboard/student-my-quiz-attempts" element={dash('student', <AttemptsListPanel title="My Attempts" />)} />
    <Route path="/dashboard/student-assignments" element={dash('student', <DashboardAssignmentsContent />)} />
    <Route path="/dashboard/student-settings" element={dash('student', <DashboardSettingsContent />)} />
    <Route path="/dashboard/exam/:testId/attempt/:attemptId" element={dash('student', <ExamAttemptPage />)} />
    <Route path="/dashboard/exam-result/:attemptId" element={dash('student', <ExamResultPage />)} />

    <Route path="/dashboard/test-builder/:testId" element={dash('admin', <TestBuilderPanel />)} />

    {/* Admin */}
    <Route path="/dashboard/admin-dashboard" element={dash('admin', <AdminDashboardHome />)} />
    <Route path="/dashboard/admin-profile" element={dash('admin', <DashboardProfileContent />)} />
    <Route path="/dashboard/admin-message" element={dash('admin', <NotificationsPanel />)} />
    <Route path="/dashboard/admin-course" element={dash('admin', <TestsListPanel title="All Tests" />)} />
    <Route path="/dashboard/admin-quiz-attempts" element={dash('admin', <AttemptsListPanel title="All Attempts" />)} />
    <Route path="/dashboard/admin-reviews" element={dash('admin', <ReportsPanel />)} />
    <Route path="/dashboard/admin-wishlist" element={dash('admin', <PaymentsPanel />)} />
    <Route path="/dashboard/admin-settings" element={dash('admin', <DashboardSettingsContent />)} />
    <Route path="/dashboard/admin-question-bank" element={dash('admin', <QuestionBankPanel />)} />
    <Route path="/dashboard/admin-users" element={dash('admin', <UsersManagementPanel />)} />
    <Route path="/dashboard/admin-audit" element={dash('admin', <AuditLogPanel />)} />
    <Route path="/dashboard/admin-org" element={dash('admin', <OrgStructurePanel />)} />
    <Route path="/dashboard/admin-branding" element={dash('admin', <BrandingSettingsPanel />)} />
    <Route path="/dashboard/admin-sessions" element={dash('admin', <SessionsSecurityPanel />)} />
  </>
);
