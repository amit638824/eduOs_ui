import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Preloader from './Preloader';
import DarkModeSwitcher from './DarkModeSwitcher';
import { useAos } from '@/hooks/useAos';
import { useEdurockScripts } from '@/hooks/useEdurockScripts';

export default function Layout() {
  useAos();
  useEdurockScripts();

  useEffect(() => {
    document.body.classList.add('body__wrapper');
    return () => document.body.classList.remove('body__wrapper');
  }, []);

  return (
    <>
      <Preloader />
      <DarkModeSwitcher />
      <main className="main_wrapper overflow-hidden">
        <Outlet />
      </main>
    </>
  );
}
