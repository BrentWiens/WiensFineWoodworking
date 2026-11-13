'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actionResult';
import { CATEGORIES, SECTIONS, getCategory } from '@/lib/expenses/categories';
import { HST_PERCENT, centsToInput, hstIncluded, parseMoney } from '@/lib/money';
import { Field, FormMessage, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';

export interface ExpenseFormValues {
  expenseDate: string;
  vendor: string;
  category: string;
  description: string;
  total: string;
  hst: string;
}

interface ExpenseFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initial: ExpenseFormValues;
  /** Earlier vendors, offered as autocomplete. */
  vendors: string[];
  mode: 'create' | 'edit';
  cancelHref?: string;
}

/**
 * Built for entering a receipt on a phone at the checkout: total, vendor, category,
 * then one tap to work out the HST from the total. After a save the date stays put,
 * since receipts tend to come in batches from the same day.
 */
export default function ExpenseForm({ action, initial, vendors, mode, cancelHref }: ExpenseFormProps) {
  const [values, setValues] = useState(initial);
  const set = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) =>
    setValues(v => ({ ...v, [key]: value }));

  const { result, pending, onSubmit } = useSubmit(action, {
    onSuccess: mode === 'create' ? () => setValues(v => ({ ...initial, expenseDate: v.expenseDate })) : undefined,
  });

  const totalCents = parseMoney(values.total);
  const fillHst = () => {
    if (totalCents !== null) set('hst', centsToInput(hstIncluded(totalCents)));
  };
  const category = getCategory(values.category);

  const date = errorProps(result, 'expenseDate', 'expense-date');
  const total = errorProps(result, 'total', 'expense-total');
  const vendor = errorProps(result, 'vendor', 'expense-vendor');
  const categoryField = errorProps(result, 'category', 'expense-category');
  const description = errorProps(result, 'description', 'expense-description');
  const hst = errorProps(result, 'hst', 'expense-hst');

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" htmlFor="expense-date" error={date.error}>
          <input
            id="expense-date"
            name="expenseDate"
            type="date"
            required
            value={values.expenseDate}
            onChange={e => set('expenseDate', e.target.value)}
            className={inputClass}
            {...date.inputProps}
          />
        </Field>
        <Field label="Total paid ($)" htmlFor="expense-total" error={total.error}>
          <input
            id="expense-total"
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

      <Field label="Vendor" htmlFor="expense-vendor" error={vendor.error}>
        <input
          id="expense-vendor"
          name="vendor"
          required
          list="expense-vendor-options"
          autoComplete="off"
          placeholder="e.g. Lumber yard, Lee Valley"
          value={values.vendor}
          onChange={e => set('vendor', e.target.value)}
          className={inputClass}
          {...vendor.inputProps}
        />
        <datalist id="expense-vendor-options">
          {vendors.map(v => (
            <option key={v} value={v} />
          ))}
        </datalist>
      </Field>

      <Field label="Category" htmlFor="expense-category" error={categoryField.error} hint={category?.hint}>
        <select
          id="expense-category"
          name="category"
          required
          value={values.category}
          onChange={e => set('category', e.target.value)}
          className={inputClass}
          {...categoryField.inputProps}
        >
          <option value="">Choose a category…</option>
          {SECTIONS.map(section => (
            <optgroup key={section.id} label={section.label}>
              {CATEGORIES.filter(c => c.section === section.id).map(c => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </optgroup>
          ))}
          {/* An expense saved under a since-retired category keeps it until changed. */}
          {values.category && !category && <option value={values.category}>{values.category}</option>}
        </select>
      </Field>

      <Field label="What was it for?" htmlFor="expense-description" error={description.error}>
        <input
          id="expense-description"
          name="description"
          required
          placeholder="e.g. Walnut for Smith dining table"
          value={values.description}
          onChange={e => set('description', e.target.value)}
          className={inputClass}
          {...description.inputProps}
        />
      </Field>

      <Field
        label="HST paid ($)"
        htmlFor="expense-hst"
        error={hst.error}
        hint="The HST line on the receipt. Leave blank if none was charged."
      >
        <div className="flex gap-2">
          <input
            id="expense-hst"
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

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={`${primaryButtonClass} flex-1 sm:flex-none`}>
          {pending ? 'Saving…' : mode === 'create' ? 'Save expense' : 'Save changes'}
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
