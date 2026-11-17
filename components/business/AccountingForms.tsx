'use client';

import type { ActionResult } from '@/lib/actionResult';
import { CCA_CLASSES } from '@/lib/accounting/cca';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';

type Action = (formData: FormData) => Promise<ActionResult>;

/** Sets the CCA claimed for one class in one year. Blank or 0 claims nothing. */
export function CcaClaimForm({
  action,
  year,
  ccaClass,
  claimed,
  suggested,
}: {
  action: Action;
  year: number;
  ccaClass: string;
  /** The amount already saved, as an input value ('' for none). */
  claimed: string;
  /** The most that can be claimed, as an input value, offered as the placeholder. */
  suggested: string;
}) {
  const { result, pending, onSubmit } = useSubmit(action);
  const id = `cca-claim-${ccaClass}`;
  const field = errorProps(result, 'claimed', id);

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <input type="hidden" name="year" value={year} />
      <input type="hidden" name="ccaClass" value={ccaClass} />
      <Field
        label={`CCA to claim for ${year} ($)`}
        htmlFor={id}
        error={field.error}
        hint="You don't have to claim the full amount. What isn't claimed stays in the pool for later years."
      >
        <div className="flex gap-2">
          <input
            id={id}
            name="claimed"
            inputMode="decimal"
            autoComplete="off"
            placeholder={suggested}
            defaultValue={claimed}
            className={inputClass}
            {...field.inputProps}
          />
          <button type="submit" disabled={pending} className={`${secondaryButtonClass} shrink-0`}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </Field>
      <FormMessage result={result} />
    </form>
  );
}

/** Adds something that wasn't bought through the expense log: the vehicle, or an older machine. */
export function CapitalAssetForm({ action, today }: { action: Action; today: string }) {
  const { result, pending, onSubmit } = useSubmit(action, { resetOnSuccess: true });
  const name = errorProps(result, 'name', 'asset-name');
  const ccaClass = errorProps(result, 'ccaClass', 'asset-class');
  const date = errorProps(result, 'acquiredDate', 'asset-date');
  const cost = errorProps(result, 'cost', 'asset-cost');
  const notes = errorProps(result, 'notes', 'asset-notes');

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field label="What is it?" htmlFor="asset-name" error={name.error}>
        <input id="asset-name" name="name" required placeholder="e.g. Honda CR-V" className={inputClass} {...name.inputProps} />
      </Field>

      <Field label="Kind" htmlFor="asset-class" error={ccaClass.error}>
        <select id="asset-class" name="ccaClass" required defaultValue="10" className={inputClass} {...ccaClass.inputProps}>
          {CCA_CLASSES.map(c => (
            <option key={c.id} value={c.id}>
              {c.label} (class {c.id}, {c.rate}%)
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="asset-date" error={date.error} hint="When it was bought, or first used for the business.">
          <input id="asset-date" name="acquiredDate" type="date" required defaultValue={today} className={inputClass} {...date.inputProps} />
        </Field>
        <Field label="Cost ($)" htmlFor="asset-cost" error={cost.error} hint="Or its value on that date, if owned before.">
          <input id="asset-cost" name="cost" inputMode="decimal" autoComplete="off" required placeholder="0.00" className={inputClass} {...cost.inputProps} />
        </Field>
      </div>

      <Field label="Notes (optional)" htmlFor="asset-notes" error={notes.error}>
        <input id="asset-notes" name="notes" className={inputClass} {...notes.inputProps} />
      </Field>

      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Adding…' : 'Add asset'}
      </button>
    </form>
  );
}
