'use client';

import React from 'react';
import Image from 'next/image';
// Import directly with relative path to fix TypeScript error
import LoginForm from '../../../components/admin/LoginForm';
import styles from './login.module.css';

export default function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.splitContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.brandingContent}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="url(#gradient)" />
                  <path d="M10 15L20 10L30 15V25L20 30L10 25V15Z" fill="white" fillOpacity="0.9" />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#DC2626" />
                      <stop offset="1" stopColor="#991B1B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <h1 className={styles.logoText}>Skyline TRD</h1>
            </div>
            
            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>Admin Dashboard</h2>
              <p className={styles.heroSubtitle}>Manage your inventory, track shipments, and monitor auction activity all in one place.</p>
            </div>
            
            <div className={styles.featuresList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>🚗</div>
                <div className={styles.featureText}>Vehicle Management</div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>🔨</div>
                <div className={styles.featureText}>Auction Control</div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>📊</div>
                <div className={styles.featureText}>Analytics Dashboard</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.formWrapper}>
            <h2 className={styles.welcomeText}>Welcome Back</h2>
            <p className={styles.instructionText}>Sign in to your admin account</p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
