'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">Error</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Something went wrong</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        We apologize for the inconvenience. Please try again later or contact support if the problem persists.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={reset} variant="default">
          Try Again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            Return Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
