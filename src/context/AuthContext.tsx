import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ApiUser, LoginInput, RegisterInput } from '@/types/api';
import { tokenStorage } from '@/lib/storage';
import * as authService from '@/services/auth.service';

interface AuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<string>;
  register: (input: RegisterInput) => Promise<string>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistTokens(accessToken: string, refreshToken: string) {
  tokenStorage.setTokens(accessToken, refreshToken);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await authService.getMe();
    setUser(profile);
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.login(input);
    persistTokens(result.tokens.accessToken, result.tokens.refreshToken);
    setUser(result.user);
    return authService.getDashboardPathForRoles(result.user.roles);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authService.register(input);
    persistTokens(result.tokens.accessToken, result.tokens.refreshToken);
    setUser(result.user);
    return authService.getDashboardPathForRoles(result.user.roles);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
