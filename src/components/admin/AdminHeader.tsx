'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminHeader.module.css';
import { getUser, logout } from '../../utils/sessionManager';
import { usePermissions } from '../../lib/usePermissions';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const router = useRouter();
  const { role } = usePermissions();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState(role || 'viewer');
  
  useEffect(() => {
    // Get user data from localStorage
    const user = getUser();
    if (user) {
      setUserName(user.name || user.email || 'User');
      setUserRole(user.role || 'viewer');
    }
  }, []);
  
  const handleLogout = async () => {
    // Use the logout function from sessionManager
    await logout();
    router.push('/admin/login');
  };
  
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      
      <div className={styles.actions}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            🔍
          </button>
        </div>
        
        <div className={styles.userMenu}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
          </div>
          
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
