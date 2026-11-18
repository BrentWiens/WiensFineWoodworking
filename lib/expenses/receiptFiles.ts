import 'server-only';
import { randomUUID } from 'node:crypto';
import { del, get, put } from '@vercel/blob';
import { verifySession } from '@/lib/auth/dal';
import { RECEIPT_FILE_TYPES, isReceiptPath, type ReceiptFileType } from './receiptPath';

/**
 * Receipt photos and PDFs, kept in a private Vercel Blob store: no file has a public
 * URL, and they're only ever served through an authenticated route
 * (app/tools/business/expenses/receipt/route.ts). Like the other data modules, every
 * function verifies the session first.
 *
 * On Vercel the SDK authenticates with the project's OIDC token once the store is
 * connected; locally it needs BLOB_READ_WRITE_TOKEN in .env.local.
 */

/** Largest file accepted. Photos are shrunk on the phone first, so this is for PDFs. */
export const MAX_RECEIPT_BYTES = 4 * 1024 * 1024;

/** Whether a Blob store is connected. Without one, the receipt photo field is hidden. */
export function receiptStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export type StoredReceipt = { path: string; type: ReceiptFileType; bytes: Buffer };

/**
 * Stores an uploaded receipt under receipts/<year>/<random id>.<ext>. Returns the
 * file's contents too, so it can be read without fetching it back.
 */
export async function storeReceiptFile(file: File, year: string): Promise<StoredReceipt> {
  await verifySession();
  const type = RECEIPT_FILE_TYPES.find(t => t.mime === file.type);
  if (!type) throw new Error(`Unsupported receipt type: ${file.type}`);
  if (file.size > MAX_RECEIPT_BYTES) throw new Error('Receipt file too large');

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `receipts/${year}/${randomUUID()}.${type.ext}`;
  await put(path, bytes, { access: 'private', contentType: type.mime, addRandomSuffix: false });
  return { path, type, bytes };
}

/** A stored receipt's contents, for the authenticated route that shows it. Null if missing. */
export async function readReceiptFile(path: string) {
  await verifySession();
  if (!isReceiptPath(path)) return null;
  const result = await get(path, { access: 'private' });
  return result?.statusCode === 200 ? result : null;
}

/**
 * Deletes stored receipts. A failure is logged, not thrown: the expense change it
 * follows has already been saved, and a stray file costs next to nothing.
 */
export async function deleteReceiptFiles(paths: (string | null)[]): Promise<void> {
  await verifySession();
  const valid = [...new Set(paths.filter((p): p is string => p !== null && isReceiptPath(p)))];
  if (valid.length === 0) return;
  try {
    await del(valid);
  } catch (error) {
    console.error('Receipt file delete failed:', valid, error);
  }
}
