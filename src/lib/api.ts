import axios from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage';
import { getSelectedOrganizationId, ORG_SCOPE_CHANGED_EVENT } from '@/lib/orgScope';
import { forceSessionExpiredLogout } from '@/lib/session';
import { readApiMessage } from '@/lib/errors';
import { notify } from '@/lib/toast';
import type { ApiResponse } from '@/types/api';

const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

function requestPath(url?: string): string {
  if (!url) return '';
  return url.replace(env.apiBaseUrl, '').split('?')[0];
}

function tokenRoles(token: string): string[] {
  try {
    const part = token.split('.')[1];
    if (!part) return [];
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { roles?: unknown };
    return Array.isArray(json.roles) ? json.roles.filter((role): role is string => typeof role === 'string') : [];
  } catch {
    return [];
  }
}

/** These calls belong to the logged-in user or the platform, not the selected organization. */
function orgHeaderOptional(path: string): boolean {
  if (!path) return true;
  return (
    path.startsWith('/auth/') ||
    path.startsWith('/public/') ||
    path.startsWith('/health') ||
    path.startsWith('/certificates/verify') ||
    path === '/organizations' ||
    path.startsWith('/organizations/') ||
    path.startsWith('/platform/notifications')
  );
}

let orgWait: Promise<string | null> | null = null;

function waitForOrganizationId(): Promise<string | null> {
  const existing = getSelectedOrganizationId();
  if (existing) return Promise.resolve(existing);
  if (!orgWait) {
    orgWait = new Promise((resolve) => {
      const finish = (id: string | null) => {
        window.removeEventListener(ORG_SCOPE_CHANGED_EVENT, onChange);
        window.clearTimeout(timer);
        orgWait = null;
        resolve(id);
      };
      const onChange = () => {
        const id = getSelectedOrganizationId();
        if (id) finish(id);
      };
      const timer = window.setTimeout(() => finish(getSelectedOrganizationId()), 8000);
      window.addEventListener(ORG_SCOPE_CHANGED_EVENT, onChange);
    });
  }
  return orgWait;
}

function missingOrganizationHeader(error: unknown): boolean {
  if (!axios.isAxiosError<{ message?: string }>(error)) return false;
  const message = error.response?.data?.message;
  return error.response?.status === 403 && typeof message === 'string' && message.includes('X-Organization-Id');
}

/** Public auth routes must not carry old JWT / org context */
function isPublicAuthRequest(url?: string): boolean {
  if (!url) return false;
  const path = requestPath(url);
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

api.interceptors.request.use(async (config) => {
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

  const path = requestPath(config.url);
  if (
    token &&
    !getSelectedOrganizationId() &&
    !orgHeaderOptional(path) &&
    tokenRoles(token).includes('super_admin')
  ) {
    await waitForOrganizationId();
  }

  // Super Admin scopes tenant APIs via X-Organization-Id (OrgSwitcher / auto-select).
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
      } catch (refreshError) {
        const fromRefresh = axios.isAxiosError(refreshError)
          ? readApiMessage(refreshError.response?.data)
          : '';
        const fromRequest = axios.isAxiosError(error) ? readApiMessage(error.response?.data) : '';
        forceSessionExpiredLogout('expired', fromRefresh || fromRequest);
        return Promise.reject(error);
      }
    }
    if (!missingOrganizationHeader(error)) notify.apiError(error);
    return Promise.reject(error);
  },
);

export default api;
