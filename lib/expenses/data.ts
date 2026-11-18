import 'server-only';
import { randomUUID } from 'node:crypto';
import { and, asc, desc, eq, gte, inArray, lt, max, sql } from 'drizzle-orm';
import type { BatchItem } from 'drizzle-orm/batch';
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

/**
 * The receipt an expense belongs to: just that expense, or every item split from
 * the same receipt, in entry order. Empty when there is no such expense.
 */
export async function getReceipt(id: number): Promise<Expense[]> {
  await verifySession();
  const [expense] = await db().select().from(expenses).where(eq(expenses.id, id)).limit(1);
  if (!expense) return [];
  if (!expense.receiptGroup) return [expense];
  return db().select().from(expenses).where(eq(expenses.receiptGroup, expense.receiptGroup)).orderBy(asc(expenses.id));
}

/** Vehicle categories are tied to the vehicle in use, everything else to none. */
async function withVehicle(items: ExpenseInput[]) {
  const vehicle = items.some(item => isVehicleCategory(item.category)) ? await getVehicle() : null;
  return items.map(item => ({ ...item, vehicleId: isVehicleCategory(item.category) ? (vehicle?.id ?? null) : null }));
}

/** Runs the writes as one transaction (a Neon HTTP batch). */
async function inOneGo(queries: BatchItem<'pg'>[]) {
  if (queries.length > 0) await db().batch(queries as [BatchItem<'pg'>, ...BatchItem<'pg'>[]]);
}

/** Saves a receipt's items: one expense each, tied together when there is more than one. */
export async function createReceipt(items: ExpenseInput[]): Promise<void> {
  await verifySession();
  const receiptGroup = items.length > 1 ? randomUUID() : null;
  const rows = (await withVehicle(items)).map(row => ({ ...row, receiptGroup }));
  await db().insert(expenses).values(rows);
}

/**
 * Replaces the receipt that expense `id` belongs to with these items. Items are
 * matched to the saved expenses in order, so each keeps its id and entry date; extra
 * items are added and leftover expenses removed, all in one transaction. Returns
 * false when the expense no longer exists.
 */
export async function updateReceipt(id: number, items: ExpenseInput[]): Promise<boolean> {
  const saved = await getReceipt(id);
  if (saved.length === 0) return false;

  const receiptGroup = items.length > 1 ? (saved[0].receiptGroup ?? randomUUID()) : null;
  const rows = (await withVehicle(items)).map(row => ({ ...row, receiptGroup }));
  const leftover = saved.slice(rows.length).map(expense => expense.id);

  await inOneGo([
    ...rows.slice(0, saved.length).map((row, i) => db().update(expenses).set(row).where(eq(expenses.id, saved[i].id))),
    ...(rows.length > saved.length ? [db().insert(expenses).values(rows.slice(saved.length))] : []),
    ...(leftover.length > 0 ? [db().delete(expenses).where(inArray(expenses.id, leftover))] : []),
  ]);
  return true;
}

/** Deletes the receipt expense `id` belongs to, every item of it. */
export async function deleteReceipt(id: number): Promise<void> {
  const saved = await getReceipt(id);
  if (saved.length === 0) return;
  await db()
    .delete(expenses)
    .where(inArray(expenses.id, saved.map(expense => expense.id)));
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
