import { type NextRequest, NextResponse } from 'next/server';
import { readReceiptFile } from '@/lib/expenses/receiptFiles';

/**
 * Serves a stored receipt photo or PDF: ?path=receipts/<year>/<id>.<ext>. The Blob
 * store is private, so this is the only way to see one, and readReceiptFile checks
 * the session before reading (redirecting to sign-in when there isn't one).
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '';
  const file = await readReceiptFile(path);
  if (!file) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(file.stream, {
    headers: {
      'Content-Type': file.blob.contentType,
      'X-Content-Type-Options': 'nosniff',
      // Receipts are private records: keep them out of every cache
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
    },
  });
}
