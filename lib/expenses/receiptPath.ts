/**
 * What a stored receipt file can be, and what its path looks like. Shared by the
 * server (storage, validation) and the expense form (what the file picker accepts).
 */

export type ReceiptFileType = { mime: string; ext: string; kind: 'image' | 'pdf' };

/** Photos arrive as JPEG after the phone shrinks them; PNG and WebP pass through as-is. */
export const RECEIPT_FILE_TYPES: ReceiptFileType[] = [
  { mime: 'image/jpeg', ext: 'jpg', kind: 'image' },
  { mime: 'image/png', ext: 'png', kind: 'image' },
  { mime: 'image/webp', ext: 'webp', kind: 'image' },
  { mime: 'application/pdf', ext: 'pdf', kind: 'pdf' },
];

const PATH = /^receipts\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|pdf)$/;

/**
 * Whether a path is one this app stored: receipts/<year>/<uuid>.<ext>. A form posts
 * the path back on save, so it's checked before being trusted.
 */
export function isReceiptPath(path: unknown): path is string {
  return typeof path === 'string' && PATH.test(path);
}

export function isPdfPath(path: string): boolean {
  return path.endsWith('.pdf');
}

/** The authenticated URL a stored receipt is shown from. */
export function receiptUrl(path: string): string {
  return `/tools/business/expenses/receipt?path=${encodeURIComponent(path)}`;
}
