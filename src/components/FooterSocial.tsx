'use client';

import React from 'react';
import styles from './Footer.module.css';
import TranslatableText from './TranslatableText';

interface SocialLinkProps {
  label: string;
  href: string;
  icon: string;
}

export default function FooterSocial({ links }: { links: SocialLinkProps[] }) {
  const renderSocialIcon = (icon: string, label: string) => {
    const iconPath = `/images/icons/${icon}.svg`;
    return (
      <img
        src={iconPath}
        alt={`${label} icon`}
        className={styles.socialIconImage}
        loading="lazy"
      />
    );
  };

  return (
    <div className={styles.socialList}>
      {links.map((social) => (
        <a 
          key={social.label} 
          href={social.href} 
          aria-label={social.label} 
          className={styles.socialButton}
          title={social.label}
        >
          {renderSocialIcon(social.icon, social.label)}
        </a>
      ))}
    </div>
  );
}
