import Link from 'next/link';
import { notFound } from 'next/navigation';
import ConfirmButton from '@/components/business/ConfirmButton';
import { IncomeForm, ProjectForm } from '@/components/business/ProjectForms';
import { KM_RATE_CENTS, MEALS_DEDUCTIBLE_PERCENT } from '@/lib/accounting/rules';
import { formatShortDate, todayIso } from '@/lib/dates';
import { categoryLabel } from '@/lib/expenses/categories';
import { formatKm } from '@/lib/mileage/summary';
import { centsToInput, formatCents } from '@/lib/money';
import { getProjectDetail } from '@/lib/projectTracking/data';
import { outstandingCents, projectTotals, type ProjectTotals } from '@/lib/projectTracking/summary';
import { statusLabel } from '@/lib/projectTracking/validation';
import type { Expense, ProjectIncome, Trip } from '@/lib/db/schema';
import { addIncomeAction, deleteIncomeAction, deleteProjectAction, updateProjectAction } from '../actions';

const BASE = '/tools/business/projects';
const cardClass = 'bg-white border border-stone-200 rounded-lg';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const detail = await getProjectDetail(id);
  if (!detail) notFound();
  const { project, income, expenses, trips } = detail;
  const totals = projectTotals(income, expenses, trips);

  return (
    <div className="space-y-6">
      <div>
        <Link href={BASE} className="text-sm text-stone-600 hover:text-stone-900">
          ← All projects
        </Link>
        <h2 className="text-xl font-semibold text-stone-800 mt-2">
          {project.number} · {project.name}
        </h2>
        <p className="text-sm text-stone-500">
          {project.client ? `${project.client} · ` : ''}
          {statusLabel(project.status)}
        </p>
      </div>

      <TotalsTable totals={totals} />

      <section className={`${cardClass} p-4 sm:p-5`}>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Money received</h2>
        <PaymentStatus priceCents={project.priceCents} receivedCents={totals.receivedCents} />
        {income.length > 0 && <IncomeList income={income} />}
        <IncomeForm action={addIncomeAction.bind(null, project.id)} today={todayIso()} />
      </section>

      <section aria-labelledby="project-expenses">
        <h2 id="project-expenses" className="text-lg font-semibold text-stone-800 mb-1">
          Expenses
        </h2>
        <p className="text-sm text-stone-500 mb-3">
          To add one, enter it in the <Link href="/tools/business/expenses" className="underline underline-offset-2">expense log</Link> and
          choose this project.
        </p>
        {expenses.length === 0 ? (
          <p className="text-stone-500">No expenses linked to this project yet.</p>
        ) : (
          <ExpenseList expenses={expenses} />
        )}
      </section>

      <section aria-labelledby="project-trips">
        <h2 id="project-trips" className="text-lg font-semibold text-stone-800 mb-1">
          Trips
        </h2>
        <p className="text-sm text-stone-500 mb-3">
          To add one, log it in the <Link href="/tools/business/mileage" className="underline underline-offset-2">mileage log</Link> and
          choose this project.
        </p>
        {trips.length === 0 ? (
          <p className="text-stone-500">No trips linked to this project yet.</p>
        ) : (
          <TripList trips={trips} />
        )}
      </section>

      <section className={`${cardClass} p-4 sm:p-5`}>
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Project details</h2>
        <ProjectForm
          mode="edit"
          action={updateProjectAction.bind(null, project.id)}
          initial={{
            number: project.number,
            name: project.name,
            client: project.client ?? '',
            amount: project.priceCents === null ? '' : centsToInput(project.priceCents),
            status: project.status,
            notes: project.notes ?? '',
          }}
        />
      </section>

      <div className="flex items-center justify-between gap-3 text-sm text-stone-500">
        <span>Added {project.createdAt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' })}</span>
        {income.length > 0 ? (
          <span className="text-right">Remove its payments before deleting this project.</span>
        ) : (
          <ConfirmButton
            action={deleteProjectAction.bind(null, project.id)}
            confirmMessage={`Delete project ${project.number}? Its expenses and trips are kept, but will no longer be tied to a project.`}
            className="text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
          >
            Delete project
          </ConfirmButton>
        )}
      </div>
    </div>
  );
}

/** The project amount, what has been paid against it, and what is still owed. */
function PaymentStatus({ priceCents, receivedCents }: { priceCents: number | null; receivedCents: number }) {
  const outstanding = outstandingCents(priceCents, receivedCents);
  if (priceCents === null || outstanding === null) {
    return (
      <p className="text-sm text-stone-600 mb-4">
        {receivedCents > 0 && <>Paid {formatCents(receivedCents)} so far. </>}
        Add the project amount under Project details to see what is still owed.
      </p>
    );
  }
  return (
    <div className="mb-5">
      <dl className="grid grid-cols-3 gap-2 text-center">
        <PaymentStat label="Project amount" cents={priceCents} />
        <PaymentStat label="Paid" cents={receivedCents} />
        <PaymentStat label="Outstanding" cents={Math.max(outstanding, 0)} highlight={outstanding > 0} />
      </dl>
      <p className="text-sm text-stone-600 mt-2">
        {outstanding > 0
          ? `${formatCents(outstanding)} still to be paid.`
          : outstanding === 0
            ? 'Paid in full.'
            : `Paid ${formatCents(-outstanding)} more than the project amount. Check the amount or the payments.`}
      </p>
    </div>
  );
}

