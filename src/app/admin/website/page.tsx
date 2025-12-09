'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import styles from './website.module.css';

export default function WebsiteManagementPage() {
  return (
    <div className={styles.dashboardLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminHeader title="Website Management" />
        
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Website Management</h1>
          <p className={styles.pageDescription}>
            Manage your website content, images, shipping schedules, and FAQs.
          </p>
        </div>
        
        <div className={styles.sectionsGrid}>
          {/* Hero Section Management */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Hero Section</h2>
              <p className={styles.sectionDescription}>
                Manage hero section images, text, and order of appearance.
              </p>
              <Link href="/admin/website/hero" className={styles.sectionLink}>
                Manage Hero Section
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* Shipping Management */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Shipping Management</h2>
              <p className={styles.sectionDescription}>
                Manage shipping schedules, routes, and information.
              </p>
              <Link href="/admin/website/shipping" className={styles.sectionLink}>
                Manage Shipping
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* FAQ Management */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>FAQ Management</h2>
              <p className={styles.sectionDescription}>
                Create, edit, and delete frequently asked questions.
              </p>
              <Link href="/admin/website/faq" className={styles.sectionLink}>
                Manage FAQs
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
          
          {/* General Settings */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>General Settings</h2>
              <p className={styles.sectionDescription}>
                Manage website general settings, contact information, and social media links.
              </p>
              <Link href="/admin/website/settings" className={styles.sectionLink}>
                Manage Settings
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
