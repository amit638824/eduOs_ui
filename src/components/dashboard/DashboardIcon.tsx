interface DashboardIconProps {
  name: string;
}

const icons: Record<string, string> = {
  home: 'icofont-home',
  user: 'icofont-user-alt-3',
  message: 'icofont-ui-message',
  bookmark: 'icofont-book-mark',
  star: 'icofont-star',
  quiz: 'icofont-question-circle',
  assignment: 'icofont-file-document',
  settings: 'icofont-settings',
  logout: 'icofont-logout',
  monitor: 'icofont-computer',
  announcement: 'icofont-megaphone',
  chat: 'icofont-speech-comments',
  cart: 'icofont-cart-alt',
  wallet: 'icofont-wallet',
  course: 'icofont-book-alt',
};

export default function DashboardIcon({ name }: DashboardIconProps) {
  return <i className={`dashboard-nav-icon ${icons[name] ?? icons.home}`} />;
}
