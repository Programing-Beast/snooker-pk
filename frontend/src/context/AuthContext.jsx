import { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectUser,
  selectToken,
  selectAuthLoading,
  bootstrap,
  login as loginThunk,
  register as registerThunk,
  logout as logoutThunk,
} from '../store/authSlice';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const loading = useSelector(selectAuthLoading);

  useEffect(() => {
    if (token && !user) {
      dispatch(bootstrap());
    }
  }, [token, user, dispatch]);

  const login = useCallback(async (email, password) => {
    const result = await dispatch(loginThunk({ email, password })).unwrap();
    return result;
  }, [dispatch]);

  const register = useCallback(async (data) => {
    const result = await dispatch(registerThunk(data)).unwrap();
    return result;
  }, [dispatch]);

  const logout = useCallback(async () => {
    await dispatch(logoutThunk());
  }, [dispatch]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    const roles = user.roles || [];
    return roles.includes(role);
  }, [user]);

  const value = useMemo(() => ({
    user, token, loading, login, register, logout, hasRole,
    isAdmin: hasRole('admin'),
    isPlayer: hasRole('player'),
    isUmpire: hasRole('umpire'),
    isAuthenticated: !!user,
  }), [user, token, loading, login, register, logout, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
