import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import type { DashboardNavSection, DashboardNavItem } from '@/types/dashboard';
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
  const location = useLocation();
  const { brand } = siteContent;

  const handleLogout = async () => {
    if (onNavigate) onNavigate();
    await onLogout();
    navigate('/login');
  };

  const isItemActive = (item: DashboardNavItem): boolean => {
    if (location.pathname === item.href) return true;
    if (item.subItems?.some((sub) => location.pathname === sub.href)) return true;
    return false;
  };

  const isSectionActive = (section: DashboardNavSection): boolean => {
    return section.items.some((item) => isItemActive(item));
  };

  // Find which collapsible section holds the currently active route
  const getActiveCollapsibleSectionKey = (): string | null => {
    for (const sec of sections) {
      if (sec.collapsible && isSectionActive(sec)) {
        return sec.id || sec.title || null;
      }
    }
    return null;
  };

  // True single-accordion state: at most ONE collapsible section is expanded at a time
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | null>(() => {
    const activeKey = getActiveCollapsibleSectionKey();
    if (activeKey) return activeKey;
    const defaultSec = sections.find((sec) => sec.collapsible && sec.defaultOpen);
    return defaultSec ? defaultSec.id || defaultSec.title || null : null;
  });

  // Track expanded/collapsed state for nested submenus (e.g. Attempts)
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.subItems && item.subItems.length > 0) {
          initial[item.label] = isItemActive(item) || true;
        }
      });
    });
    return initial;
  });

  // When route changes, auto-expand the section containing the active route and collapse all others
  useEffect(() => {
    const activeKey = getActiveCollapsibleSectionKey();
    if (activeKey) {
      setExpandedSectionKey(activeKey);
    }
    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.subItems?.some((sub) => location.pathname === sub.href)) {
          setOpenSubmenus((prev) => ({ ...prev, [item.label]: true }));
        }
      });
    });
  }, [location.pathname, sections]);

  // Single accordion toggle: opening one closes all other collapsible sections
  const handleToggleSection = (key: string) => {
    setExpandedSectionKey((prev) => (prev === key ? null : key));
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Separate pinned bottom section from main scrollable sections for guaranteed visibility
  const pinnedSection = sections.find(
    (s) => s.id === 'pinned_bottom' || s.className?.includes('pinned')
  );
  const mainSections = sections.filter((s) => s !== pinnedSection);

  const renderSectionItems = (section: DashboardNavSection) => {
    return (
      <ul className="sca-db-sidebar__items-list">
        {section.items.map((item) => {
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isSubOpen = openSubmenus[item.label] ?? false;

          if (hasSubItems) {
            return (
              <li key={item.label} className="sca-db-sidebar__item-has-submenu">
                <button
                  type="button"
                  className={`sca-db-nav-item sca-db-nav-item--parent ${
                    isItemActive(item) ? 'sca-db-nav-item--ancestor-active' : ''
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                  title={collapsed ? item.label : undefined}
                  aria-expanded={isSubOpen}
                >
                  <DashboardIcon name={item.icon} />
                  <span className="sca-db-nav-item__label">{item.label}</span>
                  {!collapsed && (
                    <svg
                      className={`sca-db-sidebar__sub-chevron ${isSubOpen ? 'sca-db-sidebar__sub-chevron--open' : ''}`}
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                {/* Nested Submenu */}
                {!collapsed && isSubOpen && (
                  <ul className="sca-db-sidebar__submenu">
                    {item.subItems!.map((sub) => (
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
                              className={`sca-db-nav-item__badge ${
                                sub.badgeVariant
                                  ? `sca-db-nav-item__badge--${sub.badgeVariant}`
                                  : ''
                              }`}
                            >
                              {sub.badge}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

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
                  <span className="sca-db-nav-item__label">{item.label}</span>
                </button>
              </li>
            );
          }

          return (
            <li key={item.href}>
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
                {!collapsed && item.badge && (
                  <span
                    className={`sca-db-nav-item__badge ${
                      item.badgeVariant
                        ? `sca-db-nav-item__badge--${item.badgeVariant}`
                        : ''
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <aside className="sca-db-sidebar" aria-label="Dashboard navigation">
      {/* 1. Brand Logo & Title */}
      <div className="sca-db-sidebar__brand">
        <Link
          to="/dashboard"
          className="sca-db-sidebar__brand-link"
          title={brand.name}
          onClick={onNavigate}
        >
          <img src={brand.logo} alt={brand.name} className="sca-db-sidebar__logo" />
          {!collapsed && <span className="sca-db-sidebar__brand-title">{brand.name}</span>}
        </Link>
      </div>

      {/* 2. Scrollable Middle Navigation */}
      <nav className="sca-db-sidebar__nav">
        {mainSections.map((section, index) => {
          const sectionKey = section.id || section.title || `nav-${index}`;
          const isCollapsible = Boolean(section.collapsible && !collapsed);
          const isOpen = isCollapsible ? expandedSectionKey === sectionKey : true;

          return (
            <div
              key={sectionKey}
              className={`sca-db-sidebar__group ${section.className || ''}`}
            >
              {section.title && !collapsed && (
                isCollapsible ? (
                  <button
                    type="button"
                    className="sca-db-sidebar__section-header"
                    onClick={() => handleToggleSection(sectionKey)}
                    aria-expanded={isOpen}
                  >
                    <span className="sca-db-sidebar__section-title-text">{section.title}</span>
                    <div className="sca-db-sidebar__section-meta">
                      {!isOpen && section.countBadge && (
                        <span className="sca-db-sidebar__count-badge">{section.countBadge}</span>
                      )}
                      <svg
                        className={`sca-db-sidebar__chevron ${isOpen ? 'sca-db-sidebar__chevron--open' : ''}`}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>
                ) : (
                  <div className="sca-db-sidebar__section-title">{section.title}</div>
                )
              )}

              {/* Items List (only rendered/visible when section is open or non-collapsible) */}
              {(!isCollapsible || isOpen) && renderSectionItems(section)}
            </div>
          );
        })}
      </nav>

      {/* 3. Pinned Bottom Section (Always visible and anchored at bottom) */}
      {pinnedSection && (
        <div className="sca-db-sidebar__pinned">
          {pinnedSection.title && !collapsed && (
            <div className="sca-db-sidebar__section-title sca-db-sidebar__section-title--pinned">
              {pinnedSection.title}
            </div>
          )}
          {renderSectionItems(pinnedSection)}
        </div>
      )}
    </aside>
  );
}
