import { z } from 'zod';
import { todayIso } from '../dates';
import { blankToUndefined, entryDate, parse, projectNumberField, text, type ParseResult } from '../validation';

/** Rounds to one decimal, the precision distances are stored at. */
export function roundKm(km: number): number {
  return Math.round(km * 10) / 10;
}

const km = (label: string) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .refine(Number.isFinite, `${label} must be a number`)
    .refine(n => n > 0, `${label} must be more than 0`)
    .refine(n => n <= 2500, `${label} looks too large`);

const odometer = z.preprocess(
  blankToUndefined,
  z.coerce
    .number({ error: 'Must be a whole number of km' })
    .int('Must be a whole number of km')
    .min(0, 'Must be 0 or more')
    .max(9_999_999, 'Too large')
    .optional(),
);

// ---------------------------------------------------------------------------

export interface TripInput {
  tripDate: string;
  origin: string;
  destination: string;
  purpose: string;
  /** Total distance driven: one-way × 2 for a round trip. */
  distanceKm: number;
  roundTrip: boolean;
  /** The project the trip was for, or null when it isn't tied to one. */
  projectNumber: string | null;
}

const tripSchema = (today: string) =>
  z
    .object({
      tripDate: entryDate(today),
      origin: text('Start', 200),
      destination: text('Destination', 200),
      purpose: text('Business purpose', 500),
      oneWayKm: km('Distance'),
      roundTrip: z.preprocess(v => v === 'on' || v === 'true' || v === true, z.boolean()),
      projectNumber: projectNumberField,
    })
    .transform(({ oneWayKm, roundTrip, projectNumber, ...rest }): TripInput => ({
      ...rest,
      roundTrip,
      distanceKm: roundKm(oneWayKm * (roundTrip ? 2 : 1)),
      projectNumber: projectNumber ?? null,
    }));

export function parseTrip(input: Record<string, unknown>, now: Date = new Date()): ParseResult<TripInput> {
  return parse(tripSchema(todayIso(now)), input);
}

/** The distance to show in the form's one-way field when editing a stored trip. */
export function oneWayKmFor(trip: { distanceKm: number; roundTrip: boolean }): number {
  return roundKm(trip.roundTrip ? trip.distanceKm / 2 : trip.distanceKm);
}

// ---------------------------------------------------------------------------

export interface PlaceInput {
  name: string;
  oneWayKm: number | null;
}

const placeSchema = z
  .object({
    name: text('Name', 200),
    oneWayKm: z.preprocess(blankToUndefined, km('Distance').optional()),
  })
  .transform(({ name, oneWayKm }): PlaceInput => ({
    name,
    oneWayKm: oneWayKm === undefined ? null : roundKm(oneWayKm),
  }));

export function parsePlace(input: Record<string, unknown>): ParseResult<PlaceInput> {
  return parse(placeSchema, input);
}

// ---------------------------------------------------------------------------

export interface OdometerInput {
  year: number;
  startKm: number | null;
  endKm: number | null;
}

const odometerSchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100),
    startKm: odometer,
    endKm: odometer,
  })
  .refine(v => v.startKm === undefined || v.endKm === undefined || v.endKm >= v.startKm, {
    message: 'End reading must be at least the start reading',
    path: ['endKm'],
  })
  .transform(({ year, startKm, endKm }): OdometerInput => ({
    year,
    startKm: startKm ?? null,
    endKm: endKm ?? null,
  }));

export function parseOdometer(input: Record<string, unknown>): ParseResult<OdometerInput> {
  return parse(odometerSchema, input);
}

// ---------------------------------------------------------------------------

const vehicleSchema = z.object({ name: text('Vehicle name', 100) });

export function parseVehicle(input: Record<string, unknown>): ParseResult<{ name: string }> {
  return parse(vehicleSchema, input);
}
