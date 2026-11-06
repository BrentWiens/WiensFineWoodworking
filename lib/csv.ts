/**
 * RFC 4180 CSV, shared by every admin export.
 *
 * Cells starting with = + - @ (or a tab/CR) get a leading apostrophe: spreadsheet
 * apps would otherwise run them as formulas ("CSV injection"). Numbers are passed
 * as numbers and left alone, so negatives in future money columns still work.
 */
export type CsvCell = string | number | boolean | null | undefined;

function escapeCell(cell: CsvCell): string {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'number') return Number.isFinite(cell) ? String(cell) : '';
  if (typeof cell === 'boolean') return cell ? 'Yes' : 'No';

  let value = cell;
  if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(rows: CsvCell[][]): string {
  // CRLF per RFC 4180; the BOM makes Excel read the file as UTF-8 (accents, en dashes).
  return '﻿' + rows.map(row => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}
