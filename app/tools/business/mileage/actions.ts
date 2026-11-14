'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import {
  createPlace,
  createTrip,
  deletePlace,
  deleteTrip,
  getTrip,
  saveOdometerYear,
  saveVehicle,
  updatePlace,
  updateTrip,
  type UpdatePlaceResult,
} from '@/lib/mileage/data';
import { parseOdometer, parsePlace, parseTrip, parseVehicle } from '@/lib/mileage/validation';
import { formToObject } from '@/lib/validation';

/**
 * Server Actions for the mileage log. Authorization happens inside lib/mileage/data
 * — every data function verifies the session — so these only validate and route.
 */

const BASE = '/tools/business/mileage';
const SAVE_FAILED: ActionResult = { ok: false, message: 'Could not save. Check your connection and try again.' };

function refreshMileage() {
  revalidatePath(BASE, 'layout');
}

/** Runs a write, turning unexpected failures into a message while letting redirects through. */
async function attempt(write: () => Promise<void>): Promise<ActionResult | null> {
  try {
    await write();
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('Mileage save failed:', error);
    return SAVE_FAILED;
  }
}

function parseId(id: unknown): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function createTripAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseTrip(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => createTrip(parsed.data));
  if (failed) return failed;

  refreshMileage();
  return { ok: true, message: `Saved: ${parsed.data.destination}, ${parsed.data.distanceKm} km` };
}

export async function updateTripAction(id: number, formData: FormData): Promise<ActionResult> {
  const tripId = parseId(id);
  if (!tripId) return { ok: false, message: 'Unknown trip.' };

  const parsed = parseTrip(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => updateTrip(tripId, parsed.data));
  if (failed) return failed;

  refreshMileage();
  redirect(`${BASE}?year=${parsed.data.tripDate.slice(0, 4)}`);
}

export async function deleteTripAction(id: number): Promise<void> {
  const tripId = parseId(id);
  if (!tripId) return;
  const trip = await getTrip(tripId);
  await deleteTrip(tripId);
  refreshMileage();
  redirect(trip ? `${BASE}?year=${trip.tripDate.slice(0, 4)}` : BASE);
}

export async function createPlaceAction(formData: FormData): Promise<ActionResult> {
  const parsed = parsePlace(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let created = false;
  const failed = await attempt(async () => {
    created = await createPlace(parsed.data);
  });
  if (failed) return failed;
  if (!created) return { ok: false, errors: { name: ['You already have a place with that name'] } };

  refreshMileage();
  return { ok: true, message: `Added ${parsed.data.name}` };
}

export async function updatePlaceAction(id: number, formData: FormData): Promise<ActionResult> {
  const placeId = parseId(id);
  if (!placeId) return { ok: false, message: 'Unknown place.' };

  const parsed = parsePlace(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  let updated: UpdatePlaceResult | undefined;
  const failed = await attempt(async () => {
    updated = await updatePlace(placeId, parsed.data);
  });
  if (failed || !updated) return failed ?? SAVE_FAILED;
  if (!updated.ok) {
    return updated.reason === 'duplicate'
      ? { ok: false, errors: { name: ['You already have a place with that name'] } }
      : { ok: false, message: 'Unknown place.' };
  }

  refreshMileage();
  return { ok: true, message: `Saved ${parsed.data.name}` };
}

export async function deletePlaceAction(id: number): Promise<void> {
  const placeId = parseId(id);
  if (!placeId) return;
  await deletePlace(placeId);
  refreshMileage();
}

export async function saveVehicleAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseVehicle(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => saveVehicle(parsed.data.name));
  if (failed) return failed;

  refreshMileage();
  return { ok: true, message: 'Vehicle saved' };
}

export async function saveOdometerAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseOdometer(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => saveOdometerYear(parsed.data));
  if (failed) return failed;

  refreshMileage();
  return { ok: true, message: 'Odometer readings saved' };
}
