/**
 * Database schema for the private business tools (/tools/business).
 *
 * Conventions every table follows, so the tools added later fit alongside:
 * - Calendar dates are Postgres `date` columns read as 'YYYY-MM-DD' strings. A trip
 *   or receipt happens on a day, not an instant, and strings can't drift a day when
 *   a timezone is applied to them.
 * - Distances are km with one decimal. Money is integer cents.
 * - Every row records when it was created and last changed — this is evidence for
 *   the CRA, so "when did this get entered" is worth having.
 *
 * Changing this file? Run `npm run db:generate` to write a migration, then
 * `npm run db:migrate` to apply it.
 */
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/**
 * Shared by mileage and (later) vehicle expenses. Only one vehicle today, but the
 * business-use percentage is per vehicle, so it needs to be a row of its own.
 */
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
  ...timestamps,
});

/**
 * The CRA wants the odometer at the start and end of the fiscal period (calendar
 * year for a sole proprietor). Total km driven that year is what the business km
 * are divided by to get the business-use percentage.
 */
export const odometerYears = pgTable(
  'odometer_years',
  {
    id: serial('id').primaryKey(),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    year: integer('year').notNull(),
    startKm: integer('start_km'),
    endKm: integer('end_km'),
    ...timestamps,
  },
  t => [
    uniqueIndex('odometer_years_vehicle_year').on(t.vehicleId, t.year),
    check('odometer_years_end_after_start', sql`${t.endKm} IS NULL OR ${t.startKm} IS NULL OR ${t.endKm} >= ${t.startKm}`),
  ],
);

/** Frequent destinations (lumber yard, client sites) so a trip is a couple of taps. */
export const places = pgTable(
  'places',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    /** One-way distance from the shop, used to prefill the trip form. */
    oneWayKm: numeric('one_way_km', { precision: 7, scale: 1, mode: 'number' }),
    ...timestamps,
  },
  t => [uniqueIndex('places_name').on(t.name)],
);

export const trips = pgTable(
  'trips',
  {
    id: serial('id').primaryKey(),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'restrict' }),
    tripDate: date('trip_date', { mode: 'string' }).notNull(),
    origin: text('origin').notNull(),
    destination: text('destination').notNull(),
    purpose: text('purpose').notNull(),
    /** Total distance driven for the trip — already doubled when it was a round trip. */
    distanceKm: numeric('distance_km', { precision: 7, scale: 1, mode: 'number' }).notNull(),
    roundTrip: boolean('round_trip').notNull().default(true),
    ...timestamps,
  },
  t => [
    index('trips_trip_date').on(t.tripDate),
    check('trips_distance_positive', sql`${t.distanceKm} > 0`),
  ],
);

/**
 * One receipt (or one line of a receipt, when it covers more than one category).
 * Categories are ids from lib/expenses/categories.ts, kept as text so adding one
 * doesn't need a migration.
 */
export const expenses = pgTable(
  'expenses',
  {
    id: serial('id').primaryKey(),
    expenseDate: date('expense_date', { mode: 'string' }).notNull(),
    vendor: text('vendor').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    /** What was paid, tax included. */
    totalCents: integer('total_cents').notNull(),
    /** The HST within the total, for input tax credits. */
    hstCents: integer('hst_cents').notNull().default(0),
    /** Set for vehicle categories, so the claim can apply that vehicle's business-use %. */
    vehicleId: integer('vehicle_id').references(() => vehicles.id, { onDelete: 'restrict' }),
    notes: text('notes'),
    ...timestamps,
  },
  t => [
    index('expenses_expense_date').on(t.expenseDate),
    check('expenses_total_positive', sql`${t.totalCents} > 0`),
    check('expenses_hst_within_total', sql`${t.hstCents} >= 0 AND ${t.hstCents} <= ${t.totalCents}`),
  ],
);

export type Trip = typeof trips.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Place = typeof places.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type OdometerYear = typeof odometerYears.$inferSelect;
