export type DashboardRole = 'student' | 'teacher' | 'admin';

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  action?: 'logout';
}

export interface DashboardNavSection {
  title?: string;
  className?: string;
  items: DashboardNavItem[];
}

export interface DashboardProfile {
  role: DashboardRole;
  name: string;
  greeting?: string;
  image: string;
  innerClass?: string;
  stats?: { icon: string; text: string }[];
  cta?: { label: string; href: string };
  showRating?: boolean;
}

export interface DashboardCounter {
  value: string;
  label: string;
  icon: string;
  suffix?: string;
}

export interface DashboardTableRow {
  name: string;
  enrolled: string;
  rating: number;
}
