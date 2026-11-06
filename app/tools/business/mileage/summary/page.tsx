import Link from 'next/link';
import { OdometerForm } from '@/components/business/SettingsForms';
import { currentYear, monthName, parseYearParam } from '@/lib/dates';
import { getOdometerYear, getVehicle, listTrips, suggestedStartKm, tripYears } from '@/lib/mileage/data';
import { formatKm, summarizeYear } from '@/lib/mileage/summary';
import { saveOdometerAction } from '../actions';

const BASE = '/tools/business/mileage';

export default async function MileageSummaryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);
  const vehicle = await getVehicle();
  if (!vehicle) {
    return (
      <p className="text-stone-600">
        <Link href={BASE} className="underline">Set up your vehicle</Link> first.
      </p>
    );
  }

  const [trips, odometer, suggestion, years] = await Promise.all([
    listTrips(year),
    getOdometerYear(year),
    suggestedStartKm(year),
    tripYears(currentYear()),
  ]);
  const summary = summarizeYear(year, trips, odometer);

  return (
    <div className="space-y-6">
      {years.length > 1 && (
        <nav aria-label="Year" className="flex flex-wrap gap-2">
          {years.map(y => (
            <Link
              key={y}
              href={`${BASE}/summary?year=${y}`}
              aria-current={y === year ? 'page' : undefined}
              className={`px-3 py-1 rounded-full text-sm border ${
                y === year ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              {y}
            </Link>
          ))}
        </nav>
      )}

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-1">
          {year} · {vehicle.name}
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Business use = business km ÷ total km driven. Apply it to the year&apos;s vehicle expenses.
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Figure label="Business km" value={formatKm(summary.businessKm)} />
          <Figure label="Total km driven" value={summary.totalKm !== null ? summary.totalKm.toLocaleString('en-CA') : '—'} />
          <Figure label="Business use" value={summary.businessPercent !== null ? `${summary.businessPercent}%` : '—'} />
          <Figure label="Trips" value={String(summary.tripCount)} />
        </dl>

        {summary.warnings.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {summary.warnings.map(w => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        )}

        <a
          href={`${BASE}/export?year=${year}`}
          className="mt-4 inline-flex items-center justify-center border border-stone-300 bg-white text-stone-800 px-4 py-2 rounded-lg font-medium hover:bg-stone-100 transition-colors"
        >
          Download {year} logbook (CSV)
        </a>
      </section>

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-1">Odometer readings</h2>
        <p className="text-sm text-stone-500 mb-3">
          Record the odometer on (or near) Jan 1 and Dec 31. The CRA expects both in your logbook.
        </p>
        <OdometerForm
          key={`${year}-${odometer?.updatedAt.getTime() ?? 0}`}
          action={saveOdometerAction}
          year={year}
          startKm={odometer?.startKm ?? null}
          endKm={odometer?.endKm ?? null}
          suggestedStartKm={suggestion}
        />
      </section>

      <section className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <caption className="sr-only">Business km by month, {year}</caption>
          <thead className="bg-stone-100 text-stone-600">
            <tr>
              <th scope="col" className="text-left font-medium px-4 py-2">Month</th>
              <th scope="col" className="text-right font-medium px-4 py-2">Trips</th>
              <th scope="col" className="text-right font-medium px-4 py-2">Business km</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {summary.months.map(m => (
              <tr key={m.month} className={m.trips === 0 ? 'text-stone-400' : 'text-stone-800'}>
                <th scope="row" className="text-left font-normal px-4 py-2">{monthName(m.month)}</th>
                <td className="text-right px-4 py-2 tabular-nums">{m.trips}</td>
                <td className="text-right px-4 py-2 tabular-nums">{formatKm(m.km)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-stone-200 font-semibold text-stone-800">
            <tr>
              <th scope="row" className="text-left px-4 py-2">Total</th>
              <td className="text-right px-4 py-2 tabular-nums">{summary.tripCount}</td>
              <td className="text-right px-4 py-2 tabular-nums">{formatKm(summary.businessKm)}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
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
