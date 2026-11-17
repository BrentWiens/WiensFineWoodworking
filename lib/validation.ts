import { z } from 'zod';
import { addDays, isIsoDate } from './dates';
import { parseMoney } from './money';

/**
 * Form-parsing helpers shared by the business tools' validation modules
 * (lib/mileage/validation.ts, lib/expenses/validation.ts).
 */

/** Blank form fields arrive as '' — treat them as absent rather than as 0. */
export const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export const text = (label: string, max: number) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max, `${label} is too long`);

export type FieldErrors = Record<string, string[] | undefined>;

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

export function parse<T>(schema: z.ZodType<T>, input: unknown): ParseResult<T> {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, errors: z.flattenError(result.error).fieldErrors as FieldErrors };
}

/** FormData → plain object. Checkboxes are absent when unticked, 'on' when ticked. */
export function formToObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') out[key] = value;
  }
  return out;
}

/** A tax-included dollar amount typed into a form, as cents. */
export const money = (label: string) =>
  z.string({ error: `${label} is required` }).transform((value, ctx) => {
    const cents = parseMoney(value);
    if (cents === null) {
      ctx.addIssue({ code: 'custom', message: `${label} must be an amount like 12.34` });
      return z.NEVER;
    }
    return cents;
  });

/** The day something happened: a real date, not long ago, and not in the future. */
export const entryDate = (today: string) =>
  z
    .string({ error: 'Date is required' })
    .refine(isIsoDate, 'Enter a valid date')
    .refine(d => d >= '2000-01-01', 'Date is too far in the past')
    // One day of slack: the phone and the server can disagree about midnight.
    .refine(d => d <= addDays(today, 1), 'Date is in the future');

/** The highest HST rate in Canada (Atlantic provinces). More than this is a typo. */
const MAX_HST_PERCENT = 15;

/** Whether `hstCents` could be the tax inside a tax-included `totalCents`. */
export const hstFitsTotal = (hstCents: number, totalCents: number) =>
  hstCents * (100 + MAX_HST_PERCENT) <= totalCents * MAX_HST_PERCENT;

/** An optional project number; blank means not tied to a project. */
export const projectNumberField = z.preprocess(
  blankToUndefined,
  z.string().trim().max(50, 'Project number is too long').optional(),
);
