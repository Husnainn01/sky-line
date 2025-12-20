'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">Server Error</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            We apologize for the inconvenience. Our server encountered an error and could not complete your request.
          </p>
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
