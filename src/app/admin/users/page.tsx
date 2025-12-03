'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import styles from './users.module.css';

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [userToToggleStatus, setUserToToggleStatus] = useState<User | null>(null);

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  // Handle user status toggle
  const handleToggleUserStatus = () => {
    if (userToToggleStatus) {
      setUsers(users.map(user => {
        if (user.id === userToToggleStatus.id) {
          return {
            ...user,
            status: user.status === 'active' ? 'disabled' : 'active'
          };
        }
        return user;
      }));
      setIsStatusModalOpen(false);
      setUserToToggleStatus(null);
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
            </div>
            <Link href="/admin/users/new" className={styles.addButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="19" y1="8" x2="19" y2="14"></line>
                <line x1="16" y1="11" x2="22" y2="11"></line>
              </svg>
              Add New User
            </Link>
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
                <label htmlFor="role-filter" className={styles.filterLabel}>Role:</label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'user')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              <div className={styles.filterItem}>
                <label htmlFor="status-filter" className={styles.filterLabel}>Status:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className={styles.tableRow}>
                      <td className={styles.nameCell}>
                        <div className={styles.avatar}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.userName}>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.userBadge}`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>{user.company || '—'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.activeBadge : styles.disabledBadge}`}>
                          {user.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <Link href={`/admin/users/${user.id}`} className={styles.actionButton}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </Link>
                        <Link href={`/admin/users/${user.id}/edit`} className={styles.actionButton}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </Link>
                        <button 
                          className={styles.actionButton}
                          onClick={() => {
                            setUserToToggleStatus(user);
                            setIsStatusModalOpen(true);
                          }}
                        >
                          {user.status === 'active' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18.36 6.64A9 9 0 0 1 20.77 15"></path>
                              <path d="M6.16 6.16a9 9 0 1 0 12.68 12.68"></path>
                              <path d="M12 2v4"></path>
                              <path d="m2 2 20 20"></path>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18.36 6.64A9 9 0 1 1 5.63 18.36"></path>
                              <line x1="12" y1="2" x2="12" y2="4"></line>
                            </svg>
                          )}
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className={styles.noResults}>
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Delete User</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Are you sure you want to delete the user <strong>{userToDelete.name}</strong>?</p>
              <p className={styles.modalWarning}>This action cannot be undone.</p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteButton}
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Status Toggle Modal */}
      {isStatusModalOpen && userToToggleStatus && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{userToToggleStatus.status === 'active' ? 'Disable' : 'Enable'} User</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setIsStatusModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              {userToToggleStatus.status === 'active' ? (
                <p>Are you sure you want to disable <strong>{userToToggleStatus.name}</strong>? They will no longer be able to log in or access the system.</p>
              ) : (
                <p>Are you sure you want to enable <strong>{userToToggleStatus.name}</strong>? This will restore their access to the system.</p>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setIsStatusModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className={userToToggleStatus.status === 'active' ? styles.disableButton : styles.enableButton}
                onClick={handleToggleUserStatus}
              >
                {userToToggleStatus.status === 'active' ? 'Disable User' : 'Enable User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
