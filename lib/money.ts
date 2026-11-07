/**
 * Money is stored and summed as integer cents, so totals never pick up
 * floating-point fractions of a cent. These helpers convert at the edges.
 */

/** Ontario HST, as a whole-number percentage. */
export const HST_PERCENT = 13;

/**
 * '1,234.5', '$12', '.99' → cents. Null for anything that isn't a plain amount,
 * including more than two decimal places (a typo, not something to round away).
 */
export function parseMoney(value: string): number | null {
  const cleaned = value.trim().replace(/^\$/, '').replace(/,/g, '').trim();
  const match = /^(\d*)(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!match || (match[1] === '' && !match[2])) return null;
  const dollars = Number(match[1] || '0');
  const cents = Number((match[2] ?? '').padEnd(2, '0'));
  const total = dollars * 100 + cents;
  return Number.isSafeInteger(total) ? total : null;
}

/** "$1,234.56" */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

/** "1234.56" — for an input's value, where grouping commas would get in the way. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** The HST inside a tax-included total: total × 13 / 113, to the nearest cent. */
export function hstIncluded(totalCents: number, percent: number = HST_PERCENT): number {
  return Math.round((totalCents * percent) / (100 + percent));
}
