'use client';

import type { ActionResult } from '@/lib/actionResult';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, useSubmit } from './forms';

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
