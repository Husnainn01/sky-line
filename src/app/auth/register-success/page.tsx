'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function RegisterSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.successWrapper}>
          <div className={styles.iconWrapper}>
            <div className={styles.checkIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>
          
          <h1 className={styles.title}>Registration Successful!</h1>
          
          <p className={styles.message}>
            Thank you for creating an account with SkylineTRD. We've sent a verification email to your inbox. 
            Please check your email and follow the instructions to verify your account.
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
            </p>
          </div>
          
          <div className={styles.actions}>
            <Link href="/auth/login" className={styles.primaryButton}>
              Go to Login
            </Link>
            <Link href="/" className={styles.secondaryButton}>
              Return to Home
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
