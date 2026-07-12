import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardRole } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
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
  TeacherDashboardHome,
  AdminDashboardHome,
  DashboardProfileContent,
  DashboardAssignmentsContent,
  DashboardAnnouncementsContent,
  DashboardSettingsContent,
  DashboardBecomeInstructorContent,
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

function RoleAwareDash({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const role: DashboardRole = user?.roles.some((r) => r === 'org_admin' || r === 'super_admin')
    ? 'admin'
    : 'teacher';
  return dash(role, children);
}

export const dashboardRouteElements = (
  <>
    <Route path="/dashboard" element={<Navigate to="/dashboard/student-dashboard" replace />} />

    {/* Legacy instructor URLs → teacher */}
    <Route path="/dashboard/instructor-dashboard" element={<Navigate to="/dashboard/teacher-dashboard" replace />} />
    <Route path="/dashboard/instructor-profile" element={<Navigate to="/dashboard/teacher-profile" replace />} />
    <Route path="/dashboard/instructor-message" element={<Navigate to="/dashboard/teacher-message" replace />} />
    <Route path="/dashboard/instructor-course" element={<Navigate to="/dashboard/teacher-course" replace />} />
    <Route path="/dashboard/instructor-quiz-attempts" element={<Navigate to="/dashboard/teacher-quiz-attempts" replace />} />
    <Route path="/dashboard/instructor-assignments" element={<Navigate to="/dashboard/teacher-assignments" replace />} />
    <Route path="/dashboard/instructor-announcments" element={<Navigate to="/dashboard/teacher-announcments" replace />} />
    <Route path="/dashboard/instructor-reviews" element={<Navigate to="/dashboard/teacher-reviews" replace />} />
    <Route path="/dashboard/instructor-settings" element={<Navigate to="/dashboard/teacher-settings" replace />} />
    <Route path="/dashboard/instructor-wishlist" element={<Navigate to="/dashboard/teacher-reviews" replace />} />
    <Route path="/dashboard/instructor-my-quiz-attempts" element={<Navigate to="/dashboard/teacher-quiz-attempts" replace />} />
    <Route path="/dashboard/instructor-order-history" element={<Navigate to="/dashboard/teacher-reviews" replace />} />
    <Route path="/dashboard/instructor-enrolled-courses" element={<Navigate to="/dashboard/teacher-course" replace />} />
    <Route path="/dashboard/create-course" element={<Navigate to="/dashboard/create-test" replace />} />
    <Route path="/dashboard/become-an-instructor" element={<Navigate to="/dashboard/become-a-teacher" replace />} />

    {/* Student */}
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

    {/* Teacher */}
    <Route path="/dashboard/teacher-dashboard" element={dash('teacher', <TeacherDashboardHome />)} />
    <Route path="/dashboard/teacher-profile" element={dash('teacher', <DashboardProfileContent />)} />
    <Route path="/dashboard/teacher-message" element={dash('teacher', <NotificationsPanel />)} />
    <Route path="/dashboard/teacher-course" element={dash('teacher', <TestsListPanel title="My Tests" />)} />
    <Route path="/dashboard/teacher-quiz-attempts" element={dash('teacher', <AttemptsListPanel title="Test Attempts" />)} />
    <Route path="/dashboard/teacher-assignments" element={dash('teacher', <DashboardAssignmentsContent />)} />
    <Route path="/dashboard/teacher-announcments" element={dash('teacher', <DashboardAnnouncementsContent />)} />
    <Route path="/dashboard/teacher-reviews" element={dash('teacher', <ReportsPanel />)} />
    <Route path="/dashboard/teacher-settings" element={dash('teacher', <DashboardSettingsContent />)} />
    <Route path="/dashboard/create-test" element={dash('teacher', <CreateTestPanel />)} />
    <Route path="/dashboard/question-bank" element={dash('teacher', <QuestionBankPanel />)} />
    <Route path="/dashboard/become-a-teacher" element={dash('teacher', <DashboardBecomeInstructorContent />)} />

    <Route path="/dashboard/test-builder/:testId" element={<RoleAwareDash><TestBuilderPanel /></RoleAwareDash>} />

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
