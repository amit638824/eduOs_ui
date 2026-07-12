import axios from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage';
import type { ApiResponse } from '@/types/api';

const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
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
