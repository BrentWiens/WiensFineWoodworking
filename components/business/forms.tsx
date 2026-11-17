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

const MAX_SUGGESTIONS = 5;

/**
 * Autocomplete for a text input, as a row of buttons under it.
 *
 * Used instead of a native `<datalist>`: on a phone the browser draws a datalist's
 * dropdown over the on-screen keyboard, which made it impossible to type a name
 * that wasn't already in the list. These sit in the page flow, so they can never
 * cover the keyboard. Nothing shows until something is typed, and nothing once the
 * text already is one of the options.
 */
export function Suggestions({
  options,
  value,
  onPick,
  label,
}: {
  options: string[];
  value: string;
  onPick: (option: string) => void;
  /** What is being suggested, for screen readers: "Earlier destinations". */
  label: string;
}) {
  const typed = value.trim().toLowerCase();
  if (!typed) return null;
  if (options.some(option => option.toLowerCase() === typed)) return null;

  // Names that start with what was typed first, then ones that merely contain it
  const matches = [
    ...options.filter(option => option.toLowerCase().startsWith(typed)),
    ...options.filter(option => !option.toLowerCase().startsWith(typed) && option.toLowerCase().includes(typed)),
  ].slice(0, MAX_SUGGESTIONS);
  if (matches.length === 0) return null;

  return (
    <div role="group" aria-label={label} className="mt-2 flex flex-wrap gap-2">
      {matches.map(option => (
        <button
          key={option}
          type="button"
          // Keeps focus (and the keyboard) on the input while a suggestion is tapped
          onPointerDown={event => event.preventDefault()}
          onClick={() => onPick(option)}
          className="max-w-full truncate rounded-full border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-stone-800 hover:bg-stone-100"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/**
 * Picks the project a trip or expense belongs to. Submits the project's number as
 * `projectNumber`, or blank for none. A select rather than a text box, so a typo
 * can't quietly start a second project.
 */
export function ProjectSelect({
  id,
  value,
  onChange,
  projects,
  error,
}: {
  id: string;
  value: string;
  onChange: (projectNumber: string) => void;
  /** The active projects. */
  projects: { number: string; name: string }[];
  error?: string;
}) {
  // A finished project, or a number entered before projects existed, stays selectable
  const listed = projects.some(p => p.number === value);

  return (
    <Field
      label="Project (optional)"
      htmlFor={id}
      error={error}
      hint={
        projects.length === 0 && !value
          ? 'No active projects yet. Add one under Projects to link this to it.'
          : "Leave as No project if this isn't for a particular project."
      }
    >
      <select
        id={id}
        name="projectNumber"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
        {...(error ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {})}
      >
        <option value="">No project</option>
        {projects.map(p => (
          <option key={p.number} value={p.number}>
            {p.number} · {p.name}
          </option>
        ))}
        {value && !listed && <option value={value}>{value}</option>}
      </select>
    </Field>
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
