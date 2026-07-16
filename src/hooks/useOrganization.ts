import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrgScope } from '@/context/OrgScopeContext';
import { parseApiError } from '@/lib/errors';
import { organizationService } from '@/services';
import type { Branch, Organization } from '@/types/api';
import { isSuperAdmin } from '@/utils/dashboardRole';

interface UseOrganizationResult {
  organization: Organization | null;
  branches: Branch[];
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOrganization(): UseOrganizationResult {
  const { user } = useAuth();
  const {
    selectedOrgId,
    organizations: scopedOrgs,
    isSuperAdmin: scopeSuper,
  } = useOrgScope();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable key — avoid re-fetch loops from new [] array references
  const scopedKey = scopedOrgs.map((o) => o.id).join(',');

  const refresh = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setBranches([]);
      setOrganizations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSuperAdmin(user.roles) || scopeSuper) {
        let listData = scopedOrgs;
        if (listData.length === 0) {
          const list = await organizationService.listOrganizations(1, 100);
          listData = list.data;
        }
        setOrganizations(listData);

        const activeOrg =
          listData.find((o) => o.id === selectedOrgId) ?? listData[0] ?? null;
        if (activeOrg) {
          setOrganization(activeOrg);
          const branchList = await organizationService.listBranches(activeOrg.id, 1, 20);
          setBranches(branchList.data);
        } else {
          setOrganization(null);
          setBranches([]);
        }
        return;
      }

      if (user.organizationId) {
        const org = await organizationService.getOrganization(user.organizationId);
        setOrganization(org);
        setOrganizations([org]);
        const branchList = await organizationService.listBranches(user.organizationId, 1, 20);
        setBranches(branchList.data);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
    // scopedOrgs read from closure; scopedKey drives re-run when ids change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedOrgId, scopeSuper, scopedKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { organization, branches, organizations, loading, error, refresh };
}
