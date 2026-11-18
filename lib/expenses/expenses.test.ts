import { describe, expect, it } from 'vitest';
import { CATEGORIES, SECTIONS, categoryLabel, isCategoryId, isVehicleCategory } from './categories';
import { parseReceipt } from './validation';
import { groupReceipts, receiptFormValues, splitReceipt } from './receipts';
import { summarizeExpenses, type SummaryExpense } from './summary';
import { expensesCsv } from './csv';

const NOW = new Date('2026-11-06T15:00:00Z');

const validExpense = {
  expenseDate: '2026-11-06',
  vendor: 'Lumber yard',
  'category.0': 'materials',
  'description.0': 'Walnut for dining table',
  total: '565.00',
  hst: '65.00',
};

describe('categories', () => {
  it('have unique ids', () => {
    expect(new Set(CATEGORIES.map(c => c.id)).size).toBe(CATEGORIES.length);
  });

  it('each belong to a section and name a T2125 line', () => {
    const sectionIds = new Set(SECTIONS.map(s => s.id));
    for (const c of CATEGORIES) {
      expect(sectionIds.has(c.section), c.id).toBe(true);
      expect(c.line, c.id).toMatch(/^\d{4}$/);
    }
  });

  it('leave no section empty', () => {
    for (const s of SECTIONS) {
      expect(CATEGORIES.some(c => c.section === s.id), s.id).toBe(true);
    }
  });

  it('know which are vehicle expenses', () => {
    expect(isVehicleCategory('vehicle_fuel')).toBe(true);
    expect(isVehicleCategory('materials')).toBe(false);
    expect(isVehicleCategory('nonsense')).toBe(false);
  });

  it('fall back to the raw id for a retired category', () => {
    expect(categoryLabel('materials')).toBe('Materials');
    expect(categoryLabel('old_thing')).toBe('old_thing');
    expect(isCategoryId('old_thing')).toBe(false);
  });
});

