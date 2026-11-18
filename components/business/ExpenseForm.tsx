'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ActionResult } from '@/lib/actionResult';
import { CATEGORIES, SECTIONS, getCategory } from '@/lib/expenses/categories';
import {
  MAX_RECEIPT_ITEMS,
  blankItem,
  splitReceipt,
  type ReceiptFormValues,
  type ReceiptItemValues,
} from '@/lib/expenses/receipts';
import { HST_PERCENT, centsToInput, formatCents, hstIncluded, parseMoney } from '@/lib/money';
import type { ScanOutcome } from '@/lib/expenses/scanResult';
import { Field, FormMessage, ProjectSelect, Suggestions, errorProps, inputClass, primaryButtonClass, secondaryButtonClass, useSubmit } from './forms';
import ReceiptAttachment from './ReceiptAttachment';

/** What uploading a receipt gives back (the expense log's attachReceiptAction). */
export type AttachReceipt = (
  formData: FormData,
  current: ReceiptFormValues | null,
) => Promise<{ ok: true; path: string; scan: ScanOutcome | null; note?: string } | { ok: false; message: string }>;

interface ExpenseFormProps {
  action: (formData: FormData) => Promise<ActionResult>;
  initial: ReceiptFormValues;
  /** Earlier vendors, offered as autocomplete. */
  vendors: string[];
  /** Every project, active ones first, for the project picker. */
  projects: { number: string; name: string; active: boolean }[];
  mode: 'create' | 'edit';
  cancelHref?: string;
  /** Receipt photos: hidden when no store is set up. Read by Claude when adding an expense. */
  receipts: { attach: AttachReceipt; storage: boolean; scanning: boolean };
}

/**
 * Built for entering a receipt on a phone at the checkout: total, vendor, then one tap
 * to work out the HST from the total, then what it was. A receipt with more than one
 * kind of thing on it (small tools and materials) can be split into items, each with
 * its own category and project; each item's amount is entered before tax, as the
 * receipt lists it, and the HST is shared out between them.
 *
 * After a save the date stays put, since receipts tend to come in batches from the
 * same day.
 */
