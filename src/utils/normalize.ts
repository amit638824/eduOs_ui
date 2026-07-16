import type { ApiRole, ApiUser, Branch, Organization } from '@/types/api';

export function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function normalizeUser(raw: Record<string, unknown>): ApiUser {
  return {
    id: String(raw.id),
    email: String(raw.email),
    firstName: String(raw.firstName ?? raw.first_name ?? ''),
    lastName: String(raw.lastName ?? raw.last_name ?? ''),
    phone: (raw.phone as string | null) ?? null,
    organizationId:
      (raw.organizationId as string | null) ?? (raw.organization_id as string | null) ?? null,
    branchId: (raw.branchId as string | null) ?? (raw.branch_id as string | null) ?? null,
    avatarUrl: (raw.avatarUrl as string | null) ?? (raw.avatar_url as string | null) ?? null,
    status: String(raw.status),
    emailVerified: Boolean(raw.emailVerified ?? raw.email_verified),
    mfaEnabled: Boolean(raw.mfaEnabled ?? raw.mfa_enabled),
    lastLoginAt: (raw.lastLoginAt as string | null) ?? (raw.last_login_at as string | null) ?? null,
    createdAt: (raw.createdAt as string | undefined) ?? (raw.created_at as string | undefined),
    roles: (raw.roles as ApiRole[]) ?? [],
  };
}

export function normalizeOrganization(raw: Record<string, unknown>): Organization {
  return {
    id: String(raw.id),
    name: String(raw.name),
    slug: String(raw.slug),
    logoUrl: (raw.logoUrl as string | null) ?? (raw.logo_url as string | null) ?? null,
    theme: (raw.theme as Record<string, unknown>) ?? {},
    settings: (raw.settings as Record<string, unknown>) ?? {},
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: (raw.updatedAt as string | undefined) ?? (raw.updated_at as string | undefined),
    usersCount:
      raw.usersCount != null || raw.users_count != null
        ? Number(raw.usersCount ?? raw.users_count)
        : undefined,
    branchesCount:
      raw.branchesCount != null || raw.branches_count != null
        ? Number(raw.branchesCount ?? raw.branches_count)
        : undefined,
  };
}

export function normalizeBranch(raw: Record<string, unknown>): Branch {
  return {
    id: String(raw.id),
    organizationId: String(raw.organizationId ?? raw.organization_id ?? ''),
    name: String(raw.name),
    code: (raw.code as string | null) ?? null,
    address: (raw.address as string | null) ?? null,
    settings: (raw.settings as Record<string, unknown>) ?? {},
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
  };
}
