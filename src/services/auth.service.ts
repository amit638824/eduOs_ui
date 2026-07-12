import api from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
import type { ApiResponse, ApiUser, LoginInput, LoginResponse, RegisterInput } from '@/types/api';
import { normalizeUser } from '@/utils/normalize';
import { getDefaultDashboardPath } from '@/utils/dashboardRole';

export interface MfaLoginResponse {
  requiresMfa: true;
  mfaToken: string;
  userId: string;
}

export type LoginApiResponse = LoginResponse | MfaLoginResponse;

export function isMfaLoginResponse(data: LoginApiResponse): data is MfaLoginResponse {
  return 'requiresMfa' in data && data.requiresMfa === true;
}

export async function login(input: LoginInput): Promise<LoginApiResponse> {
  const { data } = await api.post<ApiResponse<LoginApiResponse>>('/auth/login', input);
  if (isMfaLoginResponse(data.data)) {
    return data.data;
  }
  return {
    user: normalizeUser(data.data.user as unknown as Record<string, unknown>),
    tokens: data.data.tokens,
  };
}

export async function verifyMfaLogin(mfaToken: string, code: string): Promise<LoginResponse> {
  const { data } = await api.post<ApiResponse<LoginResponse>>('/auth/mfa/verify-login', {
    mfaToken,
    code,
  });
  return {
    user: normalizeUser(data.data.user as unknown as Record<string, unknown>),
    tokens: data.data.tokens,
  };
}

export async function forgotPassword(email: string) {
  const { data } = await api.post<ApiResponse<Record<string, unknown>>>('/auth/forgot-password', {
    email,
  });
  return data.data;
}

export async function resetPassword(token: string, password: string) {
  const { data } = await api.post<ApiResponse<unknown>>('/auth/reset-password', { token, password });
  return data.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.post<ApiResponse<unknown>>('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return data.data;
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
