import { NavLink, useNavigate } from 'react-router-dom';
import type { DashboardNavSection } from '@/types/dashboard';
import DashboardIcon from './DashboardIcon';

interface DashboardSidebarProps {
  sections: DashboardNavSection[];
  onLogout: () => void;
}

export default function DashboardSidebar({ sections, onLogout }: DashboardSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard__inner sticky-top">
      {sections.map((section, index) => (
        <div key={`${section.title}-${index}`}>
          {section.title && (
            <div className={`dashboard__nav__title ${section.className ?? ''}`.trim()}>
              <h6>{section.title}</h6>
            </div>
          )}
          <div className="dashboard__nav">
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  {item.action === 'logout' ? (
                    <button type="button" className="dashboard-nav-logout" onClick={handleLogout}>
                      <DashboardIcon name={item.icon} />
                      {item.label}
                    </button>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) => (isActive ? 'active' : undefined)}
                      end
                    >
                      <DashboardIcon name={item.icon} />
                      {item.label}
                    </NavLink>
                  )}
                  {item.badge && <span className="dashboard__label">{item.badge}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
