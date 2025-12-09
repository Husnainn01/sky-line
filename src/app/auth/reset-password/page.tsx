'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [isResetComplete, setIsResetComplete] = useState(false);

  useEffect(() => {
    // Check if token exists in URL
    if (!token) {
      // Check if token might be in a different format or parameter name
      const fullUrl = window.location.href;
      const tokenMatch = fullUrl.match(/[?&]token=([^&]+)/);
      const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
      
      if (tokenMatch && tokenMatch[1]) {
        // Found token in URL but not in searchParams
        console.log('Found token in URL:', tokenMatch[1]);
        // We'll use this token directly in handleSubmit
      } else if (codeMatch && codeMatch[1]) {
        // Some providers use 'code' instead of 'token'
        console.log('Found code in URL:', codeMatch[1]);
        // We'll use this code as token
      } else {
        setIsTokenValid(false);
        setError('Invalid or expired password reset link. Please request a new one.');
      }
    }
    // Note: WorkOS will validate the token when we actually use it
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check password strength when password field changes
    if (name === 'password') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains number
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthClass = (): string => {
    if (passwordStrength === 0) return styles.veryWeak;
    if (passwordStrength === 1) return styles.weak;
    if (passwordStrength === 2) return styles.fair;
    if (passwordStrength === 3) return styles.good;
    if (passwordStrength === 4) return styles.strong;
    return styles.veryStrong;
  };

  const validateForm = (): boolean => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check if password is strong enough (at least fair)
    if (passwordStrength < 2) {
      setError('Please use a stronger password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Try to find a token in various formats
      let resetToken = token;
      
      // If no token in searchParams, check URL directly
      if (!resetToken) {
        const fullUrl = window.location.href;
        const tokenMatch = fullUrl.match(/[?&]token=([^&]+)/);
        const codeMatch = fullUrl.match(/[?&]code=([^&]+)/);
        
        if (tokenMatch && tokenMatch[1]) {
          resetToken = tokenMatch[1];
        } else if (codeMatch && codeMatch[1]) {
          resetToken = codeMatch[1];
        }
      }
      
      // Call the reset password API with the token
      if (resetToken) {
        await authApi.resetPassword(resetToken, formData.password);
        setIsResetComplete(true);
      } else {
        setError('Missing reset token. Please request a new password reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
      console.error('Password reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isResetComplete) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.iconWrapper}>
              <div className={styles.successIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
            
            <h1 className={styles.title}>Password Reset Complete</h1>
            
            <p className={styles.message}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            
            <div className={styles.actions}>
              <Link href="/auth/login" className={styles.submitButton}>
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.iconWrapper}>
              <div className={styles.errorIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
            </div>
            
            <h1 className={styles.title}>Invalid or Expired Link</h1>
            
            <p className={styles.message}>
              The password reset link is invalid or has expired. Please request a new password reset link.
            </p>
            
            <div className={styles.actions}>
              <Link href="/auth/forgot-password" className={styles.submitButton}>
                Request New Link
              </Link>
              <Link href="/auth/login" className={styles.secondaryButton}>
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create New Password</h1>
            <p className={styles.subtitle}>Enter a new password for your account</p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter new password"
              />
              {formData.password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={`${styles.strengthIndicator} ${getPasswordStrengthClass()}`} 
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className={styles.strengthText}>{getPasswordStrengthText()}</span>
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className={styles.help}>
            <p>Need help? <Link href="/contact">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
