import { z } from 'zod';
import { todayIso } from '../dates';
import { formatCents } from '../money';
import { blankToUndefined, entryDate, hstFitsTotal, money, parse, projectNumberField, text, type FieldErrors, type ParseResult } from '../validation';
import { isCategoryId } from './categories';
import { MAX_RECEIPT_ITEMS, splitReceipt } from './receipts';

/** One expense: a whole receipt, or one category's share of a split receipt. */
export interface ExpenseInput {
  expenseDate: string;
  vendor: string;
  category: string;
  description: string;
  /** What was paid, tax included. */
  totalCents: number;
  /** The HST within that total, claimed back as an input tax credit. */
  hstCents: number;
  /** The project it was bought for, or null when it isn't tied to one. */
  projectNumber: string | null;
}

/** The receipt's own lines: when, where, and its bottom line. */
const receiptSchema = (today: string) =>
  z
    .object({
      expenseDate: entryDate(today),
      vendor: text('Vendor', 200),
      total: money('Total')
        .refine(c => c > 0, 'Total must be more than 0')
        .refine(c => c <= 100_000_000, 'Total looks too large'),
      hst: z.preprocess(blankToUndefined, money('HST').optional()),
    })
    .refine(v => v.hst === undefined || hstFitsTotal(v.hst, v.total), {
      message: 'HST is more than the tax on this total could be. Check the amounts.',
      path: ['hst'],
    });

/** One item on the receipt. The before-tax amount is only asked for once it's split. */
const itemSchema = (split: boolean) =>
  z.object({
    category: z.string({ error: 'Choose a category' }).refine(isCategoryId, 'Choose a category'),
    description: text('Description', 500),
    projectNumber: projectNumberField,
    subtotal: split
      ? z.preprocess(blankToUndefined, money('Amount').refine(c => c > 0, 'Amount must be more than 0'))
      : z.unknown().transform(() => undefined),
  });

/** The item numbers the form sent, from field names like "category.0". */
function itemIndexes(input: Record<string, unknown>): number[] {
  const indexes = new Set<number>();
  for (const key of Object.keys(input)) {
    const match = /^(?:category|description|projectNumber|subtotal)\.(\d+)$/.exec(key);
    if (match) indexes.add(Number(match[1]));
  }
  return indexes.size === 0 ? [0] : [...indexes].sort((a, b) => a - b);
}

/**
 * Parses the expense form: a receipt with one or more items. Item fields are named
 * "category.0", "description.1" and so on, and their errors come back under the same
 * names. A receipt with one item becomes one expense for the whole amount; a split
 * one becomes an expense per item, its HST shared out by before-tax amount.
 */
export function parseReceipt(input: Record<string, unknown>, now: Date = new Date()): ParseResult<ExpenseInput[]> {
  const indexes = itemIndexes(input);
  if (indexes.length > MAX_RECEIPT_ITEMS) {
    return { ok: false, errors: { items: [`A receipt can be split into at most ${MAX_RECEIPT_ITEMS} items`] } };
  }
  const split = indexes.length > 1;

  const errors: FieldErrors = {};
  const receipt = parse(receiptSchema(todayIso(now)), input);
  if (!receipt.ok) Object.assign(errors, receipt.errors);

  const items = indexes.map((n, position) => {
    const fields = Object.fromEntries(
      ['category', 'description', 'projectNumber', 'subtotal'].map(name => [name, input[`${name}.${n}`]]),
    );
    const item = parse(itemSchema(split), fields);
    if (!item.ok) {
      for (const [name, messages] of Object.entries(item.errors)) errors[`${name}.${position}`] = messages;
      return null;
    }
    return item.data;
  });

  if (!receipt.ok || items.some(item => item === null)) return { ok: false, errors };
  const { expenseDate, vendor, total, hst = 0 } = receipt.data;
  const parsed = items.filter(item => item !== null);

  const amounts = split
    ? (() => {
        const subtotals = parsed.map(item => item.subtotal!);
        const itemsCents = subtotals.reduce((sum, cents) => sum + cents, 0);
        if (itemsCents !== total - hst) return null;
        return splitReceipt(total, hst, subtotals);
      })()
    : [{ totalCents: total, hstCents: hst }];

  if (!amounts) {
    const itemsCents = parsed.reduce((sum, item) => sum + item.subtotal!, 0);
    return {
      ok: false,
      errors: {
        items: [
          `The items add up to ${formatCents(itemsCents)} before tax, but the receipt is ${formatCents(total - hst)} ` +
            '(total less HST). Check the amounts.',
        ],
      },
    };
  }

  return {
    ok: true,
    data: parsed.map((item, i) => ({
      expenseDate,
      vendor,
      category: item.category,
      description: item.description,
      totalCents: amounts[i].totalCents,
      hstCents: amounts[i].hstCents,
      projectNumber: item.projectNumber ?? null,
    })),
  };
}
