import { useEffect, useId, useRef, useState } from 'react';
import { useOrgScope } from '@/context/OrgScopeContext';

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

  if (!isSuperAdmin) return null;

  const disabled = loading && organizations.length === 0;

  return (
    <div
      ref={rootRef}
      className={`sca-db-org-switcher${open ? ' is-open' : ''}`}
      title="Switch organization context"
    >
      <span className="sca-db-org-switcher__icon" aria-hidden>
        <i className="icofont-building-alt" />
      </span>
      <div className="sca-db-org-switcher__control">
        <span className="sca-db-org-switcher__label" id={`${listId}-label`}>
          Organization
        </span>
        <button
          type="button"
          id="sca-org-scope-select"
          className="sca-db-org-switcher__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-labelledby={`${listId}-label`}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="sca-db-org-switcher__value">{currentName}</span>
          <i className={`icofont-simple-down sca-db-org-switcher__chevron${open ? ' is-open' : ''}`} />
        </button>
      </div>
      {selectedOrg && (
        <span
          className={`sca-db-org-switcher__status ${
            selectedOrg.isActive ? 'is-active' : 'is-pending'
          }`}
        >
          {selectedOrg.isActive ? 'Active' : 'Pending'}
        </span>
      )}

      {open && (
        <ul
          id={listId}
          className="sca-db-org-switcher__menu"
          role="listbox"
          aria-labelledby={`${listId}-label`}
        >
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
                    onClick={() => {
                      setSelectedOrgId(org.id);
                      setOpen(false);
                    }}
                  >
                    <span className="sca-db-org-switcher__option-name">{org.name}</span>
                    <span
                      className={`sca-db-org-switcher__option-badge ${
                        org.isActive ? 'is-active' : 'is-pending'
                      }`}
                    >
                      {org.isActive ? 'Active' : 'Pending'}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
