'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
// Import directly with relative paths to fix TypeScript errors
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  
  // This would normally check for authentication
  const isAuthenticated = true; // For demo purposes
  
  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }
  
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Dashboard" />
        
        <div className={styles.dashboardGrid}>
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Total Vehicles</h3>
            <p className={styles.statsValue}>124</p>
          </div>
          
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Stock Vehicles</h3>
            <p className={styles.statsValue}>86</p>
          </div>
          
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Auction Vehicles</h3>
            <p className={styles.statsValue}>38</p>
          </div>
          
          <div className={styles.statsCard}>
            <h3 className={styles.statsTitle}>Pending Orders</h3>
            <p className={styles.statsValue}>12</p>
          </div>
        </div>
        
        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🚗</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>New Vehicle Added</h4>
                <p className={styles.activityDesc}>2023 Toyota Supra GR added to stock inventory</p>
                <p className={styles.activityTime}>2 hours ago</p>
              </div>
            </div>
            
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>🔨</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>Auction Ended</h4>
                <p className={styles.activityDesc}>1998 Nissan Skyline GT-R sold for $45,000</p>
                <p className={styles.activityTime}>Yesterday</p>
              </div>
            </div>
            
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>📦</div>
              <div className={styles.activityContent}>
                <h4 className={styles.activityTitle}>Shipment Updated</h4>
                <p className={styles.activityDesc}>Honda NSX shipment status changed to "In Transit"</p>
                <p className={styles.activityTime}>2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
