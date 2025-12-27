'use client';

import { useState } from 'react';
import styles from './FAQSection.module.css';
import TranslatableText from '@/components/TranslatableText';

interface FAQItem {
    question: string;
    answer: string;
}

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: 'How long does the shipping process take?',
            answer: 'Shipping typically takes 4-8 weeks depending on your destination. We handle all export documentation and arrange secure shipping with trusted carriers to ensure your vehicle arrives safely.'
        },
        {
            question: 'Are all vehicles inspected before export?',
            answer: 'Yes, every vehicle undergoes a thorough inspection by our certified technicians. We provide detailed inspection reports including photos, mechanical condition, and any necessary repairs or maintenance.'
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept bank transfers, credit cards (Visa, Mastercard), and PayPal. A deposit is required to secure your vehicle, with the balance due before shipping. All transactions are secure and protected.'
        },
        {
            question: 'Can I request specific modifications or parts?',
            answer: 'Absolutely! We can source specific parts, arrange modifications, or perform upgrades before shipping. Our team works with trusted workshops in Japan to fulfill your customization requests.'
        },
        {
            question: 'Do you provide warranty or after-sales support?',
            answer: 'We provide a comprehensive pre-export inspection report and can arrange extended warranty options. Our support team is available to assist with any questions even after delivery.'
        },
        {
            question: 'What documents are required for import?',
            answer: 'Required documents vary by country but typically include the export certificate, bill of lading, and vehicle title. We provide all necessary export documentation and can guide you through your country\'s import requirements.'
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}><TranslatableText text="Got Questions?" /></span>
                    <h2 className={styles.title}><TranslatableText text="Frequently Asked Questions" /></h2>
                    <p className={styles.subtitle}>
                        <TranslatableText text="Find answers to common questions about our export process" />
                    </p>
                </div>

                <div className={styles.faqGrid}>
                    <div className={styles.faqList}>
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}
                            >
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={openIndex === index}
                                >
                                    <span className={styles.questionText}><TranslatableText text={faq.question} /></span>
                                    <svg
                                        className={styles.icon}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                                <div className={styles.faqAnswer}>
                                    <p><TranslatableText text={faq.answer} /></p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.contactCard}>
                        <div className={styles.contactIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                            </svg>
                        </div>
                        <h3 className={styles.contactTitle}><TranslatableText text="Still have questions?" /></h3>
                        <p className={styles.contactText}>
                            <TranslatableText text="Can't find the answer you're looking for? Our team is here to help." />
                        </p>
                        <a href="/contact" className={styles.contactButton}>
                            <TranslatableText text="Contact Support" />
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
