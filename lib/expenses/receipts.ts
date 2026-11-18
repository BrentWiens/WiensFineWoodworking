import { centsToInput } from '../money';

/**
 * A receipt can hold items from more than one category: small tools and materials
 * on the same hardware-store receipt. Each item is saved as its own expense, so every
 * report keeps working on expenses alone; the items of one receipt share a
 * receipt_group, and are entered, edited and deleted together.
 */

/** Most items one receipt can be split into. */
export const MAX_RECEIPT_ITEMS = 10;

/**
 * Shares a receipt's HST across its items in proportion to their before-tax amounts.
 * Whole cents go by largest remainder, so the items add up to the receipt exactly.
 * `subtotalsCents` must add up to the receipt before tax (total less HST).
 */
export function splitReceipt(
  totalCents: number,
  hstCents: number,
  subtotalsCents: number[],
): { totalCents: number; hstCents: number }[] {
  const beforeTax = subtotalsCents.reduce((sum, cents) => sum + cents, 0);
  if (beforeTax !== totalCents - hstCents || subtotalsCents.some(cents => cents <= 0)) {
    throw new Error('Item amounts must be positive and add up to the receipt before tax');
  }

  const shares = subtotalsCents.map((cents, index) => {
    const exact = (hstCents * cents) / beforeTax;
    return { index, cents: Math.floor(exact), remainder: exact - Math.floor(exact) };
  });
  let left = hstCents - shares.reduce((sum, share) => sum + share.cents, 0);
  // Largest remainder first; on a tie, the earlier item
  for (const share of [...shares].sort((a, b) => b.remainder - a.remainder || a.index - b.index)) {
    if (left === 0) break;
    share.cents += 1;
    left -= 1;
  }

  return subtotalsCents.map((cents, index) => ({ totalCents: cents + shares[index].cents, hstCents: shares[index].cents }));
}

export interface ReceiptLine {
  id: number;
  expenseDate: string;
  vendor: string;
  description: string;
  category: string;
  totalCents: number;
  hstCents: number;
  projectNumber: string | null;
  receiptGroup: string | null;
  receiptPath: string | null;
}

/** The expenses of one receipt, in the order they were listed. */
export interface Receipt<T extends ReceiptLine = ReceiptLine> {
  /** The first item's id: what the receipt's edit page is found under. */
  id: number;
  lines: T[];
  totalCents: number;
}

/**
 * Gathers expenses into receipts, keeping the list's order: a receipt sits where its
 * first item does, with its items in entry order.
 */
export function groupReceipts<T extends ReceiptLine>(expenses: T[]): Receipt<T>[] {
  const receipts: Receipt<T>[] = [];
  const byGroup = new Map<string, Receipt<T>>();
  for (const expense of expenses) {
    const existing = expense.receiptGroup ? byGroup.get(expense.receiptGroup) : undefined;
    if (existing) {
      existing.lines.push(expense);
      existing.totalCents += expense.totalCents;
      continue;
    }
    const receipt = { id: expense.id, lines: [expense], totalCents: expense.totalCents };
    receipts.push(receipt);
    if (expense.receiptGroup) byGroup.set(expense.receiptGroup, receipt);
  }
  for (const receipt of receipts) {
    receipt.lines.sort((a, b) => a.id - b.id);
    receipt.id = receipt.lines[0].id;
  }
  return receipts;
}

// --- The expense form's values ----------------------------------------------

export interface ReceiptItemValues {
  category: string;
  description: string;
  projectNumber: string;
  /** Before tax, as typed. Only used once the receipt is split. */
  subtotal: string;
}

export interface ReceiptFormValues {
  expenseDate: string;
  vendor: string;
  total: string;
  hst: string;
  items: ReceiptItemValues[];
  /** The attached photo or PDF in storage, or '' for none. */
  receiptPath: string;
}

export const blankItem = (projectNumber = ''): ReceiptItemValues => ({
  category: '',
  description: '',
  projectNumber,
  subtotal: '',
});

export const blankReceipt = (expenseDate: string): ReceiptFormValues => ({
  expenseDate,
  vendor: '',
  total: '',
  hst: '',
  items: [blankItem()],
  receiptPath: '',
});

/** A saved receipt's items back into the form that entered them. */
export function receiptFormValues(lines: ReceiptLine[]): ReceiptFormValues {
  const totalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
  const hstCents = lines.reduce((sum, line) => sum + line.hstCents, 0);
  return {
    expenseDate: lines[0].expenseDate,
    vendor: lines[0].vendor,
    total: centsToInput(totalCents),
    hst: hstCents > 0 ? centsToInput(hstCents) : '',
    items: lines.map(line => ({
      category: line.category,
      description: line.description,
      projectNumber: line.projectNumber ?? '',
      subtotal: lines.length > 1 ? centsToInput(line.totalCents - line.hstCents) : '',
    })),
    receiptPath: lines[0].receiptPath ?? '',
  };
}
