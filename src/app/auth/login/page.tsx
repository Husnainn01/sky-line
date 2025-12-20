'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { useAuth } from '@/contexts/AuthContext';

// Component that uses searchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  
  const { login, verifyMfa, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // MFA state
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaUser, setMfaUser] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Check for saved email in localStorage on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }));
    }
  }, []);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call login from AuthContext
      const data = await login(formData.email, formData.password, formData.rememberMe);
      
      // Check if MFA is required
      if (data.requiresMfa) {
        console.log('MFA required for login');
        setRequiresMfa(true);
        setMfaFactorId(data.mfaFactorId);
        setMfaUser(data.user);
        setIsLoading(false);
        return;
      }
      
      // Redirect to the original path or dashboard
      router.push(redirectPath);
    } catch (err: any) {
      // Format the error message for better user experience
      let errorMessage = 'Invalid email or password';
      
      if (err.message) {
        // Check for specific error messages
        if (err.message.includes('Failed to set up authentication')) {
          errorMessage = 'There was a problem setting up your account. Please try again or contact support.';
        } else if (err.message.includes('Authentication failed')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Verify MFA code using AuthContext
      await verifyMfa(mfaFactorId, mfaCode);
      
      // Redirect to the original path or dashboard
      router.push(redirectPath);
    } catch (err: any) {
      // Format the error message for better user experience
      let errorMessage = 'Invalid verification code';
      
      if (err.message) {
        if (err.message.includes('MFA verification failed')) {
          errorMessage = 'Invalid verification code. Please try again.';
        } else if (err.message.includes('MFA verification session expired')) {
          errorMessage = 'Your verification session has expired. Please log in again.';
          // Reset to login form after a delay
          setTimeout(() => {
            setRequiresMfa(false);
            setMfaCode('');
          }, 3000);
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error('MFA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Welcome Back</h1>
            <p className={styles.subtitle}>Sign in to access your account</p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {!requiresMfa ? (
            <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter your password"
              />
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                Remember me
              </label>
              <Link href="/auth/forgot-password" className={styles.forgotPassword}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className={styles.form}>
              <div className={styles.mfaHeader}>
                <h2>Two-Factor Authentication</h2>
                <p>Enter the verification code from your authenticator app</p>
              </div>
              
              {mfaUser && (
                <div className={styles.mfaUserInfo}>
                  <p>Verifying login for: <strong>{mfaUser.email}</strong></p>
                </div>
              )}
              
              <div className={styles.formGroup}>
                <label htmlFor="mfaCode">Verification Code</label>
                <input
                  type="text"
                  id="mfaCode"
                  name="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  required
                  className={styles.input}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              
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
            </form>
          )}

          <div className={styles.divider}>
            <span>Don't have an account?</span>
          </div>

          <Link href="/auth/register" className={styles.registerButton}>
            Create Account
          </Link>

          <div className={styles.help}>
            <p>Need help? <Link href="/contact">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.header}>
              <h1 className={styles.title}>Loading...</h1>
              <p className={styles.subtitle}>Please wait while we prepare the login page...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
