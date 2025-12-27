'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import TranslatableText from './TranslatableText';

interface BottomLinkProps {
  label: string;
  href: string;
  onClick?: () => void;
}

export default function FooterBottom({ links, year }: { links: BottomLinkProps[], year: number }) {
  return (
    <div className={styles.bottomRow}>
      <p className={styles.copyright}>
        &copy; {year} Skyline TRD. <TranslatableText text="All rights reserved." />
      </p>
      <nav className={styles.bottomNav} aria-label="Footer">
        {links.map((item) => (
          item.onClick ? (
            <button 
              key={item.label} 
              onClick={item.onClick} 
              className={styles.bottomLink}
              type="button"
            >
              <TranslatableText text={item.label} />
            </button>
          ) : (
            <Link key={item.label} href={item.href} className={styles.bottomLink}>
              <TranslatableText text={item.label} />
            </Link>
          )
        ))}
      </nav>
    </div>
  );
}
