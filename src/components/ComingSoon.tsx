'use client';

import React from 'react';
import Link from 'next/link';
import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title,
  description = 'This feature is coming soon. We\'re working hard to bring you the best experience.',
  icon,
  ctaText = 'Back to Dashboard',
  ctaLink = '/dashboard',
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.content}>
        {icon ? (
          <div className={styles.icon}>{icon}</div>
        ) : (
          <div className={styles.defaultIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
        )}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        {ctaLink && (
          <Link href={ctaLink} className={styles.button}>
            {ctaText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;
