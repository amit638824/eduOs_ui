import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getSelectedOrganizationId,
  ORG_SCOPE_CHANGED_EVENT,
  setSelectedOrganizationId,
} from '@/lib/orgScope';
import { organizationService } from '@/services';
import type { Organization } from '@/types/api';
import { isSuperAdmin } from '@/utils/dashboardRole';

interface OrgScopeValue {
  isSuperAdmin: boolean;
  organizations: Organization[];
  selectedOrgId: string | null;
  selectedOrg: Organization | null;
  loading: boolean;
  setSelectedOrgId: (id: string) => void;
  refreshOrganizations: () => Promise<void>;
}

const OrgScopeContext = createContext<OrgScopeValue | null>(null);

export function OrgScopeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const superAdmin = Boolean(user && isSuperAdmin(user.roles));
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgIdState] = useState<string | null>(() =>
    getSelectedOrganizationId(),
  );
  const [loading, setLoading] = useState(false);
  const fetchedForUser = useRef<string | null>(null);

  const refreshOrganizations = useCallback(async () => {
    if (!user || !superAdmin) {
      setOrganizations((prev) => (prev.length ? [] : prev));
      fetchedForUser.current = null;
      return;
    }

    setLoading(true);
    try {
      const list = await organizationService.listOrganizations(1, 100);
      setOrganizations(list.data);
      fetchedForUser.current = user.id;

      const stored = getSelectedOrganizationId();
      const stillValid = Boolean(stored && list.data.some((o) => o.id === stored));
      const nextId = stillValid ? stored! : list.data[0]?.id ?? null;

      if (nextId !== getSelectedOrganizationId()) {
        setSelectedOrganizationId(nextId);
      }
      setSelectedOrgIdState(nextId);
    } catch {
      // Keep previous list on error — avoid [] churn that retriggers consumers
      setOrganizations((prev) => prev);
    } finally {
      setLoading(false);
    }
  }, [user, superAdmin]);

  useEffect(() => {
    if (!user || !superAdmin) {
      fetchedForUser.current = null;
      return;
    }
    // One fetch per logged-in superadmin session (manual refresh still works)
    if (fetchedForUser.current === user.id) return;
    void refreshOrganizations();
  }, [user, superAdmin, refreshOrganizations]);

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<{ organizationId: string | null }>).detail;
      setSelectedOrgIdState(detail?.organizationId ?? getSelectedOrganizationId());
    };
    window.addEventListener(ORG_SCOPE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(ORG_SCOPE_CHANGED_EVENT, onChange);
  }, []);

  const setSelectedOrgId = useCallback((id: string) => {
    if (id === getSelectedOrganizationId()) {
      setSelectedOrgIdState(id);
      return;
    }
    setSelectedOrganizationId(id);
    setSelectedOrgIdState(id);
  }, []);

  const selectedOrg = useMemo(
    () => organizations.find((o) => o.id === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  );

  const value = useMemo(
    () => ({
      isSuperAdmin: superAdmin,
      organizations,
      selectedOrgId: superAdmin ? selectedOrgId : user?.organizationId ?? null,
      selectedOrg: superAdmin ? selectedOrg : null,
      loading,
      setSelectedOrgId,
      refreshOrganizations,
    }),
    [
      superAdmin,
      organizations,
      selectedOrgId,
      selectedOrg,
      loading,
      setSelectedOrgId,
      refreshOrganizations,
      user?.organizationId,
    ],
  );

  return <OrgScopeContext.Provider value={value}>{children}</OrgScopeContext.Provider>;
}

export function useOrgScope(): OrgScopeValue {
  const ctx = useContext(OrgScopeContext);
  if (!ctx) {
    return {
      isSuperAdmin: false,
      organizations: [],
      selectedOrgId: null,
      selectedOrg: null,
      loading: false,
      setSelectedOrgId: () => undefined,
      refreshOrganizations: async () => undefined,
    };
  }
  return ctx;
}
