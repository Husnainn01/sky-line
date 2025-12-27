import { Metadata } from 'next';
import ProcessPageClient from '@/components/ProcessPageClient';
import styles from './page.module.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'How to Buy with Us - Skyline TRD',
  description: 'Follow our simple 6-step process to import your dream car from Japan',
};

export default function ProcessPage() {
  const steps = [
    {
      number: '1',
      title: 'Vehicle Selection',
      icon: '🚗',
      description: 'Browse our inventory or auction vehicles. Once you find your desired vehicle, submit an inquiry or place a bid.',
      info: [
        { label: 'Response Time', value: 'Within 24 hours' },
        { label: 'Required Info', value: 'Vehicle details & preferences' },
      ]
    },
    {
      number: '2',
      title: 'Price Quotation',
      icon: '💰',
      description: 'Receive a detailed quote including vehicle price, shipping costs, import duties, and our service fees.',
      info: [
        { label: 'Quote Validity', value: '7 days' },
        { label: 'Price Currency', value: 'USD/JPY' },
      ]
    },
    {
      number: '3',
      title: 'Payment Process',
      icon: '🏦',
      description: 'Upon quote acceptance, submit the initial deposit to secure the vehicle. The remaining balance is due before shipping.',
      info: [
        { label: 'Initial Deposit', value: '20% of total' },
        { label: 'Payment Methods', value: 'Bank transfer' },
      ]
    },
    {
      number: '4',
      title: 'Documentation',
      icon: '📄',
      description: 'We handle all necessary paperwork including export certificates, de-registration, and shipping documents.',
      info: [
        { label: 'Processing Time', value: '5-7 business days' },
        { label: 'Required Docs', value: 'Import permit (if applicable)' },
      ]
    },
    {
      number: '5',
      title: 'Shipping Process',
      icon: '🚢',
      description: 'Your vehicle is carefully prepared for shipping. We provide regular updates and tracking information.',
      info: [
        { label: 'Transit Time', value: '4-8 weeks' },
        { label: 'Tracking Updates', value: 'Every 3-5 days' },
      ]
    },
    {
      number: '6',
      title: 'Delivery & Support',
      icon: '🎯',
      description: 'Coordinate with our team for vehicle collection at your local port. We assist with customs clearance process.',
      info: [
        { label: 'Port Handling', value: '2-3 business days' },
        { label: 'Support Period', value: '30 days post-delivery' },
      ]
    },
  ];
  
  const bankingInfo = [
    {
      title: 'Japan Account (JPY)',
      details: [
        { label: 'Bank Name', value: 'MUFG Bank, Ltd.' },
        { label: 'Branch', value: 'Tokyo Main Branch' },
        { label: 'Account Type', value: 'Current Account' },
        { label: 'Account Number', value: '1234567' },
        { label: 'SWIFT Code', value: 'BOTKJPJT' },
        { label: 'Beneficiary', value: 'JDM Global Auto Exports Ltd.' },
      ]
    },
    {
      title: 'International Account (USD)',
      details: [
        { label: 'Bank Name', value: 'Sumitomo Mitsui Banking Corporation' },
        { label: 'Branch', value: 'Shibuya Branch' },
        { label: 'Account Type', value: 'Current Account' },
        { label: 'Account Number', value: '7654321' },
        { label: 'SWIFT Code', value: 'SMBCJPJT' },
        { label: 'Beneficiary', value: 'JDM Global Auto Exports Ltd.' },
      ]
    }
  ];

  return <ProcessPageClient steps={steps} bankingInfo={bankingInfo} />;
}
