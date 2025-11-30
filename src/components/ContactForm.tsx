'use client';

import { useState } from 'react';
import { ContactFormData } from '@/types';
import styles from './ContactForm.module.css';

export default function ContactForm() {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        message: '',
        carInterest: '',
    });

    const [errors, setErrors] = useState<Partial<ContactFormData>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<ContactFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof ContactFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Simulate API call (replace with actual backend call later)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log('Form submitted:', formData);

        setIsSubmitting(false);
        setSubmitSuccess(true);

        // Reset form
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
            carInterest: '',
        });

        // Hide success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {submitSuccess && (
                <div className={styles.successMessage}>
                    Thank you! We'll get back to you soon.
                </div>
            )}

            <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>
                    Name *
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.name ? styles.error : ''}`}
                    placeholder="Your full name"
                />
                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                    Email *
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.error : ''}`}
                    placeholder="your.email@example.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="phone" className={styles.label}>
                    Phone *
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.phone ? styles.error : ''}`}
                    placeholder="+1 234 567 8900"
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="carInterest" className={styles.label}>
                    Car Interest (Optional)
                </label>
                <input
                    type="text"
                    id="carInterest"
                    name="carInterest"
                    value={formData.carInterest}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., 1995 Toyota Supra"
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                    Message *
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`${styles.textarea} ${errors.message ? styles.error : ''}`}
                    placeholder="Tell us about your inquiry..."
                    rows={5}
                />
                {errors.message && <span className={styles.errorText}>{errors.message}</span>}
            </div>

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}
