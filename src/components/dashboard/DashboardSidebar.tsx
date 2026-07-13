import { Link, NavLink, useNavigate } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import type { DashboardNavSection } from '@/types/dashboard';
import DashboardIcon from './DashboardIcon';

interface DashboardSidebarProps {
  sections: DashboardNavSection[];
  collapsed: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
}

export default function DashboardSidebar({
  sections,
  collapsed,
  onLogout,
  onNavigate,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { brand } = siteContent;

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <aside className="sca-db-sidebar" aria-label="Dashboard navigation">
      <div className="sca-db-sidebar__brand">
        <Link
          to="/dashboard"
          className="sca-db-sidebar__brand-link"
          title={brand.name}
          onClick={onNavigate}
        >
          <img src={brand.logo} alt={brand.name} className="sca-db-sidebar__logo" />
        </Link>
      </div>

      <nav className="sca-db-sidebar__nav">
        {sections.map((section, index) => (
          <div key={`nav-${index}`} className="sca-db-sidebar__group">
            {section.title && !collapsed && (
              <div className="sca-db-sidebar__section-title">{section.title}</div>
            )}
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  {item.action === 'logout' ? (
                    <button
                      type="button"
                      className="sca-db-nav-item"
                      title={collapsed ? item.label : undefined}
                      onClick={handleLogout}
                    >
                      <DashboardIcon name={item.icon} />
                      <span className="sca-db-nav-item__label">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        `sca-db-nav-item${isActive ? ' sca-db-nav-item--active' : ''}`
                      }
                      end
                      title={collapsed ? item.label : undefined}
                      onClick={onNavigate}
                    >
                      <DashboardIcon name={item.icon} />
                      <span className="sca-db-nav-item__label">{item.label}</span>
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
