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
    /** The project the trip was for (projects.number), or null when it isn't tied to one. */
    projectNumber: text('project_number'),
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
    /**
     * The project this was bought for (projects.number), to total what each project
     * cost. Null means it isn't tied to a project.
     */
    projectNumber: text('project_number'),
    ...timestamps,
  },
  t => [
    index('expenses_expense_date').on(t.expenseDate),
    check('expenses_total_positive', sql`${t.totalCents} > 0`),
    check('expenses_hst_within_total', sql`${t.hstCents} >= 0 AND ${t.hstCents} <= ${t.totalCents}`),
  ],
);

/**
 * A piece of work for a client: what its expenses, trips and income are gathered under.
 *
 * Expenses and trips point at a project by its number, as text, rather than by id.
 * The number is what gets written on the quote and the invoice, and expenses carried
 * numbers before this table existed. Renaming a project's number rewrites them (see
 * lib/projectTracking/data.ts). Income only ever exists inside a project, so it
 * links by id.
 */
export const projects = pgTable(
  'projects',
  {
    id: serial('id').primaryKey(),
    number: text('number').notNull(),
    name: text('name').notNull(),
    client: text('client'),
    /** 'active' or 'complete' (lib/projectTracking/validation.ts). */
    status: text('status').notNull().default('active'),
    notes: text('notes'),
    ...timestamps,
  },
  t => [uniqueIndex('projects_number').on(t.number)],
);

/** A payment received for a project: a deposit, a progress payment, the balance. */
export const projectIncome = pgTable(
  'project_income',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'restrict' }),
    incomeDate: date('income_date', { mode: 'string' }).notNull(),
    description: text('description').notNull(),
    /** What was received, tax included. */
    totalCents: integer('total_cents').notNull(),
    /** The HST within the total, owed to the CRA once registered. */
    hstCents: integer('hst_cents').notNull().default(0),
    ...timestamps,
  },
  t => [
    index('project_income_project').on(t.projectId),
    check('project_income_total_positive', sql`${t.totalCents} > 0`),
    check('project_income_hst_within_total', sql`${t.hstCents} >= 0 AND ${t.hstCents} <= ${t.totalCents}`),
  ],
);

/**
 * Something written off over several years that was not bought through the expense
 * log: the vehicle, or a machine owned before the business started. Tools of $500+
 * entered as expenses (category 'equipment') are capital assets without a row here.
 */
export const capitalAssets = pgTable(
  'capital_assets',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    /** CCA class id from lib/accounting/cca.ts: '8' tools, '10' vehicle. */
    ccaClass: text('cca_class').notNull(),
    acquiredDate: date('acquired_date', { mode: 'string' }).notNull(),
    /** What it cost, or what it was worth when it started being used for the business. */
    costCents: integer('cost_cents').notNull(),
    notes: text('notes'),
    ...timestamps,
  },
  t => [check('capital_assets_cost_positive', sql`${t.costCents} > 0`)],
);

/** The capital cost allowance claimed for one class in one year. The owner picks the amount. */
export const ccaClaims = pgTable(
  'cca_claims',
  {
    id: serial('id').primaryKey(),
    year: integer('year').notNull(),
    ccaClass: text('cca_class').notNull(),
    claimedCents: integer('claimed_cents').notNull(),
    ...timestamps,
  },
  t => [
    uniqueIndex('cca_claims_year_class').on(t.year, t.ccaClass),
    check('cca_claims_not_negative', sql`${t.claimedCents} >= 0`),
  ],
);

export type CapitalAsset = typeof capitalAssets.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectIncome = typeof projectIncome.$inferSelect;
export type Trip =typeof trips.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Place = typeof places.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type OdometerYear = typeof odometerYears.$inferSelect;
