import React from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../../lib/usePermissions';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
  };
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredRoles,
  fallback 
}) => {
  const { hasPermission, hasRole, isLoading } = usePermissions();
  const router = useRouter();

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check permissions
  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission.resource, requiredPermission.action);
  }

  if (requiredRoles && hasAccess) {
    hasAccess = hasRole(requiredRoles);
  }

  // If no access, show fallback or access denied message
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className={styles['access-denied']}>
        <div className={styles['access-denied-icon']}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this section.</p>
        <p>Please contact an administrator if you need access.</p>
        <button onClick={() => router.push('/admin/dashboard')}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  // If has access, render children
  return <>{children}</>;
};

export default ProtectedRoute;
