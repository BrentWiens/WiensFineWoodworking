'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import type { ActionResult } from '@/lib/actionResult';
import { capitalClasses, createCapitalAsset, deleteCapitalAsset, saveCcaClaim } from '@/lib/accounting/data';
import { parseCapitalAsset, parseCcaClaim } from '@/lib/accounting/validation';
import { formatCents } from '@/lib/money';
import { formToObject } from '@/lib/validation';

/**
 * Server Actions for the year-end accounting pages. Authorization happens inside
 * lib/accounting/data — every data function verifies the session — so these only
 * validate and route.
 */

const BASE = '/tools/business/accounting';
const SAVE_FAILED: ActionResult = { ok: false, message: 'Could not save. Check your connection and try again.' };

function refreshAccounting() {
  revalidatePath(BASE, 'layout');
}

/** Runs a write, turning unexpected failures into a message while letting redirects through. */
async function attempt(write: () => Promise<void>): Promise<ActionResult | null> {
  try {
    await write();
    return null;
  } catch (error) {
    unstable_rethrow(error);
    console.error('Accounting save failed:', error);
    return SAVE_FAILED;
  }
}

export async function createCapitalAssetAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseCapitalAsset(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };

  const failed = await attempt(() => createCapitalAsset(parsed.data));
  if (failed) return failed;

  refreshAccounting();
  return { ok: true, message: `Added ${parsed.data.name}` };
}

export async function deleteCapitalAssetAction(id: number): Promise<void> {
  const assetId = Number(id);
  if (!Number.isInteger(assetId) || assetId <= 0) return;
  await deleteCapitalAsset(assetId);
  refreshAccounting();
}

export async function saveCcaClaimAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseCcaClaim(formToObject(formData));
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const { year, ccaClass, claimedCents } = parsed.data;

  let tooMuch: ActionResult | null = null;
  const failed = await attempt(async () => {
    // The claim can't be more than what is left in the class that year
    const pool = (await capitalClasses(year)).find(c => c.id === ccaClass)?.schedule.find(row => row.year === year);
    const availableCents = pool ? pool.openingCents + pool.additionsCents : 0;
    if (claimedCents > availableCents) {
      tooMuch = {
        ok: false,
        errors: { claimed: [`Only ${formatCents(availableCents)} is left in this class for ${year}`] },
      };
      return;
    }
    await saveCcaClaim(parsed.data);
  });
  if (failed) return failed;
  if (tooMuch) return tooMuch;

  refreshAccounting();
  return { ok: true, message: `Saved: ${formatCents(claimedCents)} claimed for ${year}` };
}
