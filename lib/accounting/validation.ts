import { z } from 'zod';
import { todayIso } from '../dates';
import { blankToUndefined, entryDate, money, parse, text, type ParseResult } from '../validation';
import { isCcaClass } from './cca';

const ccaClass = z.string({ error: 'Choose a class' }).refine(isCcaClass, 'Choose a class');

export interface CapitalAssetInput {
  name: string;
  ccaClass: string;
  acquiredDate: string;
  costCents: number;
  notes: string | null;
}

const assetSchema = (today: string) =>
  z
    .object({
      name: text('Name', 200),
      ccaClass,
      acquiredDate: entryDate(today),
      cost: money('Cost')
        .refine(c => c > 0, 'Cost must be more than 0')
        .refine(c => c <= 100_000_000, 'Cost looks too large'),
      notes: z.preprocess(blankToUndefined, z.string().trim().max(500, 'Notes are too long').optional()),
    })
    .transform(({ cost, notes, ...rest }): CapitalAssetInput => ({ ...rest, costCents: cost, notes: notes ?? null }));

export function parseCapitalAsset(input: Record<string, unknown>, now: Date = new Date()): ParseResult<CapitalAssetInput> {
  return parse(assetSchema(todayIso(now)), input);
}

export interface CcaClaimInput {
  year: number;
  ccaClass: string;
  claimedCents: number;
}

const claimSchema = z
  .object({
    year: z.coerce.number().int().min(2000).max(2100),
    ccaClass,
    // Blank clears the claim
    claimed: z.preprocess(blankToUndefined, money('Amount').optional()),
  })
  .transform(({ claimed, ...rest }): CcaClaimInput => ({ ...rest, claimedCents: claimed ?? 0 }));

export function parseCcaClaim(input: Record<string, unknown>): ParseResult<CcaClaimInput> {
  return parse(claimSchema, input);
}
