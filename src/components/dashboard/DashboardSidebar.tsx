import { useMemo } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { siteContent } from '@/data/siteContent';
import type { DashboardNavSection, DashboardNavItem } from '@/types/dashboard';
import DashboardIcon from './DashboardIcon';

interface DashboardSidebarProps {
  sections: DashboardNavSection[];
  collapsed?: boolean;
  onLogout: () => void;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

function sectionKeyOf(section: DashboardNavSection, index: number): string {
  return section.id || section.title || `nav-${index}`;
}

export default function DashboardSidebar({
  sections,
  collapsed = false,
  onLogout,
  onNavigate,
  onToggleCollapse,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { brand } = siteContent;

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
    await onLogout();
    navigate('/login');
  };

  const { pinnedSection, mainSections } = useMemo(() => {
    const pinned = sections.find(
      (s) => s.id === 'pinned_bottom' || s.className?.includes('pinned'),
    );
    return {
      pinnedSection: pinned,
      mainSections: sections.filter((s) => s !== pinned),
    };
  }, [sections]);

  const renderNavItem = (item: DashboardNavItem) => {
    if (item.action === 'logout') {
      return (
        <li key={item.label}>
          <button
            type="button"
            className="sca-db-nav-item"
            title={collapsed ? item.label : undefined}
            onClick={handleLogout}
          >
            <DashboardIcon name={item.icon} />
            {!collapsed && <span className="sca-db-nav-item__label">{item.label}</span>}
          </button>
        </li>
      );
    }

    if (item.subItems && item.subItems.length > 0) {
      if (collapsed) {
        return item.subItems.map((sub) => (
          <li key={sub.href}>
            <NavLink
              to={sub.href}
              className={({ isActive }) =>
                `sca-db-nav-item${isActive ? ' sca-db-nav-item--active' : ''}`
              }
              end
              title={sub.label}
              onClick={onNavigate}
            >
              <DashboardIcon name={sub.icon || item.icon} />
            </NavLink>
          </li>
        ));
      }

      return (
        <li key={item.label} className="sca-db-sidebar__item-has-submenu">
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              `sca-db-nav-item${isActive ? ' sca-db-nav-item--active' : ''}`
            }
            end
            onClick={onNavigate}
          >
            <DashboardIcon name={item.icon} />
            <span className="sca-db-nav-item__label">{item.label}</span>
            {item.badge && (
              <span
                className={`sca-db-nav-item__badge${
                  item.badgeVariant ? ` sca-db-nav-item__badge--${item.badgeVariant}` : ''
                }`}
              >
                {item.badge}
              </span>
            )}
          </NavLink>
          <ul className="sca-db-sidebar__submenu">
            {item.subItems.map((sub) => (
              <li key={sub.href}>
                <NavLink
                  to={sub.href}
                  className={({ isActive }) =>
                    `sca-db-nav-subitem${isActive ? ' sca-db-nav-subitem--active' : ''}`
                  }
                  end
                  onClick={onNavigate}
                >
                  <span className="sca-db-nav-subitem__label">{sub.label}</span>
                  {sub.badge && (
                    <span
                      className={`sca-db-nav-item__badge${
                        sub.badgeVariant ? ` sca-db-nav-item__badge--${sub.badgeVariant}` : ''
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </li>
      );
    }

    return (
      <li key={item.href || item.label}>
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
          {!collapsed && <span className="sca-db-nav-item__label">{item.label}</span>}
          {!collapsed && item.badge && (
            <span
              className={`sca-db-nav-item__badge${
                item.badgeVariant ? ` sca-db-nav-item__badge--${item.badgeVariant}` : ''
              }`}
            >
              {item.badge}
            </span>
          )}
        </NavLink>
      </li>
    );
  };

  const renderSectionItems = (section: DashboardNavSection) => (
    <ul className="sca-db-sidebar__items-list">
      {section.items.map((item) => renderNavItem(item))}
    </ul>
  );

  return (
    <aside className="sca-db-sidebar" aria-label="Dashboard navigation">
      <div className={`sca-db-sidebar__brand${collapsed ? ' sca-db-sidebar__brand--collapsed' : ''}`}>
        {collapsed ? (
          <button
            type="button"
            className="sca-db-sidebar__rail-toggle-btn"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            title="Expand sidebar (Ctrl+B)"
          >
            <img
              src="/img/logo/mindsprint-app-icon.png"
              alt={brand.name}
              className="sca-db-sidebar__logo"
            />
          </button>
        ) : (
          <div className="sca-db-sidebar__brand-row">
            <Link
              to="/dashboard"
              className="sca-db-sidebar__brand-link"
              title={brand.name}
              onClick={onNavigate}
            >
              <img
                src="/img/logo/mindsprint-app-icon.png"
                alt={brand.name}
                className="sca-db-sidebar__logo"
              />
              <span className="sca-db-sidebar__brand-title">{brand.name}</span>
            </Link>
            {onToggleCollapse && (
              <button
                type="button"
                className="sca-db-sidebar__toggle-btn"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <FiMenu size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="sca-db-sidebar__nav">
        {mainSections.map((section, index) => {
          const sectionKey = sectionKeyOf(section, index);
          return (
            <div
              key={sectionKey}
              className={`sca-db-sidebar__group${
                section.className ? ` ${section.className}` : ''
              }`}
            >
              {section.title && !collapsed && (
                <div className="sca-db-sidebar__section-title">{section.title}</div>
              )}
              {renderSectionItems(section)}
            </div>
          );
        })}
      </nav>

      {pinnedSection && (
        <div className="sca-db-sidebar__pinned">
          <div className="sca-db-sidebar__group sca-db-sidebar__group--pinned">
            {renderSectionItems(pinnedSection)}
          </div>
        </div>
      )}
    </aside>
  );
}
