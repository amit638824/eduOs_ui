import { useState, useEffect, useMemo } from 'react';
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

function sectionKeyOf(section: DashboardNavSection, index: number): string {
  return section.id || section.title || `nav-${index}`;
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

  const isSectionActive = (section: DashboardNavSection): boolean =>
    section.items.some((item) => isItemActive(item));

  const getActiveCollapsibleSectionKey = (): string | null => {
    for (let i = 0; i < sections.length; i += 1) {
      const sec = sections[i];
      if (sec.collapsible && isSectionActive(sec)) {
        return sectionKeyOf(sec, i);
      }
    }
    return null;
  };

  const getDefaultExpandedKey = (): string | null => {
    const activeKey = getActiveCollapsibleSectionKey();
    if (activeKey) return activeKey;
    const idx = sections.findIndex((sec) => sec.collapsible && sec.defaultOpen);
    if (idx < 0) return null;
    return sectionKeyOf(sections[idx], idx);
  };

  // Single-accordion: at most ONE collapsible section expanded
  const [expandedSectionKey, setExpandedSectionKey] = useState<string | null>(
    () => getDefaultExpandedKey(),
  );

  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        if (item.subItems && item.subItems.length > 0) {
          initial[item.label] = isItemActive(item);
        }
      });
    });
    return initial;
  });

  // Route change → open the section that owns the active route (closes others)
  useEffect(() => {
    const activeKey = getActiveCollapsibleSectionKey();
    if (activeKey) {
      setExpandedSectionKey(activeKey);
    }

    setOpenSubmenus((prev) => {
      const next = { ...prev };
      let changed = false;
      sections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (item.subItems?.some((sub) => location.pathname === sub.href)) {
            if (!next[item.label]) {
              next[item.label] = true;
              changed = true;
            }
          }
        });
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to route
  }, [location.pathname]);

  const handleToggleSection = (key: string) => {
    // Opening a section replaces the previous one; clicking open section collapses it
    setExpandedSectionKey((prev) => (prev === key ? null : key));
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
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

  const renderSectionItems = (section: DashboardNavSection) => (
    <ul className="sca-db-sidebar__items-list">
      {section.items.map((item) => {
        const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
        const isSubOpen = openSubmenus[item.label] ?? false;

        if (hasSubItems) {
          return (
            <li key={item.label} className="sca-db-sidebar__item-has-submenu">
              <button
                type="button"
                className={`sca-db-nav-item sca-db-nav-item--parent${
                  isItemActive(item) ? ' sca-db-nav-item--ancestor-active' : ''
                }`}
                onClick={() => toggleSubmenu(item.label)}
                title={collapsed ? item.label : undefined}
                aria-expanded={isSubOpen}
              >
                <DashboardIcon name={item.icon} />
                <span className="sca-db-nav-item__label">{item.label}</span>
                {!collapsed && (
                  <svg
                    className={`sca-db-sidebar__sub-chevron${
                      isSubOpen ? ' sca-db-sidebar__sub-chevron--open' : ''
                    }`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

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
                            className={`sca-db-nav-item__badge${
                              sub.badgeVariant
                                ? ` sca-db-nav-item__badge--${sub.badgeVariant}`
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
      })}
    </ul>
  );

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
          {!collapsed && <span className="sca-db-sidebar__brand-title">{brand.name}</span>}
        </Link>
      </div>

      <nav className="sca-db-sidebar__nav">
        {mainSections.map((section, index) => {
          const sectionKey = sectionKeyOf(section, index);
          const isCollapsible = Boolean(section.collapsible && !collapsed);
          const isOpen = isCollapsible ? expandedSectionKey === sectionKey : true;
          const countBadge =
            section.countBadge ||
            (isCollapsible ? String(section.items.length) : undefined);

          return (
            <div
              key={sectionKey}
              className={`sca-db-sidebar__group${
                isCollapsible ? ' sca-db-sidebar__group--collapsible' : ''
              }${isOpen && isCollapsible ? ' is-open' : ''}${
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
                    onClick={() => handleToggleSection(sectionKey)}
                    aria-expanded={isOpen}
                  >
                    <span className="sca-db-sidebar__section-title-text">
                      {section.title}
                    </span>
                    <span className="sca-db-sidebar__section-meta">
                      {!isOpen && countBadge && (
                        <span className="sca-db-sidebar__count-badge">{countBadge}</span>
                      )}
                      <svg
                        className={`sca-db-sidebar__chevron${
                          isOpen ? ' sca-db-sidebar__chevron--open' : ''
                        }`}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>
                ) : (
                  <div className="sca-db-sidebar__section-title">{section.title}</div>
                )
              )}

              {(!isCollapsible || isOpen) && renderSectionItems(section)}
            </div>
          );
        })}
      </nav>

      {pinnedSection && (
        <div className="sca-db-sidebar__pinned">
          {renderSectionItems(pinnedSection)}
        </div>
      )}
    </aside>
  );
}
