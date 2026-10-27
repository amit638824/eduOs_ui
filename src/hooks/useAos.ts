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
      offset: 30,
      easing: 'ease-out-cubic',
      mirror: false,
      delay: 50,
      anchorPlacement: 'top-bottom',
    });

    const refresh = () => {
      try {
        AOS.refreshHard();
      } catch {
        AOS.refresh();
      }
    };

    // Staggered refreshes to catch DOM settling and image loads
    const t1 = window.setTimeout(refresh, 60);
    const t2 = window.setTimeout(refresh, 250);
    const t3 = window.setTimeout(refresh, 600);

    // Fail-safe: ensure nothing stays stuck invisible
    const fallbackTimer = window.setTimeout(() => {
      document.body.classList.add('aos-fallback');
      document.querySelectorAll('[data-aos]:not(.aos-animate)').forEach((el) => {
        el.classList.add('aos-animate');
      });
    }, 800);

    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      try {
        AOS.refreshHard();
      } catch {
        AOS.refresh();
      }
    };
    const t1 = window.setTimeout(refresh, 80);
    const t2 = window.setTimeout(refresh, 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);
}
