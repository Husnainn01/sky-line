'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    subject: '',
    inquiryType: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      setSubmitStatus('success');
      // Reset form after success
      setFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        subject: '',
        inquiryType: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const inquiryTypes = [
    'General Inquiry',
    'Vehicle Purchase',
    'Auction Service',
    'Shipping & Logistics',
    'Parts & Accessories',
    'Business Partnership',
  ];

  const offices = [
    {
      name: 'Tokyo Headquarters',
      address: '1-2-3 Shibaura, Minato-ku, Tokyo 108-0023, Japan',
      phone: '+81 3-1234-5678',
      email: 'tokyo@skylinejdm.com',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM (JST)',
    },
    {
      name: 'Osaka Branch',
      address: '4-5-6 Umeda, Kita-ku, Osaka 530-0001, Japan',
      phone: '+81 6-1234-5678',
      email: 'osaka@skylinejdm.com',
      hours: 'Monday - Friday: 9:00 AM - 6:00 PM (JST)',
    },
  ];

  const contactInfo = {
    phone: '+81 3-1234-5678',
    email: 'info@skylinejdm.com',
    address: '1-2-3 Shibaura, Minato-ku, Tokyo 108-0023, Japan',
    whatsapp: '+81 90-1234-5678',
    line: '@skylinejdm',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM (JST)',
  };

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Shipping duration varies by destination. Typically, it takes 4-8 weeks from purchase to delivery, including documentation and transit time.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, credit cards, and other secure payment methods. Payment details will be provided after order confirmation.',
    },
    {
      question: 'Do you help with customs clearance?',
      answer: 'Yes, we assist with all necessary documentation and can guide you through the customs clearance process in your country.',
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.pageBackground} />
        <header className={styles.header}>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Get in touch with our team for inquiries about vehicles, shipping, or any other questions
          </p>
        </header>

        <div className={styles.mainLayout}>
          <section className={styles.formSection}>
            <h2 className={styles.formTitle}>Send us a message</h2>
            <form onSubmit={handleSubmit}>
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
                  <label className={styles.formLabel}>Phone</label>
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

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={styles.formInput}
                    required
                    placeholder="Brief subject of your inquiry"
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Inquiry Type</label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className={styles.formSelect}
                    required
                  >
                    <option value="">Select Inquiry Type</option>
                    {inquiryTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.formLabel}>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.formTextarea}
                    required
                    placeholder="Please provide details about your inquiry..."
                    rows={6}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={styles.formButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : submitStatus === 'success' ? 'Message Sent!' : submitStatus === 'error' ? 'Try Again' : 'Send Message'}
              </button>
            </form>
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.contactCard}>
              <h3 className={styles.contactTitle}>Contact Information</h3>
              <div className={styles.contactList}>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <img src="/images/icons/phone-call.svg" alt="Phone icon" loading="lazy" />
                  </span>
                  <a href={`tel:${contactInfo.phone}`} className={styles.contactLink}>
                    {contactInfo.phone}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <img src="/images/icons/envelope.svg" alt="Email icon" loading="lazy" />
                  </span>
                  <a href={`mailto:${contactInfo.email}`} className={styles.contactLink}>
                    {contactInfo.email}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <img src="/images/icons/marker.svg" alt="Location icon" loading="lazy" />
                  </span>
                  <span className={styles.contactText}>{contactInfo.address}</span>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <img src="/images/icons/whatsapp.svg" alt="WhatsApp icon" loading="lazy" />
                  </span>
                  <a
                    href={`https://wa.me/${contactInfo.whatsapp.replace(/[^0-9]/g, '')}`}
                    className={styles.contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp: {contactInfo.whatsapp}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <span className={styles.contactIcon}>
                    <img src="/images/icons/line-icon.svg" alt="Chat icon" loading="lazy" />
                  </span>
                  <span className={styles.contactText}>LINE ID: {contactInfo.line}</span>
                </div>
                <div className={styles.officeHours}>
                  <strong>Office Hours:</strong><br />
                  {contactInfo.hours}
                </div>
              </div>
              <div className={styles.socialLinks}>
                {[
                  { label: 'Facebook', href: 'https://facebook.com', icon: '/images/icons/facebook-square-icon.svg' },
                  { label: 'Instagram', href: 'https://instagram.com', icon: '/images/icons/ig-instagram-icon.svg' },
                  { label: 'TikTok', href: 'https://tiktok.com', icon: '/images/icons/tiktok-rounded-square-icon.svg' },
                  { label: 'Whatsapp', href: 'https://whatsapp.com', icon: '/images/icons/whatsapp-color-icon.svg' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <img src={social.icon} alt={`${social.label} icon`} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.mapCard}>
              <iframe
                title="Nagoya Headquarters Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3240.904323246493!2d136.89887167642523!3d35.17091537275274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x600370d17405bfb7%3A0xf66d53295d85f1e6!2sNagoya%2C%20Aichi%2C%20Japan!5e0!3m2!1sen!2sus!4v1734910140000!5m2!1sen!2sus"
                className={styles.mapFrame}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </aside>
        </div>

        <section className={styles.faqSection}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq) => (
              <div key={faq.question} className={styles.faqCard}>
                <h3 className={styles.faqTitle}>{faq.question}</h3>
                <p className={styles.faqText}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
