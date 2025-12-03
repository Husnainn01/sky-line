'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import styles from './userDetail.module.css';

// Define user types based on the backend model
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  company?: string;
  phone?: string;
  createdAt: string;
  status: 'active' | 'disabled';
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Define permission categories for better organization
interface PermissionCategory {
  id: string;
  name: string;
  permissions: Permission[];
}

// Mock permissions data
const availablePermissions: Permission[] = [
  { id: 'view_vehicles', name: 'View Vehicles', description: 'Can view vehicle listings', enabled: true },
  { id: 'edit_vehicles', name: 'Edit Vehicles', description: 'Can edit vehicle information', enabled: false },
  { id: 'delete_vehicles', name: 'Delete Vehicles', description: 'Can delete vehicles from the system', enabled: false },
  { id: 'view_auctions', name: 'View Auctions', description: 'Can view auction listings', enabled: true },
  { id: 'bid_auctions', name: 'Bid on Auctions', description: 'Can place bids on auctions', enabled: true },
  { id: 'view_shipments', name: 'View Shipments', description: 'Can view shipment details', enabled: true },
  { id: 'create_shipments', name: 'Create Shipments', description: 'Can create new shipments', enabled: false },
  { id: 'view_orders', name: 'View Orders', description: 'Can view order history', enabled: true },
  { id: 'manage_users', name: 'Manage Users', description: 'Can manage other users', enabled: false },
  { id: 'system_settings', name: 'System Settings', description: 'Can modify system settings', enabled: false },
];

// Group permissions by category
const permissionCategories: PermissionCategory[] = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    permissions: availablePermissions.filter(p => p.id.includes('vehicle'))
  },
  {
    id: 'auctions',
    name: 'Auctions',
    permissions: availablePermissions.filter(p => p.id.includes('auction'))
  },
  {
    id: 'shipments',
    name: 'Shipments',
    permissions: availablePermissions.filter(p => p.id.includes('shipment'))
  },
  {
    id: 'orders',
    name: 'Orders',
    permissions: availablePermissions.filter(p => p.id.includes('order'))
  },
  {
    id: 'admin',
    name: 'Administration',
    permissions: availablePermissions.filter(p => p.id.includes('user') || p.id.includes('system'))
  }
];

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    company: 'JDM Global',
    phone: '+1 (555) 123-4567',
    createdAt: '2023-01-15T08:30:00Z',
    status: 'active',
    permissions: availablePermissions.map(p => ({ ...p, enabled: p.id === 'system_settings' ? true : p.enabled }))
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    company: 'Auto Imports Inc.',
    phone: '+1 (555) 987-6543',
    createdAt: '2023-02-20T10:15:00Z',
    status: 'active',
    permissions: availablePermissions.map(p => ({ ...p, enabled: ['view_vehicles', 'view_auctions', 'bid_auctions', 'view_shipments', 'view_orders'].includes(p.id) }))
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'user',
    createdAt: '2023-03-10T14:45:00Z',
    status: 'disabled',
    permissions: availablePermissions.map(p => ({ ...p, enabled: false }))
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'user',
    company: 'Car Collectors Ltd.',
    phone: '+44 20 1234 5678',
    createdAt: '2023-04-05T09:20:00Z',
    status: 'active',
    permissions: availablePermissions.map(p => ({ ...p, enabled: ['view_vehicles', 'view_auctions', 'view_orders'].includes(p.id) }))
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david@example.com',
    role: 'admin',
    phone: '+61 2 9876 5432',
    createdAt: '2023-05-12T16:30:00Z',
    status: 'active',
    permissions: availablePermissions.map(p => ({ ...p, enabled: true }))
  }
];

