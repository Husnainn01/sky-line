'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // This will ensure users are redirected to the main page
    // which has the proper layout with header and footer
    router.replace('/');
  }, [router]);
  
  // Show a loading state while redirecting
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1rem',
      color: '#666'
    }}>
      Loading...
    </div>
  );
}
