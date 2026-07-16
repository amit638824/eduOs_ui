import { useOrgScope } from '@/context/OrgScopeContext';

/** Superadmin-only org switcher — scopes Users / Exams / Results to selected org */
export default function OrgSwitcher() {
  const { isSuperAdmin, organizations, selectedOrgId, setSelectedOrgId, loading } = useOrgScope();

  if (!isSuperAdmin || organizations.length === 0) return null;

  return (
    <label className="sca-db-org-switcher">
      <span className="sca-db-org-switcher__label">Organization</span>
      <select
        className="sca-db-org-switcher__select"
        value={selectedOrgId ?? ''}
        disabled={loading}
        onChange={(e) => setSelectedOrgId(e.target.value)}
        aria-label="Switch organization context"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
            {!org.isActive ? ' (Pending)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
