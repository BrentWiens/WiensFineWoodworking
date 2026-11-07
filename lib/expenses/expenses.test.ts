import { describe, expect, it } from 'vitest';
import { CATEGORIES, SECTIONS, categoryLabel, isCategoryId, isVehicleCategory } from './categories';
import { parseExpense } from './validation';
import { summarizeExpenses, type SummaryExpense } from './summary';
import { expensesCsv } from './csv';

const NOW = new Date('2026-11-06T15:00:00Z');

const validExpense = {
  expenseDate: '2026-11-06',
  vendor: 'Lumber yard',
  category: 'materials',
  description: 'Walnut for dining table',
  total: '565.00',
  hst: '65.00',
  notes: '',
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

describe('parseExpense', () => {
  it('converts amounts to cents', () => {
    expect(parseExpense(validExpense, NOW)).toEqual({
      ok: true,
      data: {
        expenseDate: '2026-11-06',
        vendor: 'Lumber yard',
        category: 'materials',
        description: 'Walnut for dining table',
        totalCents: 56500,
        hstCents: 6500,
        notes: null,
      },
    });
  });

  it('treats a blank HST as none charged', () => {
    const result = parseExpense({ ...validExpense, hst: '' }, NOW);
    expect(result.ok && result.data.hstCents).toBe(0);
  });

  it('accepts a dollar sign and grouping commas', () => {
    const result = parseExpense({ ...validExpense, total: '$1,130.00', hst: '$130' }, NOW);
    expect(result.ok && [result.data.totalCents, result.data.hstCents]).toEqual([113000, 13000]);
  });

  it('requires the vendor, category, description and total', () => {
    const result = parseExpense({ expenseDate: '2026-11-06' }, NOW);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(['category', 'description', 'total', 'vendor']);
  });

  it.each([
    ['0', 'Total must be more than 0'],
    ['12.345', 'Total must be an amount like 12.34'],
    ['abc', 'Total must be an amount like 12.34'],
  ])('rejects a total of %j', (total, message) => {
    const result = parseExpense({ ...validExpense, total, hst: '' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.total).toEqual([message]);
  });

  it('rejects an unknown category', () => {
    const result = parseExpense({ ...validExpense, category: 'snacks' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.category).toEqual(['Choose a category']);
  });

  it('rejects HST larger than any Canadian rate allows', () => {
    // 15% HST on $100 is $15 of a $115 total; $16 can't be right.
    expect(parseExpense({ ...validExpense, total: '115', hst: '15' }, NOW).ok).toBe(true);
    const result = parseExpense({ ...validExpense, total: '115', hst: '16' }, NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.hst?.[0]).toMatch(/HST is more than/);
  });

  it('rejects dates in the future but allows a day of clock slack', () => {
    expect(parseExpense({ ...validExpense, expenseDate: '2026-11-07' }, NOW).ok).toBe(true);
    expect(parseExpense({ ...validExpense, expenseDate: '2026-11-08' }, NOW).ok).toBe(false);
    expect(parseExpense({ ...validExpense, expenseDate: '2026-02-30' }, NOW).ok).toBe(false);
  });
});

const sample: SummaryExpense[] = [
  { expenseDate: '2026-01-15', category: 'materials', totalCents: 11300, hstCents: 1300 },
  { expenseDate: '2026-01-20', category: 'materials', totalCents: 5650, hstCents: 650 },
  { expenseDate: '2026-03-02', category: 'vehicle_fuel', totalCents: 8000, hstCents: 920 },
  { expenseDate: '2026-03-09', category: 'bank_fees', totalCents: 1500, hstCents: 0 },
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
    expect(summarizeExpenses(2024, sample)).toMatchObject({ count: 0, totalCents: 0, sections: [] });
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
        notes: null,
      },
    ];
    const lines = expensesCsv(expenses, summarizeExpenses(2026, expenses)).replace(/^﻿/, '').split('\r\n');
    expect(lines[0]).toBe('Date,Vendor,Description,Category,T2125 line,Total paid,HST,Net of HST,Notes');
    expect(lines[1]).toBe('2026-01-15,Lumber yard,"Walnut, ""8/4""",Materials,8320,113.00,13.00,100.00,');
    expect(lines[2]).toBe('');
    expect(lines[4]).toBe('Materials,Cost of goods sold,8320,1,113.00,13.00,100.00');
    expect(lines[5]).toBe('All expenses,,,1,113.00,13.00,100.00');
  });
});
