import 'server-only';
import { and, asc, desc, eq, gte, lt, max, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { odometerYears, places, trips, vehicles, type Trip } from '@/lib/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { yearRange } from '@/lib/dates';
import type { OdometerInput, PlaceInput, TripInput } from './validation';

/**
 * Mileage data access. Every exported function verifies the session first — this
 * module, not the page or the proxy, is what keeps the data private.
 */

// --- Vehicle ---------------------------------------------------------------

/** The vehicle trips are logged against: the first active one. */
export async function getVehicle() {
  await verifySession();
  const [vehicle] = await db()
    .select()
    .from(vehicles)
    .where(eq(vehicles.active, true))
    .orderBy(asc(vehicles.id))
    .limit(1);
  return vehicle ?? null;
}

export async function saveVehicle(name: string): Promise<void> {
  const vehicle = await getVehicle();
  if (vehicle) {
    await db().update(vehicles).set({ name }).where(eq(vehicles.id, vehicle.id));
  } else {
    await db().insert(vehicles).values({ name });
  }
}

async function requireVehicle() {
  const vehicle = await getVehicle();
  if (!vehicle) throw new Error('Set up your vehicle before logging trips.');
  return vehicle;
}

// --- Trips -----------------------------------------------------------------

/** A year's trips, newest first. */
export async function listTrips(year: number): Promise<Trip[]> {
  await verifySession();
  const { start, end } = yearRange(year);
  return db()
    .select()
    .from(trips)
    .where(and(gte(trips.tripDate, start), lt(trips.tripDate, end)))
    .orderBy(desc(trips.tripDate), desc(trips.id));
}

/** Same as listTrips but oldest first — the order a logbook is read in. */
export async function listTripsChronological(year: number): Promise<Trip[]> {
  return (await listTrips(year)).reverse();
}

export async function getTrip(id: number): Promise<Trip | null> {
  await verifySession();
  const [trip] = await db().select().from(trips).where(eq(trips.id, id)).limit(1);
  return trip ?? null;
}

export async function createTrip(input: TripInput): Promise<void> {
  const vehicle = await requireVehicle();
  await db().insert(trips).values({ ...input, vehicleId: vehicle.id });
}

export async function updateTrip(id: number, input: TripInput): Promise<void> {
  await verifySession();
  await db().update(trips).set(input).where(eq(trips.id, id));
}

export async function deleteTrip(id: number): Promise<void> {
  await verifySession();
  await db().delete(trips).where(eq(trips.id, id));
}

/** Years that have trips, plus the current one, newest first — for the year picker. */
export async function tripYears(current: number): Promise<number[]> {
  await verifySession();
  const rows = await db()
    .selectDistinct({ year: sql<number>`extract(year from ${trips.tripDate})::int` })
    .from(trips);
  return [...new Set([current, ...rows.map(r => Number(r.year))])].sort((a, b) => b - a);
}

/** Recently used destinations with the last distance driven there, for autocomplete. */
export async function recentDestinations(limit = 25): Promise<{ destination: string; lastDate: string }[]> {
  await verifySession();
  const rows = await db()
    .select({ destination: trips.destination, lastDate: max(trips.tripDate) })
    .from(trips)
    .groupBy(trips.destination)
    .orderBy(desc(max(trips.tripDate)))
    .limit(limit);
  return rows.map(r => ({ destination: r.destination, lastDate: r.lastDate ?? '' }));
}

// --- Places ----------------------------------------------------------------

export async function listPlaces() {
  await verifySession();
  return db().select().from(places).orderBy(asc(places.name));
}

/** Returns false when a place with that name already exists. */
export async function createPlace(input: PlaceInput): Promise<boolean> {
  await verifySession();
  const inserted = await db()
    .insert(places)
    .values(input)
    .onConflictDoNothing({ target: places.name })
    .returning({ id: places.id });
  return inserted.length > 0;
}

export async function deletePlace(id: number): Promise<void> {
  await verifySession();
  await db().delete(places).where(eq(places.id, id));
}

// --- Odometer --------------------------------------------------------------

export async function getOdometerYear(year: number) {
  const vehicle = await getVehicle();
  if (!vehicle) return null;
  const [row] = await db()
    .select()
    .from(odometerYears)
    .where(and(eq(odometerYears.vehicleId, vehicle.id), eq(odometerYears.year, year)))
    .limit(1);
  return row ?? null;
}

/**
 * When `year` has no start reading yet, the previous year's end reading is the
 * natural default — the odometer doesn't move overnight on Dec 31.
 */
export async function suggestedStartKm(year: number): Promise<number | null> {
  const previous = await getOdometerYear(year - 1);
  return previous?.endKm ?? null;
}

export async function saveOdometerYear(input: OdometerInput): Promise<void> {
  const vehicle = await requireVehicle();
  await db()
    .insert(odometerYears)
    .values({ vehicleId: vehicle.id, ...input })
    .onConflictDoUpdate({
      target: [odometerYears.vehicleId, odometerYears.year],
      set: { startKm: input.startKm, endKm: input.endKm, updatedAt: new Date() },
    });
}
