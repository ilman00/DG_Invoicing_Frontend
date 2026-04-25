import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { tokenStore } from '../lib/axios';
import type { AuthUser } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // restore user from localStorage on page refresh
    // access token will be null — the interceptor will refresh it on first 401
    const stored = localStorage.getItem('authUser');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(
    (accessToken: string, refreshToken: string, authUser: AuthUser) => {
      tokenStore.setAccessToken(accessToken);
      tokenStore.setRefreshToken(refreshToken);
      localStorage.setItem('authUser', JSON.stringify(authUser));
      setUser(authUser);
    },
    []
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
