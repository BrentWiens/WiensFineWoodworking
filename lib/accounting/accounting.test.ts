import { describe, expect, it } from 'vitest';
import { ccaSchedule } from './cca';
import { deductibleCents, mileageCents, purchaseCents, revenueCents } from './rules';
import { parseCapitalAsset, parseCcaClaim } from './validation';
import { hstThreshold, yearAccounts, type YearInput } from './year';

const expense = (category: string, totalCents: number, hstCents = 0, expenseDate = '2026-05-01') => ({
  expenseDate,
  category,
  totalCents,
  hstCents,
});

describe('rules', () => {
  it('count a purchase in full until HST-registered, and net of HST from then on', () => {
    const saw = expense('small_tools', 11300, 1300, '2026-05-01');
    expect(purchaseCents(saw, null)).toBe(11300);
    expect(purchaseCents(saw, '2026-06-01')).toBe(11300);
    expect(purchaseCents(saw, '2026-05-01')).toBe(10000);
  });

  it('deduct half of a meal', () => {
    expect(deductibleCents(expense('meals', 2200), null)).toBe(1100);
    expect(deductibleCents(expense('meals', 2260, 260), '2026-01-01')).toBe(1000);
    expect(deductibleCents(expense('materials', 2200), null)).toBe(2200);
  });

  it('leave HST collected out of income', () => {
    expect(revenueCents({ totalCents: 113000, hstCents: 13000 })).toBe(100000);
  });

  it('cost driving at 73 cents a km', () => {
    expect(mileageCents(330)).toBe(24090);
  });
});

describe('yearAccounts', () => {
  const input: YearInput = {
    year: 2026,
    income: [
      { incomeDate: '2026-02-28', totalCents: 25000, hstCents: 0 },
      { incomeDate: '2026-10-26', totalCents: 299600, hstCents: 0 },
      { incomeDate: '2025-12-30', totalCents: 999900, hstCents: 0 },
    ],
    expenses: [
      expense('materials', 113308, 13035),
      expense('small_tools', 13549),
      expense('meals', 2200),
      expense('office', 25312),
      expense('vehicle_fuel', 80000),
      expense('equipment', 73224),
      expense('materials', 999900, 0, '2025-06-01'),
    ],
    trips: [
      { tripDate: '2026-04-17', distanceKm: 330 },
      { tripDate: '2025-04-17', distanceKm: 999 },
    ],
    businessPercent: null,
    toolsCcaCents: 7322,
    vehicleCcaCents: 100000,
  };
  const accounts = yearAccounts(input);

  it('counts only the year’s income', () => {
    expect(accounts).toMatchObject({ incomeCount: 2, incomeCents: 324600 });
  });

  it('lists everyday expenses by category, leaving out vehicle costs and $500+ tools', () => {
    expect(accounts.expenseLines.map(l => [l.id, l.count, l.paidCents, l.cents])).toEqual([
      ['materials', 1, 113308, 113308],
      ['meals', 1, 2200, 1100],
      ['office', 1, 25312, 25312],
      ['small_tools', 1, 13549, 13549],
    ]);
    expect(accounts.expensesCents).toBe(153269);
    expect(accounts.equipmentBoughtCents).toBe(73224);
  });

  it('estimates the vehicle claim per km until the business-use % is known', () => {
    expect(accounts.vehicle).toMatchObject({ method: 'estimate', km: 330, cents: 24090, runningCostsCents: 80000 });
  });

  it('claims the business share of running costs and vehicle CCA once it is', () => {
    const actual = yearAccounts({ ...input, businessPercent: 25 });
    expect(actual.vehicle).toMatchObject({ method: 'actual', cents: 45000 });
  });

  it('works out net income and the tax set-aside', () => {
    expect(accounts.deductionsCents).toBe(153269 + 24090 + 7322);
    expect(accounts.netIncomeCents).toBe(324600 - 184681);
    expect(accounts.setAsideCents).toBe(Math.round(139919 * 0.3));
  });

  it('sets nothing aside in a loss year', () => {
    const loss = yearAccounts({ ...input, income: [] });
    expect(loss.netIncomeCents).toBeLessThan(0);
    expect(loss.setAsideCents).toBe(0);
  });
});

