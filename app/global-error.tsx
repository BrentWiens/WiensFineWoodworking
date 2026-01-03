'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-bold text-stone-800 mb-4">
          Something went wrong!
        </h2>
        <p className="text-stone-600 mb-8">
          We've been notified and are looking into it.
        </p>
        <button
          onClick={reset}
          className="bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
        >
          Try again
        </button>
      </div>
    </div>
  );
}