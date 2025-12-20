'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { profileApi } from '@/lib/api';
import styles from '../verify-email/page.module.css'; // Reuse existing styles

// Component that uses searchParams
function VerifyEmailChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link. No token provided.');
      setIsLoading(false);
      return;
    }

    const verifyEmailChange = async () => {
      try {
        setIsLoading(true);
        const result = await profileApi.verifyEmailChange(token);
        
        if (result.success) {
          setSuccess(true);
          setEmail(result.email);
          
          // Update email in localStorage
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            user.email = result.email;
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
      } catch (err: any) {
        console.error('Email verification error:', err);
        setError(err.message || 'Failed to verify email change. The link may have expired.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailChange();
  }, [token]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <h1>Verifying Email Change</h1>
            <p>Please wait while we verify your email change...</p>
          </div>
        ) : success ? (
          <div className={styles.successState}>
            <h1>Email Changed Successfully!</h1>
            <p>Your email has been updated to <strong>{email}</strong>.</p>
            <div className={styles.buttonGroup}>
              <Link href="/dashboard/settings" className={styles.primaryButton}>
                Go to Settings
              </Link>
              <Link href="/dashboard" className={styles.secondaryButton}>
                Go to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.errorState}>
            <h1>Verification Failed</h1>
            <p>{error}</p>
            <div className={styles.buttonGroup}>
              <Link href="/dashboard/settings" className={styles.primaryButton}>
                Back to Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export the main component with Suspense boundary
export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loadingState}>
            <h1>Loading...</h1>
            <p>Please wait while we prepare the verification page...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}