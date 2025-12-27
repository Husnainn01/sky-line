'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../app/main_routes/process/page.module.css';
import TranslatableText from './TranslatableText';

interface Step {
  number: string;
  title: string;
  icon: string;
  description: string;
  info: Array<{ label: string; value: string }>;
}

interface BankInfo {
  title: string;
  details: Array<{ label: string; value: string }>;
}

interface ProcessPageClientProps {
  steps: Step[];
  bankingInfo: BankInfo[];
}

export default function ProcessPageClient({ steps, bankingInfo }: ProcessPageClientProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Add smooth scroll behavior when component mounts
  useEffect(() => {
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

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <TranslatableText text="How to Buy with Us" />
          </h1>
          <p className={styles.subtitle}>
            <TranslatableText text="Follow our simple 6-step process to import your dream car from Japan" />
          </p>
        </header>

        <div className={styles.timeline}>
          {steps.map((step) => (
            <div key={step.number} className={styles.timelineItem}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.timelineContent}>
                <h2 className={styles.stepTitle}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <TranslatableText text={step.title} />
                </h2>
                <p className={styles.stepDescription}>
                  <TranslatableText text={step.description} />
                </p>
                <div className={styles.infoGrid}>
                  {step.info.map((item) => (
                    <div key={item.label} className={styles.infoItem}>
                      <span className={styles.infoLabel}>
                        <TranslatableText text={item.label} />
                      </span>
                      <span className={styles.infoValue}>
                        <TranslatableText text={item.value} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="banking-details" className={styles.bankingDetails}>
          <h2 className={styles.bankingTitle}>
            <TranslatableText text="Banking Information" />
          </h2>
          <div className={styles.bankingGrid}>
            {bankingInfo.map((bank) => (
              <div key={bank.title} className={styles.bankCard}>
                <h3 className={styles.bankCardTitle}>
                  <TranslatableText text={bank.title} />
                </h3>
                <div className={styles.bankInfo}>
                  {bank.details.map((detail) => (
                    <div key={detail.label} className={styles.bankInfoItem}>
                      <span className={styles.bankInfoLabel}>
                        <TranslatableText text={detail.label} />
                      </span>
                      <span className={styles.bankInfoValue}>
                        <TranslatableText text={detail.value} />
                      </span>
                      <button
                        className={styles.copyButton}
                        onClick={() => handleCopy(detail.value, `${bank.title}-${detail.label}`)}
                      >
                        {copiedField === `${bank.title}-${detail.label}` ? (
                          <TranslatableText text="Copied!" />
                        ) : (
                          <TranslatableText text="Copy" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.supportSection}>
          <h2 className={styles.supportTitle}>
            <TranslatableText text="Need Assistance?" />
          </h2>
          <p className={styles.supportText}>
            <TranslatableText text="Our team is here to help you through every step of the process. Contact us for personalized support." />
          </p>
          <Link href="/contact" className={styles.supportButton}>
            <span>
              <TranslatableText text="Contact Support Team" />
            </span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
