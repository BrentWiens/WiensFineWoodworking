'use client';

import { useState } from 'react';
import type { ActionResult } from '@/lib/actionResult';
import { HST_PERCENT, centsToInput, hstIncluded, parseMoney } from '@/lib/money';
import { PROJECT_STATUSES, statusLabel } from '@/lib/projectTracking/validation';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';

type Action = (formData: FormData) => Promise<ActionResult>;

export interface ProjectFormValues {
  number: string;
  name: string;
  client: string;
  /** The project amount, as typed: "2996.00", or blank when not settled. */
  amount: string;
  status: string;
  notes: string;
}

/**
 * A project's details. A new project needs only a number and a name and starts out
 * active; status and notes appear once it exists. The amount can be set from the
 * start or added once it's agreed.
 */
export function ProjectForm({ action, initial, mode }: { action: Action; initial: ProjectFormValues; mode: 'create' | 'edit' }) {
  const { result, pending, onSubmit } = useSubmit(action);
  const number = errorProps(result, 'number', 'project-number');
  const name = errorProps(result, 'name', 'project-name');
  const client = errorProps(result, 'client', 'project-client');
  const amount = errorProps(result, 'amount', 'project-amount');
  const status = errorProps(result, 'status', 'project-status');
  const notes = errorProps(result, 'notes', 'project-notes');

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-[9rem_1fr] gap-3">
        <Field label="Number" htmlFor="project-number" error={number.error}>
          <input
            id="project-number"
            name="number"
            required
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={50}
            placeholder="e.g. 2026-014"
            defaultValue={initial.number}
            className={inputClass}
            {...number.inputProps}
          />
        </Field>
        <Field label="Name" htmlFor="project-name" error={name.error}>
          <input
            id="project-name"
            name="name"
            required
            placeholder="e.g. Walnut dining table"
            defaultValue={initial.name}
            className={inputClass}
            {...name.inputProps}
          />
        </Field>
      </div>

      <Field label="Client (optional)" htmlFor="project-client" error={client.error}>
        <input
          id="project-client"
          name="client"
          autoComplete="off"
          defaultValue={initial.client}
          className={inputClass}
          {...client.inputProps}
        />
      </Field>

      <div className={mode === 'edit' ? 'grid grid-cols-[1fr_9rem] gap-3' : undefined}>
        <Field
          label="Project amount ($, optional)"
          htmlFor="project-amount"
          error={amount.error}
          hint="What the client pays for the whole job, HST included. Leave blank until it's agreed."
        >
          <input
            id="project-amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            defaultValue={initial.amount}
            className={inputClass}
            {...amount.inputProps}
          />
        </Field>
        {mode === 'edit' && (
          <Field label="Status" htmlFor="project-status" error={status.error}>
            <select
              id="project-status"
              name="status"
              defaultValue={initial.status}
              className={inputClass}
              {...status.inputProps}
            >
              {PROJECT_STATUSES.map(s => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {mode === 'edit' && (
        <Field
          label="Notes (optional)"
          htmlFor="project-notes"
          error={notes.error}
        >
          <textarea
            id="project-notes"
            name="notes"
            rows={3}
            defaultValue={initial.notes}
            className={inputClass}
            {...notes.inputProps}
          />
        </Field>
      )}

      {mode === 'edit' && (
        <p className="text-sm text-stone-500">
          Changing the number also changes it on the expenses and trips already linked.
        </p>
      )}

      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving…' : mode === 'create' ? 'Add project' : 'Save project'}
      </button>
    </form>
  );
}

/** Records a payment received for a project. The date stays put after a save. */
export function IncomeForm({ action, today }: { action: Action; today: string }) {
  const blank = { incomeDate: today, description: '', total: '', hst: '' };
  const [values, setValues] = useState(blank);
  const set = (key: keyof typeof blank, value: string) => setValues(v => ({ ...v, [key]: value }));

  const { result, pending, onSubmit } = useSubmit(action, {
    onSuccess: () => setValues(v => ({ ...blank, incomeDate: v.incomeDate })),
  });

  const totalCents = parseMoney(values.total);
  const fillHst = () => {
    if (totalCents !== null) set('hst', centsToInput(hstIncluded(totalCents)));
  };

  const date = errorProps(result, 'incomeDate', 'income-date');
  const total = errorProps(result, 'total', 'income-total');
  const description = errorProps(result, 'description', 'income-description');
  const hst = errorProps(result, 'hst', 'income-hst');

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date received" htmlFor="income-date" error={date.error}>
          <input
            id="income-date"
            name="incomeDate"
            type="date"
            required
            value={values.incomeDate}
            onChange={e => set('incomeDate', e.target.value)}
            className={inputClass}
            {...date.inputProps}
          />
        </Field>
        <Field label="Amount received ($)" htmlFor="income-total" error={total.error}>
          <input
            id="income-total"
            name="total"
            inputMode="decimal"
            autoComplete="off"
            required
            placeholder="0.00"
            value={values.total}
            onChange={e => set('total', e.target.value)}
            className={inputClass}
            {...total.inputProps}
          />
        </Field>
      </div>

      <Field label="What was it?" htmlFor="income-description" error={description.error}>
        <input
          id="income-description"
          name="description"
          required
          placeholder="e.g. Deposit, final payment"
          value={values.description}
          onChange={e => set('description', e.target.value)}
          className={inputClass}
          {...description.inputProps}
        />
      </Field>

      <Field
        label="HST included ($)"
        htmlFor="income-hst"
        error={hst.error}
        hint="The HST within the amount. Leave blank if none was charged."
      >
        <div className="flex gap-2">
          <input
            id="income-hst"
            name="hst"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={values.hst}
            onChange={e => set('hst', e.target.value)}
            className={inputClass}
            {...hst.inputProps}
          />
          <button
            type="button"
            onClick={fillHst}
            disabled={totalCents === null || totalCents === 0}
            className={`${secondaryButtonClass} shrink-0`}
          >
            {HST_PERCENT}% of total
          </button>
        </div>
      </Field>

      <FormMessage result={result} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? 'Saving…' : 'Save payment'}
      </button>
    </form>
  );
}