describe('parseReceipt', () => {
  it('turns a receipt with one item into one expense for the whole amount', () => {
    expect(parseReceipt(validExpense, NOW)).toEqual({
      ok: true,
      data: [
        {
          expenseDate: '2026-11-06',
          vendor: 'Lumber yard',
          category: 'materials',
          description: 'Walnut for dining table',
          totalCents: 56500,
          hstCents: 6500,
          projectNumber: null,
          receiptPath: null,
        },
      ],
    });
  });

  it('keeps a project number, trimmed, and treats a blank one as no project', () => {
    const tagged = parseReceipt({ ...validExpense, 'projectNumber.0': ' 2026-014 ' }, NOW);
    expect(tagged.ok && tagged.data[0].projectNumber).toBe('2026-014');

    const blank = parseReceipt({ ...validExpense, 'projectNumber.0': '   ' }, NOW);
    expect(blank.ok && blank.data[0].projectNumber).toBeNull();
  });

  it('rejects a project number that is too long', () => {
    const result = parseReceipt({ ...validExpense, 'projectNumber.0': 'x'.repeat(51) }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors['projectNumber.0']).toEqual(['Project number is too long']);
  });

  it('treats a blank HST as none charged', () => {
    const result = parseReceipt({ ...validExpense, hst: '' }, NOW);
    expect(result.ok && result.data[0].hstCents).toBe(0);
  });

  it('accepts a dollar sign and grouping commas', () => {
    const result = parseReceipt({ ...validExpense, total: '$1,130.00', hst: '$130' }, NOW);
    expect(result.ok && [result.data[0].totalCents, result.data[0].hstCents]).toEqual([113000, 13000]);
  });

  it('requires the vendor, category, description and total', () => {
    const result = parseReceipt({ expenseDate: '2026-11-06' }, NOW);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(['category.0', 'description.0', 'total', 'vendor']);
  });

  it.each([
    ['0', 'Total must be more than 0'],
    ['12.345', 'Total must be an amount like 12.34'],
    ['abc', 'Total must be an amount like 12.34'],
  ])('rejects a total of %j', (total, message) => {
    const result = parseReceipt({ ...validExpense, total, hst: '' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.total).toEqual([message]);
  });

  it('rejects an unknown category', () => {
    const result = parseReceipt({ ...validExpense, 'category.0': 'snacks' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors['category.0']).toEqual(['Choose a category']);
  });

  it('rejects HST larger than any Canadian rate allows', () => {
    // 15% HST on $100 is $15 of a $115 total; $16 can't be right.
    expect(parseReceipt({ ...validExpense, total: '115', hst: '15' }, NOW).ok).toBe(true);
    const result = parseReceipt({ ...validExpense, total: '115', hst: '16' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.hst?.[0]).toMatch(/HST is more than/);
  });

  it('rejects dates in the future but allows a day of clock slack', () => {
    expect(parseReceipt({ ...validExpense, expenseDate: '2026-11-07' }, NOW).ok).toBe(true);
    expect(parseReceipt({ ...validExpense, expenseDate: '2026-11-08' }, NOW).ok).toBe(false);
    expect(parseReceipt({ ...validExpense, expenseDate: '2026-02-30' }, NOW).ok).toBe(false);
  });

  // Tools and materials on one receipt: $40 + $60 before tax, $13 HST, $113 total
  const split = {
    expenseDate: '2026-11-06',
    vendor: 'Home Depot',
    total: '113.00',
    hst: '13.00',
    'category.0': 'small_tools',
    'description.0': 'Clamps',
    'subtotal.0': '40',
    'projectNumber.0': '24',
    'category.1': 'materials',
    'description.1': 'Plywood',
    'subtotal.1': '60',
    'projectNumber.1': '',
  };

  it('splits a receipt into an expense per item, sharing the HST by amount', () => {
    const result = parseReceipt(split, NOW);
    expect(result.ok && result.data).toEqual([
      expect.objectContaining({ category: 'small_tools', description: 'Clamps', totalCents: 4520, hstCents: 520, projectNumber: '24' }),
      expect.objectContaining({ category: 'materials', description: 'Plywood', totalCents: 6780, hstCents: 780, projectNumber: null }),
    ]);
  });

  it('needs each item’s amount once split', () => {
    const result = parseReceipt({ ...split, 'subtotal.1': '' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toEqual({ 'subtotal.1': ['Amount is required'] });
  });

  it('says how far off the items are from the receipt', () => {
    const result = parseReceipt({ ...split, 'subtotal.1': '55' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.items?.[0]).toMatch(/add up to \$95\.00 before tax, but the receipt is \$100\.00/);
  });

  it('reports each item’s errors under its own number', () => {
    const result = parseReceipt({ ...split, 'category.1': '', 'description.0': '' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['category.1', 'description.0']);
  });

  it('caps how many items a receipt can be split into', () => {
    const many = Object.fromEntries(Array.from({ length: 11 }, (_, i) => [`category.${i}`, 'materials']));
    const result = parseReceipt({ ...split, ...many }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors)).toEqual(['items']);
  });
});

describe('receipt photo on save', () => {
  const path = 'receipts/2026/0f8fad5b-d9cb-469f-a165-70867728950e.jpg';

  it('keeps an uploaded receipt on every item', () => {
    const result = parseReceipt({ ...validExpense, receiptPath: path }, NOW);
    expect(result.ok && result.data.map(e => e.receiptPath)).toEqual([path]);
  });

  it('refuses a path this app did not store', () => {
    for (const receiptPath of ['receipts/2026/x.jpg', '../secret', 'https://example.com/a.jpg']) {
      const result = parseReceipt({ ...validExpense, receiptPath }, NOW);
      expect(result.ok, receiptPath).toBe(false);
      if (!result.ok) expect(Object.keys(result.errors)).toEqual(['receiptPath']);
    }
  });
});

describe('splitReceipt', () => {
  it('shares the HST in proportion, the items adding up to the receipt to the cent', () => {
    // $10 HST over three equal items can't be 3.33 each; one of them gets the extra cent
    const items = splitReceipt(4000, 1000, [1000, 1000, 1000]);
    expect(items.map(i => i.hstCents)).toEqual([334, 333, 333]);
    expect(items.reduce((sum, i) => sum + i.totalCents, 0)).toBe(4000);
  });

  it('gives no HST to any item when none was charged', () => {
    expect(splitReceipt(5000, 0, [2000, 3000])).toEqual([
      { totalCents: 2000, hstCents: 0 },
      { totalCents: 3000, hstCents: 0 },
    ]);
  });

  it('refuses items that do not add up to the receipt before tax', () => {
    expect(() => splitReceipt(11300, 1300, [4000, 5000])).toThrow();
    expect(() => splitReceipt(11300, 1300, [10000, 0])).toThrow();
  });
});

describe('receipts', () => {
  const line = (id: number, receiptGroup: string | null, totalCents: number, hstCents = 0) => ({
    id,
    expenseDate: '2026-11-06',
    vendor: 'Home Depot',
    description: `Item ${id}`,
    category: 'materials',
    totalCents,
    hstCents,
    projectNumber: null,
    receiptGroup,
    receiptPath: null,
  });

  it('gather the items of a split receipt where the first one sits, in entry order', () => {
    const receipts = groupReceipts([line(9, null, 100), line(8, 'a', 200), line(7, null, 300), line(5, 'a', 400)]);
    expect(receipts.map(r => [r.id, r.lines.map(l => l.id), r.totalCents])).toEqual([
      [9, [9], 100],
      [5, [5, 8], 600],
      [7, [7], 300],
    ]);
  });

  it('turn a saved split receipt back into the form that entered it', () => {
    const values = receiptFormValues([line(5, 'a', 4520, 520), line(8, 'a', 6780, 780)]);
    expect(values).toMatchObject({ total: '113.00', hst: '13.00' });
    expect(values.items.map(i => i.subtotal)).toEqual(['40.00', '60.00']);
  });

  it('leave a one-item receipt without a before-tax amount, as it was entered', () => {
    const values = receiptFormValues([line(3, null, 56500, 6500)]);
    expect(values).toMatchObject({ total: '565.00', hst: '65.00' });
    expect(values.items).toEqual([{ category: 'materials', description: 'Item 3', projectNumber: '', subtotal: '' }]);
  });
});

const sample: SummaryExpense[] = [
  { expenseDate: '2026-01-15', category: 'materials', totalCents: 11300, hstCents: 1300 },
  { expenseDate: '2026-01-20', category: 'materials', totalCents: 5650, hstCents: 650 },
  { expenseDate: '2026-03-02', category: 'vehicle_fuel', totalCents: 8000, hstCents: 920 },
  { expenseDate: '2026-03-09', category: 'office', totalCents: 1500, hstCents: 0 },
  { expenseDate: '2025-12-31', category: 'materials', totalCents: 99999, hstCents: 0 },
];

describe('summarizeExpenses', () => {
  const summary = summarizeExpenses(2026, sample);

  it('totals the year only', () => {
    expect(summary).toMatchObject({ count: 4, totalCents: 26450, hstCents: 2870, netCents: 23580 });
  });

  it('totals by month', () => {
    expect(summary.months[0]).toEqual({ month: 1, count: 2, totalCents: 16950, hstCents: 1950, netCents: 15000 });
    expect(summary.months[1].count).toBe(0);
    expect(summary.months[2].totalCents).toBe(9500);
  });

  it('groups categories into T2125 sections, in form order, skipping empty ones', () => {
    expect(summary.sections.map(s => s.id)).toEqual(['cogs', 'operating', 'vehicle']);
    expect(summary.sections[0]).toMatchObject({ count: 2, totalCents: 16950, netCents: 15000 });
    expect(summary.sections[0].categories).toEqual([
      { id: 'materials', label: 'Materials', line: '8320', count: 2, totalCents: 16950, hstCents: 1950, netCents: 15000 },
    ]);
  });

  it('keeps expenses under a retired category in the totals', () => {
    const withRetired = summarizeExpenses(2026, [
      ...sample,
      { expenseDate: '2026-05-01', category: 'old_thing', totalCents: 100, hstCents: 0 },
    ]);
    expect(withRetired.totalCents).toBe(26550);
    const retired = withRetired.sections.at(-1);
    expect(retired?.id).toBe('retired');
    expect(retired?.categories.map(c => c.id)).toEqual(['old_thing']);
  });

  it('is empty for a year with nothing in it', () => {
    expect(summarizeExpenses(2024, sample)).toMatchObject({ count: 0, totalCents: 0, sections: [], projects: [] });
  });

  it('counts everything as unassigned when no expense has a project', () => {
    expect(summary.projects).toEqual([]);
    expect(summary.unassigned).toEqual({ count: 4, totalCents: 26450, hstCents: 2870, netCents: 23580 });
  });

  it('totals by project, in number order, leaving the rest unassigned', () => {
    const tagged = summarizeExpenses(2026, [
      { expenseDate: '2026-02-01', category: 'materials', totalCents: 11300, hstCents: 1300, projectNumber: '10' },
      { expenseDate: '2026-02-03', category: 'shop_supplies', totalCents: 2260, hstCents: 260, projectNumber: '9' },
      { expenseDate: '2026-02-05', category: 'materials', totalCents: 5650, hstCents: 650, projectNumber: '10' },
      { expenseDate: '2026-02-07', category: 'office', totalCents: 1500, hstCents: 0, projectNumber: null },
      { expenseDate: '2025-06-01', category: 'materials', totalCents: 99999, hstCents: 0, projectNumber: '10' },
    ]);

    expect(tagged.projects).toEqual([
      { projectNumber: '9', count: 1, totalCents: 2260, hstCents: 260, netCents: 2000 },
      { projectNumber: '10', count: 2, totalCents: 16950, hstCents: 1950, netCents: 15000 },
    ]);
    expect(tagged.unassigned).toEqual({ count: 1, totalCents: 1500, hstCents: 0, netCents: 1500 });
  });
});

describe('expensesCsv', () => {
  it('lists each expense, then totals by category', () => {
    const expenses = [
      {
        expenseDate: '2026-01-15',
        vendor: 'Lumber yard',
        description: 'Walnut, "8/4"',
        category: 'materials',
        totalCents: 11300,
        hstCents: 1300,
      },
    ];
    const lines = expensesCsv(expenses, summarizeExpenses(2026, expenses)).replace(/^﻿/, '').split('\r\n');
    expect(lines[0]).toBe('Date,Vendor,Description,Category,T2125 line,Total paid,HST,Net of HST,Project');
    expect(lines[1]).toBe('2026-01-15,Lumber yard,"Walnut, ""8/4""",Materials,8320,113.00,13.00,100.00,');
    expect(lines[2]).toBe('');
    expect(lines[4]).toBe('Materials,Cost of goods sold,8320,1,113.00,13.00,100.00');
    expect(lines[5]).toBe('All expenses,,,1,113.00,13.00,100.00');
    // No project block when nothing is tagged
    expect(lines[6]).toBe('');
    expect(lines).toHaveLength(7);
  });

  it('adds the project to each row and a totals block by project', () => {
    const expenses = [
      { expenseDate: '2026-01-15', vendor: 'Lumber yard', description: 'Walnut', category: 'materials', totalCents: 11300, hstCents: 1300, projectNumber: '2026-014' },
      { expenseDate: '2026-01-16', vendor: 'Staples', description: 'Paper', category: 'office', totalCents: 2260, hstCents: 260, projectNumber: null },
    ];
    const lines = expensesCsv(expenses, summarizeExpenses(2026, expenses)).replace(/^﻿/, '').split('\r\n');

    expect(lines[1]).toBe('2026-01-15,Lumber yard,Walnut,Materials,8320,113.00,13.00,100.00,2026-014');
    expect(lines[2].endsWith(',20.00,')).toBe(true);

    const start = lines.indexOf('Projects 2026,Expenses,Total paid,HST,Net of HST');
    expect(start).toBeGreaterThan(0);
    expect(lines[start + 1]).toBe('2026-014,1,113.00,13.00,100.00');
    expect(lines[start + 2]).toBe('No project,1,22.60,2.60,20.00');
  });
});
