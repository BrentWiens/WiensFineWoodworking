import Link from 'next/link';
import TripForm from '@/components/business/TripForm';
import YearPicker from '@/components/business/YearPicker';
import { VehicleForm } from '@/components/business/SettingsForms';
import { currentYear, formatShortDate, monthName, parseYearParam, todayIso } from '@/lib/dates';
import { getOdometerYear, getVehicle, listPlaces, listTrips, recentDestinations, tripYears } from '@/lib/mileage/data';
import { formatKm, summarizeYear, type YearSummary } from '@/lib/mileage/summary';
import type { Trip } from '@/lib/db/schema';
import { createTripAction, saveVehicleAction } from './actions';

const BASE = '/tools/business/mileage';

export default async function MileagePage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string | string[] }>;
}) {
  const year = parseYearParam((await searchParams).year);
  const vehicle = await getVehicle();

  if (!vehicle) {
    return (
      <section className="bg-white border border-stone-200 rounded-lg p-5 space-y-3">
        <h2 className="text-lg font-semibold text-stone-800">First, your vehicle</h2>
        <p className="text-stone-600 text-sm">Trips are logged against the vehicle you drive for the business.</p>
        <VehicleForm action={saveVehicleAction} name="" />
      </section>
    );
  }

  const [trips, places, recent, years, odometer] = await Promise.all([
    listTrips(year),
    listPlaces(),
    recentDestinations(),
    tripYears(currentYear()),
    getOdometerYear(year),
  ]);
  const summary = summarizeYear(year, trips, odometer);

  return (
    <div className="space-y-6">
      <YearPicker years={years} selected={year} path={BASE} />

      <dl className="grid grid-cols-3 gap-3">
        <Stat label="Business km" value={formatKm(summary.businessKm)} />
        <Stat label="Trips" value={String(summary.tripCount)} />
        <Stat
          label="Business use"
          value={summary.businessPercent !== null ? `${summary.businessPercent}%` : '—'}
          href={summary.businessPercent === null ? `${BASE}/summary?year=${year}` : undefined}
          hint={summary.businessPercent === null ? 'Add odometer' : undefined}
        />
      </dl>

      <section className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5">
        <h2 className="text-lg font-semibold text-stone-800 mb-3">Log a trip</h2>
        <TripForm
          mode="create"
          action={createTripAction}
          places={places}
          suggestions={recent.map(r => r.destination)}
          initial={{
            tripDate: todayIso(),
            origin: 'Shop',
            destination: '',
            purpose: '',
            oneWayKm: '',
            roundTrip: true,
          }}
        />
      </section>

      <TripList trips={trips} year={year} summary={summary} />
    </div>
  );
}

function Stat({ label, value, href, hint }: { label: string; value: string; href?: string; hint?: string }) {
  const body = (
    <>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-xl sm:text-2xl font-bold text-stone-800 tabular-nums">{value}</dd>
      {hint && <dd className="text-xs text-stone-500 underline underline-offset-2">{hint}</dd>}
    </>
  );
  const className = 'block bg-white border border-stone-200 rounded-lg p-3';
  return href ? (
    <Link href={href} className={`${className} hover:bg-stone-100`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

function TripList({ trips, year, summary }: { trips: Trip[]; year: number; summary: YearSummary }) {
  if (trips.length === 0) {
    return <p className="text-stone-500 text-center py-8">No trips logged for {year} yet.</p>;
  }

  // Newest first, grouped by month.
  const groups = new Map<number, Trip[]>();
  for (const trip of trips) {
    const month = Number(trip.tripDate.slice(5, 7));
    groups.set(month, [...(groups.get(month) ?? []), trip]);
  }

  return (
    <section className="space-y-5" aria-label={`Trips in ${year}`}>
      {[...groups].map(([month, monthTrips]) => (
        <div key={month}>
          <h3 className="flex justify-between text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2 px-1">
            <span>
              {monthName(month)} {year}
            </span>
            <span className="tabular-nums">{formatKm(summary.months[month - 1].km)} km</span>
          </h3>
          <ul className="bg-white border border-stone-200 rounded-lg divide-y divide-stone-100">
            {monthTrips.map(trip => (
              <li key={trip.id}>
                <Link
                  href={`${BASE}/${trip.id}`}
                  className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-stone-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-stone-800 truncate">{trip.destination}</p>
                    <p className="text-sm text-stone-500 truncate">
                      {formatShortDate(trip.tripDate)} · {trip.purpose}
                    </p>
                  </div>
                  <p className="text-right shrink-0">
                    <span className="font-semibold text-stone-800 tabular-nums">{formatKm(trip.distanceKm)}</span>
                    <span className="block text-xs text-stone-500">{trip.roundTrip ? 'round trip' : 'one way'}</span>
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
