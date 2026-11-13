import Link from 'next/link';
import ExpenseForm from '@/components/business/ExpenseForm';
import YearPicker from '@/components/business/YearPicker';
import { currentYear, formatShortDate, monthName, parseYearParam, todayIso } from '@/lib/dates';
import { categoryLabel } from '@/lib/expenses/categories';
import { expenseYears, listExpenses, recentVendors } from '@/lib/expenses/data';
import { summarizeExpenses, type ExpenseSummary } from '@/lib/expenses/summary';
import type { Expense } from '@/lib/db/schema';
import { formatCents } from '@/lib/money';
import { createExpenseAction } from './actions';

const BASE = '/tools/business/expenses';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);

  const [expenses, vendors, years] = await Promise.all([
    listExpenses(year),
    recentVendors(),
    expenseYears(currentYear()),
  ]);
  const summary = summarizeExpenses(year, expenses);

  return (
    <div className="space-y-6">
      <YearPicker years={years} selected={year} path={BASE} />

      {/* Dollar amounts need more room than km, so only two tiles fit across a phone. */}
      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Spent" value={formatCents(summary.totalCents)} />
        <Stat label="HST paid" value={formatCents(summary.hstCents)} />
        <Stat label="Expenses" value={String(summary.count)} className="col-span-2 sm:col-span-1" />
      </dl>

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Add an expense</h2>
        <ExpenseForm
          mode="create"
          action={createExpenseAction}
          vendors={vendors}
          initial={{
            expenseDate: todayIso(),
            vendor: '',
            category: '',
            description: '',
            total: '',
            hst: '',
          }}
        />
      </section>

      <ExpenseList expenses={expenses} year={year} summary={summary} />
    </div>
  );
}

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-lg p-3 ${className}`}>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-xl sm:text-2xl font-bold text-stone-800 tabular-nums">{value}</dd>
    </div>
  );
}

function ExpenseList({ expenses, year, summary }: { expenses: Expense[]; year: number; summary: ExpenseSummary }) {
  if (expenses.length === 0) {
    return <p className="text-stone-500 text-center py-8">No expenses entered for {year} yet.</p>;
  }

  // Newest first, grouped by month.
  const groups = new Map<number, Expense[]>();
  for (const expense of expenses) {
    const month = Number(expense.expenseDate.slice(5, 7));
    groups.set(month, [...(groups.get(month) ?? []), expense]);
  }

  return (
    <section className="space-y-5" aria-label={`Expenses in ${year}`}>
      {[...groups].map(([month, monthExpenses]) => (
        <div key={month}>
          <h3 className="flex justify-between text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 px-1">
            <span>
              {monthName(month)} {year}
            </span>
            <span className="tabular-nums">{formatCents(summary.months[month - 1].totalCents)}</span>
          </h3>
          <ul className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
            {monthExpenses.map(expense => (
              <li key={expense.id}>
                <Link
                  href={`${BASE}/${expense.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{expense.vendor}</p>
                    <p className="text-sm text-stone-500 truncate">
                      {formatShortDate(expense.expenseDate)} · {expense.description}
                    </p>
                  </div>
                  <p className="text-right shrink-0">
                    <span className="font-semibold text-stone-800 tabular-nums">{formatCents(expense.totalCents)}</span>
                    <span className="block text-xs text-stone-500">{categoryLabel(expense.category)}</span>
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
