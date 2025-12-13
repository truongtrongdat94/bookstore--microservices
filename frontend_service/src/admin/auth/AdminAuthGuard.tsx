/**
 * Admin Authentication Guard Component
 * Protects admin routes from unauthorized access
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const checkAdminAuth = () => {
      // First check Zustand store
      if (isAuthenticated && user?.role === 'admin') {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Fallback: Check localStorage for admin_user (set by React Admin auth provider)
      const adminUser = localStorage.getItem('admin_user');
      const token = localStorage.getItem('auth_token');

      if (token && adminUser) {
        try {
          const parsedUser = JSON.parse(adminUser);
          if (parsedUser.role === 'admin') {
            setIsAuthorized(true);
            setIsChecking(false);
            return;
          }
        } catch {
          // Invalid JSON, continue to unauthorized
        }
      }

      setIsAuthorized(false);
      setIsChecking(false);
    };

    checkAdminAuth();
  }, [isAuthenticated, user]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authorized
  if (!isAuthorized) {
    // Store the attempted URL for redirect after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AdminAuthGuard;
