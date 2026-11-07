import YearPicker from '@/components/business/YearPicker';
import { currentYear, parseYearParam } from '@/lib/dates';
import { expenseYears, listExpenses } from '@/lib/expenses/data';
import { summarizeExpenses, type SectionTotal } from '@/lib/expenses/summary';
import { formatCents } from '@/lib/money';

const BASE = '/tools/business/expenses';

export default async function ExpenseSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);
  const [expenses, years] = await Promise.all([listExpenses(year), expenseYears(currentYear())]);
  const summary = summarizeExpenses(year, expenses);

  return (
    <div className="space-y-6">
      <YearPicker years={years} selected={year} path={`${BASE}/summary`} />

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-1">{year} expenses</h2>
        <p className="text-sm text-stone-500 mb-4">
          Once HST-registered, the HST paid comes back as input tax credits, so the expense is the amount net of HST.
          Before registration, the full total is the expense.
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Figure label="Total paid" value={formatCents(summary.totalCents)} />
          <Figure label="HST paid" value={formatCents(summary.hstCents)} />
          <Figure label="Net of HST" value={formatCents(summary.netCents)} />
          <Figure label="Expenses" value={String(summary.count)} />
        </dl>

        <a
          href={`${BASE}/export?year=${year}`}
          className="mt-4 inline-flex items-center justify-center border border-stone-300 bg-white text-stone-800 px-4 py-2 rounded-lg font-medium hover:bg-stone-100 transition-colors"
        >
          Download {year} expenses (CSV)
        </a>
      </section>

      {summary.sections.length === 0 ? (
        <p className="text-stone-500 text-center py-8">No expenses entered for {year} yet.</p>
      ) : (
        summary.sections.map(section => <SectionTable key={section.id} section={section} year={year} />)
      )}
    </div>
  );
}

function SectionTable({ section, year }: { section: SectionTotal; year: number }) {
  return (
    <section className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-stone-800">{section.label}</h2>
        {section.note && <p className="text-sm text-stone-500">{section.note}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">
            {section.label} by category, {year}
          </caption>
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th scope="col" className="text-left font-medium px-4 py-2">Category</th>
              <th scope="col" className="text-right font-medium px-3 py-2">Total</th>
              <th scope="col" className="text-right font-medium px-3 py-2">HST</th>
              <th scope="col" className="text-right font-medium px-4 py-2">Net</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {section.categories.map(c => (
              <tr key={c.id}>
                <th scope="row" className="text-left font-normal px-4 py-2">
                  {c.label}
                  <span className="block text-xs text-stone-500">
                    {c.line && `Line ${c.line} · `}
                    {c.count} {c.count === 1 ? 'expense' : 'expenses'}
                  </span>
                </th>
                <td className="text-right px-3 py-2 tabular-nums">{formatCents(c.totalCents)}</td>
                <td className="text-right px-3 py-2 tabular-nums">{formatCents(c.hstCents)}</td>
                <td className="text-right px-4 py-2 tabular-nums">{formatCents(c.netCents)}</td>
              </tr>
            ))}
          </tbody>
          {section.categories.length > 1 && (
            <tfoot className="border-t-2 border-stone-200 font-semibold text-stone-800">
              <tr>
                <th scope="row" className="text-left px-4 py-2">Total</th>
                <td className="text-right px-3 py-2 tabular-nums">{formatCents(section.totalCents)}</td>
                <td className="text-right px-3 py-2 tabular-nums">{formatCents(section.hstCents)}</td>
                <td className="text-right px-4 py-2 tabular-nums">{formatCents(section.netCents)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-xl font-bold text-stone-800 tabular-nums">{value}</dd>
    </div>
  );
}
