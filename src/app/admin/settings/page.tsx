'use client';

import React, { useState } from 'react';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import styles from './settings.module.css';

// Mock user data
const mockUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@jdmglobal.com',
  role: 'Administrator',
  lastLogin: '2023-12-03T08:45:22Z',
  createdAt: '2023-01-15T10:30:00Z',
  permissions: ['manage_vehicles', 'manage_users', 'manage_website', 'manage_orders']
};

export default function SettingsPage() {
  const [user] = useState(mockUser);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Account Settings" />
        
        <div className={styles.settingsContainer}>
          <div className={styles.settingsHeader}>
            <h1 className={styles.pageTitle}>Account Settings</h1>
            <p className={styles.pageDescription}>
              View your account information and change your password.
            </p>
          </div>
          
          <div className={styles.settingsGrid}>
            {/* Account Information Section */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Account Information
                </h2>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.accountInfo}>
                  <div className={styles.infoGroup}>
                    <label className={styles.infoLabel}>Name</label>
                    <div className={styles.infoValue}>{user.name}</div>
                  </div>
                  
                  <div className={styles.infoGroup}>
                    <label className={styles.infoLabel}>Email</label>
                    <div className={styles.infoValue}>{user.email}</div>
                  </div>
                  
                  <div className={styles.infoGroup}>
                    <label className={styles.infoLabel}>Role</label>
                    <div className={styles.infoValue}>
                      <span className={styles.roleBadge}>{user.role}</span>
                    </div>
                  </div>
                  
                  <div className={styles.infoGroup}>
                    <label className={styles.infoLabel}>Last Login</label>
                    <div className={styles.infoValue}>
                      {new Date(user.lastLogin).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className={styles.infoGroup}>
                    <label className={styles.infoLabel}>Account Created</label>
                    <div className={styles.infoValue}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className={styles.permissionsSection}>
                  <h3 className={styles.permissionsTitle}>Permissions</h3>
                  <div className={styles.permissionsList}>
                    {user.permissions.map(permission => (
                      <div key={permission} className={styles.permissionBadge}>
                        {permission.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.noteSection}>
                  <p className={styles.noteText}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    To update your account information, please contact your system administrator.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Change Password Section */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Change Password
                </h2>
              </div>
              
              <div className={styles.cardContent}>
                <form onSubmit={handlePasswordChange} className={styles.passwordForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currentPassword" className={styles.formLabel}>Current Password</label>
                    <input 
                      type="password" 
                      id="currentPassword" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={styles.formInput}
                      placeholder="Enter your current password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
                    <input 
                      type="password" 
                      id="newPassword" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.formInput}
                      placeholder="Enter your new password"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirmPassword" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.formInput}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  
                  {passwordError && (
                    <div className={styles.errorMessage}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {passwordError}
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className={styles.successMessage}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {passwordSuccess}
                    </div>
                  )}
                  
                  <div className={styles.formActions}>
                    <button 
                      type="submit" 
                      className={styles.submitButton}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className={styles.loadingIcon} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                          </svg>
                          Changing Password...
                        </>
                      ) : 'Change Password'}
                    </button>
                  </div>
                </form>
                
                <div className={styles.passwordGuidelines}>
                  <h3 className={styles.guidelinesTitle}>Password Guidelines</h3>
                  <ul className={styles.guidelinesList}>
                    <li>At least 8 characters long</li>
                    <li>Include at least one uppercase letter</li>
                    <li>Include at least one number</li>
                    <li>Include at least one special character</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Security Settings Section */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Security Settings
                </h2>
              </div>
              
              <div className={styles.cardContent}>
                <div className={styles.securityOptions}>
                  <div className={styles.securityOption}>
                    <div className={styles.optionInfo}>
                      <h3 className={styles.optionTitle}>Two-Factor Authentication</h3>
                      <p className={styles.optionDescription}>
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                    </div>
                    <button className={styles.enableButton}>
                      Enable
                    </button>
                  </div>
                  
                  <div className={styles.securityOption}>
                    <div className={styles.optionInfo}>
                      <h3 className={styles.optionTitle}>Session Management</h3>
                      <p className={styles.optionDescription}>
                        View and manage your active sessions across different devices.
                      </p>
                    </div>
                    <button className={styles.viewButton}>
                      View Sessions
                    </button>
                  </div>
                  
                  <div className={styles.securityOption}>
                    <div className={styles.optionInfo}>
                      <h3 className={styles.optionTitle}>Login History</h3>
                      <p className={styles.optionDescription}>
                        View your recent login activity and detect any unauthorized access.
                      </p>
                    </div>
                    <button className={styles.viewButton}>
                      View History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
