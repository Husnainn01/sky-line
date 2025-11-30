'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const steps = [
  {
    number: '1',
    title: 'Vehicle Selection',
    icon: '🚗',
    description: 'Browse our inventory or auction vehicles. Once you find your desired vehicle, submit an inquiry or place a bid.',
    info: [
      { label: 'Response Time', value: 'Within 24 hours' },
      { label: 'Required Info', value: 'Vehicle details & preferences' },
    ]
  },
  {
    number: '2',
    title: 'Price Quotation',
    icon: '💰',
    description: 'Receive a detailed quote including vehicle price, shipping costs, import duties, and our service fees.',
    info: [
      { label: 'Quote Validity', value: '7 days' },
      { label: 'Price Currency', value: 'USD/JPY' },
    ]
  },
  {
    number: '3',
    title: 'Payment Process',
    icon: '🏦',
    description: 'Upon quote acceptance, submit the initial deposit to secure the vehicle. The remaining balance is due before shipping.',
    info: [
      { label: 'Initial Deposit', value: '20% of total' },
      { label: 'Payment Methods', value: 'Bank transfer' },
    ]
  },
  {
    number: '4',
    title: 'Documentation',
    icon: '📄',
    description: 'We handle all necessary paperwork including export certificates, de-registration, and shipping documents.',
    info: [
      { label: 'Processing Time', value: '5-7 business days' },
      { label: 'Required Docs', value: 'Import permit (if applicable)' },
    ]
  },
  {
    number: '5',
    title: 'Shipping Process',
    icon: '🚢',
    description: 'Your vehicle is carefully prepared for shipping. We provide regular updates and tracking information.',
    info: [
      { label: 'Transit Time', value: '4-8 weeks' },
      { label: 'Tracking Updates', value: 'Every 3-5 days' },
    ]
  },
  {
    number: '6',
    title: 'Delivery & Support',
    icon: '🎯',
    description: 'Coordinate with our team for vehicle collection at your local port. We assist with customs clearance process.',
    info: [
      { label: 'Port Handling', value: '2-3 business days' },
      { label: 'Support Period', value: '30 days post-delivery' },
    ]
  },
];

const bankingInfo = [
  {
    title: 'Japan Account (JPY)',
    details: [
      { label: 'Bank Name', value: 'MUFG Bank, Ltd.' },
      { label: 'Branch', value: 'Tokyo Main Branch' },
      { label: 'Account Type', value: 'Current Account' },
      { label: 'Account Number', value: '1234567' },
      { label: 'SWIFT Code', value: 'BOTKJPJT' },
      { label: 'Beneficiary', value: 'JDM Global Auto Exports Ltd.' },
    ]
  },
  {
    title: 'International Account (USD)',
    details: [
      { label: 'Bank Name', value: 'Sumitomo Mitsui Banking Corporation' },
      { label: 'Branch', value: 'Shibuya Branch' },
      { label: 'Account Type', value: 'Current Account' },
      { label: 'Account Number', value: '7654321' },
      { label: 'SWIFT Code', value: 'SMBCJPJT' },
      { label: 'Beneficiary', value: 'JDM Global Auto Exports Ltd.' },
    ]
  }
];

export default function ProcessPage() {
  // Add smooth scroll behavior when component mounts
  React.useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        // Add a slight delay to ensure smooth scroll works
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, []);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>How to Buy with Us</h1>
          <p className={styles.subtitle}>
            Follow our simple 6-step process to import your dream car from Japan
          </p>
        </header>

        <div className={styles.timeline}>
          {steps.map((step) => (
            <div key={step.number} className={styles.timelineItem}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.timelineContent}>
                <h2 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  {step.title}
                </h2>
                <p className={styles.stepDescription}>{step.description}</p>
                <div className={styles.infoGrid}>
                  {step.info.map((item) => (
                    <div key={item.label} className={styles.infoItem}>
                      <span className={styles.infoLabel}>{item.label}</span>
                      <span className={styles.infoValue}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="banking-details" className={styles.bankingDetails}>
          <h2 className={styles.bankingTitle}>Banking Information</h2>
          <div className={styles.bankingGrid}>
            {bankingInfo.map((bank) => (
              <div key={bank.title} className={styles.bankCard}>
                <h3 className={styles.bankCardTitle}>{bank.title}</h3>
                <div className={styles.bankInfo}>
                  {bank.details.map((detail) => (
                    <div key={detail.label} className={styles.bankInfoItem}>
                      <span className={styles.bankInfoLabel}>{detail.label}</span>
                      <span className={styles.bankInfoValue}>{detail.value}</span>
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(detail.value, `${bank.title}-${detail.label}`)}
                      >
                        {copiedField === `${bank.title}-${detail.label}` ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.supportSection}>
          <h2 className={styles.supportTitle}>Need Assistance?</h2>
          <p className={styles.supportText}>
            Our team is here to help you through every step of the process. Contact us for personalized support.
          </p>
          <Link href="/contact" className={styles.supportButton}>
            <span>Contact Support Team</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
