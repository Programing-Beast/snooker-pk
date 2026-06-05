import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

/* Route guards */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen grid place-items-center bg-page"><span className="text-muted">Loading...</span></div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ role }) {
  const { hasRole, loading } = useAuth();
  if (loading) return <div className="h-screen grid place-items-center bg-page"><span className="text-muted">Loading...</span></div>;
  return hasRole(role) ? <Outlet /> : <Navigate to="/" replace />;
}

export function GuestRoute() {
  const { isAuthenticated, loading, hasRole } = useAuth();
  if (loading) return <div className="h-screen grid place-items-center bg-page"><span className="text-muted">Loading...</span></div>;
  if (!isAuthenticated) return <Outlet />;
  if (hasRole('admin')) return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}
