import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/** Inner page title block — matches modern step/card layout */
export default function DashboardPageHeader({ badge, title, subtitle, actions }: DashboardPageHeaderProps) {
  return (
    <div className="sca-page-header">
      <div className="sca-page-header__text">
        {badge && <span className="sca-page-header__badge">{badge}</span>}
        <h1 className="sca-page-header__title">{title}</h1>
        {subtitle && <p className="sca-page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="sca-page-header__actions">{actions}</div>}
    </div>
  );
}
