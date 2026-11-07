'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import { createExpense, deleteExpense, getExpense, updateExpense } from '@/lib/expenses/data';
import { parseExpense } from '@/lib/expenses/validation';
import { formatCents } from '@/lib/money';
import { formToObject } from '@/lib/validation';

/**
 * Server Actions for the expense log. Authorization happens inside lib/expenses/data
 * — every data function verifies the session — so these only validate and route.
 */

const BASE = '/tools/business/expenses';
const SAVE_FAILED: ActionResult = { ok: false, message: 'Could not save. Check your connection and try again.' };

function refreshExpenses() {
  revalidatePath(BASE, 'layout');
}

/** Runs a write, turning unexpected failures into a message while letting redirects through. */
async function attempt(write: () => Promise<void>): Promise<ActionResult | null> {
  try {
    await write();
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('Expense save failed:', error);
    return SAVE_FAILED;
  }
}

function parseId(id: unknown): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseExpense(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => createExpense(parsed.data));
  if (failed) return failed;

  refreshExpenses();
  return { ok: true, message: `Saved: ${parsed.data.vendor}, ${formatCents(parsed.data.totalCents)}` };
}

export async function updateExpenseAction(id: number, formData: FormData): Promise<ActionResult> {
  const expenseId = parseId(id);
  if (!expenseId) return { ok: false, message: 'Unknown expense.' };

  const parsed = parseExpense(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => updateExpense(expenseId, parsed.data));
  if (failed) return failed;

  refreshExpenses();
  redirect(`${BASE}?year=${parsed.data.expenseDate.slice(0, 4)}`);
}

export async function deleteExpenseAction(id: number): Promise<void> {
  const expenseId = parseId(id);
  if (!expenseId) return;
  const expense = await getExpense(expenseId);
  await deleteExpense(expenseId);
  refreshExpenses();
  redirect(expense ? `${BASE}?year=${expense.expenseDate.slice(0, 4)}` : BASE);
}
