import { useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, isLoading, token } = useAuth();
  const [, setLocation] = useLocation();
  const redirectedRef = useRef(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated - only once
  if (!isLoading && (!token || !user) && !redirectedRef.current) {
    redirectedRef.current = true;
    setLocation('/login');
    return null;
  }

  if (!token || !user) {
    return null; // Return nothing while redirecting
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
          <p className="text-secondary-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
