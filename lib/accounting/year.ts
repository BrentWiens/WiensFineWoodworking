import { CATEGORIES, categoryLabel, getCategory } from '../expenses/categories';
import {
  HST_THRESHOLD_CENTS,
  TAX_SET_ASIDE_PERCENT,
  deductibleCents,
  mileageCents,
  purchaseCents,
  revenueCents,
  type Amount,
  type DatedExpense,
} from './rules';

/**
 * The year's profit and loss: income from the project payments, less expenses,
 * the vehicle claim and capital cost allowance. Amounts are integer cents.
 */

export interface YearInput {
  year: number;
  income: (Amount & { incomeDate: string })[];
  expenses: DatedExpense[];
  trips: { tripDate: string; distanceKm: number }[];
  /** Business km ÷ total km from the mileage log, 0–100. Null until the odometer readings are in. */
  businessPercent: number | null;
  /** Capital cost allowance being claimed this year (lib/accounting/cca.ts). */
  toolsCcaCents: number;
  vehicleCcaCents: number;
}

export interface ExpenseLine {
  id: string;
  label: string;
  count: number;
  /** What was paid, tax included. */
  paidCents: number;
  /** What comes off income. */
  cents: number;
}

export interface VehicleClaim {
  km: number;
  /**
   * 'actual' once the business-use % is known: that share of the year's running
   * costs and vehicle CCA. Until then an estimate at the per-km rate.
   */
  method: 'actual' | 'estimate';
  businessPercent: number | null;
  runningCostsCents: number;
  ccaCents: number;
  cents: number;
}

export interface YearAccounts {
  year: number;
  incomeCount: number;
  incomeCents: number;
  /** Everyday expenses by category. Vehicle costs and $500+ tools are claimed separately. */
  expenseLines: ExpenseLine[];
  expensesCents: number;
  vehicle: VehicleClaim;
  toolsCcaCents: number;
  /** Spent this year on $500+ tools: not an expense, but what the CCA is claimed on. */
  equipmentBoughtCents: number;
  deductionsCents: number;
  netIncomeCents: number;
  /** A share of net income to keep aside for tax. Zero in a loss year. */
  setAsideCents: number;
}

export function yearAccounts(input: YearInput): YearAccounts {
  const prefix = `${input.year}-`;
  const income = input.income.filter(i => i.incomeDate.startsWith(prefix));
  const expenses = input.expenses.filter(e => e.expenseDate.startsWith(prefix));
  const trips = input.trips.filter(t => t.tripDate.startsWith(prefix));

  const incomeCents = income.reduce((total, payment) => total + revenueCents(payment), 0);

  const lines = new Map<string, Omit<ExpenseLine, 'id' | 'label'>>();
  let runningCostsCents = 0;
  let equipmentBoughtCents = 0;
  for (const expense of expenses) {
    const section = getCategory(expense.category)?.section;
    if (section === 'vehicle') {
      runningCostsCents += purchaseCents(expense);
    } else if (expense.category === 'equipment') {
      equipmentBoughtCents += purchaseCents(expense);
    } else {
      const line = lines.get(expense.category) ?? { count: 0, paidCents: 0, cents: 0 };
      line.count += 1;
      line.paidCents += expense.totalCents;
      line.cents += deductibleCents(expense);
      lines.set(expense.category, line);
    }
  }
  // Known categories in form order, then any retired ones
  const order = [...new Set([...CATEGORIES.map(c => c.id), ...lines.keys()])];
  const expenseLines = order.flatMap(id => {
    const line = lines.get(id);
    return line ? [{ id, label: categoryLabel(id), ...line }] : [];
  });
  const expensesCents = expenseLines.reduce((total, line) => total + line.cents, 0);

  const km = trips.reduce((total, trip) => total + Math.round(trip.distanceKm * 10), 0) / 10;
  const percent = input.businessPercent === null ? null : Math.min(input.businessPercent, 100);
  const vehicle: VehicleClaim = {
    km,
    method: percent === null ? 'estimate' : 'actual',
    businessPercent: percent,
    runningCostsCents,
    ccaCents: input.vehicleCcaCents,
    cents:
      percent === null ? mileageCents(km) : Math.round(((runningCostsCents + input.vehicleCcaCents) * percent) / 100),
  };

  const deductionsCents = expensesCents + vehicle.cents + input.toolsCcaCents;
  const netIncomeCents = incomeCents - deductionsCents;

  return {
    year: input.year,
    incomeCount: income.length,
    incomeCents,
    expenseLines,
    expensesCents,
    vehicle,
    toolsCcaCents: input.toolsCcaCents,
    equipmentBoughtCents,
    deductionsCents,
    netIncomeCents,
    setAsideCents: Math.max(0, Math.round((netIncomeCents * TAX_SET_ASIDE_PERCENT) / 100)),
  };
}

// ---------------------------------------------------------------------------

export interface HstThreshold {
  /** First and last day of the four calendar quarters ending with the current one. */
  from: string;
  to: string;
  /** Revenue in those four quarters. */
  cents: number;
  /** The largest single quarter among them, which has the same limit on its own. */
  largestQuarterCents: number;
  limitCents: number;
  remainingCents: number;
  /** 0–100, whole number. */
  percent: number;
  over: boolean;
}

const quarterIndex = (iso: string) => Number(iso.slice(0, 4)) * 4 + Math.floor((Number(iso.slice(5, 7)) - 1) / 3);

/**
 * How close revenue is to the point where HST registration is required: more than
 * $30,000 over four consecutive calendar quarters, or in any one quarter. This looks
 * at the four quarters ending with the one `today` is in, which is the window that
 * is still growing.
 */
export function hstThreshold(income: (Amount & { incomeDate: string })[], today: string): HstThreshold {
  const current = quarterIndex(today);
  const first = current - 3;
  const quarters = [0, 0, 0, 0];
  for (const payment of income) {
    const q = quarterIndex(payment.incomeDate);
    if (q >= first && q <= current) quarters[q - first] += revenueCents(payment);
  }

  const cents = quarters.reduce((total, q) => total + q, 0);
  const largestQuarterCents = Math.max(...quarters);
  const pad = (n: number) => String(n).padStart(2, '0');
  const firstYear = Math.floor(first / 4);
  const firstMonth = (first % 4) * 3 + 1;
  const lastYear = Math.floor(current / 4);
  const lastMonth = (current % 4) * 3 + 3;
  const lastDay = lastMonth === 3 || lastMonth === 12 ? 31 : 30;

  return {
    from: `${firstYear}-${pad(firstMonth)}-01`,
    to: `${lastYear}-${pad(lastMonth)}-${lastDay}`,
    cents,
    largestQuarterCents,
    limitCents: HST_THRESHOLD_CENTS,
    remainingCents: Math.max(0, HST_THRESHOLD_CENTS - cents),
    percent: Math.min(100, Math.round((cents / HST_THRESHOLD_CENTS) * 100)),
    over: cents > HST_THRESHOLD_CENTS || largestQuarterCents > HST_THRESHOLD_CENTS,
  };
}
