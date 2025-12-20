'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function AuctionServiceQuote() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    preferredMake: '',
    modelPreference: '',
    yearRange: '',
    auctionPreference: '',
    additionalRequirements: ''
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h2>Quote Request Submitted!</h2>
          <p>Thank you for your interest in our auction services. Our team will review your requirements and contact you within 24 hours.</p>
          <div className={styles.nextSteps}>
            <h3>Next Steps:</h3>
            <ol>
              <li>Review of your requirements by our auction specialists</li>
              <li>Detailed quote preparation including all fees and charges</li>
              <li>Personal consultation to discuss available options</li>
              <li>Auction participation strategy planning</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Auction Service Quote</h1>
        <p className={styles.subtitle}>Get professional assistance for bidding in Japanese car auctions</p>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(step / 3) * 100}%` }}
          />
          <div className={styles.steps}>
            {['Basic Info', 'Vehicle Details', 'Additional Info'].map((label, index) => (
              <div 
                key={label} 
                className={`${styles.step} ${index + 1 <= step ? styles.active : ''}`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 && (
            <div className={styles.formStep}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.formStep}>
              <div className={styles.formGroup}>
                <label htmlFor="budget">Budget Range (USD)</label>
                <input
                  type="text"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  placeholder="e.g., 10,000 - 15,000"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="preferredMake">Preferred Make</label>
                <input
                  type="text"
                  id="preferredMake"
                  name="preferredMake"
                  value={formData.preferredMake}
                  onChange={handleChange}
                  placeholder="e.g., Toyota, Nissan"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="modelPreference">Model Preference</label>
                <input
                  type="text"
                  id="modelPreference"
                  name="modelPreference"
                  value={formData.modelPreference}
                  onChange={handleChange}
                  placeholder="e.g., Skyline, Supra"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="yearRange">Year Range</label>
                <input
                  type="text"
                  id="yearRange"
                  name="yearRange"
                  value={formData.yearRange}
                  onChange={handleChange}
                  placeholder="e.g., 1990 - 1995"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.formStep}>
              <div className={styles.formGroup}>
                <label htmlFor="auctionPreference">Preferred Auction House</label>
                <select
                  id="auctionPreference"
                  name="auctionPreference"
                  value={formData.auctionPreference}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an auction house</option>
                  <option value="USS">USS Auction</option>
                  <option value="TAA">Toyota Auto Auction</option>
                  <option value="JAA">Japan Auto Auction</option>
                  <option value="any">No Preference</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="additionalRequirements">Additional Requirements</label>
                <textarea
                  id="additionalRequirements"
                  name="additionalRequirements"
                  value={formData.additionalRequirements}
                  onChange={handleChange}
                  placeholder="Any specific requirements or preferences..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className={styles.formNavigation}>
            {step > 1 && (
              <button 
                type="button" 
                onClick={prevStep}
                className={styles.prevButton}
              >
                Previous
              </button>
            )}
            {step < 3 ? (
              <button 
                type="button" 
                onClick={nextStep}
                className={styles.nextButton}
              >
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
