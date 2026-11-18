import { notFound } from 'next/navigation';
import ExpenseForm from '@/components/business/ExpenseForm';
import ConfirmButton from '@/components/business/ConfirmButton';
import { getReceipt, recentVendors } from '@/lib/expenses/data';
import { receiptFormValues } from '@/lib/expenses/receipts';
import { projectOptions } from '@/lib/projectTracking/data';
import { formatCents } from '@/lib/money';
import { receiptStorageConfigured } from '@/lib/expenses/receiptFiles';
import { receiptScanningConfigured } from '@/lib/expenses/scan';
import { attachReceiptAction, deleteExpenseAction, updateExpenseAction } from '../actions';

export const maxDuration = 60;

/** Edits a receipt: one expense, or every item split from the same receipt. */
export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [lines, vendors, projects] = await Promise.all([getReceipt(id), recentVendors(), projectOptions()]);
  if (lines.length === 0) notFound();

  const [first] = lines;
  const split = lines.length > 1;
  const totalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
  const backHref = `/tools/business/expenses?year=${first.expenseDate.slice(0, 4)}`;
  const entered = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
  const edited = lines.some(line => line.updatedAt.getTime() - line.createdAt.getTime() > 1000);
  const lastEdit = new Date(Math.max(...lines.map(line => line.updatedAt.getTime())));

  return (
    <div className="space-y-6">
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">{split ? 'Edit receipt' : 'Edit expense'}</h2>
        <ExpenseForm
          mode="edit"
          action={updateExpenseAction.bind(null, first.id)}
          vendors={vendors}
          projects={projects}
          cancelHref={backHref}
          initial={receiptFormValues(lines)}
          receipts={{
            attach: attachReceiptAction,
            // A receipt already attached stays visible even if storage is later disconnected
            storage: receiptStorageConfigured() || Boolean(first.receiptPath),
            scanning: receiptScanningConfigured(),
          }}
        />
      </section>

      <div className="flex items-center justify-between gap-3 text-sm text-stone-500">
        <span>
          Entered {entered(first.createdAt)}
          {edited && `, edited ${entered(lastEdit)}`}
        </span>
        <ConfirmButton
          action={deleteExpenseAction.bind(null, first.id)}
          confirmMessage={
            split
              ? `Delete this ${formatCents(totalCents)} receipt at ${first.vendor} on ${first.expenseDate}, all ${lines.length} items?`
              : `Delete ${formatCents(totalCents)} at ${first.vendor} on ${first.expenseDate}?`
          }
          className="text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
        >
          {split ? 'Delete receipt' : 'Delete expense'}
        </ConfirmButton>
      </div>
    </div>
  );
}
