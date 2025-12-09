'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import { apiRequest } from '../../../lib/api';
import styles from './users.module.css';

// Define admin user types based on the backend model
interface Permission {
  resource: string;
  actions: {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
  };
}

interface Admin {
  _id: string;
  id?: string; // For frontend compatibility
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  workosId?: string;
  company?: string;
  phone?: string;
  permissions: Permission[];
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Available roles with descriptions
const ROLES = [
  { value: 'superadmin', label: 'Super Admin', description: 'Full access to all system features and settings' },
  { value: 'admin', label: 'Admin', description: 'Administrative access with some restrictions' },
  { value: 'editor', label: 'Editor', description: 'Content management with limited administrative access' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access to content' }
];

export default function UsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('viewer'); // Default to lowest permission
  const [currentUserPermissions, setCurrentUserPermissions] = useState<Permission[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  
  // Get current user role from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userDataString = localStorage.getItem('adminUser');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setCurrentUserRole(userData.role || 'viewer');
          setCurrentUserPermissions(userData.permissions || []);
        } catch (err) {
          console.error('Error parsing user data from localStorage:', err);
        }
      }
    }
  }, []);

  // Fetch admins on component mount
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiRequest('/admin/admins');
        
        // Process the response data
        const adminData = response.data.map((admin: any) => ({
          ...admin,
          id: admin._id // Add id for frontend compatibility
        }));
        
        setAdmins(adminData);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching admins:', err);
        
        // Check if it's a permission error (403)
        if (err.status === 403 || (err.message && err.message.includes('403'))) {
          setError('You do not have permission to access this section. Please contact an administrator.');
        } else {
          setError('Failed to load admin users. Please try again later.');
        }
        
        setLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'superadmin' | 'admin' | 'editor' | 'viewer'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [adminToToggleStatus, setAdminToToggleStatus] = useState<Admin | null>(null);

  // Filter admins based on search term, role, and status
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.company && admin.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Helper function to check if user has permission
  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    // Superadmin has all permissions
    if (currentUserRole === 'superadmin') return true;
    
    // Check specific permission
    const permission = currentUserPermissions.find(p => p.resource === resource);
    return permission ? permission.actions[action] : false;
  };
  
  // Helper function to check if user can manage admins
  const canManageAdmins = (): boolean => {
    return hasPermission('admins', 'update') || hasPermission('admins', 'delete');
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle admin deletion
  const handleDeleteAdmin = async () => {
    if (adminToDelete) {
      try {
        setDeleteLoading(adminToDelete._id);
        setDeleteError(null);
        
        await apiRequest(`/admin/admins/${adminToDelete._id}`, {
          method: 'DELETE'
        });
        
        setAdmins(admins.filter(admin => admin._id !== adminToDelete._id));
        setIsDeleteModalOpen(false);
        setAdminToDelete(null);
        setDeleteLoading(null);
      } catch (err) {
        console.error(`Error deleting admin with ID ${adminToDelete._id}:`, err);
        setDeleteError('Failed to delete admin user. Please try again.');
        setDeleteLoading(null);
      }
    }
  };

  // Handle admin status toggle
  const handleToggleAdminStatus = async () => {
    if (adminToToggleStatus) {
      try {
        setStatusLoading(adminToToggleStatus._id);
        setStatusError(null);
        
        // Determine the new status
        const newStatus = adminToToggleStatus.status === 'active' ? 'inactive' : 'active';
        
        // Update the admin status
        const response = await apiRequest(`/admin/admins/${adminToToggleStatus._id}/role`, {
          method: 'PUT',
          body: JSON.stringify({
            role: adminToToggleStatus.role, // Keep the same role
            status: newStatus // Update the status
          })
        });
        
        // Update the local state with the updated admin
        setAdmins(admins.map(admin => {
          if (admin._id === adminToToggleStatus._id) {
            return {
              ...admin,
              status: newStatus
            };
          }
          return admin;
        }));
        
        setIsStatusModalOpen(false);
        setAdminToToggleStatus(null);
        setStatusLoading(null);
      } catch (err) {
        console.error(`Error updating admin status with ID ${adminToToggleStatus._id}:`, err);
        setStatusError('Failed to update admin status. Please try again.');
        setStatusLoading(null);
      }
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="User Management" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1 className={styles.title}>Users</h1>
              <p className={styles.subtitle}>Manage users, roles, and permissions</p>
              <p className={styles.roleInfo}>Your role: <strong>{currentUserRole}</strong></p>
            </div>
            {hasPermission('admins', 'create') && (
              <Link href="/admin/users/new" className={styles.addButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="16" y1="11" x2="22" y2="11"></line>
                </svg>
                Add New User
              </Link>
            )}
          </div>
          
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search by name, email, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
            </div>
            
            <div className={styles.filterGroup}>
              <div className={styles.filterItem}>
                <label htmlFor="roleFilter">Role:</label>
                <select
                  id="roleFilter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'superadmin' | 'admin' | 'editor' | 'viewer')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              
              <div className={styles.filterItem}>
                <label htmlFor="statusFilter">Status:</label>
                <select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Loading and error states */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading admin users...</p>
            </div>
          )}
          
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>
                {error.includes('permission') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>
              <div className={styles.errorContent}>
                <h3 className={styles.errorTitle}>
                  {error.includes('permission') ? 'Access Denied' : 'Error'}
                </h3>
                <p className={styles.errorMessage}>{error}</p>
              </div>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
          
          {deleteError && (
            <div className={styles.errorNotification}>
              <p>{deleteError}</p>
              <button 
                className={styles.closeButton}
                onClick={() => setDeleteError(null)}
              >
                ×
              </button>
            </div>
          )}
          
          {statusError && (
            <div className={styles.errorNotification}>
              <p>{statusError}</p>
              <button 
                className={styles.closeButton}
                onClick={() => setStatusError(null)}
              >
                ×
              </button>
            </div>
          )}
          
         {!loading && !error && (
  <div className={styles.userList}>
    <div className={styles.userListHeader}>
      <div className={styles.userNameCol}>Name / Email</div>
      <div className={styles.userRoleCol}>Role</div>
      <div className={styles.userCreatedCol}>Created</div>
      <div className={styles.userStatusCol}>Status</div>
      <div className={styles.userActionsCol}>Actions</div>
    </div>

    {filteredAdmins.length > 0 ? (
      filteredAdmins.map(admin => (
        <div key={admin._id} className={styles.userItem}>
          <div className={styles.userNameCol}>
            <div className={styles.userName}>{admin.name}</div>
            <div className={styles.userEmail}>{admin.email}</div>
            {admin.company && <div className={styles.userCompany}>{admin.company}</div>}
          </div>

          <div className={styles.userRoleCol}>
            <span className={`${styles.roleTag} ${styles[`role_${admin.role}`]}`}>
              {ROLES.find(r => r.value === admin.role)?.label || admin.role}
            </span>
          </div>
          
          <div className={styles.userCreatedCol}>
            {formatDate(admin.createdAt)}
          </div>
          
          <div className={styles.userStatusCol}>
            <span className={`${styles.statusTag} ${styles[`status_${admin.status}`]}`}>
              {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
            </span>
          </div>
          
          <div className={styles.userActionsCol}>
            <div className={styles.actionButtons}>
              {/* View button - always visible */}
              <Link href={`/admin/users/${admin._id}`} className={styles.viewButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </Link>
              
              {/* Toggle status button - only visible for users with admin update permission */}
              {hasPermission('admins', 'update') && (
                <button 
                  className={styles.toggleStatusButton}
                  onClick={() => {
                    setAdminToToggleStatus(admin);
                    setIsStatusModalOpen(true);
                  }}
                  disabled={statusLoading === admin._id}
                >
                  {statusLoading === admin._id ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : admin.status === 'active' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                      <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                      <line x1="12" y1="2" x2="12" y2="12"></line>
                    </svg>
                  )}
                </button>
              )}
              
              {/* Delete button - only visible for users with admin delete permission */}
              {hasPermission('admins', 'delete') && (
                <button 
                  className={styles.deleteButton}
                  onClick={() => {
                    setAdminToDelete(admin);
                    setIsDeleteModalOpen(true);
                  }}
                  disabled={deleteLoading === admin._id}
                >
                  {deleteLoading === admin._id ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className={styles.noResults}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="15" x2="16" y2="15"></line>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
        <p>No admin users found matching your filters</p>
        <button 
          className={styles.resetButton}
          onClick={() => {
            setSearchTerm('');
            setRoleFilter('all');
            setStatusFilter('all');
          }}
        >
          Reset Filters
        </button>
      </div>
    )}
  </div>
)}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && adminToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Deletion</h3>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete the admin user <strong>{adminToDelete.name}</strong>?</p>
              <p className={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAdminToDelete(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmDeleteButton}
                onClick={handleDeleteAdmin}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Toggle Confirmation Modal */}
      {isStatusModalOpen && adminToToggleStatus && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Status Change</h3>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to 
                <strong>
                  {adminToToggleStatus.status === 'active' ? ' deactivate ' : ' activate '}
                </strong>
                the admin user <strong>{adminToToggleStatus.name}</strong>?
              </p>
              {adminToToggleStatus.status === 'active' && (
                <p className={styles.warningText}>The admin user will no longer be able to access the system.</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setAdminToToggleStatus(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={adminToToggleStatus.status === 'active' ? styles.disableButton : styles.enableButton}
                onClick={handleToggleAdminStatus}
              >
                {adminToToggleStatus.status === 'active' ? 'Deactivate User' : 'Activate User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
