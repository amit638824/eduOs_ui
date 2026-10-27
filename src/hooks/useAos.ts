import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function useAos() {
  const { pathname } = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      offset: 60,
      easing: 'ease-out-cubic',
      mirror: false,
    });

    const refresh = () => {
      try {
        AOS.refreshHard();
      } catch {
        AOS.refresh();
      }
    };

    const t1 = window.setTimeout(refresh, 80);
    const t2 = window.setTimeout(refresh, 500);
    // After animations have had time to fire, force-visible any leftovers
    const fallback = window.setTimeout(() => {
      document.body.classList.add('aos-fallback');
    }, 1400);

    window.addEventListener('load', refresh);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(fallback);
      window.removeEventListener('load', refresh);
    };
  }, []);

  useEffect(() => {
    document.body.classList.remove('aos-fallback');
    const refreshId = window.setTimeout(() => AOS.refreshHard(), 60);
    const fallbackId = window.setTimeout(() => {
      document.body.classList.add('aos-fallback');
    }, 1400);
    return () => {
      window.clearTimeout(refreshId);
      window.clearTimeout(fallbackId);
    };
  }, [pathname]);
}
