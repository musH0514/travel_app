import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '@/api/auth';
import { STORAGE_KEYS } from '@/utils/constants';
import type { UserResponse } from '@/api/auth';

interface AuthContextValue {
  user: UserResponse | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginSuccess: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  loginSuccess: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) : null;
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loginSuccess = useCallback(async (token: string) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, loginSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
