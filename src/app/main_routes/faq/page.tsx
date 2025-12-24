'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const faqData: FAQ[] = [
  // Vehicle Import
  {
    id: 'import-1',
    category: 'vehicle-import',
    question: 'What are the requirements for importing a vehicle to my country?',
    answer: 'Requirements vary by country but generally include: vehicle age restrictions, emissions standards compliance, safety regulations, import duties, and proper documentation. We assist with all necessary paperwork and ensure vehicles meet your country\'s requirements.',
  },
  {
    id: 'import-2',
    category: 'vehicle-import',
    question: 'How long does the import process take?',
    answer: 'The import process typically takes 6-8 weeks from purchase to delivery. This includes auction purchase, documentation, shipping, and customs clearance. Timing can vary based on destination country and specific requirements.',
  },
  {
    id: 'import-3',
    category: 'vehicle-import',
    question: 'What documents are needed for vehicle import?',
    answer: 'Required documents include: Bill of Lading, Export Certificate, Purchase Invoice, Vehicle Registration, Inspection Certificate, and Import Declaration. We handle all documentation preparation on your behalf.',
  },

  // Auction Process
  {
    id: 'auction-1',
    category: 'auction',
    question: 'How do I participate in Japanese car auctions?',
    answer: 'Through our service, you can access all major Japanese auto auctions. Simply tell us your desired vehicle and maximum budget. We\'ll handle the bidding process, inspection, and provide real-time updates.',
  },
  {
    id: 'auction-2',
    category: 'auction',
    question: 'What does the auction grade mean?',
    answer: 'Auction grades range from 0-5, with 5 being the best. They indicate the vehicle\'s overall condition, including exterior, interior, and mechanical state. We provide detailed grade explanations and inspection reports.',
  },
  {
    id: 'auction-3',
    category: 'auction',
    question: 'Can I inspect the vehicle before bidding?',
    answer: 'While physical inspection isn\'t possible for overseas buyers, we provide detailed auction inspection reports, photos, and our expert assessment. Our team physically inspects vehicles when possible.',
  },

  // Shipping & Logistics
  {
    id: 'shipping-1',
    category: 'shipping',
    question: 'What shipping methods are available?',
    answer: 'We offer container shipping (shared or exclusive) and RoRo (Roll-on/Roll-off) shipping. Container shipping provides better protection, while RoRo is more economical for operational vehicles.',
  },
  {
    id: 'shipping-2',
    category: 'shipping',
    question: 'How are vehicles protected during shipping?',
    answer: 'Vehicles are securely fastened in containers or on RoRo vessels. We provide comprehensive marine insurance coverage against damage or loss during transit.',
  },
  {
    id: 'shipping-3',
    category: 'shipping',
    question: 'Can I track my vehicle during shipping?',
    answer: 'Yes, we provide regular updates and tracking information. You\'ll receive notifications at key stages: departure from Japan, transit updates, and arrival at destination port.',
  },

  // Payment & Costs
  {
    id: 'payment-1',
    category: 'payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept bank transfers, credit cards, and other secure payment methods. All transactions are processed through secure channels with detailed invoicing.',
  },
  {
    id: 'payment-2',
    category: 'payment',
    question: 'What costs are involved besides the vehicle price?',
    answer: 'Additional costs include: auction fees, shipping costs, insurance, import duties, and our service fee. We provide a detailed cost breakdown before purchase.',
  },
  {
    id: 'payment-3',
    category: 'payment',
    question: 'Do you offer financing options?',
    answer: 'While we don\'t provide direct financing, we can recommend trusted partners who specialize in international auto financing. Terms vary by country.',
  },

  // After-Sales
  {
    id: 'aftersales-1',
    category: 'after-sales',
    question: 'What warranty options are available?',
    answer: 'We offer various warranty packages for mechanical and electrical components. Coverage periods and terms vary. Extended warranties are available through our partners.',
  },
  {
    id: 'aftersales-2',
    category: 'after-sales',
    question: 'Can you help with parts and maintenance?',
    answer: 'Yes, we maintain relationships with parts suppliers and can assist in sourcing genuine or aftermarket parts. We can also recommend specialized mechanics in your area.',
  },
  {
    id: 'aftersales-3',
    category: 'after-sales',
    question: 'What post-purchase support do you provide?',
    answer: 'We offer ongoing support including documentation assistance, parts sourcing, maintenance advice, and technical support. Our team remains available after delivery.',
  },
];

const categories = [
  { id: 'all', name: 'All Questions', icon: '/images/icons/globe-line-icon.svg' },
  { id: 'vehicle-import', name: 'Vehicle Import', icon: '/images/icons/cruise-icon.svg' },
  { id: 'auction', name: 'Auction Process', icon: '/images/icons/male-services-support-icon.svg' },
  { id: 'shipping', name: 'Shipping & Logistics', icon: '/images/icons/box-package-icon.svg' },
  { id: 'payment', name: 'Payment & Costs', icon: '/images/icons/bank-transfer-icon.svg' },
  { id: 'after-sales', name: 'After-Sales Support', icon: '/images/icons/male-services-support-icon.svg' },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleQuestion = (id: string) => {
    setOpenQuestions(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Find answers to common questions about our vehicle import, auction, and shipping services
          </p>
        </header>

        <div className={styles.categories}>
          {categories.map(category => (
            <button
              key={category.id}
              className={`${styles.categoryButton} ${activeCategory === category.id ? styles.categoryButtonActive : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className={styles.categoryIcon}>
                <Image
                  src={category.icon}
                  alt={`${category.name} icon`}
                  width={24}
                  height={24}
                  className={styles.categoryIconImage}
                />
              </span>
              {category.name}
            </button>
          ))}
        </div>

        <div className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search frequently asked questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredFAQs.length > 0 ? (
          <div className={styles.faqGrid}>
            {filteredFAQs.map(faq => (
              <div key={faq.id} className={styles.faqCard}>
                <div 
                  className={styles.faqQuestion}
                  onClick={() => toggleQuestion(faq.id)}
                >
                  <div className={styles.faqQuestionText}>{faq.question}</div>
                  <span className={`${styles.faqToggle} ${openQuestions.includes(faq.id) ? styles.faqToggleOpen : ''}`}>
                    ▼
                  </span>
                </div>
                <div className={`${styles.faqAnswer} ${openQuestions.includes(faq.id) ? '' : styles.faqAnswerHidden}`}>
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3 className={styles.noResultsTitle}>No matching questions found</h3>
            <p>Try adjusting your search or browse all categories</p>
          </div>
        )}

        <div className={styles.contactBox}>
          <h2 className={styles.contactTitle}>Still have questions?</h2>
          <p className={styles.contactText}>
            Can't find what you're looking for? Our team is here to help with any specific questions.
          </p>
          <Link href="/contact" className={styles.contactButton}>
            <span>Contact Support</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
