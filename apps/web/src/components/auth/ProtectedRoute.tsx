import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  // Not logged in → redirect to appropriate login
  if (!isAuthenticated || !user) {
    if (allowedRoles && allowedRoles.includes('superadmin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/auth/login" replace />;
  }

  // Logged in but wrong role → redirect to appropriate page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (allowedRoles.includes('superadmin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