// Mock user activity log
const mockActivityLog = [
  { id: '1', action: 'Login', timestamp: '2023-06-15T09:30:00Z', details: 'Successful login from IP 192.168.1.1' },
  { id: '2', action: 'Password Change', timestamp: '2023-06-10T14:20:00Z', details: 'Password changed successfully' },
  { id: '3', action: 'Profile Update', timestamp: '2023-05-28T11:45:00Z', details: 'Updated contact information' },
  { id: '4', action: 'Login', timestamp: '2023-05-25T08:15:00Z', details: 'Successful login from IP 192.168.1.1' },
  { id: '5', action: 'Bid Placed', timestamp: '2023-05-20T16:30:00Z', details: 'Placed bid on Toyota Supra MK4 (ID: AUC-12345)' },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  // Find the user by ID
  const user = mockUsers.find(u => u.id === userId);
  
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userStatus, setUserStatus] = useState<'active' | 'disabled'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'permissions' | 'activity'>('permissions');
  
  // Initialize user data
  useEffect(() => {
    if (user) {
      setUserPermissions(user.permissions);
      setUserRole(user.role);
      setUserStatus(user.status);
    }
  }, [user]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle permission toggle
  const togglePermission = (permissionId: string) => {
    setUserPermissions(prevPermissions => 
      prevPermissions.map(p => 
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };
  
  // Handle role change
  const handleRoleChange = (role: 'admin' | 'user') => {
    setUserRole(role);
    
    // If changing to admin, enable all permissions
    if (role === 'admin') {
      setUserPermissions(prevPermissions => 
        prevPermissions.map(p => ({ ...p, enabled: true }))
      );
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: 'active' | 'disabled') => {
    setUserStatus(status);
  };
  
  // Handle save changes
  const handleSaveChanges = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // If user not found, show error
  if (!user) {
    return (
      <div className={styles.dashboardLayout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <AdminHeader title="User Not Found" />
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 className={styles.errorTitle}>User Not Found</h2>
            <p className={styles.errorMessage}>The user you are looking for does not exist or has been removed.</p>
            <Link href="/admin/users" className={styles.backButton}>
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="User Details" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/users" className={styles.breadcrumbLink}>
                Users
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{user.name}</span>
            </div>
            
            <div className={styles.actions}>
              <Link href={`/admin/users/${userId}/edit`} className={styles.editButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </Link>
            </div>
          </div>
          
          {saveSuccess && (
            <div className={styles.successAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>User settings saved successfully</span>
            </div>
          )}
          
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{user.name}</h2>
              <div className={styles.userMeta}>
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.metaDot}>•</span>
                <span className={`${styles.userRole} ${user.role === 'admin' ? styles.adminRole : styles.userRole}`}>
                  {user.role === 'admin' ? 'Administrator' : 'Standard User'}
                </span>
                <span className={styles.metaDot}>•</span>
                <span className={`${styles.userStatus} ${user.status === 'active' ? styles.activeStatus : styles.disabledStatus}`}>
                  {user.status === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>
              <div className={styles.userDetails}>
                {user.company && (
                  <div className={styles.userDetail}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    <span>{user.company}</span>
                  </div>
                )}
                {user.phone && (
                  <div className={styles.userDetail}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className={styles.userDetail}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>Member since {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'permissions' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('permissions')}
            >
              Roles & Permissions
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'activity' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              Activity Log
            </button>
          </div>
          
          {activeTab === 'permissions' && (
            <div className={styles.permissionsSection}>
              <div className={styles.roleSettings}>
                <h3 className={styles.sectionTitle}>User Role & Status</h3>
                <div className={styles.roleOptions}>
                  <div className={styles.roleOption}>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="role" 
                        checked={userRole === 'user'} 
                        onChange={() => handleRoleChange('user')} 
                        className={styles.radioInput}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>Standard User</div>
                        <div className={styles.radioDescription}>Regular user with limited permissions</div>
                      </div>
                    </label>
                  </div>
                  <div className={styles.roleOption}>
                    <label className={styles.radioLabel}>
                      <input 
                        type="radio" 
                        name="role" 
                        checked={userRole === 'admin'} 
                        onChange={() => handleRoleChange('admin')} 
                        className={styles.radioInput}
                      />
                      <div className={styles.radioContent}>
                        <div className={styles.radioTitle}>Administrator</div>
                        <div className={styles.radioDescription}>Full access to all features and settings</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                <div className={styles.statusToggle}>
                  <span className={styles.statusLabel}>Account Status:</span>
                  <div className={styles.toggleSwitch}>
                    <input 
                      type="checkbox" 
                      id="status-toggle" 
                      checked={userStatus === 'active'} 
                      onChange={() => handleStatusChange(userStatus === 'active' ? 'disabled' : 'active')} 
                      className={styles.toggleInput}
                    />
                    <label htmlFor="status-toggle" className={styles.toggleLabel}>
                      <span className={styles.toggleInner}></span>
                      <span className={styles.toggleSwitch}></span>
                    </label>
                  </div>
                  <span className={styles.statusValue}>
                    {userStatus === 'active' ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <h3 className={styles.sectionTitle}>Permissions</h3>
              <p className={styles.sectionDescription}>
                {userRole === 'admin' 
                  ? 'Administrators have all permissions by default. You can customize specific permissions below.' 
                  : 'Select the permissions this user should have access to.'}
              </p>
              
              <div className={styles.permissionsGrid}>
                {permissionCategories.map(category => (
                  <div key={category.id} className={styles.permissionCategory}>
                    <h4 className={styles.categoryTitle}>{category.name}</h4>
                    <div className={styles.permissionsList}>
                      {category.permissions.map(permission => (
                        <div key={permission.id} className={styles.permissionItem}>
                          <label className={styles.permissionLabel}>
                            <input 
                              type="checkbox" 
                              checked={userPermissions.find(p => p.id === permission.id)?.enabled || false} 
                              onChange={() => togglePermission(permission.id)} 
                              className={styles.permissionCheckbox}
                              disabled={userRole === 'admin'} // Admins have all permissions
                            />
                            <div className={styles.permissionInfo}>
                              <div className={styles.permissionName}>{permission.name}</div>
                              <div className={styles.permissionDescription}>{permission.description}</div>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.formActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className={styles.activitySection}>
              <h3 className={styles.sectionTitle}>User Activity Log</h3>
              <div className={styles.activityList}>
                {mockActivityLog.map(activity => (
                  <div key={activity.id} className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      {activity.action === 'Login' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                      )}
                      {activity.action === 'Password Change' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                      )}
                      {activity.action === 'Profile Update' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                      {activity.action === 'Bid Placed' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      )}
                    </div>
                    <div className={styles.activityContent}>
                      <div className={styles.activityHeader}>
                        <span className={styles.activityAction}>{activity.action}</span>
                        <span className={styles.activityTime}>
                          {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                        </span>
                      </div>
                      <div className={styles.activityDetails}>{activity.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
