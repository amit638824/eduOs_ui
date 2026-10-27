import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import 'aos/dist/aos.css';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function arm(el: HTMLElement, show: boolean) {
  el.classList.add('aos-init');
  if (!show) return;
  const delay = el.getAttribute('data-aos-delay');
  el.style.transitionDelay = delay ? `${delay}ms` : '0ms';
  el.classList.add('aos-animate');
}

function syncAos() {
  const nodes = document.querySelectorAll<HTMLElement>('[data-aos]');
  if (prefersReducedMotion()) {
    nodes.forEach((el) => el.classList.add('aos-animate'));
    return;
  }

  const limit = window.innerHeight * 0.96;
  nodes.forEach((el) => {
    if (el.classList.contains('aos-animate')) return;
    const rect = el.getBoundingClientRect();
    const inView = rect.top < limit && rect.bottom > 40;
    arm(el, inView);
  });
}

export function useAos() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    document.body.classList.remove('aos-fallback');
    syncAos();
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const pending = () =>
      document.querySelectorAll<HTMLElement>('[data-aos]:not(.aos-animate)');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          arm(entry.target as HTMLElement, true);
          io.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );

    const observe = () => {
      syncAos();
      pending().forEach((el) => io.observe(el));
    };

    observe();
    const t1 = window.setTimeout(observe, 250);
    const t2 = window.setTimeout(observe, 800);
    window.addEventListener('load', observe);

    return () => {
      io.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('load', observe);
    };
  }, [pathname]);
}
