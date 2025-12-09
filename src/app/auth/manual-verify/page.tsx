'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../verify-email/page.module.css';
import { authApi } from '@/lib/api';

export default function ManualVerifyPage() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      setStatus('error');
      setMessage('Please enter a verification code');
      return;
    }
    
    setStatus('loading');
    setMessage('Verifying your email...');
    
    try {
      // Call the API to verify email
      await authApi.verifyEmail(verificationCode);
      
      // Update user verification status if user is logged in
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.verified = true;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      
      setStatus('success');
      setMessage('Email verification successful!');
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Invalid verification code. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Email Verification</h1>
            <p>Enter the verification code from your email</p>
          </div>

          <form onSubmit={handleVerifyEmail} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="code">Verification Code</label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={styles.input}
                placeholder="Enter verification code"
                disabled={status === 'loading' || status === 'success'}
              />
            </div>

            {message && (
              <div className={status === 'error' ? styles.error : status === 'success' ? styles.success : styles.loading}>
                <p>{message}</p>
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={status === 'loading' || status === 'success' || !verificationCode}
            >
              {status === 'loading' ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {status === 'success' && (
            <div className={styles.successActions}>
              <Link href="/dashboard" className={styles.linkButton}>
                Go to Dashboard
              </Link>
            </div>
          )}

          <div className={styles.help}>
            <p>
              Didn't receive a code? <Link href="/auth/login">Go back to login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
