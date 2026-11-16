const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const tokenStorage = {
  getAccessToken(): string | null {
    try {
      const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      if (sessionToken) return sessionToken;
      const localToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (localToken) {
        // Seed tab's sessionStorage from localStorage for multi-tab isolation
        sessionStorage.setItem(ACCESS_TOKEN_KEY, localToken);
        return localToken;
      }
      return null;
    } catch {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
  },
  getRefreshToken(): string | null {
    try {
      const sessionToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
      if (sessionToken) return sessionToken;
      const localToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (localToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, localToken);
        return localToken;
      }
      return null;
    } catch {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
  },
  setTokens(accessToken: string, refreshToken: string) {
    try {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch {}
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch {}
  },
  clear() {
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  },
};
