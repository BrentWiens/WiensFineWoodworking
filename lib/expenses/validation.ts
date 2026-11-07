import { z } from 'zod';
import { addDays, isIsoDate, todayIso } from '../dates';
import { parseMoney } from '../money';
import { blankToUndefined, optionalText, parse, text, type ParseResult } from '../validation';
import { isCategoryId } from './categories';

export interface ExpenseInput {
  expenseDate: string;
  vendor: string;
  category: string;
  description: string;
  /** What was paid, tax included — the bottom line of the receipt. */
  totalCents: number;
  /** The HST within that total, claimed back as an input tax credit. */
  hstCents: number;
  notes: string | null;
}

/** The highest HST rate in Canada (Atlantic provinces). More than this is a typo. */
const MAX_HST_PERCENT = 15;

const money = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .transform((value, ctx) => {
      const cents = parseMoney(value);
      if (cents === null) {
        ctx.addIssue({ code: 'custom', message: `${label} must be an amount like 12.34` });
        return z.NEVER;
      }
      return cents;
    });

const expenseSchema = (today: string) =>
  z
    .object({
      expenseDate: z
        .string({ error: 'Date is required' })
        .refine(isIsoDate, 'Enter a valid date')
        .refine(d => d >= '2000-01-01', 'Date is too far in the past')
        // One day of slack: the phone and the server can disagree about midnight.
        .refine(d => d <= addDays(today, 1), 'Date is in the future'),
      vendor: text('Vendor', 200),
      category: z.string({ error: 'Choose a category' }).refine(isCategoryId, 'Choose a category'),
      description: text('Description', 500),
      total: money('Total')
        .refine(c => c > 0, 'Total must be more than 0')
        .refine(c => c <= 100_000_000, 'Total looks too large'),
      hst: z.preprocess(blankToUndefined, money('HST').optional()),
      notes: optionalText(2000),
    })
    .refine(v => v.hst === undefined || v.hst * (100 + MAX_HST_PERCENT) <= v.total * MAX_HST_PERCENT, {
      message: 'HST is more than the tax on this total could be. Check the amounts.',
      path: ['hst'],
    })
    .transform(({ total, hst, notes, ...rest }): ExpenseInput => ({
      ...rest,
      totalCents: total,
      hstCents: hst ?? 0,
      notes: notes ?? null,
    }));

export function parseExpense(input: Record<string, unknown>, now: Date = new Date()): ParseResult<ExpenseInput> {
  return parse(expenseSchema(todayIso(now)), input);
}