describe('hstThreshold', () => {
  const income = [
    { incomeDate: '2025-12-31', totalCents: 500000, hstCents: 0 }, // the quarter before the window
    { incomeDate: '2026-01-01', totalCents: 1000000, hstCents: 0 },
    { incomeDate: '2026-06-30', totalCents: 600000, hstCents: 0 },
    { incomeDate: '2026-11-16', totalCents: 1062546, hstCents: 0 },
  ];

  it('adds up the four calendar quarters ending with the current one', () => {
    expect(hstThreshold(income, '2026-11-16')).toMatchObject({
      from: '2026-01-01',
      to: '2026-12-31',
      cents: 2662546,
      largestQuarterCents: 1062546,
      remainingCents: 337454,
      percent: 89,
      over: false,
    });
  });

  it('rolls forward a quarter at a time, across the year end', () => {
    expect(hstThreshold(income, '2027-02-10')).toMatchObject({ from: '2026-04-01', to: '2027-03-31', cents: 1662546 });
    expect(hstThreshold(income, '2026-03-31')).toMatchObject({ from: '2025-04-01', to: '2026-03-31', cents: 1500000 });
  });

  it('is over once the total passes $30,000, or a single quarter does', () => {
    const more = [...income, { incomeDate: '2026-12-01', totalCents: 337455, hstCents: 0 }];
    expect(hstThreshold(more, '2026-12-02')).toMatchObject({ over: true, remainingCents: 0, percent: 100 });
    expect(hstThreshold([{ incomeDate: '2026-12-01', totalCents: 3000000, hstCents: 0 }], '2026-12-02').over).toBe(false);
  });
});

describe('ccaSchedule', () => {
  it('is empty until something is bought', () => {
    expect(ccaSchedule(20, [], [], 2026)).toEqual([]);
    expect(ccaSchedule(20, [{ year: 2027, cents: 100000 }], [], 2026)).toEqual([]);
  });

  it('carries the pool forward, with the half-year rule on purchases', () => {
    const schedule = ccaSchedule(
      20,
      [{ year: 2026, cents: 73224 }],
      [
        { year: 2026, cents: 7322 },
        { year: 2027, cents: 5000 },
      ],
      2028,
    );
    expect(schedule).toEqual([
      { year: 2026, openingCents: 0, additionsCents: 73224, maxCents: 7322, claimedCents: 7322, closingCents: 65902 },
      { year: 2027, openingCents: 65902, additionsCents: 0, maxCents: 13180, claimedCents: 5000, closingCents: 60902 },
      { year: 2028, openingCents: 60902, additionsCents: 0, maxCents: 12180, claimedCents: 0, closingCents: 60902 },
    ]);
  });

  it('never lets a claim take the pool below zero', () => {
    const [row] = ccaSchedule(20, [{ year: 2026, cents: 1000 }], [{ year: 2026, cents: 5000 }], 2026);
    expect(row).toMatchObject({ claimedCents: 1000, closingCents: 0 });
  });
});

describe('accounting forms', () => {
  const NOW = new Date('2026-11-16T15:00:00Z');

  it('parse a capital asset', () => {
    expect(
      parseCapitalAsset({ name: ' Honda CR-V ', ccaClass: '10', acquiredDate: '2026-01-01', cost: '12,000', notes: '' }, NOW),
    ).toEqual({
      ok: true,
      data: { name: 'Honda CR-V', ccaClass: '10', acquiredDate: '2026-01-01', costCents: 1200000, notes: null },
    });
    expect(parseCapitalAsset({ name: 'Saw', ccaClass: '99', acquiredDate: '2026-01-01', cost: '900' }, NOW).ok).toBe(false);
  });

  it('parse a CCA claim, treating blank as nothing claimed', () => {
    expect(parseCcaClaim({ year: '2026', ccaClass: '8', claimed: '73.22' })).toEqual({
      ok: true,
      data: { year: 2026, ccaClass: '8', claimedCents: 7322 },
    });
    const blank = parseCcaClaim({ year: '2026', ccaClass: '8', claimed: '' });
    expect(blank.ok && blank.data.claimedCents).toBe(0);
  });
});
