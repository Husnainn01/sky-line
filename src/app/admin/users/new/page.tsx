'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../../../components/admin/AdminHeader';
import AdminSidebar from '../../../../components/admin/AdminSidebar';
import styles from './newUser.module.css';

// Define permission types
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

// Define permission categories for better organization
interface PermissionCategory {
  id: string;
  name: string;
  permissions: Permission[];
}

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

export default function NewUserPage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'admin' | 'user',
    company: '',
    phone: '',
    status: 'active' as 'active' | 'disabled'
  });
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>(
    availablePermissions.map(p => ({ ...p, enabled: p.id === 'view_vehicles' || p.id === 'view_auctions' || p.id === 'view_orders' }))
  );
  
  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle role change
  const handleRoleChange = (role: 'admin' | 'user') => {
    setFormData(prev => ({ ...prev, role }));
    
    // If changing to admin, enable all permissions
    if (role === 'admin') {
      setPermissions(prevPermissions => 
        prevPermissions.map(p => ({ ...p, enabled: true }))
      );
    } else {
      // Reset to default permissions for standard users
      setPermissions(prevPermissions => 
        prevPermissions.map(p => ({ 
          ...p, 
          enabled: ['view_vehicles', 'view_auctions', 'view_orders'].includes(p.id)
        }))
      );
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: 'active' | 'disabled') => {
    setFormData(prev => ({ ...prev, status }));
  };
  
  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setPermissions(prevPermissions => 
      prevPermissions.map(p => 
        p.id === permissionId ? { ...p, enabled: !p.enabled } : p
      )
    );
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        // Redirect to users list after successful submission
        setTimeout(() => {
          router.push('/admin/users');
        }, 1500);
      }, 1000);
    }
  };
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Add New User" />
        
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.breadcrumbs}>
              <Link href="/admin/users" className={styles.breadcrumbLink}>
                Users
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>Add New User</span>
            </div>
          </div>
          
          {submitSuccess && (
            <div className={styles.successAlert}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>User created successfully! Redirecting...</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>User Information</h2>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name" className={styles.formLabel}>Full Name*</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email Address*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Password*</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Enter password"
                  />
                  {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password*</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <div className={styles.errorMessage}>{errors.confirmPassword}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="company" className={styles.formLabel}>Company (Optional)</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.formLabel}>Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Role & Status</h2>
              
              <div className={styles.roleOptions}>
                <div className={styles.roleOption}>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      name="role" 
                      checked={formData.role === 'user'} 
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
                      checked={formData.role === 'admin'} 
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
                    checked={formData.status === 'active'} 
                    onChange={() => handleStatusChange(formData.status === 'active' ? 'disabled' : 'active')} 
                    className={styles.toggleInput}
                  />
                  <label htmlFor="status-toggle" className={styles.toggleLabel}>
                    <span className={styles.toggleInner}></span>
                    <span className={styles.toggleSwitch}></span>
                  </label>
                </div>
                <span className={styles.statusValue}>
                  {formData.status === 'active' ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Permissions</h2>
              <p className={styles.sectionDescription}>
                {formData.role === 'admin' 
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
                              checked={permissions.find(p => p.id === permission.id)?.enabled || false} 
                              onChange={() => togglePermission(permission.id)} 
                              className={styles.permissionCheckbox}
                              disabled={formData.role === 'admin'} // Admins have all permissions
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
            </div>
            
            <div className={styles.formActions}>
              <Link href="/admin/users" className={styles.cancelButton}>
                Cancel
              </Link>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