export default function ExpenseForm({ action, initial, vendors, projects, mode, cancelHref, receipts }: ExpenseFormProps) {
  const [values, setValues] = useState(initial);
  const set = <K extends keyof ReceiptFormValues>(key: K, value: ReceiptFormValues[K]) =>
    setValues(v => ({ ...v, [key]: value }));
  const setItem = (index: number, change: Partial<ReceiptItemValues>) =>
    setValues(v => ({ ...v, items: v.items.map((item, i) => (i === index ? { ...item, ...change } : item)) }));

  // Bumped after adding an expense, so the receipt photo section starts afresh
  const [receiptKey, setReceiptKey] = useState(0);
  const { result, pending, onSubmit } = useSubmit(action, {
    onSuccess:
      mode === 'create'
        ? () => {
            setValues(v => ({ ...initial, expenseDate: v.expenseDate }));
            setReceiptKey(k => k + 1);
          }
        : undefined,
  });

  const split = values.items.length > 1;
  const addItem = () =>
    setValues(v => ({
      ...v,
      // A new item is usually for the same job as the one above it
      items: [...v.items, blankItem(v.items[v.items.length - 1].projectNumber)],
    }));
  const removeItem = (index: number) =>
    setValues(v => {
      const items = v.items.filter((_, i) => i !== index);
      // Back to one item: it is the whole receipt again
      return { ...v, items: items.length === 1 ? [{ ...items[0], subtotal: '' }] : items };
    });

  const totalCents = parseMoney(values.total);
  const hstCents = values.hst.trim() === '' ? 0 : parseMoney(values.hst);
  const fillHst = () => {
    if (totalCents !== null) set('hst', centsToInput(hstIncluded(totalCents)));
  };

  // The split's arithmetic, for the running check under the items
  const beforeTaxCents = totalCents !== null && hstCents !== null ? totalCents - hstCents : null;
  const subtotals = values.items.map(item => parseMoney(item.subtotal));
  const enteredCents = subtotals.reduce<number>((sum, cents) => sum + (cents ?? 0), 0);
  const balanced =
    split && beforeTaxCents !== null && subtotals.every(c => c !== null && c > 0) && enteredCents === beforeTaxCents;
  const withHst = balanced ? splitReceipt(totalCents!, hstCents!, subtotals as number[]) : null;
  const fillRest = (index: number) => {
    if (beforeTaxCents === null) return;
    const others = subtotals.reduce<number>((sum, cents, i) => (i === index ? sum : sum + (cents ?? 0)), 0);
    if (beforeTaxCents - others > 0) setItem(index, { subtotal: centsToInput(beforeTaxCents - others) });
  };

  // A photo chosen while adding an expense is read, and fills in the form; on an
  // existing expense it's only attached, so nothing already entered is overwritten.
  const scanOnUpload = mode === 'create' && receipts.scanning;
  const uploadReceipt = async (file: File) => {
    const formData = new FormData();
    formData.set('file', file);
    let outcome: Awaited<ReturnType<AttachReceipt>>;
    try {
      outcome = await receipts.attach(formData, scanOnUpload ? values : null);
    } catch {
      return { ok: false as const, message: 'Could not reach the server. Check your connection and try again.' };
    }
    if (!outcome.ok) return outcome;
    const { path } = outcome;
    if (outcome.scan) {
      setValues({ ...outcome.scan.values, receiptPath: path });
      const notes = ['Filled in from the receipt. Check each field before saving.', ...outcome.scan.warnings];
      return { ok: true as const, path, notes };
    }
    set('receiptPath', path);
    return { ok: true as const, path, notes: outcome.note ? [outcome.note] : [] };
  };

  const date = errorProps(result, 'expenseDate', 'expense-date');
  const total = errorProps(result, 'total', 'expense-total');
  const vendor = errorProps(result, 'vendor', 'expense-vendor');
  const hst = errorProps(result, 'hst', 'expense-hst');
  const itemsError = errorProps(result, 'items', 'expense-items').error;
  const receiptError = errorProps(result, 'receiptPath', 'expense-receipt').error;

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <input type="hidden" name="receiptPath" value={values.receiptPath} />
      {receipts.storage && (
        <ReceiptAttachment
          key={receiptKey}
          path={values.receiptPath}
          scan={scanOnUpload}
          upload={uploadReceipt}
          onRemove={() => set('receiptPath', '')}
          error={receiptError}
        />
      )}

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
          autoComplete="off"
          placeholder="e.g. Lumber yard, Lee Valley"
          value={values.vendor}
          onChange={e => set('vendor', e.target.value)}
          className={inputClass}
          {...vendor.inputProps}
        />
        <Suggestions
          label="Earlier vendors"
          options={vendors}
          value={values.vendor}
          onPick={name => set('vendor', name)}
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

      {split && (
        <div>
          <h3 className="font-semibold text-stone-800">Items on this receipt</h3>
          <p className="text-sm text-stone-500">
            Enter each item&apos;s amount before tax, as the receipt lists it. The HST is shared out between them.
          </p>
        </div>
      )}

      {values.items.map((item, index) =>
        split ? (
          <fieldset key={index} className="border border-stone-200 rounded-lg p-3 sm:p-4 space-y-4">
            <legend className="px-1 text-sm font-semibold text-stone-600">Item {index + 1}</legend>
            <ItemFields
              index={index}
              item={item}
              split
              result={result}
              projects={projects}
              onChange={change => setItem(index, change)}
              onFillRest={() => fillRest(index)}
              canFillRest={beforeTaxCents !== null}
              withHstCents={withHst?.[index].totalCents}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-sm text-red-700 hover:text-red-900 underline underline-offset-2"
            >
              Remove item {index + 1}
            </button>
          </fieldset>
        ) : (
          <ItemFields
            key={index}
            index={index}
            item={item}
            split={false}
            result={result}
            projects={projects}
            onChange={change => setItem(index, change)}
          />
        ),
      )}

      {split && (
        <SplitCheck beforeTaxCents={beforeTaxCents} enteredCents={enteredCents} balanced={balanced} error={itemsError} />
      )}

      {values.items.length < MAX_RECEIPT_ITEMS && (
        <button type="button" onClick={addItem} className={`${secondaryButtonClass} w-full sm:w-auto`}>
          {split ? '+ Add another item' : '+ Split into another category'}
        </button>
      )}

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

/** One item's fields. Named "category.0", "description.0"…, which is what the action reads. */
function ItemFields({
  index,
  item,
  split,
  result,
  projects,
  onChange,
  onFillRest,
  canFillRest,
  withHstCents,
}: {
  index: number;
  item: ReceiptItemValues;
  split: boolean;
  result: ActionResult | undefined;
  projects: ExpenseFormProps['projects'];
  onChange: (change: Partial<ReceiptItemValues>) => void;
  onFillRest?: () => void;
  canFillRest?: boolean;
  withHstCents?: number;
}) {
  const id = (field: string) => `expense-${field}-${index}`;
  const category = getCategory(item.category);
  const categoryField = errorProps(result, `category.${index}`, id('category'));
  const description = errorProps(result, `description.${index}`, id('description'));
  const subtotal = errorProps(result, `subtotal.${index}`, id('subtotal'));
  const project = errorProps(result, `projectNumber.${index}`, id('project'));

  return (
    <>
      <Field label="Category" htmlFor={id('category')} error={categoryField.error} hint={category?.hint}>
        <select
          id={id('category')}
          name={`category.${index}`}
          required
          value={item.category}
          onChange={e => onChange({ category: e.target.value })}
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
          {item.category && !category && <option value={item.category}>{item.category}</option>}
        </select>
      </Field>

      <Field label="What was it for?" htmlFor={id('description')} error={description.error}>
        <input
          id={id('description')}
          name={`description.${index}`}
          required
          placeholder={split ? 'e.g. Clamps and bits' : 'e.g. Walnut for Smith dining table'}
          value={item.description}
          onChange={e => onChange({ description: e.target.value })}
          className={inputClass}
          {...description.inputProps}
        />
      </Field>

      {split && (
        <Field
          label="Amount before tax ($)"
          htmlFor={id('subtotal')}
          error={subtotal.error}
          hint={withHstCents !== undefined ? `${formatCents(withHstCents)} with its share of the HST.` : undefined}
        >
          <div className="flex gap-2">
            <input
              id={id('subtotal')}
              name={`subtotal.${index}`}
              inputMode="decimal"
              autoComplete="off"
              required
              placeholder="0.00"
              value={item.subtotal}
              onChange={e => onChange({ subtotal: e.target.value })}
              className={inputClass}
              {...subtotal.inputProps}
            />
            <button type="button" onClick={onFillRest} disabled={!canFillRest} className={`${secondaryButtonClass} shrink-0`}>
              The rest
            </button>
          </div>
        </Field>
      )}

      <ProjectSelect
        id={id('project')}
        name={`projectNumber.${index}`}
        value={item.projectNumber}
        onChange={number => onChange({ projectNumber: number })}
        projects={projects}
        error={project.error}
      />
    </>
  );
}

/** Whether the items add up to the receipt before tax, as they're typed. */
function SplitCheck({
  beforeTaxCents,
  enteredCents,
  balanced,
  error,
}: {
  beforeTaxCents: number | null;
  enteredCents: number;
  balanced: boolean;
  error?: string;
}) {
  const gap = beforeTaxCents === null ? null : beforeTaxCents - enteredCents;
  return (
    <div id="expense-items-error" className="text-sm" aria-live="polite">
      {beforeTaxCents === null ? (
        <p className="text-stone-500">Enter the total and HST to check the items against the receipt.</p>
      ) : (
        <p className={balanced ? 'text-stone-600' : 'text-amber-800'}>
          Items: {formatCents(enteredCents)} of {formatCents(beforeTaxCents)} before tax.{' '}
          {balanced
            ? 'They match the receipt.'
            : gap! > 0
              ? `${formatCents(gap!)} still to go on an item.`
              : gap! < 0
                ? `${formatCents(-gap!)} more than the receipt.`
                : 'Every item needs an amount.'}
        </p>
      )}
      {error && <p className="text-red-700 mt-1">{error}</p>}
    </div>
  );
}
