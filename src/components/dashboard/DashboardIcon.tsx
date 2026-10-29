import type { ReactNode } from 'react';

interface DashboardIconProps {
  name: string;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="dashboard-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="18"
      height="18"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const paths: Record<string, ReactNode> = {
  home: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.5c1.4-3 3.8-4.5 7-4.5s5.6 1.5 7 4.5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="2.6" />
      <path d="M3.5 18.5c1-2.4 2.8-3.6 5.5-3.6s4.5 1.2 5.5 3.6" />
      <circle cx="16.5" cy="9" r="2.2" />
      <path d="M16 14.2c2.2.2 3.8 1.3 4.6 3.3" />
    </>
  ),
  message: (
    <>
      <path d="M5 6.5h14v9H8l-3 2.5V6.5z" />
    </>
  ),
  bookmark: (
    <>
      <path d="M7 4.5h10v15l-5-3-5 3v-15z" />
    </>
  ),
  star: (
    <>
      <path d="m12 4 2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 14.8 7.8 17l.8-4.7L5.2 9l4.7-.7L12 4z" />
    </>
  ),
  quiz: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.1.8-1.1 1.5" />
      <path d="M12 16.5h.01" />
    </>
  ),
  certificate: (
    <>
      <circle cx="12" cy="9" r="4.5" />
      <path d="m9.2 12.8-1.2 6.2L12 16.8l4 2.2-1.2-6.2" />
    </>
  ),
  assignment: (
    <>
      <path d="M8 4.5h6l3 3V19.5H7v-15h1z" />
      <path d="M14 4.5V8h3.5" />
      <path d="M9.5 12.5h5M9.5 15.5h5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" />
      <path d="M13 8.5 16.5 12 13 15.5" />
      <path d="M16 12H9" />
    </>
  ),
  monitor: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.5" />
      <path d="M9 19.5h6M12 16v3.5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 6v12M6 12h12" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5 13.4 8.6 18.5 10 13.4 11.4 12 16.5 10.6 11.4 5.5 10 10.6 8.6 12 3.5z" />
      <path d="M18 15.5 18.6 17.4 20.5 18 18.6 18.6 18 20.5 17.4 18.6 15.5 18 17.4 17.4 18 15.5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6.5v5.2c0 4-2.8 6.8-7 8.3-4.2-1.5-7-4.3-7-8.3V6.5L12 3.5z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14" rx="1.5" />
      <path d="M8 3.5v4M16 3.5v4M4 10h16" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="19" r="1.2" />
      <circle cx="17" cy="19" r="1.2" />
      <path d="M4 5h2l1.6 9h10.2l1.6-6.5H7" />
    </>
  ),
  course: (
    <>
      <path d="M4 7.5 12 4l8 3.5L12 11 4 7.5z" />
      <path d="M8 9.5v4.2c0 .8 1.8 2.3 4 2.3s4-1.5 4-2.3V9.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19h16" />
      <path d="M7 16V10" />
      <path d="M12 16V6" />
      <path d="M17 16v-4" />
    </>
  ),
  flag: (
    <>
      <path d="M6 4.5v15" />
      <path d="M6 5.5h9.5l-1.8 3.2 1.8 3.3H6" />
    </>
  ),
};

export default function DashboardIcon({ name }: DashboardIconProps) {
  return <Icon>{paths[name] ?? paths.home}</Icon>;
}
