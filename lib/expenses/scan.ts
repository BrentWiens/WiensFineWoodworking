import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { verifySession } from '@/lib/auth/dal';
import type { StoredReceipt } from './receiptFiles';
import { scanRequest } from './scanRequest';
import type { ReceiptScan } from './scanResult';

/**
 * Reads a receipt photo or PDF with Claude, to fill in the expense form. The receipt
 * goes to Anthropic's API; nothing is saved from the result until the person checks
 * the form and saves it. The request itself is built in ./scanRequest.
 */

let client: Anthropic | undefined;

/** Whether an Anthropic API key is set. Without one, receipts are stored but not read. */
export function receiptScanningConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Reads a stored receipt. Returns null when Claude declined it; throws when the API
 * couldn't be reached or answered with an error.
 */
export async function scanReceipt(receipt: StoredReceipt): Promise<ReceiptScan | null> {
  await verifySession();
  client ??= new Anthropic();

  const response = await client.beta.messages.parse(scanRequest(receipt.type, receipt.bytes.toString('base64')));

  if (response.stop_reason === 'refusal') {
    console.warn('Receipt scan declined:', response.stop_details);
    return null;
  }
  return response.parsed_output ?? null;
}
