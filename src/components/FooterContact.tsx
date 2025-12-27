'use client';

import React from 'react';
import styles from './Footer.module.css';
import TranslatableText from './TranslatableText';

interface ContactItemProps {
  label: string;
  icon: string;
}

export default function FooterContact({ items }: { items: ContactItemProps[] }) {
  return (
    <ul className={styles.contactList}>
      {items.map((item) => (
        <li key={item.label}>
          <span className={styles.contactIcon}>
            <img 
              src={item.icon} 
              alt={`${item.label} icon`} 
              className={styles.contactIconImage}
              loading="lazy"
            />
          </span>
          <span>
            {item.label.includes('@') || item.label.includes('+') 
              ? item.label 
              : <TranslatableText text={item.label} />
            }
          </span>
        </li>
      ))}
    </ul>
  );
}
