import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { OrgScopeProvider } from '@/context/OrgScopeContext';

import Layout from '@/components/layout/Layout';

import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AboutPage from '@/pages/AboutPage';
import CoursePage from '@/pages/CoursePage';
import CourseDetailsPage from '@/pages/CourseDetailsPage';
import ContactPage from '@/pages/ContactPage';
import FaqPage from '@/pages/FaqPage';
import InstructorPage from '@/pages/InstructorPage';
import InstructorDetailsPage from '@/pages/InstructorDetailsPage';
import EdulebPricingPage from '@/pages/EdulebPricingPage';
import EdulebNotFoundPage from '@/pages/EdulebNotFoundPage';
import ExamsPage from '@/pages/ExamsPage';
import ExamSlugPage from '@/pages/ExamSlugPage';
import SchoolsPage from '@/pages/SchoolsPage';
import HelpPage from '@/pages/HelpPage';
import PrivacyPage from '@/pages/PrivacyPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';

import VerifyCertificatePage from '@/pages/VerifyCertificatePage';
import CertificatePage from '@/pages/CertificatePage';

import { dashboardRouteElements } from '@/pages/dashboard/dashboardRoutes';

import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrgScopeProvider>
          <BrowserRouter>
            <Routes>
              {/* Certificate page without normal website layout */}
              <Route
                path="/certificate/:studentName?"
                element={<CertificatePage />}
              />

              {/* Normal website pages */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />

                <Route path="/login" element={<LoginPage />} />

                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />

                <Route
                  path="/reset-password"
                  element={<ResetPasswordPage />}
                />

                <Route path="/register" element={<Navigate to="/login" replace />} />

                <Route path="/about" element={<AboutPage />} />
                <Route path="/course" element={<CoursePage />} />
                <Route path="/course-details" element={<CourseDetailsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/instructor-page" element={<InstructorPage />} />
                <Route
                  path="/instructor-details-page"
                  element={<InstructorDetailsPage />}
                />
                <Route path="/pricing" element={<EdulebPricingPage />} />
                <Route path="/not-found-demo" element={<EdulebNotFoundPage />} />

                <Route path="/exams" element={<ExamsPage />} />

                <Route
                  path="/exams/:slug"
                  element={<ExamSlugPage />}
                />

                <Route path="/schools" element={<SchoolsPage />} />

                <Route path="/help" element={<HelpPage />} />

                <Route path="/privacy" element={<PrivacyPage />} />

                <Route path="/blog" element={<BlogPage />} />

                <Route
                  path="/blog/:slug"
                  element={<BlogPostPage />}
                />

                {/* Certificate verification */}
                <Route
                  path="/verify-certificate"
                  element={<VerifyCertificatePage />}
                />

                {/* Instructor (dashboard redirects) */}
                <Route
                  path="/instructor"
                  element={
                    <Navigate
                      to="/dashboard/become-a-teacher"
                      replace
                    />
                  }
                />

                <Route
                  path="/instructor-details"
                  element={
                    <Navigate
                      to="/dashboard/become-a-teacher"
                      replace
                    />
                  }
                />

                {/* Dashboard */}
                {dashboardRouteElements}

                {/* 404 */}
                <Route
                  path="*"
                  element={<NotFoundPage />}
                />
              </Route>
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3200}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="light"
              toastClassName="sca-toast"
            />
          </BrowserRouter>
        </OrgScopeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

//.