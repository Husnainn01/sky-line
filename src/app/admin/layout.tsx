'use client';

import React from 'react';
import { Inter } from 'next/font/google';
import './admin.css';

const inter = Inter({ subsets: ['latin'] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} admin-body`}>
      <div className="admin-container">
        {children}
      </div>
    </div>
  );
}
