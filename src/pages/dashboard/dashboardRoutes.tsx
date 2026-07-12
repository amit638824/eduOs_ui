import type { ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardRole } from '@/types/dashboard';
import {
  StudentDashboardHome,
  TeacherDashboardHome,
  AdminDashboardHome,
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
} from './pages';

function dash(role: DashboardRole, children: ReactNode) {
  return <DashboardLayout role={role}>{children}</DashboardLayout>;
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
    <Route path="/dashboard/student-message" element={dash('student', <DashboardMessageContent />)} />
    <Route path="/dashboard/student-enrolled-courses" element={dash('student', <DashboardCoursesContent title="My Tests" />)} />
    <Route path="/dashboard/student-wishlist" element={dash('student', <DashboardWishlistContent />)} />
    <Route path="/dashboard/student-reviews" element={dash('student', <DashboardReviewsContent />)} />
    <Route path="/dashboard/student-my-quiz-attempts" element={dash('student', <DashboardQuizAttemptsContent title="My Attempts" />)} />
    <Route path="/dashboard/student-assignments" element={dash('student', <DashboardAssignmentsContent />)} />
    <Route path="/dashboard/student-settings" element={dash('student', <DashboardSettingsContent />)} />

    {/* Teacher (API role: teacher) */}
    <Route path="/dashboard/teacher-dashboard" element={dash('teacher', <TeacherDashboardHome />)} />
    <Route path="/dashboard/teacher-profile" element={dash('teacher', <DashboardProfileContent />)} />
    <Route path="/dashboard/teacher-message" element={dash('teacher', <DashboardMessageContent />)} />
    <Route path="/dashboard/teacher-course" element={dash('teacher', <DashboardCoursesContent title="My Tests" showTabs />)} />
    <Route path="/dashboard/teacher-quiz-attempts" element={dash('teacher', <DashboardQuizAttemptsContent title="Test Attempts" />)} />
    <Route path="/dashboard/teacher-assignments" element={dash('teacher', <DashboardAssignmentsContent />)} />
    <Route path="/dashboard/teacher-announcments" element={dash('teacher', <DashboardAnnouncementsContent />)} />
    <Route path="/dashboard/teacher-reviews" element={dash('teacher', <DashboardReviewsContent />)} />
    <Route path="/dashboard/teacher-settings" element={dash('teacher', <DashboardSettingsContent />)} />
    <Route path="/dashboard/create-test" element={dash('teacher', <DashboardCreateCourseContent />)} />
    <Route path="/dashboard/become-a-teacher" element={dash('teacher', <DashboardBecomeInstructorContent />)} />

    {/* Admin (API roles: org_admin, super_admin, branch_admin) */}
    <Route path="/dashboard/admin-dashboard" element={dash('admin', <AdminDashboardHome />)} />
    <Route path="/dashboard/admin-profile" element={dash('admin', <DashboardProfileContent />)} />
    <Route path="/dashboard/admin-message" element={dash('admin', <DashboardMessageContent />)} />
    <Route path="/dashboard/admin-course" element={dash('admin', <DashboardCoursesContent title="All Tests" showTabs />)} />
    <Route path="/dashboard/admin-quiz-attempts" element={dash('admin', <DashboardQuizAttemptsContent title="All Attempts" />)} />
    <Route path="/dashboard/admin-reviews" element={dash('admin', <DashboardReviewsContent />)} />
    <Route path="/dashboard/admin-wishlist" element={dash('admin', <DashboardOrderHistoryContent />)} />
    <Route path="/dashboard/admin-settings" element={dash('admin', <DashboardSettingsContent />)} />
  </>
);
