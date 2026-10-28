interface DashboardIconProps {
  name: string;
}

const icons: Record<string, string> = {
  home: 'icofont-home',
  user: 'icofont-user-alt-3',
  users: 'icofont-users-alt-5',
  message: 'icofont-ui-message',
  notification: 'icofont-notification',
  bookmark: 'icofont-book-mark',
  star: 'icofont-star',
  quiz: 'icofont-question-circle',
  certificate: 'icofont-certificate-alt-1',
  assignment: 'icofont-file-document',
  settings: 'icofont-settings',
  logout: 'icofont-logout',
  monitor: 'icofont-computer',
  announcement: 'icofont-megaphone',
  chat: 'icofont-speech-comments',
  cart: 'icofont-cart-alt',
  wallet: 'icofont-wallet',
  course: 'icofont-book-alt',
  plus: 'icofont-plus',
  spark: 'icofont-magic-alt',
  shield: 'icofont-shield-alt',
  clock: 'icofont-clock-time',
  building: 'icofont-building',
  calendar: 'icofont-calendar',
};

export default function DashboardIcon({ name }: DashboardIconProps) {
  return <i className={`dashboard-nav-icon ${icons[name] ?? icons.home}`} />;
}
