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
                <Image 
                  src="/images/logo/footer.png" 
                  alt="SkylineTRD Logo" 
                  width={100} 
                  height={100} 
                />
              </div>
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
