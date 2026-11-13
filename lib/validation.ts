import { z } from 'zod';

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
