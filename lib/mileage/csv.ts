import { toCsv, type CsvCell } from '../csv';
import type { YearSummary } from './summary';

export interface CsvTrip {
  tripDate: string;
  origin: string;
  destination: string;
  purpose: string;
  roundTrip: boolean;
  distanceKm: number;
}

/** The year's logbook for the accountant: one row per trip, then the year-end totals. */
export function mileageCsv(vehicleName: string, trips: CsvTrip[], summary: YearSummary): string {
  const rows: CsvCell[][] = [
    ['Date', 'From', 'To', 'Business purpose', 'Round trip', 'Distance (km)'],
    ...trips.map(t => [t.tripDate, t.origin, t.destination, t.purpose, t.roundTrip, t.distanceKm]),
    [],
    ['Summary', `${summary.year} — ${vehicleName}`],
    ['Trips', summary.tripCount],
    ['Business km', summary.businessKm],
    ['Odometer at start of year', summary.startKm],
    ['Odometer at end of year', summary.endKm],
    ['Total km driven', summary.totalKm],
    ['Business use (%)', summary.businessPercent],
  ];
  return toCsv(rows);
}
