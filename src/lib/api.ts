import axios from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage';
import { getSelectedOrganizationId } from '@/lib/orgScope';
import type { ApiResponse } from '@/types/api';
import { isSuperAdmin } from '@/utils/dashboardRole';

const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

/** Public auth routes must not carry old JWT / org context */
function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  const path = url.replace(env.apiBaseUrl, '').split('?')[0];
  return [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/mfa/verify-login',
  ].some((p) => path === p || path.endsWith(p));
}

function decodeRolesFromAccessToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
    return Array.isArray(payload?.roles) ? payload.roles.map(String) : [];
  } catch {
    return [];
  }
}

api.interceptors.request.use((config) => {
  const publicAuth = isPublicAuthRequest(config.url);

  if (publicAuth) {
    delete config.headers.Authorization;
    delete config.headers['X-Organization-Id'];
    return config;
  }

  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Only Super Admin sends org scope header
  const roles = token ? decodeRolesFromAccessToken(token) : [];
  const orgId = getSelectedOrganizationId();
  if (token && isSuperAdmin(roles) && orgId) {
    config.headers['X-Organization-Id'] = orgId;
  } else {
    delete config.headers['X-Organization-Id'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isPublicAuthRequest(original.url)
    ) {
      original._retry = true;
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const { data } = await axios.post<
            ApiResponse<{ user: unknown; tokens: { accessToken: string; refreshToken: string } }>
          >(`${env.apiBaseUrl}/auth/refresh`, { refreshToken });
          tokenStorage.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.tokens.accessToken}`;
          return api(original);
        } catch {
          tokenStorage.clear();
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
