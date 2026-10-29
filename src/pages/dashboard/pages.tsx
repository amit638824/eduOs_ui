import StudentExamCalendar from '@/components/dashboard/examination/StudentExamCalendar';

import ModernAdminDashboard from '@/components/dashboard/admin/ModernAdminDashboard';
import { QuestionBankPanel, TestsListPanel,
  StudentTestsPanel,
  AttemptsListPanel,
  ResultsPanel,
  CreateTestPanel,
  ExamAttemptPage,
  ExamResultPage,
  ProfileSettingsApiForm,
} from '@/components/dashboard/examination/ExaminationPanels';
import { AiBuildPanel } from '@/components/dashboard/examination/AiBuildPanel';
import {
  DashboardProfileContent,
  DashboardMessageContent,
  DashboardWishlistContent,
  DashboardAssignmentsContent,
  DashboardOrderHistoryContent,
  DashboardAnnouncementsContent,
  DashboardBecomeInstructorContent,
  DashboardSettingsContent,
} from '@/components/dashboard/content/DashboardContent';
import { useOrganization } from '@/hooks/useOrganization';

export function StudentDashboardHome() {
  return <ModernAdminDashboard role="student" />;
}

export function TeacherDashboardHome() {
  return <ModernAdminDashboard role="teacher" />;
}

export function AdminDashboardHome() {
  const { error } = useOrganization();
  return <ModernAdminDashboard error={error} />;
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
  AiBuildPanel,
  ExamAttemptPage,
  ExamResultPage,
  ProfileSettingsApiForm,
  StudentExamCalendar,
};