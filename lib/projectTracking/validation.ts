import { z } from 'zod';
import { todayIso } from '../dates';
import { blankToUndefined, entryDate, hstFitsTotal, money, parse, text, type ParseResult } from '../validation';

/**
 * Form validation for the project tracker (/tools/business/projects). The public
 * portfolio's projects are a different thing and live in lib/projects.ts.
 */

export const PROJECT_STATUSES = ['active', 'complete'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const statusLabel = (status: string) => (status === 'complete' ? 'Complete' : 'Active');

export interface ProjectInput {
  /** What ties expenses and trips to the project, e.g. "2026-014". */
  number: string;
  name: string;
  client: string | null;
  /** What the client pays for the whole job, HST included; null when not settled yet. */
  priceCents: number | null;
  status: ProjectStatus;
  notes: string | null;
}

const optionalText = (label: string, max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max, `${label} is too long`).optional());

const projectSchema = z
  .object({
    number: text('Project number', 50),
    name: text('Name', 200),
    client: optionalText('Client', 200),
    amount: z.preprocess(
      blankToUndefined,
      money('Project amount')
        .refine(c => c > 0, 'Project amount must be more than 0')
        .refine(c => c <= 100_000_000, 'Project amount looks too large')
        .optional(),
    ),
    // A new project's form has no status field; it starts out active.
    status: z.preprocess(blankToUndefined, z.enum(PROJECT_STATUSES, { error: 'Choose a status' }).default('active')),
    notes: optionalText('Notes', 2000),
  })
  .transform(({ client, amount, notes, ...rest }): ProjectInput => ({
    ...rest,
    client: client ?? null,
    priceCents: amount ?? null,
    notes: notes ?? null,
  }));

export function parseProject(input: Record<string, unknown>): ParseResult<ProjectInput> {
  return parse(projectSchema, input);
}

// ---------------------------------------------------------------------------

export interface IncomeInput {
  incomeDate: string;
  /** What the payment was: "Deposit", "Final payment". */
  description: string;
  /** What was received, tax included. */
  totalCents: number;
  /** The HST within that total. */
  hstCents: number;
}

const incomeSchema = (today: string) =>
  z
    .object({
      incomeDate: entryDate(today),
      description: text('Description', 200),
      total: money('Amount')
        .refine(c => c > 0, 'Amount must be more than 0')
        .refine(c => c <= 100_000_000, 'Amount looks too large'),
      hst: z.preprocess(blankToUndefined, money('HST').optional()),
    })
    .refine(v => v.hst === undefined || hstFitsTotal(v.hst, v.total), {
      message: 'HST is more than the tax on this amount could be. Check the amounts.',
      path: ['hst'],
    })
    .transform(({ total, hst, ...rest }): IncomeInput => ({
      ...rest,
      totalCents: total,
      hstCents: hst ?? 0,
    }));

export function parseIncome(input: Record<string, unknown>, now: Date = new Date()): ParseResult<IncomeInput> {
  return parse(incomeSchema(todayIso(now)), input);
}
