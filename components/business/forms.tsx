'use client';

import { useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { firstError, type ActionResult } from '@/lib/actionResult';

/**
 * Form plumbing shared by the private business tools.
 *
 * Forms submit through `useSubmit` rather than `<form action={…}>` because React
 * resets a form after an action-prop submission — including one that came back
 * with validation errors, which would wipe what was just typed on a phone.
 */
export function useSubmit(
  action: (formData: FormData) => Promise<ActionResult>,
  { resetOnSuccess = false, onSuccess }: { resetOnSuccess?: boolean; onSuccess?: () => void } = {},
) {
  const [result, setResult] = useState<ActionResult>();
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let outcome: ActionResult | undefined;
      try {
        outcome = await action(formData);
      } catch {
        outcome = { ok: false, message: 'Could not reach the server. Check your connection and try again.' };
      }
      // A redirecting action resolves with nothing; the router is already navigating.
      if (!outcome) return;
      const settled = outcome;
      startTransition(() => {
        setResult(settled);
        if (settled.ok) {
          if (resetOnSuccess) form.reset();
          onSuccess?.();
        }
      });
    });
  };

  return { result, pending, onSubmit };
}

export const inputClass =
  'w-full px-3 py-2.5 text-base border border-stone-300 rounded-lg bg-white text-stone-900 placeholder:text-stone-400 ' +
  'focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none disabled:bg-stone-100';

export const primaryButtonClass =
  'inline-flex items-center justify-center bg-stone-800 text-white px-5 py-2.5 rounded-lg font-semibold ' +
  'hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryButtonClass =
  'inline-flex items-center justify-center border border-stone-300 bg-white text-stone-800 px-4 py-2 rounded-lg font-medium ' +
  'hover:bg-stone-100 transition-colors disabled:opacity-50';

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = '',
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700 mb-1">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-sm text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** aria props tying an input to its error message, if it has one. */
export function errorProps(result: ActionResult | undefined, field: string, id: string) {
  const error = result && !result.ok ? firstError(result.errors, field) : undefined;
  return {
    error,
    inputProps: error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {},
  };
}

export function FormMessage({ result }: { result: ActionResult | undefined }) {
  return (
    <div role="status" aria-live="polite">
      {result?.message && (
        <p
          className={`text-sm rounded-lg px-3 py-2 ${
            result.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {result.message}
        </p>
      )}
      {result && !result.ok && !result.message && result.errors && (
        <p className="text-sm rounded-lg px-3 py-2 bg-red-50 text-red-800 border border-red-200">
          Please fix the highlighted fields.
        </p>
      )}
    </div>
  );
}
