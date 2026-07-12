import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AboutPage from '@/pages/AboutPage';
import ExamsPage from '@/pages/ExamsPage';
import ExamSlugPage from '@/pages/ExamSlugPage';
import PricingPage from '@/pages/PricingPage';
import SchoolsPage from '@/pages/SchoolsPage';
import HelpPage from '@/pages/HelpPage';
import PrivacyPage from '@/pages/PrivacyPage';
import BlogPage from '@/pages/BlogPage';
import BlogPostPage from '@/pages/BlogPostPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { dashboardRouteElements } from '@/pages/dashboard/dashboardRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/:slug" element={<ExamSlugPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/schools" element={<SchoolsPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              <Route path="/instructor" element={<Navigate to="/dashboard/become-a-teacher" replace />} />
              <Route path="/instructor-details" element={<Navigate to="/dashboard/become-a-teacher" replace />} />

              {dashboardRouteElements}

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
