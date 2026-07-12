import api from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
import type { ApiResponse, ApiUser, LoginInput, LoginResponse, RegisterInput } from '@/types/api';
import { normalizeUser } from '@/utils/normalize';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';

export async function login(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/login', input);
  return {
    user: normalizeUser(data.data.user as unknown as Record<string, unknown>),
    tokens: data.data.tokens,
  };
}

export async function register(input: RegisterInput): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/register', input);
  return {
    user: normalizeUser(data.data.user as unknown as Record<string, unknown>),
    tokens: data.data.tokens,
  };
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (refreshToken) {
    await api.post('/auth/logout', { refreshToken }).catch(() => undefined);
  }
  tokenStorage.clear();
}

export async function getMe(): Promise<ApiUser> {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>('/auth/me');
  return normalizeUser(data.data);
}

export function getDashboardPathForRoles(roles: string[]): string {
  return getDefaultDashboardPath(roles);
}
