import Link from 'next/link';
import { CapitalAssetForm, CcaClaimForm } from '@/components/business/AccountingForms';
import ConfirmButton from '@/components/business/ConfirmButton';
import YearPicker from '@/components/business/YearPicker';
import { capitalClasses, type CapitalClass } from '@/lib/accounting/data';
import { currentYear, parseYearParam, todayIso } from '@/lib/dates';
import { centsToInput, formatCents } from '@/lib/money';
import { createCapitalAssetAction, deleteCapitalAssetAction, saveCcaClaimAction } from '../actions';

const BASE = '/tools/business/accounting/capital';
const cardClass = 'bg-white border border-stone-200 rounded-lg';

export default async function CapitalPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);
  const classes = await capitalClasses(Math.max(year, currentYear()));

  const firstYear = Math.min(currentYear(), ...classes.flatMap(c => c.schedule.map(row => row.year)));
  const years = Array.from({ length: currentYear() - firstYear + 1 }, (_, i) => currentYear() - i);

  return (
    <div className="space-y-6">
      <p className="text-sm text-stone-600">
        A tool of $500 or more, and the vehicle, are written off over several years through capital cost allowance
        (CCA) instead of being expensed when bought. Each year you choose how much to claim, up to a limit. The
        limit shown uses the standard half-year rule; your accountant may be able to claim more in the first year.
      </p>

      <YearPicker years={years} selected={year} path={BASE} />

      {classes.map(ccaClass => (
        <ClassSection key={ccaClass.id} ccaClass={ccaClass} year={year} />
      ))}

      <section className={`${cardClass} p-4 sm:p-5`}>
        <h2 className="text-lg font-semibold text-stone-800 mb-1">Add an asset</h2>
        <p className="text-sm text-stone-500 mb-3">
          For the vehicle, or a machine owned before the business started. A new tool of $500 or more goes in the
          expense log instead, and shows up here by itself.
        </p>
        <CapitalAssetForm action={createCapitalAssetAction} today={todayIso()} />
      </section>
    </div>
  );
}

function ClassSection({ ccaClass, year }: { ccaClass: CapitalClass; year: number }) {
  const row = ccaClass.schedule.find(r => r.year === year);
  const shown = ccaClass.schedule.filter(r => r.year <= year);

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-semibold text-stone-800">{ccaClass.label}</h2>
        <p className="text-sm text-stone-500">
          {ccaClass.note} Up to {ccaClass.rate}% of the pool a year.
        </p>
      </div>

      {ccaClass.items.length === 0 ? (
        <p className="text-stone-500 px-4 pb-4">Nothing in this class yet.</p>
      ) : (
        <>
          <ul className="divide-y divide-stone-100 border-t border-stone-100">
            {ccaClass.items.map(item => (
              <li key={item.key} className="flex items-start justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="font-medium text-stone-800 truncate">{item.name}</p>
                  <p className="text-sm text-stone-500 truncate">
                    {item.date}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </p>
                </div>
                <p className="text-right shrink-0">
                  <span className="font-semibold text-stone-800 tabular-nums">{formatCents(item.costCents)}</span>
                  {item.expenseId !== undefined && (
                    <Link
                      href={`/tools/business/expenses/${item.expenseId}`}
                      className="block text-xs text-stone-600 underline underline-offset-2 hover:text-stone-900"
                    >
                      Open expense
                    </Link>
                  )}
                  {item.assetId !== undefined && (
                    <ConfirmButton
                      action={deleteCapitalAssetAction.bind(null, item.assetId)}
                      confirmMessage={`Remove ${item.name} from the capital assets?`}
                      className="block ml-auto text-xs text-red-700 hover:text-red-900 underline underline-offset-2 disabled:opacity-50"
                    >
                      Remove
                    </ConfirmButton>
                  )}
                </p>
              </li>
            ))}
          </ul>

          {shown.length > 0 && (
            <div className="overflow-x-auto border-t border-stone-200">
              <table className="w-full text-sm">
                <caption className="sr-only">{ccaClass.label}: capital cost allowance by year</caption>
                <thead className="bg-stone-100 text-stone-600">
                  <tr>
                    <th scope="col" className="text-left font-medium px-4 py-2">Year</th>
                    <th scope="col" className="text-right font-medium px-3 py-2">Start (UCC)</th>
                    <th scope="col" className="text-right font-medium px-3 py-2">Bought</th>
                    <th scope="col" className="text-right font-medium px-3 py-2">Limit</th>
                    <th scope="col" className="text-right font-medium px-3 py-2">Claimed</th>
                    <th scope="col" className="text-right font-medium px-4 py-2">End (UCC)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {shown.map(r => (
                    <tr key={r.year} className={r.year === year ? 'bg-stone-50 font-medium' : undefined}>
                      <th scope="row" className="text-left font-normal px-4 py-2">{r.year}</th>
                      <td className="text-right px-3 py-2 tabular-nums">{formatCents(r.openingCents)}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{formatCents(r.additionsCents)}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{formatCents(r.maxCents)}</td>
                      <td className="text-right px-3 py-2 tabular-nums">{formatCents(r.claimedCents)}</td>
                      <td className="text-right px-4 py-2 tabular-nums">{formatCents(r.closingCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-4 py-4 border-t border-stone-200">
            {row ? (
              <CcaClaimForm
                key={year}
                action={saveCcaClaimAction}
                year={year}
                ccaClass={ccaClass.id}
                claimed={row.claimedCents > 0 ? centsToInput(row.claimedCents) : ''}
                suggested={centsToInput(row.maxCents)}
              />
            ) : (
              <p className="text-sm text-stone-500">Nothing was in this class by {year}, so there is nothing to claim.</p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
