import Link from 'next/link';
import YearPicker from '@/components/business/YearPicker';
import { capitalClasses, listIncome } from '@/lib/accounting/data';
import { HST_REGISTERED_FROM, KM_RATE_CENTS, MEALS_DEDUCTIBLE_PERCENT, TAX_SET_ASIDE_PERCENT } from '@/lib/accounting/rules';
import { hstThreshold, yearAccounts, type HstThreshold, type YearAccounts } from '@/lib/accounting/year';
import { currentYear, parseYearParam, todayIso } from '@/lib/dates';
import { expenseYears, listExpenses } from '@/lib/expenses/data';
import { getOdometerYear, listTrips, tripYears } from '@/lib/mileage/data';
import { formatKm, summarizeYear } from '@/lib/mileage/summary';
import { formatCents } from '@/lib/money';

const BASE = '/tools/business/accounting';
const cardClass = 'bg-white border border-stone-200 rounded-lg';

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);
  const thisYear = currentYear();

  const [income, expenses, trips, odometer, classes, withExpenses, withTrips] = await Promise.all([
    listIncome(),
    listExpenses(year),
    listTrips(year),
    getOdometerYear(year),
    capitalClasses(year),
    expenseYears(thisYear),
    tripYears(thisYear),
  ]);

  const claimed = (classId: string) =>
    classes.find(c => c.id === classId)?.schedule.find(row => row.year === year)?.claimedCents ?? 0;

  const accounts = yearAccounts({
    year,
    income,
    expenses,
    trips,
    businessPercent: summarizeYear(year, trips, odometer).businessPercent,
    toolsCcaCents: claimed('8'),
    vehicleCcaCents: claimed('10'),
  });

  const years = [
    ...new Set([...withExpenses, ...withTrips, ...income.map(i => Number(i.incomeDate.slice(0, 4)))]),
  ].sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <YearPicker years={years} selected={year} path={BASE} />

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Income" value={formatCents(accounts.incomeCents)} />
        <Stat label="Expenses" value={formatCents(accounts.deductionsCents)} />
        <Stat label="Net income" value={formatCents(accounts.netIncomeCents)} />
        <Stat label={`Set aside (${TAX_SET_ASIDE_PERCENT}%)`} value={formatCents(accounts.setAsideCents)} />
      </dl>

      <ProfitAndLoss accounts={accounts} />

      {/* The threshold looks back from today, so it only belongs with the current year */}
      {year === thisYear && HST_REGISTERED_FROM === null && <Threshold threshold={hstThreshold(income, todayIso())} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${cardClass} p-3`}>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-xl sm:text-2xl font-bold text-stone-800 tabular-nums">{value}</dd>
    </div>
  );
}

function ProfitAndLoss({ accounts }: { accounts: YearAccounts }) {
  const { vehicle, year } = accounts;
  const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? '' : 's'}`;

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-stone-800">{year} profit and loss</h2>
        <p className="text-sm text-stone-500">
          {HST_REGISTERED_FROM === null
            ? 'Not HST-registered, so each expense counts in full, HST included.'
            : `HST-registered from ${HST_REGISTERED_FROM}: expenses from then on count net of HST.`}
        </p>
      </div>
      <table className="w-full text-sm">
        <caption className="sr-only">Income, expenses and net income for {year}</caption>
        <tbody className="divide-y divide-stone-100 text-stone-800">
          <Row
            label="Income"
            note={`${count(accounts.incomeCount, 'payment')} received on projects`}
            cents={accounts.incomeCents}
            href="/tools/business/projects"
            bold
          />
          {accounts.expenseLines.map(line => (
            <Row
              key={line.id}
              label={line.label}
              note={
                line.id === 'meals'
                  ? `${count(line.count, 'expense')} · ${MEALS_DEDUCTIBLE_PERCENT}% of ${formatCents(line.paidCents)}`
                  : count(line.count, 'expense')
              }
              cents={-line.cents}
            />
          ))}
          <Row
            label="Vehicle"
            note={
              vehicle.method === 'actual'
                ? `${vehicle.businessPercent}% business use of ${formatCents(vehicle.runningCostsCents)} running costs` +
                  (vehicle.ccaCents > 0 ? ` and ${formatCents(vehicle.ccaCents)} CCA` : '')
                : `Estimate: ${formatKm(vehicle.km)} km at ${formatCents(KM_RATE_CENTS)}/km. Add the year's odometer readings in the mileage log for the real claim.`
            }
            cents={-vehicle.cents}
            href={`/tools/business/mileage/summary?year=${year}`}
          />
          <Row
            label="Tools and equipment (CCA)"
            note={
              accounts.equipmentBoughtCents > 0
                ? `${formatCents(accounts.equipmentBoughtCents)} bought this year is written off over time`
                : 'Capital cost allowance claimed this year'
            }
            cents={-accounts.toolsCcaCents}
            href={`${BASE}/capital?year=${year}`}
          />
        </tbody>
        <tfoot className="border-t-2 border-stone-200 font-semibold text-stone-800">
          <tr>
            <th scope="row" className="text-left px-4 py-2">Net income</th>
            <td className="text-right px-4 py-2 tabular-nums">{formatCents(accounts.netIncomeCents)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="text-sm text-stone-500 px-4 py-3 border-t border-stone-100">
        Keep about {formatCents(accounts.setAsideCents)} aside for income tax and CPP: {TAX_SET_ASIDE_PERCENT}% of net
        income, as a rule of thumb.
      </p>
    </section>
  );
}

