import Link from 'next/link';
import ExpenseForm from '@/components/business/ExpenseForm';
import YearPicker from '@/components/business/YearPicker';
import { currentYear, formatShortDate, monthName, parseYearParam, todayIso } from '@/lib/dates';
import { categoryLabel } from '@/lib/expenses/categories';
import { expenseYears, listExpenses, recentVendors } from '@/lib/expenses/data';
import { blankReceipt, groupReceipts, type Receipt } from '@/lib/expenses/receipts';
import { projectOptions } from '@/lib/projectTracking/data';
import { summarizeExpenses, type ExpenseSummary } from '@/lib/expenses/summary';
import type { Expense } from '@/lib/db/schema';
import { formatCents } from '@/lib/money';
import { receiptStorageConfigured } from '@/lib/expenses/receiptFiles';
import { receiptScanningConfigured } from '@/lib/expenses/scan';
import { attachReceiptAction, createExpenseAction } from './actions';

const BASE = '/tools/business/expenses';

/** Reading a receipt photo with Claude can take a while; this covers the page's Server Actions. */
export const maxDuration = 60;

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);

  const [expenses, vendors, projects, years] = await Promise.all([
    listExpenses(year),
    recentVendors(),
    projectOptions(),
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
          projects={projects}
          initial={blankReceipt(todayIso())}
          receipts={{
            attach: attachReceiptAction,
            storage: receiptStorageConfigured(),
            scanning: receiptScanningConfigured(),
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

  // Newest first, grouped by month; the items of a split receipt show as one entry.
  const groups = new Map<number, Receipt<Expense>[]>();
  for (const receipt of groupReceipts(expenses)) {
    const month = Number(receipt.lines[0].expenseDate.slice(5, 7));
    groups.set(month, [...(groups.get(month) ?? []), receipt]);
  }

  return (
    <section className="space-y-5" aria-label={`Expenses in ${year}`}>
      {[...groups].map(([month, receipts]) => (
        <div key={month}>
          <h3 className="flex justify-between text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 px-1">
            <span>
              {monthName(month)} {year}
            </span>
            <span className="tabular-nums">{formatCents(summary.months[month - 1].totalCents)}</span>
          </h3>
          <ul className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
            {receipts.map(receipt => (
              <li key={receipt.id}>
                <Link
                  href={`${BASE}/${receipt.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">
                      {receipt.lines[0].vendor}
                      {receipt.lines[0].receiptPath && (
                        <span className="ml-1.5 text-xs font-normal text-stone-500">· receipt</span>
                      )}
                    </p>
                    <p className="text-sm text-stone-500 truncate">
                      {formatShortDate(receipt.lines[0].expenseDate)} · {unique(receipt.lines.map(l => l.description)).join(' · ')}
                    </p>
                  </div>
                  <p className="text-right shrink-0">
                    <span className="font-semibold text-stone-800 tabular-nums">{formatCents(receipt.totalCents)}</span>
                    <span className="block text-xs text-stone-500">
                      {unique(receipt.lines.map(l => categoryLabel(l.category))).join(' + ')}
                    </span>
                    {receipt.lines.some(l => l.projectNumber) && (
                      <span className="block text-xs text-stone-500">
                        {projectsLabel(receipt.lines.flatMap(l => (l.projectNumber ? [l.projectNumber] : [])))}
                      </span>
                    )}
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

const unique = (values: string[]) => [...new Set(values)];

function projectsLabel(numbers: string[]): string {
  const distinct = unique(numbers);
  return `${distinct.length === 1 ? 'Project' : 'Projects'} ${distinct.join(', ')}`;
}
