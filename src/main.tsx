import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/overrides.css';
import './styles/dashboard.css';
import './styles/modernAdminDashboard.css';
import './styles/landing-redesign.css';
import './styles/eduleb-landing.css';
import './styles/pagination.css';

// Global handler: clicking anywhere in date/datetime input opens native date select picker
if (typeof window !== 'undefined') {
  window.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement &&
        (target.type === 'date' || target.type === 'datetime-local' || target.type === 'time')
      ) {
        try {
          target.showPicker?.();
        } catch {
          // ignore if showPicker is unsupported or already open
        }
      }
    },
    true,
  );

  window.addEventListener(
    'keydown',
    (e) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement &&
        (target.type === 'date' || target.type === 'datetime-local')
      ) {
        if (e.key !== 'Tab' && e.key !== 'Escape' && e.key !== 'Enter') {
          e.preventDefault();
          try {
            target.showPicker?.();
          } catch {}
        }
      }
    },
    true,
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
