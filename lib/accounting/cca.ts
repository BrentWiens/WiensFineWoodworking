/**
 * Capital cost allowance: how a tool of $500 or more, or the vehicle, is written
 * off over several years instead of being expensed when bought.
 *
 * Each class is one pool. Its undepreciated capital cost (UCC) goes up by what is
 * bought and down by the CCA claimed, and each year up to a percentage of the pool
 * may be claimed. Claiming less is allowed and leaves more for later years.
 *
 * The "most that can be claimed" figure uses the standard half-year rule (only half
 * of the year's purchases count in the year they're bought). Temporary federal
 * measures have at times allowed more in the first year, so treat it as a floor on
 * the maximum and let the accountant confirm. Amounts are integer cents.
 */

export interface CcaClass {
  id: string;
  label: string;
  /** Declining-balance rate, as a percentage. */
  rate: number;
  note: string;
}

export const CCA_CLASSES: CcaClass[] = [
  {
    id: '8',
    label: 'Tools and equipment',
    rate: 20,
    note: 'Class 8. Every expense entered as "Tools and equipment ($500+)" is added automatically.',
  },
  {
    id: '10',
    label: 'Vehicle',
    rate: 30,
    note: 'Class 10. Add the vehicle at what it was worth when it started being used for the business. Only the business-use share of the CCA is deducted.',
  },
];

export const isCcaClass = (id: string) => CCA_CLASSES.some(c => c.id === id);
export const getCcaClass = (id: string) => CCA_CLASSES.find(c => c.id === id);

export interface CcaYear {
  year: number;
  openingCents: number;
  additionsCents: number;
  /** The most that can be claimed under the half-year rule. */
  maxCents: number;
  claimedCents: number;
  closingCents: number;
}

/**
 * The pool year by year, from its first purchase through `throughYear`. Empty when
 * nothing has been bought by then.
 */
export function ccaSchedule(
  rate: number,
  additions: { year: number; cents: number }[],
  claims: { year: number; cents: number }[],
  throughYear: number,
): CcaYear[] {
  const firstYear = Math.min(...additions.map(a => a.year));
  if (!Number.isFinite(firstYear) || firstYear > throughYear) return [];

  const sumFor = (rows: { year: number; cents: number }[], year: number) =>
    rows.reduce((total, row) => (row.year === year ? total + row.cents : total), 0);

  const schedule: CcaYear[] = [];
  let openingCents = 0;
  for (let year = firstYear; year <= throughYear; year++) {
    const additionsCents = sumFor(additions, year);
    const available = openingCents + additionsCents;
    const maxCents = Math.min(available, Math.round(((openingCents + additionsCents / 2) * rate) / 100));
    // A claim can never take the pool below zero, whatever was entered
    const claimedCents = Math.min(available, sumFor(claims, year));
    const closingCents = available - claimedCents;
    schedule.push({ year, openingCents, additionsCents, maxCents, claimedCents, closingCents });
    openingCents = closingCents;
  }
  return schedule;
}
