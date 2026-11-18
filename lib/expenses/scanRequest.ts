import type Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { CATEGORIES, SECTIONS } from './categories';
import type { ReceiptFileType } from './receiptPath';
import { receiptScanSchema } from './scanResult';

/**
 * The request that asks Claude to read a receipt, kept apart from the API call
 * (lib/expenses/scan.ts) so it can be built and tried outside the app.
 */

export const SCAN_MODEL = 'claude-opus-5-5';

const categoryGuide = SECTIONS.map(
  section =>
    `${section.label}:\n` +
    CATEGORIES.filter(c => c.section === section.id)
      .map(c => `- ${c.id} (${c.label}): ${c.hint}`)
      .join('\n'),
).join('\n\n');

export const SCAN_SYSTEM = `You read receipts for a one-person custom woodworking business in Ontario, Canada (furniture, cabinetry, finish carpentry). The owner photographs each receipt so its details can be filled into an expense log, and checks them before saving.

Read the receipt exactly as printed. Don't guess: leave a field null when it isn't on the receipt or can't be read.

- total: the final amount paid, after discounts, tax included. Include a tip if one was added.
- hst: the sales tax charged (HST, or GST and PST added together). 0 when the receipt shows no tax.
- items: group the receipt's lines by the expense category each belongs to, and give each category's before-tax total. Spread any discounts or deposits over the lines they apply to, so the items add up to the total less the tax. Most receipts are a single category; split only when lines clearly belong to different ones.

Categories:
${categoryGuide}

Pick the category by what the purchase is for in a woodworking shop: lumber, plywood and hardware for client work are materials; sandpaper, glue, blades and bits are shop supplies; a tool under $500 is small tools, $500 or more is tools and equipment. Restaurant and coffee purchases are meals.`;

/** The Messages API request for one receipt file, its contents base64-encoded. */
export function scanRequest(type: ReceiptFileType, base64: string) {
  const file: Anthropic.Beta.BetaContentBlockParam =
    type.kind === 'pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : {
          type: 'image',
          source: { type: 'base64', media_type: type.mime as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 },
        };

  return {
    model: SCAN_MODEL,
    max_tokens: 16000,
    // If the model declines, the API retries on its recommended fallback model.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default' as const,
    output_config: { effort: 'medium' as const, format: betaZodOutputFormat(receiptScanSchema) },
    system: SCAN_SYSTEM,
    messages: [{ role: 'user' as const, content: [file, { type: 'text' as const, text: 'Read this receipt.' }] }],
  };
}
