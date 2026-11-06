/**
 * Year-end mileage numbers for the CRA vehicle-expense claim.
 *
 * A sole proprietor claims the business-use share of actual vehicle costs, and that
 * share is business km ÷ total km driven in the year. Total km comes from the
 * odometer readings at the start and end of the year.
 */

export interface SummaryTrip {
  tripDate: string;
  distanceKm: number;
}

export interface OdometerReadings {
  startKm: number | null;
  endKm: number | null;
}

export interface MonthTotal {
  month: number;
  km: number;
  trips: number;
}

export interface YearSummary {
  year: number;
  tripCount: number;
  businessKm: number;
  startKm: number | null;
  endKm: number | null;
  /** Null until both odometer readings are in. */
  totalKm: number | null;
  /** 0–100, one decimal. Null when total km is unknown or zero. */
  businessPercent: number | null;
  months: MonthTotal[];
  warnings: string[];
}

/** Sums in tenths of a km as integers, so 0.1 + 0.2 lands on 0.3. */
const toTenths = (km: number) => Math.round(km * 10);
const fromTenths = (tenths: number) => tenths / 10;

export function summarizeYear(
  year: number,
  trips: SummaryTrip[],
  odometer: OdometerReadings | null,
): YearSummary {
  const prefix = `${year}-`;
  const monthTenths = Array.from({ length: 12 }, () => ({ tenths: 0, trips: 0 }));
  let totalTenths = 0;
  let tripCount = 0;

  for (const trip of trips) {
    if (!trip.tripDate.startsWith(prefix)) continue;
    const month = Number(trip.tripDate.slice(5, 7));
    const tenths = toTenths(trip.distanceKm);
    monthTenths[month - 1].tenths += tenths;
    monthTenths[month - 1].trips += 1;
    totalTenths += tenths;
    tripCount += 1;
  }

  const startKm = odometer?.startKm ?? null;
  const endKm = odometer?.endKm ?? null;
  const totalKm = startKm !== null && endKm !== null && endKm >= startKm ? endKm - startKm : null;
  const businessKm = fromTenths(totalTenths);

  const businessPercent =
    totalKm !== null && totalKm > 0 ? Math.round((businessKm / totalKm) * 1000) / 10 : null;

  const warnings: string[] = [];
  if (startKm === null) warnings.push(`Add the odometer reading from the start of ${year}.`);
  if (endKm === null) warnings.push(`Add the odometer reading from the end of ${year}.`);
  if (businessPercent !== null && businessPercent > 100) {
    warnings.push('Business km are more than the total km driven — check the odometer readings and trips.');
  }

  return {
    year,
    tripCount,
    businessKm,
    startKm,
    endKm,
    totalKm,
    businessPercent,
    months: monthTenths.map((m, i) => ({ month: i + 1, km: fromTenths(m.tenths), trips: m.trips })),
    warnings,
  };
}

/** "1,234.5" — always one decimal, Canadian grouping. */
export function formatKm(km: number): string {
  return km.toLocaleString('en-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
