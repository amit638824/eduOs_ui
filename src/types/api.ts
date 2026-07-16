export type ApiRole =
  | 'super_admin'
  | 'org_admin'
  | 'branch_admin'
  | 'teacher'
  | 'examiner'
  | 'evaluator'
  | 'student'
  | 'parent'
  | 'support'
  | 'finance';

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  organizationId?: string | null;
  branchId?: string | null;
  avatarUrl?: string | null;
  status: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
  roles: ApiRole[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: ApiUser;
  tokens: AuthTokens;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationId?: string;
  role?: 'student' | 'teacher' | 'org_admin';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  usersCount?: number;
  branchesCount?: number;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  code?: string | null;
  address?: string | null;
  settings?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logoUrl?: string;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  contactEmail?: string;
  isActive?: boolean;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  logoUrl?: string;
  theme?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  contactEmail?: string;
  isActive?: boolean;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
}
