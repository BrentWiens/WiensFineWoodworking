import { deductibleCents, mileageCents, revenueCents, type Amount, type DatedExpense } from '../accounting/rules';
import { CATEGORIES, categoryLabel } from '../expenses/categories';

/**
 * What a project earned, what it cost and what is left.
 *
 * Amounts are integer cents, counted the way lib/accounting/rules.ts says: income
 * without any HST collected, costs with their HST until HST-registered, meals at
 * half. Driving is costed at a per-km estimate, since what a km really cost isn't
 * known until the year's vehicle expenses are in.
 */

export interface CostLine {
  /** Expense category id. */
  id: string;
  label: string;
  count: number;
  cents: number;
}

export interface ProjectTotals {
  incomeCount: number;
  /** Income without any HST collected: what the business earned. */
  incomeCents: number;
  /** Everything received, HST included: what the client has paid. */
  receivedCents: number;
  /** Expenses by category, in the expense form's order. Only categories with expenses. */
  costs: CostLine[];
  expenseCount: number;
  expenseCents: number;
  tripCount: number;
  km: number;
  /** An estimate: km at the per-km rate. */
  mileageCents: number;
  /** Income less expenses and the mileage estimate. */
  profitCents: number;
}

export function projectTotals(
  income: Amount[],
  expenses: DatedExpense[],
  trips: { distanceKm: number }[],
): ProjectTotals {
  const incomeCents = income.reduce((total, payment) => total + revenueCents(payment), 0);

  const byCategory = new Map<string, { count: number; cents: number }>();
  for (const expense of expenses) {
    const line = byCategory.get(expense.category) ?? { count: 0, cents: 0 };
    line.count += 1;
    line.cents += deductibleCents(expense);
    byCategory.set(expense.category, line);
  }
  // Known categories in form order, then any retired ones
  const order = [...CATEGORIES.map(c => c.id), ...byCategory.keys()];
  const costs = [...new Set(order)].flatMap(id => {
    const line = byCategory.get(id);
    return line ? [{ id, label: categoryLabel(id), ...line }] : [];
  });
  const expenseCents = costs.reduce((total, line) => total + line.cents, 0);

  // Summed in tenths of a km as integers, so 0.1 + 0.2 lands on 0.3
  const km = trips.reduce((total, trip) => total + Math.round(trip.distanceKm * 10), 0) / 10;
  const driving = mileageCents(km);

  return {
    incomeCount: income.length,
    incomeCents,
    receivedCents: income.reduce((total, payment) => total + payment.totalCents, 0),
    costs,
    expenseCount: expenses.length,
    expenseCents,
    tripCount: trips.length,
    km,
    mileageCents: driving,
    profitCents: incomeCents - expenseCents - driving,
  };
}

/**
 * What the client still owes: the project amount less everything paid so far.
 * Null when no amount is set. Negative when more was paid than the amount.
 */
export function outstandingCents(priceCents: number | null, receivedCents: number): number | null {
  return priceCents === null ? null : priceCents - receivedCents;
}

/** Totals for every project at once, keyed by project id, from everything tagged. */
export function totalsByProject(
  projects: { id: number; number: string }[],
  income: (Amount & { projectId: number })[],
  expenses: (DatedExpense & { projectNumber: string | null })[],
  trips: { distanceKm: number; projectNumber: string | null }[],
): Map<number, ProjectTotals> {
  return new Map(
    projects.map(project => [
      project.id,
      projectTotals(
        income.filter(i => i.projectId === project.id),
        expenses.filter(e => e.projectNumber === project.number),
        trips.filter(t => t.projectNumber === project.number),
      ),
    ]),
  );
}

/** Project numbers in use on expenses or trips that no project has, in number order. */
export function unknownProjectNumbers(
  projects: { number: string }[],
  tagged: { projectNumber: string | null }[],
): string[] {
  const known = new Set(projects.map(p => p.number));
  const unknown = new Set(tagged.flatMap(t => (t.projectNumber && !known.has(t.projectNumber) ? [t.projectNumber] : [])));
  return [...unknown].sort(compareProjectNumbers);
}

/** "9" before "10", "2026-2" before "2026-14". */
export function compareProjectNumbers(a: string, b: string): number {
  return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });
}

/** Active projects first, then newest number first: the order the list is read in. */
export function sortProjects<T extends { number: string; status: string }>(projects: T[]): T[] {
  return [...projects].sort(
    (a, b) =>
      Number(a.status === 'complete') - Number(b.status === 'complete') || compareProjectNumbers(b.number, a.number),
  );
}
