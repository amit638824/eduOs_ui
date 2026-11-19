import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Preloader from './Preloader';
import DarkModeSwitcher from './DarkModeSwitcher';
import Header from './Header';
import Footer from './Footer';
import { useAos } from '@/hooks/useAos';
import { useEdurockScripts } from '@/hooks/useEdurockScripts';

export default function Layout() {
  useAos();
  useEdurockScripts();
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  const isLoginPage = pathname === '/login';
  const isHomePage = pathname === '/';
  const isEdulebPage = !isDashboard;

  useEffect(() => {
    if (isDashboard) {
      document.body.classList.add('body__wrapper', 'dashboard-layout-active');
      document.body.classList.remove('eduleb-page', 'ms-home-active');
    } else if (isHomePage) {
      document.body.classList.remove('dashboard-layout-active', 'eduleb-page', 'body__wrapper');
      document.body.classList.add('ms-home-active');
      document.documentElement.classList.remove('is_dark');
    } else {
      document.body.classList.add('body__wrapper', 'eduleb-page');
      document.body.classList.remove('dashboard-layout-active', 'ms-home-active');
      document.documentElement.classList.remove('is_dark');
    }
    return () => {
      document.body.classList.remove('body__wrapper', 'dashboard-layout-active', 'eduleb-page', 'ms-home-active');
    };
  }, [isDashboard, isHomePage]);

  if (isHomePage) {
    return <Outlet />;
  }

  return (
    <>
      {isDashboard && <Preloader />}
      {isDashboard && <DarkModeSwitcher />}
      <main
        className={`main_wrapper wrapper${
          isDashboard ? ' main_wrapper--dashboard' : ''
        }${isEdulebPage ? ' eduleb-main' : ''}`}
      >
        {isEdulebPage && <Header />}
        <Outlet />
        {isEdulebPage && !isLoginPage && <Footer />}
      </main>
    </>
  );
}
