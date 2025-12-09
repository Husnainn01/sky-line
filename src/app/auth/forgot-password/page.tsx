'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the forgot password API
      await authApi.forgotPassword(email);
      
      // Show success message
      setIsSubmitted(true);
    } catch (err: any) {
      // Handle specific error for legacy accounts
      if (err.message && err.message.includes('before our new authentication system')) {
        setError(
          <>
            This account was created before our new authentication system. 
            Please <Link href="/auth/register" className={styles.errorLink}>register again</Link> with the same email.
          </>
        );
      } else {
        setError(err.message || 'Failed to send reset link. Please try again.');
      }
      console.error('Password reset request error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.iconWrapper}>
              <div className={styles.emailIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>
            
            <h1 className={styles.title}>Check Your Email</h1>
            
            <p className={styles.message}>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
            
            <div className={styles.noteBox}>
              <div className={styles.noteIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <p>
                If you don't see the email in your inbox, please check your spam or junk folder.
                The link will expire in 30 minutes.
              </p>
            </div>
            
            <div className={styles.actions}>
              <Link href="/auth/login" className={styles.secondaryButton}>
                Return to Login
              </Link>
            </div>
            
            <div className={styles.help}>
              <p>Need help? <Link href="/contact">Contact Support</Link></p>
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
            <h1 className={styles.title}>Reset Password</h1>
            <p className={styles.subtitle}>Enter your email to receive a password reset link</p>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          <div className={styles.actions}>
            <Link href="/auth/login" className={styles.secondaryButton}>
              Return to Login
            </Link>
          </div>

          <div className={styles.help}>
            <p>Need help? <Link href="/contact">Contact Support</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
