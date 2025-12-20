'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

export default function ImportShippingQuote() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    destination: '',
    shippingMethod: '',
    customsClearance: false,
    insurance: false,
    estimatedValue: '',
    additionalServices: [] as string[],
    specialRequirements: ''
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const shippingMethods = [
    { value: 'container', label: 'Container (Shared/Consolidated)' },
    { value: 'roro', label: 'RoRo (Roll-on/Roll-off)' },
    { value: 'dedicated', label: 'Dedicated Container' }
  ];

  const additionalServices = [
    { value: 'inspection', label: 'Pre-shipping Inspection' },
    { value: 'documentation', label: 'Documentation Assistance' },
    { value: 'tracking', label: 'Real-time Tracking' },
    { value: 'storage', label: 'Temporary Storage' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name === 'additionalServices') {
        setFormData(prev => ({
          ...prev,
          additionalServices: checkbox.checked
            ? [...prev.additionalServices, value]
            : prev.additionalServices.filter(service => service !== value)
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields in the last step
    if (step === 3) {
      if (!formData.additionalServices.length) {
        alert('Please select at least one additional service');
        return;
      }
    }

    if (step < 3) {
      nextStep();
      return;
    }

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
          <p>Thank you for your interest in our import & shipping services. Our team will prepare a detailed quote within 24 hours.</p>
          <div className={styles.nextSteps}>
            <h3>Next Steps:</h3>
            <ol>
              <li>Review of shipping requirements</li>
              <li>Detailed cost breakdown preparation</li>
              <li>Documentation requirements list</li>
              <li>Shipping schedule proposal</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Import & Shipping Quote</h1>
        <p className={styles.subtitle}>Get a comprehensive quote for vehicle import and shipping services</p>
        
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${(step / 3) * 100}%` }}
          />
          <div className={styles.steps}>
            {['Contact Info', 'Shipping Details', 'Additional Services'].map((label, index) => (
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
                <label htmlFor="vehicleType">Vehicle Type</label>
                <input
                  type="text"
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  placeholder="e.g., Sedan, SUV, Sports Car"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="destination">Destination Country/Port</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="shippingMethod">Preferred Shipping Method</label>
                <select
                  id="shippingMethod"
                  name="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select shipping method</option>
                  {shippingMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="estimatedValue">Estimated Vehicle Value (USD)</label>
                <input
                  type="text"
                  id="estimatedValue"
                  name="estimatedValue"
                  value={formData.estimatedValue}
                  onChange={handleChange}
                  placeholder="e.g., 15000"
                  required
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.formStep}>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="customsClearance"
                    checked={formData.customsClearance}
                    onChange={handleChange}
                  />
                  Include Customs Clearance Service
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="insurance"
                    checked={formData.insurance}
                    onChange={handleChange}
                  />
                  Include Marine Insurance
                </label>
              </div>
              <div className={styles.formGroup}>
                <label>Additional Services</label>
                <div className={styles.checkboxGrid}>
                  {additionalServices.map(service => (
                    <label key={service.value} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="additionalServices"
                        value={service.value}
                        checked={formData.additionalServices.includes(service.value)}
                        onChange={handleChange}
                      />
                      {service.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="specialRequirements">Special Requirements</label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  placeholder="Any specific requirements or notes..."
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
            <button 
                type="submit" 
                className={step < 3 ? styles.nextButton : styles.submitButton}
                disabled={isSubmitting}
              >
                {step < 3 ? 'Next' : isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}
