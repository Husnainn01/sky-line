'use client';

import React from 'react';
import ComingSoon from '@/components/ComingSoon';

export default function PaymentsPage() {
  return (
    <ComingSoon
      title="Payment System Coming Soon"
      description="Our secure payment system is currently under development. Soon you'll be able to make deposits, view transaction history, and complete vehicle purchases all in one place with multiple payment options."
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      }
      ctaText="Return to Dashboard"
      ctaLink="/dashboard"
    />
  );
}
