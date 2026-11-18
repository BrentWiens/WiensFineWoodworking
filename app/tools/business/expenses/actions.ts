'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import { createReceipt, deleteReceipt, getReceipt, updateReceipt } from '@/lib/expenses/data';
import { parseReceipt, type ExpenseInput } from '@/lib/expenses/validation';
import { MAX_RECEIPT_BYTES, receiptStorageConfigured, storeReceiptFile } from '@/lib/expenses/receiptFiles';
import { RECEIPT_FILE_TYPES } from '@/lib/expenses/receiptPath';
import type { ReceiptFormValues } from '@/lib/expenses/receipts';
import { receiptScanningConfigured, scanReceipt } from '@/lib/expenses/scan';
import { scanToForm, type ScanOutcome } from '@/lib/expenses/scanResult';
import { isIsoDate, todayIso } from '@/lib/dates';
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

export type AttachReceiptResult =
  | {
      ok: true;
      /** Where the file is stored, for the form to send back on save. */
      path: string;
      /** The form filled in from the receipt, when it was read. */
      scan: ScanOutcome | null;
      /** Why it wasn't read, when it wasn't. */
      note?: string;
    }
  | { ok: false; message: string };

/**
 * Stores a receipt photo or PDF (field `file`) and, when `current` is given, has
 * Claude read it and returns the form filled in from it. Nothing is saved to the
 * expense log here: the form posts the stored path back with everything else.
 */
export async function attachReceiptAction(
  formData: FormData,
  current: ReceiptFormValues | null,
): Promise<AttachReceiptResult> {
  if (!receiptStorageConfigured()) return { ok: false, message: 'Receipt storage isn’t set up yet.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: 'Choose a photo or PDF of the receipt.' };
  if (!RECEIPT_FILE_TYPES.some(t => t.mime === file.type)) {
    return { ok: false, message: 'That file type can’t be used. Choose a photo (JPEG, PNG) or a PDF.' };
  }
  if (file.size > MAX_RECEIPT_BYTES) return { ok: false, message: 'That file is over 4 MB. Choose a smaller one.' };

  const date = current?.expenseDate && isIsoDate(current.expenseDate) ? current.expenseDate : todayIso();
  let stored;
  try {
    stored = await storeReceiptFile(file, date.slice(0, 4));
  } catch (error) {
    unstable_rethrow(error);
    console.error('Receipt upload failed:', error);
    return { ok: false, message: 'Could not upload the receipt. Check your connection and try again.' };
  }

  if (!current || !Array.isArray(current.items)) return { ok: true, path: stored.path, scan: null };
  if (!receiptScanningConfigured()) {
    return { ok: true, path: stored.path, scan: null, note: 'Receipt reading isn’t set up yet, so fill in the details by hand.' };
  }
  try {
    const scan = await scanReceipt(stored);
    if (!scan) return { ok: true, path: stored.path, scan: null, note: 'This receipt couldn’t be read. Fill in the details by hand.' };
    return { ok: true, path: stored.path, scan: scanToForm(scan, current, todayIso()) };
  } catch (error) {
    unstable_rethrow(error);
    console.error('Receipt scan failed:', error);
    return {
      ok: true,
      path: stored.path,
      scan: null,
      note: 'The receipt is attached, but reading it failed. Fill in the details by hand.',
    };
  }
}
