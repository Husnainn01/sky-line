'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';
import { dashboardApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  // Default stats in case API fails
  const defaultStats = [
    { label: 'Saved Vehicles', value: '0', trend: '0 saved', link: '/dashboard/my-vehicles' },
    { label: 'Vehicles Owned', value: '0', trend: '0 vehicles', link: '/dashboard/my-vehicles' },
    { label: 'Active Shipments', value: '0', trend: 'None in transit', link: '/dashboard/shipments' },
    { label: 'Total Spent', value: '$0', trend: 'No purchases', link: '/dashboard/payments' },
  ];

  // Stats from API or defaults
  const stats = dashboardData?.stats ? [
    { 
      label: 'Saved Vehicles', 
      value: dashboardData.stats.savedVehicles.toString(), 
      trend: `${dashboardData.stats.savedVehicles > 0 ? 'View all saved' : 'Save vehicles'}`,
      link: '/dashboard/my-vehicles'
    },
    { 
      label: 'Vehicles Owned', 
      value: dashboardData.stats.vehiclesOwned.toString(), 
      trend: `${dashboardData.stats.vehiclesOwned > 0 ? 'View all owned' : 'Browse inventory'}`,
      link: '/dashboard/my-vehicles'
    },
    { 
      label: 'Active Shipments', 
      value: dashboardData.stats.activeShipments.toString(), 
      trend: `${dashboardData.stats.activeShipments > 0 ? 'In transit' : 'No shipments'}`,
      link: '/dashboard/shipments'
    },
    { 
      label: 'Total Spent', 
      value: `$${dashboardData.stats.totalSpent.toLocaleString()}`, 
      trend: `${dashboardData.stats.vehiclesOwned > 0 ? 'View purchases' : 'No purchases'}`,
      link: '/dashboard/payments'
    },
  ] : defaultStats;

  // Define featured vehicle type
  interface FeaturedVehicle {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    image: string;
    status: string;
  }

  const featuredVehicles: FeaturedVehicle[] = dashboardData?.featuredVehicles || [];

  // Handle email verification with code
  const handleVerifyEmail = async () => {
    if (!verificationCode) return;
    
    setVerifying(true);
    setVerificationMessage('');
    
    try {
      // Call the API to verify email through authApi
      // We'll use a direct fetch since we need to update the dashboard API
      const response = await fetch(`http://localhost:5001/api/auth/verify-email?code=${verificationCode}`);
      const data = await response.json();
      
      // Update user verification status in AuthContext
      if (user) {
        updateUser({ verified: true });
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
    // Check if user is authenticated using AuthContext
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user needs to verify email
    if (user && user.verified === false) {
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
          <Link href={stat.link} key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <h3 className={styles.statLabel}>{stat.label}</h3>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statTrend}>{stat.trend}</div>
          </Link>
        ))}
      </div>

      <section className={styles.featuredSection}>
        <h2 className={styles.sectionTitle}>
          {featuredVehicles.length > 0 ? 'Your Saved Vehicles' : 'Featured Vehicles'}
        </h2>
        
        {featuredVehicles.length > 0 ? (
          <div className={styles.featuredGrid}>
            {featuredVehicles.map((vehicle) => (
              <Link href={`/inventory/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase()}-${vehicle.year}`} key={vehicle.id} className={styles.featuredCard}>
                <div className={styles.featuredImageContainer}>
                  <img 
                    src={vehicle.image} 
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
                    className={styles.featuredImage}
                  />
                  <div className={styles.featuredBadge}>{vehicle.status}</div>
                </div>
                <div className={styles.featuredContent}>
                  <h3 className={styles.featuredTitle}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className={styles.featuredPrice}>
                    ${vehicle.price.toLocaleString()}
                  </div>
                </div>
              </Link>
            ))}
            
            <Link href="/dashboard/my-vehicles" className={styles.viewAllButton}>
              View All Saved Vehicles
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        ) : (
          <div className={styles.emptyFeatured}>
            <div className={styles.emptyIcon}>🔍</div>
            <h3 className={styles.emptyTitle}>No saved vehicles yet</h3>
            <p className={styles.emptyText}>Start browsing our inventory and save vehicles you're interested in.</p>
            <Link href="/inventory" className={styles.browseButton}>
              Browse Inventory
            </Link>
          </div>
        )}
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/inventory" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                <circle cx="7" cy="17" r="2"></circle>
                <path d="M9 17h6"></path>
                <circle cx="17" cy="17" r="2"></circle>
              </svg>
            </span>
            Browse Inventory
          </Link>
          <Link href="/dashboard/my-vehicles" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            My Vehicles
          </Link>
          <Link href="/dashboard/shipments" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                <path d="M12 3v6"></path>
              </svg>
            </span>
            Track Shipments
          </Link>
          <Link href="/dashboard/documents" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </span>
            My Documents
          </Link>
          <Link href="/dashboard/payments" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </span>
            Payment Methods
          </Link>
          <Link href="/dashboard/settings" className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </span>
            Account Settings
          </Link>
        </div>
      </section>
    </div>
  );
}
