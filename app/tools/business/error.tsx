'use client';

export default function BusinessToolsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6 text-center space-y-3">
      <h2 className="text-lg font-semibold text-stone-800">Something went wrong</h2>
      <p className="text-stone-600 text-sm">
        The data couldn&apos;t be loaded. If this keeps happening, check that the database is connected.
        {error.digest && <span className="block mt-1 text-stone-400">Reference: {error.digest}</span>}
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-stone-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-stone-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
