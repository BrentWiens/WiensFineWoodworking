import { z } from 'zod';
import { addDays, isIsoDate } from '../dates';
import { centsToInput } from '../money';
import { hstFitsTotal } from '../validation';
import { CATEGORIES } from './categories';
import { MAX_RECEIPT_ITEMS, type ReceiptFormValues, type ReceiptItemValues } from './receipts';

/**
 * What Claude reads off a receipt (lib/expenses/scan.ts asks for exactly this shape),
 * and how that becomes the expense form's values. Nothing is saved from a scan: it
 * only fills in the form, for a person to check and save.
 */

const categoryIds = CATEGORIES.map(c => c.id) as [string, ...string[]];

export const receiptScanSchema = z.object({
  readable: z
    .boolean()
    .describe('False when this is not a receipt or invoice, or too blurry or cut off to read the total.'),
  date: z.string().nullable().describe('Purchase date as YYYY-MM-DD, or null if not shown.'),
  vendor: z.string().nullable().describe('The store or business name, as a person would say it.'),
  total: z.number().nullable().describe('The final amount paid, tax included, in dollars.'),
  hst: z
    .number()
    .nullable()
    .describe('The HST, GST or PST charged, in dollars, added up if listed separately. 0 when none was charged.'),
  items: z
    .array(
      z.object({
        category: z.enum(categoryIds),
        description: z.string().describe('A few words on what was bought, e.g. "Walnut boards" or "Clamps and bits".'),
        amount_before_tax: z.number().describe('Before-tax total of everything in this category, in dollars.'),
      }),
    )
    .describe('One entry per category, its lines added up, before tax. Usually just one.'),
});

export type ReceiptScan = z.infer<typeof receiptScanSchema>;

export interface ScanOutcome {
  values: ReceiptFormValues;
  /** Things the person should look at, e.g. items that don't add up. */
  warnings: string[];
}

const cents = (dollars: number | null) => (dollars === null || !Number.isFinite(dollars) ? null : Math.round(dollars * 100));

/**
 * The form after a scan: whatever was read replaces what's there, and anything that
 * couldn't be read is left as it was. Projects stay as chosen, since a receipt can't
 * say which job it was for.
 */
export function scanToForm(scan: ReceiptScan, current: ReceiptFormValues, today: string): ScanOutcome {
  if (!scan.readable) {
    return { values: current, warnings: ['The receipt couldn’t be read. Fill in the details by hand.'] };
  }
  const warnings: string[] = [];
  const values: ReceiptFormValues = { ...current };

  if (scan.date && isIsoDate(scan.date) && scan.date >= '2000-01-01' && scan.date <= addDays(today, 1)) {
    values.expenseDate = scan.date;
  }
  const vendor = scan.vendor?.trim().slice(0, 200);
  if (vendor) values.vendor = vendor;

  const totalCents = cents(scan.total);
  if (totalCents === null || totalCents <= 0) {
    warnings.push('The total couldn’t be read.');
    return { values, warnings };
  }
  values.total = centsToInput(totalCents);
  const read = cents(scan.hst);
  const hstCents = read !== null && read >= 0 && hstFitsTotal(read, totalCents) ? read : 0;
  values.hst = hstCents > 0 ? centsToInput(hstCents) : '';
  if (read !== null && read > 0 && hstCents === 0) warnings.push('The HST read off the receipt looked wrong. Check it.');

  // One entry per category, in case the same one came back twice
  const byCategory = new Map<string, { descriptions: string[]; cents: number }>();
  for (const item of scan.items) {
    const amount = cents(item.amount_before_tax);
    if (!CATEGORIES.some(c => c.id === item.category) || amount === null || amount <= 0) continue;
    const entry = byCategory.get(item.category) ?? { descriptions: [], cents: 0 };
    entry.descriptions.push(item.description.trim());
    entry.cents += amount;
    byCategory.set(item.category, entry);
  }
  const project = current.items[0]?.projectNumber ?? '';
  let items: (ReceiptItemValues & { cents: number })[] = [...byCategory].map(([category, entry]) => ({
    category,
    description: [...new Set(entry.descriptions.filter(Boolean))].join(', ').slice(0, 500),
    projectNumber: project,
    subtotal: '',
    cents: entry.cents,
  }));
  if (items.length > MAX_RECEIPT_ITEMS) {
    items = items.slice(0, MAX_RECEIPT_ITEMS);
    warnings.push(`Only the first ${MAX_RECEIPT_ITEMS} categories were filled in.`);
  }

  if (items.length === 0) return { values, warnings };
  if (items.length === 1) {
    const { category, description, projectNumber } = items[0];
    values.items = [{ category, description, projectNumber, subtotal: '' }];
    return { values, warnings };
  }

  // Split: the items must add up to the receipt before tax. A few cents of rounding
  // goes on the largest item; more than that is left for the person to sort out.
  const gap = totalCents - hstCents - items.reduce((sum, item) => sum + item.cents, 0);
  if (gap !== 0 && Math.abs(gap) <= items.length * 2) {
    const largest = items.reduce((a, b) => (b.cents > a.cents ? b : a));
    largest.cents += gap;
  } else if (gap !== 0) {
    warnings.push('The items read off the receipt don’t add up to its total. Check the amounts.');
  }
  values.items = items.map(({ cents: amount, ...item }) => ({ ...item, subtotal: centsToInput(amount) }));
  return { values, warnings };
}
