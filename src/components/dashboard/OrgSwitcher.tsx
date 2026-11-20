import { useEffect, useId, useRef, useState } from 'react';
import { useOrgScope } from '@/context/OrgScopeContext';
import { useOrganization } from '@/hooks/useOrganization';

/** Superadmin-only org switcher — scopes Users / Exams / Results to selected org */
export default function OrgSwitcher() {
  const {
    isSuperAdmin,
    organizations,
    selectedOrgId,
    selectedOrg,
    setSelectedOrgId,
    loading,
  } = useOrgScope();
  const { organization: directOrg } = useOrganization();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const value =
    selectedOrgId && organizations.some((o) => o.id === selectedOrgId)
      ? selectedOrgId
      : organizations[0]?.id ?? '';

  const currentName =
    organizations.find((o) => o.id === value)?.name ??
    (loading ? 'Loading…' : 'No organizations');

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!isSuperAdmin || loading || organizations.length === 0) return;
    if (selectedOrgId && organizations.some((o) => o.id === selectedOrgId)) return;
    setSelectedOrgId(organizations[0].id);
  }, [isSuperAdmin, loading, organizations, selectedOrgId, setSelectedOrgId]);

  if (!isSuperAdmin) {
    const nonAdminOrgName = directOrg?.name || (currentName !== 'No organizations' ? currentName : null);
    if (!nonAdminOrgName || nonAdminOrgName === 'Loading…') return null;

    return (
      <div className="sca-db-org-switcher sca-db-org-switcher--readonly" title={nonAdminOrgName}>
        <span className="sca-db-org-switcher__icon" aria-hidden>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="2" width="14" height="16" rx="2" />
            <path d="M7 6h2M11 6h2M7 10h2M11 10h2M7 14h2M11 14h2" />
          </svg>
        </span>
        <div className="sca-db-org-switcher__text">
          <span className="sca-db-org-switcher__label">Organization</span>
          <span className="sca-db-org-switcher__name">{nonAdminOrgName}</span>
        </div>
        <span className="sca-db-org-switcher__status is-active">
          <span className="sca-db-org-switcher__status-dot" />
          Active
        </span>
      </div>
    );
  }

  const disabled = loading && organizations.length === 0;

  return (
    <div
      ref={rootRef}
      className={`sca-db-org-switcher-wrap${open ? ' is-open' : ''}`}
    >
      <button
        type="button"
        id="sca-org-scope-select"
        className={`sca-db-org-switcher${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        title={currentName}
      >
        <span className="sca-db-org-switcher__icon" aria-hidden>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <rect x="3" y="2" width="14" height="16" rx="2" />
            <path d="M7 6h2M11 6h2M7 10h2M11 10h2M7 14h2M11 14h2" />
          </svg>
        </span>

        <div className="sca-db-org-switcher__text">
          <span className="sca-db-org-switcher__label">Organization</span>
          <span className="sca-db-org-switcher__name">{currentName}</span>
        </div>

        {selectedOrg && (
          <span
            className={`sca-db-org-switcher__status ${
              selectedOrg.isActive ? 'is-active' : 'is-pending'
            }`}
          >
            <span className="sca-db-org-switcher__status-dot" />
            {selectedOrg.isActive ? 'Active' : 'Pending'}
          </span>
        )}

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          width="14"
          height="14"
          className={`sca-db-org-switcher__chevron${open ? ' is-open' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <ul
        id={listId}
        className={`sca-db-org-switcher__menu${open ? ' is-open' : ''}`}
        role="listbox"
        aria-labelledby={`${listId}-label`}
        aria-hidden={!open}
      >
        <li className="sca-db-org-switcher__menu-head" role="presentation">
          <span>Select Organization</span>
          <span className="sca-db-org-switcher__menu-count">{organizations.length} total</span>
        </li>
        {organizations.length === 0 ? (
          <li className="sca-db-org-switcher__empty" role="presentation">
            {loading ? 'Loading…' : 'No organizations'}
          </li>
        ) : (
          organizations.map((org) => {
            const selected = org.id === value;
            return (
              <li key={org.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`sca-db-org-switcher__option${selected ? ' is-selected' : ''}`}
                  tabIndex={open ? 0 : -1}
                  onClick={() => {
                    setSelectedOrgId(org.id);
                    setOpen(false);
                  }}
                >
                  <span className="sca-db-org-switcher__option-left">
                    <span className="sca-db-org-switcher__option-icon">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                        <rect x="3" y="2" width="14" height="16" rx="2" />
                        <path d="M7 6h2M11 6h2M7 10h2M11 10h2M7 14h2M11 14h2" />
                      </svg>
                    </span>
                    <span className="sca-db-org-switcher__option-name" title={org.name}>
                      {org.name}
                    </span>
                  </span>
                  <div className="sca-db-org-switcher__option-right">
                    <span
                      className={`sca-db-org-switcher__option-badge ${
                        org.isActive ? 'is-active' : 'is-pending'
                      }`}
                    >
                      {org.isActive ? 'Active' : 'Pending'}
                    </span>
                    {selected && (
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" className="sca-db-org-switcher__option-check">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