function Row({ label, note, cents, href, bold }: { label: string; note: string; cents: number; href?: string; bold?: boolean }) {
  return (
    <tr>
      <th scope="row" className={`text-left px-4 py-2 ${bold ? 'font-semibold' : 'font-normal'}`}>
        {href ? (
          <Link href={href} className="underline underline-offset-2 decoration-stone-300 hover:decoration-stone-800">
            {label}
          </Link>
        ) : (
          label
        )}
        <span className="block text-xs font-normal text-stone-500">{note}</span>
      </th>
      <td className={`text-right align-top px-4 py-2 tabular-nums whitespace-nowrap ${bold ? 'font-semibold' : ''}`}>
        {formatCents(cents)}
      </td>
    </tr>
  );
}

function Threshold({ threshold }: { threshold: HstThreshold }) {
  const near = threshold.percent >= 80;
  return (
    <section className={`${cardClass} p-4 sm:p-5`}>
      <h2 className="text-lg font-semibold text-stone-800 mb-1">HST registration threshold</h2>
      <p className="text-sm text-stone-500 mb-3">
        Registration is required once income passes {formatCents(threshold.limitCents)} over four calendar quarters
        in a row, or in a single quarter. This counts every payment from {threshold.from} to {threshold.to},
        including clients outside Canada.
      </p>
      <div
        role="progressbar"
        aria-label="Income toward the HST threshold"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={threshold.percent}
        className="h-3 rounded-full bg-stone-200 overflow-hidden"
      >
        <div
          className={`h-full ${threshold.over ? 'bg-red-700' : near ? 'bg-amber-500' : 'bg-stone-800'}`}
          style={{ width: `${threshold.percent}%` }}
        />
      </div>
      <p className={`mt-2 text-sm ${threshold.over ? 'text-red-800 font-semibold' : near ? 'text-amber-800 font-medium' : 'text-stone-700'}`}>
        {formatCents(threshold.cents)} of {formatCents(threshold.limitCents)} ({threshold.percent}%).{' '}
        {threshold.over
          ? 'Over the limit: register for HST and start charging it.'
          : `${formatCents(threshold.remainingCents)} to go${near ? ', so registration is close' : ''}.`}
      </p>
    </section>
  );
}
