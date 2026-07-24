import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Preloader from './Preloader';
import DarkModeSwitcher from './DarkModeSwitcher';
import TopBar from './TopBar';
import Header from './Header';
import MobileMenu from './MobileMenu';
import ThemeShadow from './ThemeShadow';
import Footer from './Footer';
import { useAos } from '@/hooks/useAos';
import { useEdurockScripts } from '@/hooks/useEdurockScripts';

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function Layout() {
  useAos();
  useEdurockScripts();
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  const isAuthPage = AUTH_PATHS.includes(pathname);

  useEffect(() => {
    document.body.classList.add('body__wrapper');
    if (isDashboard) {
      document.body.classList.add('dashboard-layout-active');
    } else {
      document.body.classList.remove('dashboard-layout-active');
    }
    return () => {
      document.body.classList.remove('body__wrapper', 'dashboard-layout-active');
    };
  }, [isDashboard]);

  return (
    <>
      <Preloader />
      {!isDashboard && <DarkModeSwitcher />}
      <main className={`main_wrapper wrapper overflow-hidden${isDashboard ? ' main_wrapper--dashboard' : ''}`}>
        {!isDashboard && !isAuthPage && <TopBar />}
        {!isDashboard && <Header />}
        {!isDashboard && <MobileMenu />}
        {!isDashboard && <ThemeShadow />}
        <Outlet />
        {!isDashboard && !isAuthPage && <Footer />}
      </main>
    </>
  );
}
