import { notFound } from 'next/navigation';
import ExpenseForm from '@/components/business/ExpenseForm';
import ConfirmButton from '@/components/business/ConfirmButton';
import { getExpense, recentVendors } from '@/lib/expenses/data';
import { centsToInput, formatCents } from '@/lib/money';
import { deleteExpenseAction, updateExpenseAction } from '../actions';

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [expense, vendors] = await Promise.all([getExpense(id), recentVendors()]);
  if (!expense) notFound();

  const backHref = `/tools/business/expenses?year=${expense.expenseDate.slice(0, 4)}`;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Edit expense</h2>
        <ExpenseForm
          mode="edit"
          action={updateExpenseAction.bind(null, expense.id)}
          vendors={vendors}
          cancelHref={backHref}
          initial={{
            expenseDate: expense.expenseDate,
            vendor: expense.vendor,
            category: expense.category,
            description: expense.description,
            total: centsToInput(expense.totalCents),
            hst: expense.hstCents > 0 ? centsToInput(expense.hstCents) : '',
          }}
        />
      </section>

      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          Entered {expense.createdAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}
          {expense.updatedAt.getTime() - expense.createdAt.getTime() > 1000 &&
            `, edited ${expense.updatedAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}`}
        </span>
        <ConfirmButton
          action={deleteExpenseAction.bind(null, expense.id)}
          confirmMessage={`Delete ${formatCents(expense.totalCents)} at ${expense.vendor} on ${expense.expenseDate}?`}
          className="text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
        >
          Delete expense
        </ConfirmButton>
      </div>
    </div>
  );
}
