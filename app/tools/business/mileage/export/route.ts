import type { NextRequest } from 'next/server';
import { parseYearParam } from '@/lib/dates';
import { mileageCsv } from '@/lib/mileage/csv';
import { getOdometerYear, getVehicle, listTripsChronological } from '@/lib/mileage/data';
import { summarizeYear } from '@/lib/mileage/summary';

/** The year's logbook as CSV. The data functions verify the session. */
export async function GET(request: NextRequest) {
  const year = parseYearParam(request.nextUrl.searchParams.get('year') ?? undefined);

  const [vehicle, trips, odometer] = await Promise.all([
    getVehicle(),
    listTripsChronological(year),
    getOdometerYear(year),
  ]);

  const csv = mileageCsv(vehicle?.name ?? 'Vehicle', trips, summarizeYear(year, trips, odometer));

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mileage-log-${year}.csv"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
