import { useState, useEffect } from 'react';

interface Permission {
  resource: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface User {
  role: string;
  permissions: Permission[];
}

export function usePermissions() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('adminUser');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setCurrentUser({
            role: userData.role || 'viewer',
            permissions: userData.permissions || []
          });
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Check if user has a specific role
  const hasRole = (roles: string[]): boolean => {
    if (!currentUser) return false;
    
    // Superadmin has all roles
    if (currentUser.role === 'superadmin') return true;
    
    return roles.includes(currentUser.role);
  };

  // Check if user has permission for a specific action on a resource
  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!currentUser) return false;
    
    // Superadmin has all permissions
    if (currentUser.role === 'superadmin') return true;
    
    const permission = currentUser.permissions.find(p => p.resource === resource);
    return permission ? permission.actions[action] : false;
  };

  // Check if user can access a specific section
  const canAccess = (section: string): boolean => {
    switch (section) {
      case 'admin_users':
        return hasRole(['superadmin', 'admin']);
      case 'vehicles':
        return hasPermission('vehicles', 'read');
      case 'auctions':
        return hasPermission('auctions', 'read');
      case 'orders':
        return hasPermission('orders', 'read');
      case 'shipments':
        return hasPermission('shipments', 'read');
      case 'website_content':
        return hasPermission('content', 'read');
      default:
        return false;
    }
  };

  return {
    currentUser,
    isLoading,
    hasRole,
    hasPermission,
    canAccess,
    role: currentUser?.role || 'viewer'
  };
}
