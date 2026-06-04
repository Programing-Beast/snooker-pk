import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then((res) => setUser(res.data.data ?? res.data))
      .catch(() => { localStorage.removeItem('token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const t = res.data.token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await authApi.getMe();
    setUser(me.data.data ?? me.data);
    return me.data.data ?? me.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    const t = res.data.token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await authApi.getMe();
    setUser(me.data.data ?? me.data);
    return me.data.data ?? me.data;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    const roles = user.roles || [];
    return roles.includes(role);
  }, [user]);

  const value = {
    user, token, loading, login, register, logout, hasRole,
    isAdmin: hasRole('admin'),
    isPlayer: hasRole('player'),
    isUmpire: hasRole('umpire'),
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
