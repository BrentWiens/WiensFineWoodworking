import { describe, expect, it } from 'vitest';
import { scaledSize } from './compressImage';
import { isReceiptPath, receiptUrl } from './receiptPath';
import { blankReceipt } from './receipts';
import { receiptScanSchema, scanToForm, type ReceiptScan } from './scanResult';

const TODAY = '2026-11-18';
const empty = { ...blankReceipt(TODAY), items: [{ category: '', description: '', projectNumber: '24', subtotal: '' }] };

const scan = (overrides: Partial<ReceiptScan> = {}): ReceiptScan => ({
  readable: true,
  date: '2026-11-14',
  vendor: 'Home Depot',
  total: 113,
  hst: 13,
  items: [{ category: 'materials', description: 'Plywood', amount_before_tax: 100 }],
  ...overrides,
});

describe('scanToForm', () => {
  it('fills in a single-category receipt, keeping the chosen project', () => {
    const { values, warnings } = scanToForm(scan(), empty, TODAY);
    expect(values).toMatchObject({ expenseDate: '2026-11-14', vendor: 'Home Depot', total: '113.00', hst: '13.00' });
    expect(values.items).toEqual([{ category: 'materials', description: 'Plywood', projectNumber: '24', subtotal: '' }]);
    expect(warnings).toEqual([]);
  });

  it('splits a receipt by category, with before-tax amounts that add up', () => {
    const { values } = scanToForm(
      scan({
        items: [
          { category: 'small_tools', description: 'Clamps', amount_before_tax: 40 },
          { category: 'materials', description: 'Plywood', amount_before_tax: 60 },
        ],
      }),
      empty,
      TODAY,
    );
    expect(values.items.map(i => [i.category, i.subtotal, i.projectNumber])).toEqual([
      ['small_tools', '40.00', '24'],
      ['materials', '60.00', '24'],
    ]);
  });

  it('puts a few cents of rounding on the largest item', () => {
    const { values, warnings } = scanToForm(
      scan({
        items: [
          { category: 'small_tools', description: 'Clamps', amount_before_tax: 33.33 },
          { category: 'materials', description: 'Plywood', amount_before_tax: 66.66 },
        ],
      }),
      empty,
      TODAY,
    );
    expect(values.items.map(i => i.subtotal)).toEqual(['33.33', '66.67']);
    expect(warnings).toEqual([]);
  });

  it('leaves items that are well off for the person to fix, and says so', () => {
    const { values, warnings } = scanToForm(
      scan({
        items: [
          { category: 'small_tools', description: 'Clamps', amount_before_tax: 40 },
          { category: 'materials', description: 'Plywood', amount_before_tax: 50 },
        ],
      }),
      empty,
      TODAY,
    );
    expect(values.items.map(i => i.subtotal)).toEqual(['40.00', '50.00']);
    expect(warnings[0]).toMatch(/don’t add up/);
  });

  it('merges two entries for the same category', () => {
    const { values } = scanToForm(
      scan({
        items: [
          { category: 'materials', description: 'Plywood', amount_before_tax: 60 },
          { category: 'materials', description: 'Screws', amount_before_tax: 40 },
        ],
      }),
      empty,
      TODAY,
    );
    expect(values.items).toEqual([{ category: 'materials', description: 'Plywood, Screws', projectNumber: '24', subtotal: '' }]);
  });

  it('keeps what was there for anything unreadable or implausible', () => {
    const current = { ...empty, expenseDate: '2026-11-10', vendor: 'Typed in' };
    const { values } = scanToForm(scan({ date: '2027-01-01', vendor: null }), current, TODAY);
    expect(values).toMatchObject({ expenseDate: '2026-11-10', vendor: 'Typed in' });
  });

  it('drops HST that is more than any tax rate could be', () => {
    const { values, warnings } = scanToForm(scan({ total: 100, hst: 40, items: [] }), empty, TODAY);
    expect(values.hst).toBe('');
    expect(warnings[0]).toMatch(/HST/);
  });

  it('changes nothing when the receipt could not be read', () => {
    const { values, warnings } = scanToForm(scan({ readable: false }), empty, TODAY);
    expect(values).toBe(empty);
    expect(warnings[0]).toMatch(/couldn’t be read/);
  });

  it('only accepts known categories from the model', () => {
    expect(receiptScanSchema.safeParse(scan({ items: [{ category: 'snacks', description: 'x', amount_before_tax: 1 }] })).success).toBe(
      false,
    );
  });
});

describe('receipt paths', () => {
  it('accept only paths this app stores', () => {
    expect(isReceiptPath('receipts/2026/0f8fad5b-d9cb-469f-a165-70867728950e.jpg')).toBe(true);
    expect(isReceiptPath('receipts/2026/0f8fad5b-d9cb-469f-a165-70867728950e.pdf')).toBe(true);
    for (const path of ['receipts/2026/../x.jpg', 'other/2026/0f8fad5b-d9cb-469f-a165-70867728950e.jpg', '', null]) {
      expect(isReceiptPath(path), String(path)).toBe(false);
    }
  });

  it('are shown through the signed-in route', () => {
    expect(receiptUrl('receipts/2026/a.jpg')).toBe('/tools/business/expenses/receipt?path=receipts%2F2026%2Fa.jpg');
  });
});

describe('scaledSize', () => {
  it('shrinks a phone photo to 2000 px on its long side, keeping its shape', () => {
    expect(scaledSize(3024, 4032)).toEqual({ width: 1500, height: 2000 });
    expect(scaledSize(4032, 3024)).toEqual({ width: 2000, height: 1500 });
  });

  it('never enlarges a small image', () => {
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
