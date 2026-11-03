import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './authContextDef';
import * as api from '@/lib/api';
import type { APIUser } from '@/lib/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<APIUser | null>(null);
  const [loading, setLoading] = useState(() => !!api.getToken());

  // Check for existing token on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getMe()
        .then(setUser)
        .catch(() => {
          api.clearToken();
        })
        .finally(() => setLoading(false));
    }
  }, []);

  // An expired or revoked token answers 401 mid-session; drop the user so the
  // admin shell returns to sign-in.
  useEffect(() => api.onUnauthorized(() => setUser(null)), []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    if (res.user.role !== 'admin') {
      api.clearToken();
      throw new Error('This account is not an admin. Sign in with an admin account.');
    }
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
