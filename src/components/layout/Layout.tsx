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
  /* Marketing + auth pages share Eduleb chrome (header/footer + styles) */
  const isEdulebPage = !isDashboard;

  useEffect(() => {
    document.body.classList.add('body__wrapper');
    if (isDashboard) {
      document.body.classList.add('dashboard-layout-active');
      document.body.classList.remove('eduleb-page', 'aos-fallback');
    } else {
      document.body.classList.remove('dashboard-layout-active');
      document.body.classList.add('eduleb-page');
      document.documentElement.classList.remove('is_dark');
      window.setTimeout(() => document.body.classList.add('aos-fallback'), 1400);
    }
    return () => {
      document.body.classList.remove('body__wrapper', 'dashboard-layout-active', 'eduleb-page');
    };
  }, [isDashboard]);

  return (
    <>
      {isDashboard && <Preloader />}
      {isDashboard && <DarkModeSwitcher />}
      <main
        className={`main_wrapper wrapper${isEdulebPage ? '' : ' overflow-hidden'}${
          isDashboard ? ' main_wrapper--dashboard' : ''
        }${isEdulebPage ? ' eduleb-main' : ''}`}
      >
        {isEdulebPage && <Header />}
        <Outlet />
        {isEdulebPage && <Footer />}
      </main>
    </>
  );
}
