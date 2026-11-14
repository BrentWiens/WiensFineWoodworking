'use client';

import { useState } from 'react';
import type { ActionResult } from '@/lib/actionResult';
import ConfirmButton from './ConfirmButton';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';

type Action = (formData: FormData) => Promise<ActionResult>;

export function VehicleForm({ action, name }: { action: Action; name: string }) {
  const { result, pending, onSubmit } = useSubmit(action);
  const field = errorProps(result, 'name', 'vehicle-name');

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <Field label="Vehicle" htmlFor="vehicle-name" error={field.error} hint="e.g. 2019 Ford F-150">
        <input id="vehicle-name" name="name" defaultValue={name} required className={inputClass} {...field.inputProps} />
      </Field>
      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving…' : 'Save vehicle'}
      </button>
    </form>
  );
}

export function PlaceForm({ action }: { action: Action }) {
  const { result, pending, onSubmit } = useSubmit(action, { resetOnSuccess: true });
  const name = errorProps(result, 'name', 'place-name');
  const km = errorProps(result, 'oneWayKm', 'place-km');

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <Field label="Place" htmlFor="place-name" error={name.error}>
          <input id="place-name" name="name" required placeholder="e.g. Lumber yard" className={inputClass} {...name.inputProps} />
        </Field>
        <Field label="One-way km" htmlFor="place-km" error={km.error}>
          <input
            id="place-km"
            name="oneWayKm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            className={inputClass}
            {...km.inputProps}
          />
        </Field>
      </div>
      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Adding…' : 'Add place'}
      </button>
    </form>
  );
}

interface SavedPlace {
  id: number;
  name: string;
  oneWayKm: number | null;
}

/** The saved places, each with Edit and Remove. Editing swaps the row for a small form. */
export function PlaceList({
  places,
  updateAction,
  deleteAction,
}: {
  places: SavedPlace[];
  updateAction: (id: number, formData: FormData) => Promise<ActionResult>;
  deleteAction: (id: number) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg mb-5">
      {places.map(place => (
        <li key={place.id} className="px-4 py-2.5">
          {editingId === place.id ? (
            <PlaceEditForm
              place={place}
              action={formData => updateAction(place.id, formData)}
              onDone={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-stone-800 min-w-0 break-words">
                {place.name}
                {place.oneWayKm !== null && <span className="text-stone-500"> · {place.oneWayKm} km one way</span>}
              </span>
              <span className="flex items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingId(place.id)}
                  aria-label={`Edit ${place.name}`}
                  className="text-sm text-stone-700 hover:text-stone-900 underline underline-offset-2"
                >
                  Edit
                </button>
                <ConfirmButton
                  action={() => deleteAction(place.id)}
                  confirmMessage={`Remove ${place.name} from saved places? Logged trips are not affected.`}
                  className="text-sm text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
                >
                  Remove
                </ConfirmButton>
              </span>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function PlaceEditForm({ place, action, onDone }: { place: SavedPlace; action: Action; onDone: () => void }) {
  const { result, pending, onSubmit } = useSubmit(action, { onSuccess: onDone });
  const nameId = `place-${place.id}-name`;
  const kmId = `place-${place.id}-km`;
  const name = errorProps(result, 'name', nameId);
  const km = errorProps(result, 'oneWayKm', kmId);

  return (
    <form onSubmit={onSubmit} className="space-y-3 py-1.5" noValidate>
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <Field label="Place" htmlFor={nameId} error={name.error}>
          <input id={nameId} name="name" defaultValue={place.name} required autoFocus className={inputClass} {...name.inputProps} />
        </Field>
        <Field label="One-way km" htmlFor={kmId} error={km.error}>
          <input
            id={kmId}
            name="oneWayKm"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0.1"
            defaultValue={place.oneWayKm ?? ''}
            className={inputClass}
            {...km.inputProps}
          />
        </Field>
      </div>
      <p className="text-sm text-stone-500">
        A new name is also applied to the trips already logged there. A new distance only affects future trips.
      </p>
      <FormMessage result={result} />
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? 'Saving…' : 'Save'}
        </button>
        <button type="button" disabled={pending} onClick={onDone} className={secondaryButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export function OdometerForm({
  action,
  year,
  startKm,
  endKm,
  suggestedStartKm,
}: {
  action: Action;
  year: number;
  startKm: number | null;
  endKm: number | null;
  suggestedStartKm: number | null;
}) {
  const { result, pending, onSubmit } = useSubmit(action);
  const start = errorProps(result, 'startKm', 'odo-start');
  const end = errorProps(result, 'endKm', 'odo-end');

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <input type="hidden" name="year" value={year} />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label={`Start of ${year}`}
          htmlFor="odo-start"
          error={start.error}
          hint={startKm === null && suggestedStartKm !== null ? `End of ${year - 1} was ${suggestedStartKm.toLocaleString('en-CA')}` : undefined}
        >
          <input
            id="odo-start"
            name="startKm"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            defaultValue={startKm ?? suggestedStartKm ?? ''}
            className={inputClass}
            {...start.inputProps}
          />
        </Field>
        <Field label={`End of ${year}`} htmlFor="odo-end" error={end.error}>
          <input
            id="odo-end"
            name="endKm"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            defaultValue={endKm ?? ''}
            className={inputClass}
            {...end.inputProps}
          />
        </Field>
      </div>
      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving…' : 'Save readings'}
      </button>
    </form>
  );
}