function PaymentStat({ label, cents, highlight }: { label: string; cents: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border px-2 py-2 ${highlight ? 'border-amber-200 bg-amber-50' : 'border-stone-200'}`}>
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className={`font-semibold tabular-nums ${highlight ? 'text-amber-900' : 'text-stone-800'}`}>
        {formatCents(cents)}
      </dd>
    </div>
  );
}

function TotalsTable({ totals }: { totals: ProjectTotals }) {
  return (
    <section className={`${cardClass} overflow-hidden`}>
      <table className="w-full text-sm">
        <caption className="sr-only">Income, costs and profit for this project</caption>
        <tbody className="divide-y divide-stone-100 text-stone-800">
          <TotalRow label="Income" note={count(totals.incomeCount, 'payment')} cents={totals.incomeCents} bold />
          {totals.costs.map(line => (
            <TotalRow
              key={line.id}
              label={line.label}
              note={count(line.count, 'expense') + (line.id === 'meals' ? `, counted at ${MEALS_DEDUCTIBLE_PERCENT}%` : '')}
              cents={-line.cents}
            />
          ))}
          {totals.tripCount > 0 && (
            <TotalRow
              label="Mileage"
              note={`${count(totals.tripCount, 'trip')}, ${formatKm(totals.km)} km at ${formatCents(KM_RATE_CENTS)}/km (estimate)`}
              cents={-totals.mileageCents}
            />
          )}
        </tbody>
        <tfoot className="border-t-2 border-stone-200 font-semibold text-stone-800">
          <tr>
            <th scope="row" className="text-left px-4 py-2">Profit</th>
            <td className={`text-right px-4 py-2 tabular-nums ${totals.profitCents < 0 ? 'text-red-700' : ''}`}>
              {formatCents(totals.profitCents)}
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function TotalRow({ label, note, cents, bold }: { label: string; note: string; cents: number; bold?: boolean }) {
  return (
    <tr>
      <th scope="row" className={`text-left px-4 py-2 ${bold ? 'font-semibold' : 'font-normal'}`}>
        {label}
        <span className="block text-xs font-normal text-stone-500">{note}</span>
      </th>
      <td className={`text-right align-top px-4 py-2 tabular-nums whitespace-nowrap ${bold ? 'font-semibold' : ''}`}>
        {formatCents(cents)}
      </td>
    </tr>
  );
}

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? '' : 's'}`;
}

function IncomeList({ income }: { income: ProjectIncome[] }) {
  return (
    <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg mb-5">
      {income.map(payment => (
        <li key={payment.id} className="flex items-start justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="font-medium text-stone-800 truncate">{payment.description}</p>
            <p className="text-sm text-stone-500">
              {formatShortDate(payment.incomeDate)}, {payment.incomeDate.slice(0, 4)}
              {payment.hstCents > 0 && ` · HST ${formatCents(payment.hstCents)}`}
            </p>
          </div>
          <p className="text-right shrink-0">
            <span className="font-semibold text-stone-800 tabular-nums">{formatCents(payment.totalCents)}</span>
            <ConfirmButton
              action={deleteIncomeAction.bind(null, payment.id)}
              confirmMessage={`Remove ${formatCents(payment.totalCents)} (${payment.description}) received on ${payment.incomeDate}?`}
              className="block ml-auto text-xs text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
            >
              Remove
            </ConfirmButton>
          </p>
        </li>
      ))}
    </ul>
  );
}

function ExpenseList({ expenses }: { expenses: Expense[] }) {
  return (
    <ul className={`${cardClass} divide-y divide-stone-100`}>
      {expenses.map(expense => (
        <li key={expense.id}>
          <Link
            href={`/tools/business/expenses/${expense.id}`}
            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <p className="font-medium text-stone-800 truncate">{expense.vendor}</p>
              <p className="text-sm text-stone-500 truncate">
                {formatShortDate(expense.expenseDate)}, {expense.expenseDate.slice(0, 4)} · {expense.description}
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
  );
}

function TripList({ trips }: { trips: Trip[] }) {
  return (
    <ul className={`${cardClass} divide-y divide-stone-100`}>
      {trips.map(trip => (
        <li key={trip.id}>
          <Link
            href={`/tools/business/mileage/${trip.id}`}
            className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
          >
            <div className="min-w-0">
              <p className="font-medium text-stone-800 truncate">{trip.destination}</p>
              <p className="text-sm text-stone-500 truncate">
                {formatShortDate(trip.tripDate)}, {trip.tripDate.slice(0, 4)} · {trip.purpose}
              </p>
            </div>
            <p className="text-right shrink-0">
              <span className="font-semibold text-stone-800 tabular-nums">{formatKm(trip.distanceKm)}</span>
              <span className="block text-xs text-stone-500">km</span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
