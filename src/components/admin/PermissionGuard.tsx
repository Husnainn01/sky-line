import React from 'react';
import { usePermissions } from '../../lib/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
  };
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * Use this for UI elements like buttons, forms, etc.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  requiredPermission,
  requiredRoles,
  fallback = null
}) => {
  const { hasPermission, hasRole } = usePermissions();

  // Check permissions
  let hasAccess = true;

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission.resource, requiredPermission.action);
  }

  if (requiredRoles && hasAccess) {
    hasAccess = hasRole(requiredRoles);
  }

  // If no access, show fallback or nothing
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // If has access, render children
  return <>{children}</>;
};

export default PermissionGuard;
