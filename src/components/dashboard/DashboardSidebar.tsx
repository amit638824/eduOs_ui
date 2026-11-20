import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiChevronDown, FiMenu } from 'react-icons/fi';
import { siteContent } from '@/data/siteContent';
import type { DashboardNavSection, DashboardNavItem } from '@/types/dashboard';
import DashboardIcon from './DashboardIcon';

interface DashboardSidebarProps {
  sections: DashboardNavSection[];
  collapsed?: boolean;
  onLogout?: () => void;
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
  const { brand } = siteContent;
  const location = useLocation();

  const isItemActive = (item: DashboardNavItem, currentPath: string): boolean => {
    if (item.href === currentPath) return true;
    if (item.subItems?.some((sub) => sub.href === currentPath)) return true;
    if (
      item.href !== '/dashboard' &&
      item.href !== '/dashboard/admin-dashboard' &&
      item.href !== '/dashboard/teacher-dashboard' &&
      item.href !== '/dashboard/student-dashboard' &&
      currentPath.startsWith(item.href)
    ) {
      return true;
    }
    return false;
  };

  const sectionHasActive = (section: DashboardNavSection, currentPath: string): boolean => {
    return section.items.some((item) => isItemActive(item, currentPath));
  };

  // Track accordion expand/collapse state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec, idx) => {
      const key = sectionKeyOf(sec, idx);
      if (sec.collapsible) {
        initial[key] = sec.defaultOpen ?? false;
      } else {
        initial[key] = true;
      }
    });
    return initial;
  });

  // Automatically expand the section that contains the currently active route
  useEffect(() => {
    sections.forEach((sec, idx) => {
      if (sec.collapsible && sectionHasActive(sec, location.pathname)) {
        const key = sectionKeyOf(sec, idx);
        setOpenSections((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
      }
    });
  }, [location.pathname, sections]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderNavItem = (item: DashboardNavItem) => {
    if (item.action === 'logout') {
      return (
        <li key={item.label}>
          <button
            type="button"
            className="sca-db-nav-item"
            title={collapsed ? item.label : undefined}
            onClick={onLogout}
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
        {sections.map((section, index) => {
          const sectionKey = sectionKeyOf(section, index);
          const isCollapsible = Boolean(section.collapsible && section.title);
          const isOpen = isCollapsible ? Boolean(openSections[sectionKey]) : true;

          return (
            <div
              key={sectionKey}
              className={`sca-db-sidebar__group${
                isCollapsible ? ' sca-db-sidebar__group--collapsible' : ''
              }${isOpen ? ' is-open' : ''}${
                section.className ? ` ${section.className}` : ''
              }`}
            >
              {section.title && !collapsed && (
                isCollapsible ? (
                  <button
                    type="button"
                    className={`sca-db-sidebar__section-header${
                      isOpen ? ' sca-db-sidebar__section-header--open' : ''
                    }`}
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isOpen}
                    aria-controls={`section-panel-${sectionKey}`}
                    title={`${isOpen ? 'Collapse' : 'Expand'} ${section.title}`}
                  >
                    <span className="sca-db-sidebar__section-title-text">
                      {section.title}
                    </span>
                    <div className="sca-db-sidebar__section-meta">
                      {section.countBadge && (
                        <span className="sca-db-sidebar__count-badge">
                          {section.countBadge}
                        </span>
                      )}
                      <FiChevronDown
                        size={14}
                        className={`sca-db-sidebar__chevron${
                          isOpen ? ' sca-db-sidebar__chevron--open' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                ) : (
                  <div className="sca-db-sidebar__section-title-static">
                    {section.title}
                  </div>
                )
              )}

              <div
                id={`section-panel-${sectionKey}`}
                className={`sca-db-sidebar__panel${
                  isOpen || collapsed ? ' is-open' : ''
                }`}
                aria-hidden={!isOpen && !collapsed}
              >
                <div className="sca-db-sidebar__panel-inner">
                  {renderSectionItems(section)}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
