'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: '📊' 
    },
    { 
      name: 'Vehicles', 
      path: '/admin/vehicles', 
      icon: '🚗' 
    },
    { 
      name: 'Stock Vehicles', 
      path: '/admin/vehicles/stock', 
      icon: '🏁',
      indent: true
    },
    { 
      name: 'Auction Vehicles', 
      path: '/admin/vehicles/auction', 
      icon: '🔨',
      indent: true
    },
    { 
      name: 'Orders', 
      path: '/admin/orders', 
      icon: '📦' 
    },
    { 
      name: 'Customers', 
      path: '/admin/customers', 
      icon: '👥' 
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: '⚙️' 
    },
  ];
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/admin/dashboard" className={styles.logoLink}>
          <span className={styles.logoIcon}>🏎️</span>
          <span className={styles.logoText}>JDM Global</span>
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.path} className={`
              ${styles.navItem} 
              ${isActive(item.path) ? styles.active : ''}
              ${item.indent ? styles.indented : ''}
            `}>
              <Link href={item.path} className={styles.navLink}>
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.viewSiteLink}>
          <span className={styles.viewSiteIcon}>🌐</span>
          <span className={styles.viewSiteText}>View Website</span>
        </Link>
      </div>
    </aside>
  );
}
