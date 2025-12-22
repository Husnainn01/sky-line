'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// Empty initial state - will be populated from API
const initialFaqData: FAQ[] = [];

const categories = [
  { id: 'all', name: 'All Questions', icon: '📋' },
  { id: 'vehicle-import', name: 'Vehicle Import', icon: '🚢' },
  { id: 'auction', name: 'Auction Process', icon: '🔨' },
  { id: 'shipping', name: 'Shipping & Logistics', icon: '📦' },
  { id: 'payment', name: 'Payment & Costs', icon: '💳' },
  { id: 'after-sales', name: 'After-Sales Support', icon: '🔧' },
];

export default function FAQPage() {
  const [faqData, setFaqData] = useState<FAQ[]>(initialFaqData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestions, setOpenQuestions] = useState<string[]>([]);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        
        const response = await fetch(`${API_BASE_URL}/faqs`);
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data) {
          // Map MongoDB _id to id for frontend consistency
          const mappedData = data.data
            .filter((item: any) => item.isActive) // Only show active FAQs
            .map((item: any) => ({
              ...item,
              id: item._id // Map _id to id
            }));
          console.log('Mapped FAQs:', mappedData);
          setFaqData(mappedData);
        } else {
          console.log('No FAQs found or invalid data');
          setFaqData([]);
        }
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError('Failed to load FAQs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = searchQuery === '' || 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqData, activeCategory, searchQuery]);

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
              <span className={styles.categoryIcon}>{category.icon}</span>
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

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading FAQs...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3 className={styles.errorTitle}>Error loading FAQs</h3>
            <p>{error}</p>
          </div>
        ) : filteredFAQs.length > 0 ? (
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
