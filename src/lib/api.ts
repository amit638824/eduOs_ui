import axios from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage';
import { getSelectedOrganizationId } from '@/lib/orgScope';
import { forceSessionExpiredLogout } from '@/lib/session';
import { notify } from '@/lib/toast';
import type { ApiResponse } from '@/types/api';

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
    '/public/home',
  ].some((p) => path === p || path.endsWith(p));
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

  // Super Admin scopes tenant APIs via X-Organization-Id (OrgSwitcher / auto-select).
  // Send whenever an org is stored — only super_admin writes this key.
  const orgId = getSelectedOrganizationId();
  if (token && orgId) {
    config.headers['X-Organization-Id'] = orgId;
  } else {
    delete config.headers['X-Organization-Id'];
  }

  return config;
});

type TokenPair = { accessToken: string; refreshToken: string };

let refreshTask: Promise<TokenPair> | null = null;

function refreshSession(): Promise<TokenPair> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error('Missing refresh token'));
  if (!refreshTask) {
    refreshTask = axios
      .post<ApiResponse<{ tokens: TokenPair }>>(`${env.apiBaseUrl}/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        const tokens = data.data.tokens;
        tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      })
      .finally(() => {
        refreshTask = null;
      });
  }
  return refreshTask;
}

api.interceptors.response.use(
  (response) => {
    notify.apiSuccess(response);
    return response;
  },
  async (error) => {
    const original = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    if (status === 401 && original && !original._retry && !isPublicAuthRequest(original.url)) {
      original._retry = true;
      try {
        const tokens = await refreshSession();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        forceSessionExpiredLogout('expired');
        return Promise.reject(error);
      }
    }
    notify.apiError(error);
    return Promise.reject(error);
  },
);

export default api;
