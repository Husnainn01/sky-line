'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

type FormData = {
  make: string;
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  condition: string;
  specifications: string[];
  additionalDetails: string;
  name: string;
  email: string;
  phone: string;
  country: string;
};

const initialFormData: FormData = {
  make: '',
  model: '',
  yearMin: '',
  yearMax: '',
  priceMin: '',
  priceMax: '',
  condition: '',
  specifications: [],
  additionalDetails: '',
  name: '',
  email: '',
  phone: '',
  country: '',
};

const makes = [
  'Toyota', 'Nissan', 'Honda', 'Mazda', 'Subaru', 'Mitsubishi',
  'Lexus', 'Infiniti', 'Suzuki', 'Other'
];

const conditions = [
  'Any Condition',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Project Car'
];

const specifications = [
  'Right Hand Drive',
  'Manual Transmission',
  'Turbo',
  'Stock Condition',
  'Modified',
  'Low Mileage',
  'Service History',
  'Original Paint',
];

export default function VehicleSearchQuote() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecChange = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.includes(spec)
        ? prev.specifications.filter(s => s !== spec)
        : [...prev.specifications, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Handle success
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Vehicle Search Quote</h1>
          <p className={styles.subtitle}>
            Tell us about your dream car and we'll help you find it
          </p>
        </header>

        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {step === 1 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Vehicle Details</h2>
              
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Make</label>
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select make</option>
                    {makes.map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="e.g. Skyline GT-R"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Year Range (From)</label>
                  <input
                    type="number"
                    name="yearMin"
                    value={formData.yearMin}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Minimum year"
                    min="1970"
                    max="2024"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Year Range (To)</label>
                  <input
                    type="number"
                    name="yearMax"
                    value={formData.yearMax}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Maximum year"
                    min="1970"
                    max="2024"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price Range (From)</label>
                  <input
                    type="number"
                    name="priceMin"
                    value={formData.priceMin}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Minimum price (USD)"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Price Range (To)</label>
                  <input
                    type="number"
                    name="priceMax"
                    value={formData.priceMax}
                    onChange={handleChange}
                    className={styles.formInput}
                    placeholder="Maximum price (USD)"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.nextButton}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Specifications</h2>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className={styles.formSelect}
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Specifications</label>
                <div className={styles.checkboxGrid}>
                  {specifications.map(spec => (
                    <label key={spec} className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={formData.specifications.includes(spec)}
                        onChange={() => handleSpecChange(spec)}
                      />
                      <span>{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Additional Details</label>
                <textarea
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleChange}
                  className={styles.formTextarea}
                  placeholder="Any specific requirements or preferences..."
                  rows={4}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.backButton}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className={styles.nextButton}
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              
              <div className={styles.formGrid}>
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
                  <label className={styles.formLabel}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                    placeholder="Your country"
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.backButton}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Get Quote'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
