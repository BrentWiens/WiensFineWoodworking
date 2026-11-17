/**
 * The handful of tax rules and working assumptions the project and year-end numbers
 * rest on, in one place so they can be changed in one place. Amounts are integer
 * cents. The accountant has the final say on all of it.
 */

/**
 * The date HST registration took effect, as 'YYYY-MM-DD', or null while not
 * registered. Before it, the HST on a purchase is simply part of what it cost.
 * From it on, that HST comes back as an input tax credit, so only the net counts.
 * Set this the day registration starts.
 */
export const HST_REGISTERED_FROM: string | null = null;

/**
 * Registration is required once revenue passes this in a single calendar quarter
 * or over four consecutive ones. Sales to clients outside Canada count toward it.
 */
export const HST_THRESHOLD_CENTS = 30_000_00;

/** Only half of a meal's cost is deductible. */
export const MEALS_DEDUCTIBLE_PERCENT = 50;

/**
 * What a km of driving is costed at on a project, and for the year until the
 * odometer readings are in. An estimate: the real vehicle claim is the business-use
 * share of the year's actual vehicle expenses.
 */
export const KM_RATE_CENTS = 73;

/** Share of net income to keep aside for income tax and CPP. A rule of thumb. */
export const TAX_SET_ASIDE_PERCENT = 30;

export interface Amount {
  /** Tax included. */
  totalCents: number;
  /** The HST within the total. */
  hstCents: number;
}

export interface DatedExpense extends Amount {
  expenseDate: string;
  category: string;
}

const registeredOn = (date: string, registeredFrom: string | null) => registeredFrom !== null && date >= registeredFrom;

/** What a payment received adds to income: HST collected belongs to the CRA. */
export function revenueCents(income: Amount): number {
  return income.totalCents - income.hstCents;
}

/** What a purchase cost the business: HST included until registered, net of it after. */
export function purchaseCents(expense: Amount & { expenseDate: string }, registeredFrom = HST_REGISTERED_FROM): number {
  return registeredOn(expense.expenseDate, registeredFrom) ? expense.totalCents - expense.hstCents : expense.totalCents;
}

/** What an expense takes off income: its cost, or half of it for a meal. */
export function deductibleCents(expense: DatedExpense, registeredFrom = HST_REGISTERED_FROM): number {
  const cost = purchaseCents(expense, registeredFrom);
  return expense.category === 'meals' ? Math.round((cost * MEALS_DEDUCTIBLE_PERCENT) / 100) : cost;
}

/** The estimated cost of driving `km`. */
export function mileageCents(km: number): number {
  return Math.round(km * KM_RATE_CENTS);
}
