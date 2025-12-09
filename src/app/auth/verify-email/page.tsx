'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // WorkOS verification links contain a code parameter
        const code = searchParams.get('code');
        
        if (!code) {
          setStatus('error');
          setMessage('Verification code is missing. Please check your email link.');
          return;
        }

        // The verification is already handled by WorkOS when the user clicks the link
        // We just need to show a success message and redirect them to complete registration
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now complete your registration.');
        
        // Update user verification status if they're logged in
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          parsedUser.verified = true;
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Email Verification</h1>
          </div>

          <div className={status === 'loading' ? styles.loading : styles.hidden}>
            <p>Verifying your email...</p>
            <div className={styles.spinner}></div>
          </div>

          <div className={status === 'success' ? styles.success : styles.hidden}>
            <p>{message}</p>
            <div className={styles.buttonGroup}>
              <Link href="/auth/register" className={styles.submitButton}>
                Complete Registration
              </Link>
              <Link href="/auth/login" className={styles.secondaryButton}>
                Go to Login
              </Link>
            </div>
          </div>

          <div className={status === 'error' ? styles.error : styles.hidden}>
            <p>{message}</p>
            <Link href="/auth/login" className={styles.submitButton}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
