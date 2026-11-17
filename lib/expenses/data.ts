import 'server-only';
import { and, desc, eq, gte, lt, max, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { expenses, type Expense } from '@/lib/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { yearRange } from '@/lib/dates';
import { getVehicle } from '@/lib/mileage/data';
import { isVehicleCategory } from './categories';
import type { ExpenseInput } from './validation';

/**
 * Expense data access. Every exported function verifies the session first — this
 * module, not the page or the proxy, is what keeps the data private.
 */

/** A year's expenses, newest first. */
export async function listExpenses(year: number): Promise<Expense[]> {
  await verifySession();
  const { start, end } = yearRange(year);
  return db()
    .select()
    .from(expenses)
    .where(and(gte(expenses.expenseDate, start), lt(expenses.expenseDate, end)))
    .orderBy(desc(expenses.expenseDate), desc(expenses.id));
}

/** Same as listExpenses but oldest first — the order a ledger is read in. */
export async function listExpensesChronological(year: number): Promise<Expense[]> {
  return (await listExpenses(year)).reverse();
}

export async function getExpense(id: number): Promise<Expense | null> {
  await verifySession();
  const [expense] = await db().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  return expense ?? null;
}

/** Vehicle categories are tied to the vehicle in use, everything else to none. */
async function withVehicle(input: ExpenseInput) {
  const vehicle = isVehicleCategory(input.category) ? await getVehicle() : null;
  return { ...input, vehicleId: vehicle?.id ?? null };
}

export async function createExpense(input: ExpenseInput): Promise<void> {
  await verifySession();
  await db().insert(expenses).values(await withVehicle(input));
}

export async function updateExpense(id: number, input: ExpenseInput): Promise<void> {
  await verifySession();
  await db().update(expenses).set(await withVehicle(input)).where(eq(expenses.id, id));
}

export async function deleteExpense(id: number): Promise<void> {
  await verifySession();
  await db().delete(expenses).where(eq(expenses.id, id));
}

/** Years that have expenses, plus the current one, newest first — for the year picker. */
export async function expenseYears(current: number): Promise<number[]> {
  await verifySession();
  const rows = await db()
    .selectDistinct({ year: sql<number>`extract(year from ${expenses.expenseDate})::int` })
    .from(expenses);
  return [...new Set([current, ...rows.map(r => Number(r.year))])].sort((a, b) => b - a);
}

/** Recently used vendors, most recent first, for autocomplete. */
export async function recentVendors(limit = 30): Promise<string[]> {
  await verifySession();
  const rows = await db()
    .select({ vendor: expenses.vendor })
    .from(expenses)
    .groupBy(expenses.vendor)
    .orderBy(desc(max(expenses.expenseDate)))
    .limit(limit);
  return rows.map(r => r.vendor);
}
