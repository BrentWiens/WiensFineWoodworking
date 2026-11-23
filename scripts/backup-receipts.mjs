// Nightly backup (.github/workflows/backup.yml): copies receipt files that aren't in the
// Google Drive backup yet out of the private Blob store, named so they're easy to find
// by browsing or searching Drive:
//   <out>/<year>/2026-11-14 Kitchener Building Supply $330.95 (<id>).jpg
// A receipt no saved expense points to (an upload abandoned before saving) is named
//   <out>/<year>/Not on an expense (<id>).jpg
//
// Usage: node scripts/backup-receipts.mjs <out dir> <file listing what Drive already has>
// Env:   DATABASE_URL, BLOB_READ_WRITE_TOKEN
//
// This runs in a public repo's Actions log: print counts only, never receipt details.
import fs from 'node:fs';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { get, list } from '@vercel/blob';

const [outDir, existingListing] = process.argv.slice(2);
if (!outDir || !existingListing) throw new Error('Usage: backup-receipts.mjs <out dir> <existing listing>');

// Receipts already in Drive, by the id in their name
const existing = fs.existsSync(existingListing) ? fs.readFileSync(existingListing, 'utf8') : '';
const backedUp = new Set(existing.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g) ?? []);

// What each receipt was for, from the expenses that point to it (a split receipt's items add up)
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`
  SELECT receipt_path, min(expense_date)::text AS date, min(vendor) AS vendor, sum(total_cents)::int AS cents
  FROM expenses WHERE receipt_path IS NOT NULL GROUP BY receipt_path`;
const byPath = new Map(rows.map(r => [r.receipt_path, r]));

const safe = text => text.replace(/[\\/:*?"<>|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
const dollars = cents => `$${(cents / 100).toFixed(2)}`;

let cursor;
let copied = 0;
let skipped = 0;
do {
  const page = await list({ prefix: 'receipts/', cursor, limit: 1000 });
  for (const blob of page.blobs) {
    const match = /^receipts\/(\d{4})\/([0-9a-f-]{36})\.(\w+)$/.exec(blob.pathname);
    if (!match) continue;
    const [, storedYear, id, ext] = match;
    if (backedUp.has(id)) {
      skipped += 1;
      continue;
    }
    const expense = byPath.get(blob.pathname);
    // Filed by the expense's year: a photo is stored under the year on the form when it's
    // uploaded, which is still today's date for an old receipt the photo then fills in
    const year = expense?.date.slice(0, 4) ?? storedYear;
    const name = expense
      ? `${expense.date} ${safe(expense.vendor)} ${dollars(expense.cents)} (${id}).${ext}`
      : `Not on an expense (${id}).${ext}`;
    const file = await get(blob.pathname, { access: 'private' });
    if (file?.statusCode !== 200) throw new Error(`Could not read a receipt (${id})`);
    fs.mkdirSync(path.join(outDir, year), { recursive: true });
    fs.writeFileSync(path.join(outDir, year, name), Buffer.from(await new Response(file.stream).arrayBuffer()));
    copied += 1;
  }
  cursor = page.hasMore ? page.cursor : undefined;
} while (cursor);

console.log(`Receipts: ${copied} new, ${skipped} already backed up.`);
