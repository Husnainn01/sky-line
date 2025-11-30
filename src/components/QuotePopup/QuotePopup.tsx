'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './QuotePopup.module.css';

type QuoteFormData = {
  name: string;
  email: string;
  phone: string;
  carType: string;
  budget: string;
  timeline: string;
  message: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const initialFormData: QuoteFormData = {
  name: '',
  email: '',
  phone: '',
  carType: '',
  budget: '',
  timeline: '',
  message: '',
};

const carTypes = [
  'Sports Car',
  'Luxury Sedan',
  'Classic Car',
  'SUV',
  'Drift Car',
  'Race Car',
  'Other',
];

const timelines = [
  'As soon as possible',
  'Within 1 month',
  'Within 3 months',
  'Within 6 months',
  'No specific timeline',
];

export default function QuotePopup({ isOpen, onClose }: Props) {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      // Reset form
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setIsSuccess(false);
    }, 300);
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={handleClose}>✕</button>

        {!isSuccess ? (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Get a Quick Quote</h2>
              <p className={styles.subtitle}>
                Tell us about your dream car and we'll provide a detailed quote within 24 hours
              </p>
            </div>

            <div className={styles.content}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Type of Car</label>
                  <select
                    name="carType"
                    value={formData.carType}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select car type</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Budget Range (USD)</label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select budget range</option>
                    <option value="under-10k">Under $10,000</option>
                    <option value="10k-20k">$10,000 - $20,000</option>
                    <option value="20k-30k">$20,000 - $30,000</option>
                    <option value="30k-50k">$30,000 - $50,000</option>
                    <option value="over-50k">Over $50,000</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Purchase Timeline</label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select timeline</option>
                    {timelines.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Additional Details</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    placeholder="Tell us more about your desired vehicle (make, model, year, specifications, etc.)"
                  />
                </div>
              </form>
            </div>

            <div className={styles.footer}>
              <p className={styles.footerText}>
                We'll get back to you within 24 hours
              </p>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Sending...' : 'Get Quote'}
              </button>
            </div>
          </>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✓</div>
            <h3 className={styles.successTitle}>Quote Request Sent!</h3>
            <p className={styles.successText}>
              We'll email you a detailed quote within 24 hours. Want to explore more options while you wait?
            </p>
            <Link href="/quote" className={styles.detailsButton} onClick={handleClose}>
              View Detailed Quote Options
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
