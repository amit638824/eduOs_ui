import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/overrides.css';
import './styles/dashboard.css';
import './styles/modernAdminDashboard.css';
import './styles/landing-redesign.css';
import './styles/eduleb-landing.css';
import './styles/pagination.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
