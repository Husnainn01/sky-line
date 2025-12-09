'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { securityApi, profileApi } from '@/lib/api';
import styles from './page.module.css';

type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  company: string;
  avatar: string;
  twoFactorEnabled: boolean;
  pendingEmail?: string;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Security state
  const [securitySettings, setSecuritySettings] = useState({
    mfaEnabled: false,
    mfaEnrolled: false,
    lastPasswordChange: new Date().toISOString()
  });
  
  // MFA setup state
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState('');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    company: '',
    avatar: '/placeholder-avatar.png',
    twoFactorEnabled: false,
    pendingEmail: undefined,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Load user data and security settings
  useEffect(() => {
    // Reset loading and error states
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    // Load user profile from localStorage first for quick display
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfile(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        // Other fields will be loaded from API
      }));
    }
    
    // Load profile data
    const loadProfileData = async () => {
      try {
        const data = await profileApi.getProfile();
        if (data.success && data.profile) {
          setProfile(prev => ({
            ...prev,
            name: data.profile.name || prev.name,
            email: data.profile.email || prev.email,
            phone: data.profile.phone || '',
            address: data.profile.address || '',
            city: data.profile.city || '',
            state: data.profile.state || '',
            zipCode: data.profile.zipCode || '',
            country: data.profile.country || '',
            company: data.profile.company || '',
            pendingEmail: data.profile.pendingEmail,
          }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      }
    };
    
    // Load security settings
    const loadSecuritySettings = async () => {
      try {
        const data = await securityApi.getSecuritySettings();
        setSecuritySettings(data.security);
        setProfile(prev => ({
          ...prev,
          twoFactorEnabled: data.security.mfaEnabled
        }));
      } catch (err) {
        console.error('Error loading security settings:', err);
        if (!error) { // Don't overwrite profile error if it exists
          setError('Failed to load security settings');
        }
      }
    };
    
    // Load both data sources and then turn off loading state
    Promise.all([
      loadProfileData(),
      loadSecuritySettings()
    ])
    .finally(() => {
      setIsLoading(false);
    });
    
    // Clean up function
    return () => {
      // Reset states when component unmounts
      setIsLoading(false);
      setError('');
      setSuccessMessage('');
    };
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!profile.name.trim()) {
        setError('Name is required');
        setIsLoading(false);
        return;
      }
      
      const result = await profileApi.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        company: profile.company.trim(),
        address: profile.address.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        zipCode: profile.zipCode.trim(),
        country: profile.country.trim(),
      });
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully');
        setIsEditing(false);
        
        // Update local storage with new name
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.name = profile.name;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailChangeRequest = async () => {
    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const result = await profileApi.requestEmailChange(newEmail);
      if (result.success) {
        setSuccessMessage(`Verification email sent to ${newEmail}. Please check your inbox.`);
        setProfile(prev => ({ ...prev, pendingEmail: newEmail }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request email change');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelEmailChange = async () => {
    if (!profile.pendingEmail) return;
    
    setError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const result = await profileApi.cancelEmailChange();
      if (result.success) {
        setSuccessMessage('Email change request cancelled');
        setProfile(prev => ({ ...prev, pendingEmail: undefined }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel email change');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      await securityApi.changePassword(currentPassword, newPassword);
      setSuccessMessage('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would typically upload the image to your server
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const startMfaSetup = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const data = await securityApi.enableMFA();
      setMfaSetupData(data.enrollment);
      setShowMfaSetup(true);
    } catch (err: any) {
      setError(err.message || 'Failed to start MFA setup');
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyMfaSetup = async () => {
    if (!mfaSetupData || !mfaCode) return;
    
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      const result = await securityApi.verifyMFA(mfaSetupData.factorId, mfaCode);
      
      if (result.valid) {
        setSuccessMessage('Two-factor authentication enabled successfully');
        setShowMfaSetup(false);
        setMfaCode('');
        setProfile(prev => ({ ...prev, twoFactorEnabled: true }));
        setSecuritySettings(prev => ({ ...prev, mfaEnabled: true, mfaEnrolled: true }));
      } else {
        setError('Invalid verification code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify MFA setup');
    } finally {
      setIsLoading(false);
    }
  };
  
  const disableMfa = async () => {
    setError('');
    setSuccessMessage('');
    
    try {
      setIsLoading(true);
      await securityApi.disableMFA();
      setSuccessMessage('Two-factor authentication disabled successfully');
      setProfile(prev => ({ ...prev, twoFactorEnabled: false }));
      setSecuritySettings(prev => ({ ...prev, mfaEnabled: false, mfaEnrolled: false }));
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggle2FA = () => {
    if (profile.twoFactorEnabled) {
      disableMfa();
    } else {
      startMfaSetup();
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account settings and preferences</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className={styles.section}>
          {error && <div className={styles.error}>{error}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}
          
          {isLoading && !isEditing ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading profile information...</p>
            </div>
          ) : (
            <>
              <div className={styles.avatarSection}>
                <div className={styles.avatarContainer}>
                  <Image
                    src={profile.avatar}
                    alt="Profile"
                    width={100}
                    height={100}
                    className={styles.avatar}
                  />
                  <label className={styles.avatarUpload}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                      disabled={isLoading}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Upload Photo
                  </label>
                </div>
              </div>
            </>
          )}

          <form onSubmit={isEditing ? handleProfileUpdate : (e) => e.preventDefault()} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  disabled={!isEditing || isLoading}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <div className={styles.emailField}>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                  />
                  {!profile.pendingEmail && (
                    <button 
                      type="button" 
                      className={styles.changeEmailButton}
                      onClick={handleEmailChangeRequest}
                      disabled={isLoading}
                    >
                      Change
                    </button>
                  )}
                </div>
                {profile.pendingEmail && (
                  <div className={styles.pendingEmail}>
                    <p>Pending change to: <strong>{profile.pendingEmail}</strong></p>
                    <button 
                      type="button" 
                      className={styles.cancelButton}
                      onClick={handleCancelEmailChange}
                    >
                      Cancel Change
                    </button>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Company</label>
                <input
                  type="text"
                  value={profile.company}
                  onChange={e => setProfile({...profile, company: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your company name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Address</label>
                <textarea
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  disabled={!isEditing || isLoading}
                  rows={2}
                  placeholder="Enter your street address"
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>City</label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={e => setProfile({...profile, city: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your city"
                />
              </div>
              <div className={styles.formGroup}>
                <label>State/Province</label>
                <input
                  type="text"
                  value={profile.state}
                  onChange={e => setProfile({...profile, state: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your state or province"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Postal/ZIP Code</label>
                <input
                  type="text"
                  value={profile.zipCode}
                  onChange={e => setProfile({...profile, zipCode: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your postal/ZIP code"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Country</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile({...profile, country: e.target.value})}
                  disabled={!isEditing || isLoading}
                  placeholder="Enter your country"
                />
              </div>
            </div>
            {isEditing && (
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.saveButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
          
          {!isEditing && (
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.editButton}
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className={styles.section}>
          <div className={styles.securitySection}>
            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}
            
            {isLoading && !showMfaSetup ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading security settings...</p>
              </div>
            ) : (
              <>
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            <div className={styles.twoFactorSection}>
              <h3>Two-Factor Authentication</h3>
              <p>Add an extra layer of security to your account</p>
              
              {showMfaSetup && mfaSetupData && (
                <div className={styles.mfaSetupContainer}>
                  <h4>Set up Two-Factor Authentication</h4>
                  <p>Scan this QR code with your authenticator app:</p>
                  
                  <div className={styles.qrCodeContainer}>
                    <img 
                      src={mfaSetupData.qrCode} 
                      alt="QR Code for 2FA Setup" 
                      className={styles.qrCode}
                    />
                  </div>
                  
                  <p>Or enter this code manually:</p>
                  <div className={styles.secretCode}>{mfaSetupData.secret}</div>
                  
                  <div className={styles.formGroup}>
                    <label>Verification Code</label>
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className={styles.codeInput}
                      maxLength={6}
                    />
                  </div>
                  
                  <div className={styles.mfaActions}>
                    <button 
                      onClick={verifyMfaSetup} 
                      className={styles.saveButton}
                      disabled={isLoading || !mfaCode}
                    >
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    <button 
                      onClick={() => setShowMfaSetup(false)} 
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {!showMfaSetup && (
                <div className={styles.twoFactorToggle}>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={profile.twoFactorEnabled}
                      onChange={toggle2FA}
                      disabled={isLoading}
                    />
                    <span className={styles.slider}></span>
                  </label>
                  <span>{profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
