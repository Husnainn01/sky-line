'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const quoteOptions = [
  {
    icon: '🚗',
    title: 'Vehicle Search',
    description: 'Looking for a specific vehicle? We\'ll help you find and evaluate the perfect match.',
    features: [
      'Access to all major Japanese auctions',
      'Vehicle condition assessment',
      'Price evaluation and market analysis',
      'Detailed inspection reports',
    ],
    buttonText: 'Start Vehicle Search',
    buttonLink: '/quote/vehicle-search',
  },
  {
    icon: '🔨',
    title: 'Auction Service',
    description: 'Want to participate in Japanese car auctions? Let us handle the entire process.',
    features: [
      'Bidding strategy consultation',
      'Real-time auction updates',
      'Post-auction inspection',
      'Purchase handling and documentation',
    ],
    buttonText: 'Get Auction Quote',
    buttonLink: '/quote/auction-service',
  },
  {
    icon: '🚢',
    title: 'Import & Shipping',
    description: 'Need help importing a vehicle? We\'ll manage logistics and compliance.',
    features: [
      'Door-to-door shipping',
      'Customs clearance assistance',
      'Import compliance check',
      'Documentation handling',
    ],
    buttonText: 'Calculate Shipping',
    buttonLink: '/quote/import-shipping',
  },
];

const process = [
  {
    number: '1',
    title: 'Submit Requirements',
    text: 'Tell us about your desired vehicle and specific requirements.',
  },
  {
    number: '2',
    title: 'Receive Quote',
    text: 'Get a detailed quote including all costs and timeline estimates.',
  },
  {
    number: '3',
    title: 'Review Options',
    text: 'We\'ll present available options and help you make an informed decision.',
  },
  {
    number: '4',
    title: 'Proceed with Service',
    text: 'Once approved, we\'ll begin the process and keep you updated.',
  },
];

export default function QuotePage() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Get a Customized Quote</h1>
          <p className={styles.subtitle}>
            Choose the service you need and we'll provide a detailed quote tailored to your requirements
          </p>
        </header>

        <div className={styles.optionsGrid}>
          {quoteOptions.map((option, index) => (
            <div key={index} className={styles.optionCard}>
              <div className={styles.optionIcon}>{option.icon}</div>
              <h2 className={styles.optionTitle}>{option.title}</h2>
              <p className={styles.optionDescription}>{option.description}</p>
              <div className={styles.optionFeatures}>
                {option.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className={styles.featureItem}>
                    <span className={styles.featureIcon}>✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Link 
                href={option.buttonLink} 
                className={`${styles.optionButton} ${index !== 0 ? styles.optionButtonOutline : ''}`}
              >
                {option.buttonText}
              </Link>
            </div>
          ))}
        </div>

        <section className={styles.processSection}>
          <h2 className={styles.processTitle}>How It Works</h2>
          <div className={styles.processGrid}>
            {process.map((step, index) => (
              <div key={index} className={styles.processCard}>
                <div className={styles.processNumber}>{step.number}</div>
                <div className={styles.processContent}>
                  <h3 className={styles.processCardTitle}>{step.title}</h3>
                  <p className={styles.processCardText}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
