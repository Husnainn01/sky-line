'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoot() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the login page
    router.push('/admin/login');
  }, [router]);
  
  // Show a loading message while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      Redirecting to admin login...
    </div>
  );
}
