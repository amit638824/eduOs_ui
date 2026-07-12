import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { parseApiError } from '@/lib/errors';
import { organizationService } from '@/services';
import type { Branch, Organization } from '@/types/api';

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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      if (user.roles.includes('super_admin')) {
        const list = await organizationService.listOrganizations(1, 10);
        setOrganizations(list.data);

        const activeOrg = list.data[0];
        if (activeOrg) {
          setOrganization(activeOrg);
          const branchList = await organizationService.listBranches(activeOrg.id, 1, 20);
          setBranches(branchList.data);
        }
        return;
      }

      if (user.organizationId) {
        const org = await organizationService.getOrganization(user.organizationId);
        setOrganization(org);
        const branchList = await organizationService.listBranches(user.organizationId, 1, 20);
        setBranches(branchList.data);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { organization, branches, organizations, loading, error, refresh };
}
