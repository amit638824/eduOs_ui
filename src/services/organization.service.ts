import api from '@/lib/api';
import type {
  ApiResponse,
  Branch,
  CreateOrganizationInput,
  Organization,
  PaginatedResponse,
  UpdateOrganizationInput,
} from '@/types/api';
import { normalizeBranch, normalizeOrganization } from '@/utils/normalize';

export async function listOrganizations(page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<Record<string, unknown>>>('/organizations', {
    params: { page, limit },
  });
  return {
    data: data.data.map((row) => normalizeOrganization(row)),
    pagination: data.pagination,
  };
}

export async function getOrganization(id: string): Promise<Organization> {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/organizations/${id}`);
  return normalizeOrganization(data.data);
}

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<Organization & { adminEmail?: string | null; credentialsEmailed?: boolean }> {
  const { data } = await api.post<
    ApiResponse<Record<string, unknown> & { adminEmail?: string | null; credentialsEmailed?: boolean }>
  >('/organizations', input);
  return {
    ...normalizeOrganization(data.data),
    adminEmail: (data.data.adminEmail as string | null | undefined) ?? null,
    credentialsEmailed: Boolean(data.data.credentialsEmailed),
  };
}

export async function updateOrganization(
  id: string,
  input: UpdateOrganizationInput,
): Promise<Organization> {
  const payload = {
    name: input.name,
    slug: input.slug,
    logoUrl: input.logoUrl,
    theme: input.theme,
    settings: input.settings,
    contactEmail: input.contactEmail,
    isActive: input.isActive,
  };
  const { data } = await api.patch<ApiResponse<Record<string, unknown>>>(
    `/organizations/${id}`,
    payload,
  );
  return normalizeOrganization(data.data);
}

export async function verifyOrganization(id: string): Promise<Organization> {
  const { data } = await api.post<ApiResponse<Record<string, unknown>>>(
    `/organizations/${id}/verify`,
  );
  return normalizeOrganization(data.data);
}

export async function deleteOrganization(id: string): Promise<void> {
  await api.delete(`/organizations/${id}`);
}

export async function listBranches(organizationId: string, page = 1, limit = 20) {
  const { data } = await api.get<PaginatedResponse<Record<string, unknown>>>(
    `/organizations/${organizationId}/branches`,
    { params: { page, limit } },
  );
  return {
    data: data.data.map((row) => normalizeBranch(row)),
    pagination: data.pagination,
  };
}

export async function getBranch(id: string): Promise<Branch> {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(
    `/organizations/branches/${id}`,
  );
  return normalizeBranch(data.data);
}
