import type { ComponentType } from 'react';
import type { IconBaseProps } from 'react-icons';
import {
  FiHome,
  FiLayers,
  FiFolder,
  FiUserCheck,
  FiUsers,
  FiFileText,
  FiCheckSquare,
  FiHelpCircle,
  FiPlusCircle,
  FiBookOpen,
  FiClock,
  FiAlertTriangle,
  FiBarChart2,
  FiAward,
  FiCreditCard,
  FiActivity,
  FiSettings,
  FiUser,
  FiBell,
  FiCalendar,
  FiLogOut,
  FiBookmark,
  FiStar,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

interface DashboardIconProps {
  name: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, ComponentType<IconBaseProps>> = {
  // Navigation & Core
  home: FiHome,
  dashboard: FiHome,

  // Organization & Admin
  shield: FiLayers,
  organization: FiLayers,
  organizations: FiLayers,
  course: FiFolder,
  department: FiFolder,
  departments: FiFolder,

  // Users & Roles
  user: FiUser,
  profile: FiUser,
  users: FiUsers,
  students: FiUsers,
  student: FiUsers,
  teachers: FiUserCheck,
  teacher: FiUserCheck,
  faculty: FiUserCheck,

  // Exams & Tests
  monitor: FiCheckSquare,
  tests: FiCheckSquare,
  test: FiCheckSquare,
  exam: FiCheckSquare,
  exams: FiCheckSquare,
  quiz: FiHelpCircle,
  'question-bank': FiHelpCircle,
  plus: FiPlusCircle,
  'create-test': FiPlusCircle,
  spark: HiSparkles,
  ai: HiSparkles,
  assignment: FiBookOpen,
  assignments: FiBookOpen,

  // Monitoring, Analytics & Logs
  clock: FiClock,
  attempts: FiClock,
  flag: FiAlertTriangle,
  flagged: FiAlertTriangle,
  chart: FiBarChart2,
  reports: FiBarChart2,
  results: FiBarChart2,
  certificate: FiAward,
  certificates: FiAward,
  cart: FiCreditCard,
  payments: FiCreditCard,
  audit: FiFileText,
  'audit-logs': FiFileText,
  sessions: FiActivity,

  // Preferences & Communication
  settings: FiSettings,
  message: FiBell,
  notifications: FiBell,
  calendar: FiCalendar,
  logout: FiLogOut,
  bookmark: FiBookmark,
  star: FiStar,
};

export default function DashboardIcon({ name, className, size = 18 }: DashboardIconProps) {
  const IconComp = iconMap[name.toLowerCase()] || FiHome;
  const combinedClass = ['dashboard-nav-icon', className].filter(Boolean).join(' ');
  return <IconComp className={combinedClass} size={size} aria-hidden="true" />;
}
