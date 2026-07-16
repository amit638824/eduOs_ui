const STORAGE_KEY = 'edutech.selectedOrganizationId';
export const ORG_SCOPE_CHANGED_EVENT = 'edutech:org-scope-changed';

export function getSelectedOrganizationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedOrganizationId(id: string | null): void {
  try {
    if (!id) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent(ORG_SCOPE_CHANGED_EVENT, { detail: { organizationId: id } }),
  );
}
