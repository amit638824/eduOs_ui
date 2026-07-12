import { useEffect } from 'react';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

const SCRIPTS = [
  '/js/vendor/modernizr-3.5.0.min.js',
  '/js/vendor/jquery-3.6.0.min.js',
  '/js/popper.min.js',
  '/js/bootstrap.min.js',
  '/js/isotope.pkgd.min.js',
  '/js/slick.min.js',
  '/js/jquery.meanmenu.min.js',
  '/js/ajax-form.js',
  '/js/wow.min.js',
  '/js/jquery.scrollUp.min.js',
  '/js/imagesloaded.pkgd.min.js',
  '/js/jquery.magnific-popup.min.js',
  '/js/waypoints.min.js',
  '/js/jquery.counterup.min.js',
  '/js/plugins.js',
  '/js/swiper-bundle.min.js',
  '/js/main.js',
];

export function useEdurockScripts() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      for (const src of SCRIPTS) {
        if (cancelled) return;
        await loadScript(src);
      }
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);
}
