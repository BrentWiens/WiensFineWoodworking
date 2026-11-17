import { z } from 'zod';
import { todayIso } from '../dates';
import { blankToUndefined, entryDate, hstFitsTotal, money, parse, projectNumberField, text, type ParseResult } from '../validation';
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
  /** The project it was bought for, or null when it isn't tied to one. */
  projectNumber: string | null;
}

const expenseSchema = (today: string) =>
  z
    .object({
      expenseDate: entryDate(today),
      vendor: text('Vendor', 200),
      category: z.string({ error: 'Choose a category' }).refine(isCategoryId, 'Choose a category'),
      description: text('Description', 500),
      total: money('Total')
        .refine(c => c > 0, 'Total must be more than 0')
        .refine(c => c <= 100_000_000, 'Total looks too large'),
      hst: z.preprocess(blankToUndefined, money('HST').optional()),
      projectNumber: projectNumberField,
    })
    .refine(v => v.hst === undefined || hstFitsTotal(v.hst, v.total), {
      message: 'HST is more than the tax on this total could be. Check the amounts.',
      path: ['hst'],
    })
    .transform(({ total, hst, projectNumber, ...rest }): ExpenseInput => ({
      ...rest,
      totalCents: total,
      hstCents: hst ?? 0,
      projectNumber: projectNumber ?? null,
    }));

export function parseExpense(input: Record<string, unknown>, now: Date = new Date()): ParseResult<ExpenseInput> {
  return parse(expenseSchema(todayIso(now)), input);
}
