'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './LoginForm.module.css';
import { storeAuthToken } from '../../utils/sessionManager';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // State for MFA verification
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUser, setMfaUser] = useState<any>(null);
  
  // State for email verification
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Admin login attempt with:', { email, password, rememberMe });
      
      // Call the admin login API
      const response = await fetch('http://localhost:5001/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Check if MFA is required
      if (data.requiresMfa) {
        console.log('MFA required for admin login');
        setRequiresMfa(true);
        setMfaFactorId(data.mfaFactorId);
        setMfaUser(data.user);
        setIsLoading(false);
        return;
      }
      
      // Store token using session manager
      storeAuthToken(data.token, data.user);
      
      // Ensure token is immediately available for Next.js 15.x
      console.log('Storing admin token for immediate use');
      
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to dashboard - use direct window location for more reliable navigation in Next.js 15.x
        console.log('Redirecting to admin dashboard after login');
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      
      // Check if this is an email verification error
      if (err.message && (err.message.includes('Email ownership must be verified') || err.message.includes('Email verification required'))) {
        setError('Your email needs to be verified. Please enter the verification code sent to your email.');
        setNeedsVerification(true);
        
        // Redirect to the verification page
        router.push(`/admin/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.message || 'An error occurred. Please try again.');
        setNeedsVerification(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    
    setResendingEmail(true);
    setError('');
    
    try {
      // Call the API to resend verification email
      const response = await fetch('http://localhost:5001/api/admin/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification email');
      }
      
      setError('Verification email has been resent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
      console.error('Resend verification error:', err);
    } finally {
      setResendingEmail(false);
    }
  };
  
  // Handle MFA verification
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Call the MFA verification API
      const response = await fetch('http://localhost:5001/api/admin/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          factorId: mfaFactorId, 
          code: mfaCode,
          rememberMe 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'MFA verification failed');
      }
      
      // Store token using session manager
      storeAuthToken(data.token, data.user);
      
      // Ensure token is immediately available for Next.js 15.x
      console.log('Storing admin token after MFA for immediate use');
      
      if (rememberMe) {
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminEmail');
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate to dashboard - use direct window location for more reliable navigation in Next.js 15.x
        console.log('Redirecting to admin dashboard after MFA verification');
        window.location.href = '/admin/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'MFA verification failed');
      console.error('MFA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for saved email in localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Sign In</h2>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      {!requiresMfa ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="admin@jdmglobal.com"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className={styles.formOptions}>
            <label className={styles.rememberMe}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className={styles.checkbox}
              />
              Remember me
            </label>
            
            <Link href="/admin/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>
          
          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading || resendingEmail}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            {needsVerification && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleResendVerification}
                disabled={resendingEmail}
              >
                {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleMfaSubmit} className={styles.form}>
          <div className={styles.mfaHeader}>
            <h3 className={styles.mfaTitle}>Two-Factor Authentication</h3>
            <p className={styles.mfaDescription}>Enter the verification code from your authenticator app</p>
          </div>
          
          {mfaUser && (
            <div className={styles.mfaUserInfo}>
              <p>Verifying login for: <strong>{mfaUser.email}</strong></p>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label htmlFor="mfaCode" className={styles.label}>Verification Code</label>
            <input
              id="mfaCode"
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className={styles.input}
              placeholder="Enter 6-digit code"
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
          </div>
          
          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setRequiresMfa(false)}
              disabled={isLoading}
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
