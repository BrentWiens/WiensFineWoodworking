/**
 * Calendar-date helpers for the admin tools. Dates are 'YYYY-MM-DD' strings
 * throughout — see lib/db/schema.ts for why.
 */

/** The business's own timezone: "today" means today in Kitchener, not in a UTC data centre. */
export const BUSINESS_TIME_ZONE = 'America/Toronto';

/** Today's date in the business timezone, as YYYY-MM-DD. */
export function todayIso(now: Date = new Date()): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function currentYear(now: Date = new Date()): number {
  return Number(todayIso(now).slice(0, 4));
}

/** A real calendar date in YYYY-MM-DD form (rejects 2026-02-30). */
export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** Adds whole days to a YYYY-MM-DD date. */
export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** First day of `year` and first day of the following year: a half-open range. */
export function yearRange(year: number): { start: string; end: string } {
  return { start: `${year}-01-01`, end: `${year + 1}-01-01` };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? '';
}

/** "Thu, Nov 6" — compact enough for a phone-width list row. */
export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Parses a ?year= search param, falling back to the current year for anything odd. */
export function parseYearParam(value: string | string[] | undefined, now: Date = new Date()): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const year = Number(raw);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : currentYear(now);
}
