import { Metadata } from 'next';
import ContactPageClient from '@/components/ContactPageClient';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact Us - Skyline TRD',
  description: 'Get in touch with our team for inquiries about vehicles, shipping, or any other questions',
};

export default function ContactPage() {
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

  return <ContactPageClient contactInfo={contactInfo} offices={offices} faqs={faqs} inquiryTypes={inquiryTypes} />;
}
