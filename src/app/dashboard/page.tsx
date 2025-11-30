'use client';

import React from 'react';
import styles from './page.module.css';

export default function DashboardPage() {
  const stats = [
    { label: 'Active Bids', value: '5', trend: '+2 this week' },
    { label: 'Vehicles Owned', value: '3', trend: '+1 this month' },
    { label: 'Active Shipments', value: '2', trend: 'In transit' },
    { label: 'Total Spent', value: '$45,800', trend: '+$12,000 this month' },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'bid',
      title: 'Bid placed on Nissan Skyline GT-R',
      amount: '$25,000',
      status: 'pending',
      date: '2h ago'
    },
    {
      id: 2,
      type: 'shipment',
      title: 'Toyota Supra shipment updated',
      status: 'in_transit',
      location: 'Port of Tokyo',
      date: '5h ago'
    },
    {
      id: 3,
      type: 'document',
      title: 'Import documents approved',
      status: 'completed',
      date: '1d ago'
    },
    {
      id: 4,
      type: 'payment',
      title: 'Payment processed',
      amount: '$12,000',
      status: 'completed',
      date: '2d ago'
    }
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.greeting}>Welcome back, John! Here's what's happening with your vehicles.</p>
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
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activity.type === 'bid' && '🔨'}
                {activity.type === 'shipment' && '🚢'}
                {activity.type === 'document' && '📄'}
                {activity.type === 'payment' && '💰'}
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
            </div>
          ))}
        </div>
      </section>

      <section className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>🔍</span>
            Browse Auctions
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📦</span>
            Track Shipment
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📝</span>
            Submit Documents
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>💳</span>
            Make Payment
          </button>
        </div>
      </section>
    </div>
  );
}
