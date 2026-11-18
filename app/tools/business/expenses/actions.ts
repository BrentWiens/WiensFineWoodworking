'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import { createReceipt, deleteReceipt, getReceipt, updateReceipt } from '@/lib/expenses/data';
import { parseReceipt, type ExpenseInput } from '@/lib/expenses/validation';
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
  // A project's costs are its expenses
  revalidatePath('/tools/business/projects', 'layout');
  revalidatePath('/tools/business/accounting', 'layout');
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

/** "Lumber yard, $113.00" or "Lumber yard, $113.00 in 2 categories". */
function savedMessage(items: ExpenseInput[]): string {
  const total = items.reduce((sum, item) => sum + item.totalCents, 0);
  const split = items.length > 1 ? ` in ${items.length} categories` : '';
  return `Saved: ${items[0].vendor}, ${formatCents(total)}${split}`;
}

export async function createExpenseAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseReceipt(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => createReceipt(parsed.data));
  if (failed) return failed;

  refreshExpenses();
  return { ok: true, message: savedMessage(parsed.data) };
}

export async function updateExpenseAction(id: number, formData: FormData): Promise<ActionResult> {
  const expenseId = parseId(id);
  if (!expenseId) return { ok: false, message: 'Unknown expense.' };

  const parsed = parseReceipt(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let found = false;
  const failed = await attempt(async () => {
    found = await updateReceipt(expenseId, parsed.data);
  });
  if (failed) return failed;
  if (!found) return { ok: false, message: 'This expense was deleted.' };

  refreshExpenses();
  redirect(`${BASE}?year=${parsed.data[0].expenseDate.slice(0, 4)}`);
}

/** Deletes the whole receipt: every item split from it. */
export async function deleteExpenseAction(id: number): Promise<void> {
  const expenseId = parseId(id);
  if (!expenseId) return;
  const [expense] = await getReceipt(expenseId);
  await deleteReceipt(expenseId);
  refreshExpenses();
  redirect(expense ? `${BASE}?year=${expense.expenseDate.slice(0, 4)}` : BASE);
}
