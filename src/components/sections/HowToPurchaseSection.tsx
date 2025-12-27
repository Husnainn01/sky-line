'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './HowToPurchaseSection.module.css';
import TranslatableText from '@/components/TranslatableText';

export default function HowToPurchaseSection() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

    const steps = [
        {
            number: 1,
            title: 'Search & Select',
            description: 'Browse our extensive inventory and select your perfect vehicle',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <path d="M11 8v6M8 11h6" />
                </svg>
            )
        },
        {
            number: 2,
            title: 'Secure Payment',
            description: 'Complete payment with trusted methods',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                </svg>
            ),
            badges: ['VISA', 'Mastercard', 'PayPal']
        },
        {
            number: 3,
            title: 'Processing',
            description: 'Vehicle inspection and shipping preparation',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            )
        },
        {
            number: 4,
            title: 'Delivery',
            description: 'Safe delivery to your location',
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 3h5v13h-5zM16 8H1v11h15V8z" />
                    <circle cx="5.5" cy="19.5" r="2.5" />
                    <circle cx="18.5" cy="19.5" r="2.5" />
                </svg>
            )
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}><TranslatableText text="Simple Process" /></span>
                    <h2 className={styles.title}><TranslatableText text="How to Purchase" /></h2>
                    <p className={styles.subtitle}>
                        <TranslatableText text="Get your dream JDM vehicle in 4 easy steps" />
                    </p>
                </div>

                <div className={styles.stepsContainer}>
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`${styles.stepWrapper} ${activeStep === step.number ? styles.active : ''}`}
                            onMouseEnter={() => setActiveStep(step.number)}
                            onMouseLeave={() => setActiveStep(null)}
                        >
                            {index < steps.length - 1 && (
                                <div className={styles.connector}>
                                    <div className={styles.connectorLine}></div>
                                    <svg className={styles.connectorArrow} viewBox="0 0 24 24" fill="none">
                                        <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}

                            <div className={styles.stepCard}>
                                <div className={styles.stepNumber}>{step.number}</div>

                                <div className={styles.iconContainer}>
                                    {step.icon}
                                </div>

                                <h3 className={styles.stepTitle}><TranslatableText text={step.title} /></h3>
                                <p className={styles.stepDescription}><TranslatableText text={step.description} /></p>

                                {step.badges && (
                                    <div className={styles.badges}>
                                        {step.badges.map((badge, i) => (
                                            <span key={i} className={styles.badge}>{badge}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.cta}>
                    <Link href="/process" className={styles.guideButton}>
                        <span><TranslatableText text="View Complete Guide" /></span>
                        <svg viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                    <p className={styles.ctaSubtext}>
                        <TranslatableText text="Have questions?" /> <Link href="/contact"><TranslatableText text="Contact our team" /></Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
