import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { capitalAssets, ccaClaims, expenses, projectIncome, type CapitalAsset } from '@/lib/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { CCA_CLASSES, ccaSchedule, type CcaClass, type CcaYear } from './cca';
import { purchaseCents } from './rules';
import type { CapitalAssetInput, CcaClaimInput } from './validation';

/**
 * Year-end accounting data access. Every exported function verifies the session
 * first — this module, not the page or the proxy, is what keeps the data private.
 */

/** Every payment received, oldest first. A few hundred rows at most, so no year filter. */
export async function listIncome() {
  await verifySession();
  return db()
    .select({
      incomeDate: projectIncome.incomeDate,
      totalCents: projectIncome.totalCents,
      hstCents: projectIncome.hstCents,
    })
    .from(projectIncome)
    .orderBy(asc(projectIncome.incomeDate));
}

/** One thing in a CCA class: a $500+ tool from the expense log, or an asset added by hand. */
export interface CapitalItem {
  key: string;
  name: string;
  date: string;
  costCents: number;
  notes: string | null;
  /** Set for an expense: it is edited in the expense log. */
  expenseId?: number;
  /** Set for an asset added by hand: it can be removed here. */
  assetId?: number;
}

export interface CapitalClass extends CcaClass {
  items: CapitalItem[];
  /** Year by year through the requested year. Empty when the class has nothing in it yet. */
  schedule: CcaYear[];
}

/** Each CCA class with what's in it and its schedule through `throughYear`. */
export async function capitalClasses(throughYear: number): Promise<CapitalClass[]> {
  await verifySession();
  const [assets, equipment, claims] = await Promise.all([
    db().select().from(capitalAssets),
    db().select().from(expenses).where(eq(expenses.category, 'equipment')),
    db().select().from(ccaClaims),
  ]);

  return CCA_CLASSES.map(ccaClass => {
    const items: CapitalItem[] = [
      ...assets
        .filter(asset => asset.ccaClass === ccaClass.id)
        .map(asset => ({
          key: `asset-${asset.id}`,
          name: asset.name,
          date: asset.acquiredDate,
          costCents: asset.costCents,
          notes: asset.notes,
          assetId: asset.id,
        })),
      // Tools from the expense log all belong to class 8
      ...(ccaClass.id === '8' ? equipment : []).map(expense => ({
        key: `expense-${expense.id}`,
        name: expense.description,
        date: expense.expenseDate,
        costCents: purchaseCents(expense),
        notes: expense.vendor,
        expenseId: expense.id,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date));

    const schedule = ccaSchedule(
      ccaClass.rate,
      items.map(item => ({ year: Number(item.date.slice(0, 4)), cents: item.costCents })),
      claims.filter(claim => claim.ccaClass === ccaClass.id).map(claim => ({ year: claim.year, cents: claim.claimedCents })),
      throughYear,
    );
    return { ...ccaClass, items, schedule };
  });
}

export async function createCapitalAsset(input: CapitalAssetInput): Promise<void> {
  await verifySession();
  await db().insert(capitalAssets).values(input);
}

export async function deleteCapitalAsset(id: number): Promise<CapitalAsset | null> {
  await verifySession();
  const [deleted] = await db().delete(capitalAssets).where(eq(capitalAssets.id, id)).returning();
  return deleted ?? null;
}

/** Sets the CCA claimed for a class in a year, replacing any earlier amount. */
export async function saveCcaClaim(input: CcaClaimInput): Promise<void> {
  await verifySession();
  await db()
    .insert(ccaClaims)
    .values(input)
    .onConflictDoUpdate({
      target: [ccaClaims.year, ccaClaims.ccaClass],
      set: { claimedCents: input.claimedCents, updatedAt: new Date() },
    });
}
