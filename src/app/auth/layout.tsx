'use client';

import Link from 'next/link';
import { Inter, Outfit } from "next/font/google";
import styles from './layout.module.css';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: '--font-outfit',
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${styles.authLayout} ${inter.variable} ${outfit.variable}`}>
      <div className={styles.authContainer}>
        {/* <Link href="/" className={styles.logo}> */}
          {/* <div className={styles.logoIcon}>
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
          <div className={styles.logoTextContainer}>
            <span className={styles.logoText}>Skyline</span>
            <span className={styles.logoAccent}>TRD</span>
          </div> */}
        {/* </Link> */}
        <div className={styles.authContent}>
          {children}
        </div>
      </div>
    </div>
  );
}
