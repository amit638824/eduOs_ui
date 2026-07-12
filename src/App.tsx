import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AboutPage from '@/pages/AboutPage';
import ExamsPage from '@/pages/ExamsPage';
import PricingPage from '@/pages/PricingPage';
import SchoolsPage from '@/pages/SchoolsPage';
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
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/exams/*" element={<ExamsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/schools" element={<SchoolsPage />} />

              {dashboardRouteElements}

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
