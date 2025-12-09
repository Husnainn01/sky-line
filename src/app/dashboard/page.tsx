'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { dashboardApi, authApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  // Default stats and activity in case API fails
  const defaultStats = [
    { label: 'Saved Vehicles', value: '0', trend: '0 saved' },
    { label: 'Vehicles Owned', value: '0', trend: '0 vehicles' },
    { label: 'Active Shipments', value: '0', trend: 'None in transit' },
    { label: 'Total Spent', value: '$0', trend: 'No purchases' },
  ];

  const defaultActivity = [
    {
      id: 'default-1',
      type: 'info',
      title: 'No recent activity',
      status: 'pending',
      date: 'Now'
    }
  ];

  // Stats and activity from API or defaults
  const stats = dashboardData?.stats ? [
    { label: 'Saved Vehicles', value: dashboardData.stats.savedVehicles.toString(), trend: `${dashboardData.stats.savedVehicles > 0 ? 'View all saved' : 'Save vehicles'}` },
    { label: 'Vehicles Owned', value: dashboardData.stats.vehiclesOwned.toString(), trend: `${dashboardData.stats.vehiclesOwned > 0 ? 'View all owned' : 'Browse inventory'}` },
    { label: 'Active Shipments', value: dashboardData.stats.activeShipments.toString(), trend: `${dashboardData.stats.activeShipments > 0 ? 'In transit' : 'No shipments'}` },
    { label: 'Total Spent', value: `$${dashboardData.stats.totalSpent.toLocaleString()}`, trend: `${dashboardData.stats.vehiclesOwned > 0 ? 'View purchases' : 'No purchases'}` },
  ] : defaultStats;

  // Define activity type
  interface Activity {
    id: string;
    type: string;
    title: string;
    status: string;
    date: string;
    amount?: string;
    location?: string;
    vehicleId?: string;
    shipmentId?: string;
  }

  const recentActivity: Activity[] = dashboardData?.recentActivity || defaultActivity;

  // Handle email verification with code
  const handleVerifyEmail = async () => {
    if (!verificationCode) return;
    
    setVerifying(true);
    setVerificationMessage('');
    
    try {
      // Call the API to verify email
      const response = await authApi.verifyEmail(verificationCode);
      
      // Update user verification status
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.verified = true;
        localStorage.setItem('user', JSON.stringify(parsedUser));
        setUser(parsedUser);
      }
      
      setVerificationMessage('Email verification successful!');
      setVerificationCode('');
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationMessage('Invalid verification code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };
  
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/auth/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Check if user needs to verify email
    if (parsedUser.verified === false) {
      console.log('User needs to verify email');
    }
    
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardApi.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Using sample data instead.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.greeting}>Welcome back, {user?.name || 'User'}! Here's what's happening with your vehicles.</p>
        {user?.verified === false && (
          <div className={styles.verificationBanner}>
            <p>Your email is not verified. Please check your inbox for a verification email or enter your verification code below.</p>
            <div className={styles.verificationForm}>
              <input 
                type="text" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className={styles.verificationInput}
              />
              <button 
                onClick={handleVerifyEmail}
                disabled={verifying || !verificationCode}
                className={styles.verificationButton}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            {verificationMessage && (
              <p className={verificationMessage.includes('success') ? styles.successMessage : styles.errorMessage}>
                {verificationMessage}
              </p>
            )}
            <div className={styles.verificationLinks}>
              <Link href="/auth/manual-verify" className={styles.verificationLink}>
                Go to verification page
              </Link>
            </div>
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        {isLoading && <p className={styles.loading}>Loading your dashboard data...</p>}
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statLabel}>{stat.label}</h3>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statTrend}>{stat.trend}</div>
          </div>
        ))}
      </div>

      <section className={styles.activitySection}>
        <h2 className={styles.sectionTitle}>Recent Activity</h2>
        <div className={styles.activityList}>
          {recentActivity.map((activity) => {
            // Determine the link based on activity type
            let activityLink = '#';
            if (activity.type === 'bookmark' && activity.vehicleId) {
              activityLink = `/vehicle/${activity.vehicleId}`;
            } else if (activity.type === 'purchase' && activity.vehicleId) {
              activityLink = `/dashboard/my-vehicles`;
            } else if (activity.type === 'shipment' && activity.shipmentId) {
              activityLink = `/dashboard/shipments/${activity.shipmentId}`;
            } else if (activity.type === 'document') {
              activityLink = `/dashboard/documents`;
            } else if (activity.type === 'payment') {
              activityLink = `/dashboard/payments`;
            }
            
            return (
              <Link href={activityLink} key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.type === 'bookmark' && '🔖'}
                  {activity.type === 'purchase' && '🚗'}
                  {activity.type === 'shipment' && '🚢'}
                  {activity.type === 'document' && '📄'}
                  {activity.type === 'payment' && '💰'}
                  {activity.type === 'info' && 'ℹ️'}
                </div>
                <div className={styles.activityContent}>
                  <h4 className={styles.activityTitle}>{activity.title}</h4>
                  <div className={styles.activityDetails}>
                    {activity.amount && (
                      <span className={styles.activityAmount}>{activity.amount}</span>
                    )}
                    {activity.location && (
                      <span className={styles.activityLocation}>{activity.location}</span>
                    )}
                    <span className={`${styles.activityStatus} ${styles[activity.status]}`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <time className={styles.activityDate}>{activity.date}</time>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/auction" className={styles.actionButton}>
            <span className={styles.actionIcon}>🔍</span>
            Browse Auctions
          </Link>
          <Link href="/dashboard/saved-vehicles" className={styles.actionButton}>
            <span className={styles.actionIcon}>🔖</span>
            Saved Vehicles
          </Link>
          <Link href="/dashboard/shipments" className={styles.actionButton}>
            <span className={styles.actionIcon}>�</span>
            Track Shipments
          </Link>
          <Link href="/dashboard/documents" className={styles.actionButton}>
            <span className={styles.actionIcon}>📝</span>
            My Documents
          </Link>
          <Link href="/dashboard/payments" className={styles.actionButton}>
            <span className={styles.actionIcon}>💳</span>
            Payment Methods
          </Link>
          <Link href="/dashboard/settings" className={styles.actionButton}>
            <span className={styles.actionIcon}>⚙️</span>
            Account Settings
          </Link>
        </div>
      </section>
    </div>
  );
}
