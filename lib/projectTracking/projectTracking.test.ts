import { describe, expect, it } from 'vitest';
import { parseIncome, parseProject } from './validation';
import { compareProjectNumbers, projectTotals, sortProjects, totalsByProject, unknownProjectNumbers } from './summary';

const NOW = new Date('2026-11-16T15:00:00Z');

describe('parseProject', () => {
  it('needs only a number and a name, and starts out active', () => {
    expect(parseProject({ number: ' 2026-014 ', name: 'Walnut dining table', client: '', notes: '' })).toEqual({
      ok: true,
      data: { number: '2026-014', name: 'Walnut dining table', client: null, status: 'active', notes: null },
    });
  });

  it('keeps the client, status and notes when given', () => {
    const result = parseProject({ number: '14', name: 'Table', client: 'Smith', status: 'complete', notes: 'Paid in full' });
    expect(result.ok && result.data).toMatchObject({ client: 'Smith', status: 'complete', notes: 'Paid in full' });
  });

  it('requires the number and the name', () => {
    const result = parseProject({ number: '  ', name: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(['name', 'number']);
  });

  it('rejects an unknown status', () => {
    const result = parseProject({ number: '14', name: 'Table', status: 'paused' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.status).toEqual(['Choose a status']);
  });
});

describe('parseIncome', () => {
  const valid = { incomeDate: '2026-11-10', description: 'Deposit', total: '$2,260.00', hst: '260' };

  it('converts amounts to cents', () => {
    expect(parseIncome(valid, NOW)).toEqual({
      ok: true,
      data: { incomeDate: '2026-11-10', description: 'Deposit', totalCents: 226000, hstCents: 26000 },
    });
  });

  it('treats a blank HST as none charged', () => {
    const result = parseIncome({ ...valid, hst: '' }, NOW);
    expect(result.ok && result.data.hstCents).toBe(0);
  });

  it('rejects a zero amount, too much HST and a future date', () => {
    expect(parseIncome({ ...valid, total: '0', hst: '' }, NOW).ok).toBe(false);
    expect(parseIncome({ ...valid, total: '100', hst: '50' }, NOW).ok).toBe(false);
    expect(parseIncome({ ...valid, incomeDate: '2026-11-18' }, NOW).ok).toBe(false);
  });
});

describe('projectTotals', () => {
  const expense = (category: string, totalCents: number, hstCents = 0) => ({
    expenseDate: '2026-05-01',
    category,
    totalCents,
    hstCents,
  });

  const totals = projectTotals(
    [
      { totalCents: 100000, hstCents: 0 },
      { totalCents: 50000, hstCents: 0 },
    ],
    [expense('small_tools', 20000, 2301), expense('materials', 11300, 1300), expense('materials', 5000), expense('meals', 2200)],
    [{ distanceKm: 0.1 }, { distanceKm: 0.2 }, { distanceKm: 99.7 }],
  );

  it('totals income', () => {
    expect(totals).toMatchObject({ incomeCount: 2, incomeCents: 150000 });
  });

  it('breaks costs down by category in form order, HST included, meals at half', () => {
    expect(totals.costs).toEqual([
      { id: 'materials', label: 'Materials', count: 2, cents: 16300 },
      { id: 'meals', label: expect.any(String), count: 1, cents: 1100 },
      { id: 'small_tools', label: expect.any(String), count: 1, cents: 20000 },
    ]);
    expect(totals).toMatchObject({ expenseCount: 4, expenseCents: 37400 });
  });

  it('costs driving at the per-km estimate, without floating-point drift in the km', () => {
    expect(totals).toMatchObject({ tripCount: 3, km: 100, mileageCents: 7300 });
  });

  it('takes expenses and mileage off income for the profit', () => {
    expect(totals.profitCents).toBe(150000 - 37400 - 7300);
  });

  it('shows a loss as a negative profit, and zeros for an empty project', () => {
    expect(projectTotals([], [expense('materials', 5000)], []).profitCents).toBe(-5000);
    expect(projectTotals([], [], [])).toMatchObject({ profitCents: 0, km: 0, tripCount: 0, costs: [] });
  });
});

describe('totalsByProject', () => {
  it('gives each project its own income, expenses and trips', () => {
    const expense = (projectNumber: string | null, totalCents: number) => ({
      projectNumber,
      expenseDate: '2026-05-01',
      category: 'materials',
      totalCents,
      hstCents: 0,
    });
    const totals = totalsByProject(
      [
        { id: 1, number: '14' },
        { id: 2, number: '15' },
      ],
      [{ projectId: 1, totalCents: 10000, hstCents: 0 }],
      // "014" is not the same project as "14": numbers must match exactly
      [expense('14', 4000), expense('15', 1000), expense('014', 99999), expense(null, 99999)],
      [{ projectNumber: '15', distanceKm: 10 }],
    );

    expect(totals.get(1)).toMatchObject({ profitCents: 6000, tripCount: 0 });
    expect(totals.get(2)).toMatchObject({ profitCents: -1730, tripCount: 1, km: 10 });
  });
});

describe('project numbers', () => {
  it('sort by the numbers inside them', () => {
    expect(['10', '9', '2026-14', '2026-2'].sort(compareProjectNumbers)).toEqual(['9', '10', '2026-2', '2026-14']);
  });

  it('list active projects first, newest number first', () => {
    const sorted = sortProjects([
      { number: '12', status: 'complete' },
      { number: '9', status: 'active' },
      { number: '13', status: 'complete' },
      { number: '10', status: 'active' },
    ]);
    expect(sorted.map(p => p.number)).toEqual(['10', '9', '13', '12']);
  });

  it('finds numbers in use that no project has', () => {
    expect(
      unknownProjectNumbers(
        [{ number: '14' }],
        [{ projectNumber: '14' }, { projectNumber: '20' }, { projectNumber: '3' }, { projectNumber: '20' }, { projectNumber: null }],
      ),
    ).toEqual(['3', '20']);
  });
});
