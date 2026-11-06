'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actionResult';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';

export interface TripFormValues {
  tripDate: string;
  origin: string;
  destination: string;
  purpose: string;
  oneWayKm: string;
  roundTrip: boolean;
  notes: string;
}

interface TripFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initial: TripFormValues;
  places: { id: number; name: string; oneWayKm: number | null }[];
  /** Earlier destinations, offered as autocomplete. */
  suggestions: string[];
  mode: 'create' | 'edit';
  cancelHref?: string;
}

/**
 * Built for logging a trip on a phone right after driving it: pick a saved place
 * (fills destination and distance), type the purpose, save. After a save the date
 * and start point stay put, since the next trip is usually the same day.
 */
export default function TripForm({ action, initial, places, suggestions, mode, cancelHref }: TripFormProps) {
  const [values, setValues] = useState(initial);
  const set = <K extends keyof TripFormValues>(key: K, value: TripFormValues[K]) =>
    setValues(v => ({ ...v, [key]: value }));

  const { result, pending, onSubmit } = useSubmit(action, {
    onSuccess:
      mode === 'create'
        ? () => setValues(v => ({ ...initial, tripDate: v.tripDate, origin: v.origin }))
        : undefined,
  });

  const pickPlace = (id: string) => {
    const place = places.find(p => String(p.id) === id);
    if (!place) return;
    setValues(v => ({
      ...v,
      destination: place.name,
      oneWayKm: place.oneWayKm !== null ? String(place.oneWayKm) : v.oneWayKm,
    }));
  };

  const oneWay = Number(values.oneWayKm);
  const total = Number.isFinite(oneWay) && oneWay > 0 ? Math.round(oneWay * (values.roundTrip ? 2 : 1) * 10) / 10 : null;
  const destinationOptions = [...new Set([...places.map(p => p.name), ...suggestions])];

  const date = errorProps(result, 'tripDate', 'trip-date');
  const origin = errorProps(result, 'origin', 'trip-origin');
  const destination = errorProps(result, 'destination', 'trip-destination');
  const km = errorProps(result, 'oneWayKm', 'trip-km');
  const purpose = errorProps(result, 'purpose', 'trip-purpose');
  const notes = errorProps(result, 'notes', 'trip-notes');

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="trip-date" error={date.error}>
          <input
            id="trip-date"
            name="tripDate"
            type="date"
            required
            value={values.tripDate}
            onChange={e => set('tripDate', e.target.value)}
            className={inputClass}
            {...date.inputProps}
          />
        </Field>
        <Field label="From" htmlFor="trip-origin" error={origin.error}>
          <input
            id="trip-origin"
            name="origin"
            required
            value={values.origin}
            onChange={e => set('origin', e.target.value)}
            className={inputClass}
            {...origin.inputProps}
          />
        </Field>
      </div>

      {places.length > 0 && (
        <Field label="Saved place" htmlFor="trip-place">
          <select
            id="trip-place"
            value=""
            onChange={e => pickPlace(e.target.value)}
            className={inputClass}
          >
            <option value="">Choose to fill in destination…</option>
            {places.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.oneWayKm !== null ? ` (${p.oneWayKm} km)` : ''}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="To" htmlFor="trip-destination" error={destination.error}>
        <input
          id="trip-destination"
          name="destination"
          required
          list="trip-destination-options"
          autoComplete="off"
          placeholder="e.g. Lumber yard, client's house"
          value={values.destination}
          onChange={e => set('destination', e.target.value)}
          className={inputClass}
          {...destination.inputProps}
        />
        <datalist id="trip-destination-options">
          {destinationOptions.map(d => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </Field>

      <div className="grid grid-cols-2 gap-3 items-start">
        <Field
          label="One-way km"
          htmlFor="trip-km"
          error={km.error}
          hint={total !== null && values.roundTrip ? `Total: ${total} km` : undefined}
        >
          <input
            id="trip-km"
            name="oneWayKm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            required
            value={values.oneWayKm}
            onChange={e => set('oneWayKm', e.target.value)}
            className={inputClass}
            {...km.inputProps}
          />
        </Field>
        <label className="flex items-center gap-2 mt-7 text-stone-800 select-none">
          <input
            type="checkbox"
            name="roundTrip"
            checked={values.roundTrip}
            onChange={e => set('roundTrip', e.target.checked)}
            className="h-5 w-5 accent-stone-800"
          />
          Round trip
        </label>
      </div>

      <Field label="Business purpose" htmlFor="trip-purpose" error={purpose.error}>
        <input
          id="trip-purpose"
          name="purpose"
          required
          placeholder="e.g. Pick up walnut for Smith dining table"
          value={values.purpose}
          onChange={e => set('purpose', e.target.value)}
          className={inputClass}
          {...purpose.inputProps}
        />
      </Field>

      <details className="group" open={mode === 'edit' && initial.notes !== ''}>
        <summary className="cursor-pointer text-sm text-stone-600 hover:text-stone-900">Notes (optional)</summary>
        <Field label="Notes" htmlFor="trip-notes" error={notes.error} className="mt-2">
          <textarea
            id="trip-notes"
            name="notes"
            rows={2}
            value={values.notes}
            onChange={e => set('notes', e.target.value)}
            className={inputClass}
            {...notes.inputProps}
          />
        </Field>
      </details>

      <FormMessage result={result} />

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={`${primaryButtonClass} flex-1 sm:flex-none`}>
          {pending ? 'Saving…' : mode === 'create' ? 'Log trip' : 'Save changes'}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className={secondaryButtonClass}>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
