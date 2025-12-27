'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';
import TranslatableText from './TranslatableText';

interface FooterLinkProps {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLinkProps[];
  cta?: FooterLinkProps;
}

export default function FooterColumn({ title, links, cta }: FooterColumnProps) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>
        <TranslatableText text={title} />
      </h4>
      <ul className={styles.linkList}>
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={styles.link}>
              <TranslatableText text={link.label} />
            </Link>
          </li>
        ))}
      </ul>
      {cta && (
        <Link href={cta.href} className={styles.viewMore}>
          <TranslatableText text={cta.label} />
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M4 9h10" strokeLinecap="round" />
            <path d="M10 5l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}
