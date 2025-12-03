'use client';

import React from 'react';
// Import directly with relative path to fix TypeScript error
import LoginForm from '../../../components/admin/LoginForm';
import styles from './login.module.css';

export default function AdminLoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logoText}>JDM Global</h1>
          <p className={styles.logoSubtext}>Admin Panel</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
