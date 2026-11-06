import { describe, expect, it } from 'vitest';
import { formToObject, oneWayKmFor, parseOdometer, parsePlace, parseTrip } from './validation';
import { formatKm, summarizeYear } from './summary';
import { mileageCsv } from './csv';
import { toCsv } from '../csv';

const NOW = new Date('2026-11-06T15:00:00Z');

const validTrip = {
  tripDate: '2026-11-06',
  origin: 'Shop',
  destination: 'Lumber yard',
  purpose: 'Buy walnut for dining table',
  oneWayKm: '12.3',
  roundTrip: 'on',
  notes: '',
};

describe('parseTrip', () => {
  it('doubles the one-way distance for a round trip', () => {
    const result = parseTrip(validTrip, NOW);
    expect(result).toEqual({
      ok: true,
      data: {
        tripDate: '2026-11-06',
        origin: 'Shop',
        destination: 'Lumber yard',
        purpose: 'Buy walnut for dining table',
        distanceKm: 24.6,
        roundTrip: true,
        notes: null,
      },
    });
  });

  it('keeps a one-way trip as entered, rounded to 0.1 km', () => {
    // An unticked checkbox is simply absent from the submitted form.
    const oneWay: Record<string, string> = { ...validTrip, oneWayKm: '7.06' };
    delete oneWay.roundTrip;
    const result = parseTrip(oneWay, NOW);
    expect(result.ok && result.data).toMatchObject({ distanceKm: 7.1, roundTrip: false });
  });

  it('reports each problem against its field', () => {
    const result = parseTrip(
      { ...validTrip, tripDate: '2026-02-30', destination: '  ', purpose: '', oneWayKm: '' },
      NOW,
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(Object.keys(result.errors).sort()).toEqual(['destination', 'oneWayKm', 'purpose', 'tripDate']);
  });

  it('rejects zero, negative, non-numeric and absurd distances', () => {
    for (const oneWayKm of ['0', '-5', 'abc', '99999']) {
      expect(parseTrip({ ...validTrip, oneWayKm }, NOW).ok).toBe(false);
    }
  });

  it('allows tomorrow (timezone slack) but not further ahead', () => {
    expect(parseTrip({ ...validTrip, tripDate: '2026-11-07' }, NOW).ok).toBe(true);
    expect(parseTrip({ ...validTrip, tripDate: '2026-11-08' }, NOW).ok).toBe(false);
  });

  it('round-trips through the edit form', () => {
    expect(oneWayKmFor({ distanceKm: 24.6, roundTrip: true })).toBe(12.3);
    expect(oneWayKmFor({ distanceKm: 7.1, roundTrip: false })).toBe(7.1);
  });
});

describe('formToObject', () => {
  it('keeps strings and drops files', () => {
    const fd = new FormData();
    fd.set('a', 'x');
    fd.set('f', new Blob(['data']));
    expect(formToObject(fd)).toEqual({ a: 'x' });
  });
});

describe('parsePlace', () => {
  it('makes the distance optional', () => {
    expect(parsePlace({ name: 'Client: Smith', oneWayKm: '' })).toEqual({
      ok: true,
      data: { name: 'Client: Smith', oneWayKm: null },
    });
    expect(parsePlace({ name: 'Home Depot', oneWayKm: '8.25' })).toMatchObject({ data: { oneWayKm: 8.3 } });
    expect(parsePlace({ name: '' }).ok).toBe(false);
  });
});

describe('parseOdometer', () => {
  it('accepts partial readings and rejects an end below the start', () => {
    expect(parseOdometer({ year: '2026', startKm: '84210', endKm: '' })).toEqual({
      ok: true,
      data: { year: 2026, startKm: 84210, endKm: null },
    });
    const bad = parseOdometer({ year: '2026', startKm: '90000', endKm: '80000' });
    expect(bad.ok === false && bad.errors.endKm).toBeTruthy();
    expect(parseOdometer({ year: '2026', startKm: '1.5' }).ok).toBe(false);
  });
});

describe('summarizeYear', () => {
  const trips = [
    { tripDate: '2026-01-15', distanceKm: 0.1 },
    { tripDate: '2026-01-20', distanceKm: 0.2 },
    { tripDate: '2026-03-02', distanceKm: 100 },
    { tripDate: '2025-12-31', distanceKm: 999 }, // other year, ignored
  ];

  it('totals business km without float drift and splits by month', () => {
    const s = summarizeYear(2026, trips, null);
    expect(s.businessKm).toBe(100.3);
    expect(s.tripCount).toBe(3);
    expect(s.months[0]).toEqual({ month: 1, km: 0.3, trips: 2 });
    expect(s.months[2]).toEqual({ month: 3, km: 100, trips: 1 });
    expect(s.months).toHaveLength(12);
  });

  it('computes the business-use percentage from the odometer', () => {
    const s = summarizeYear(2026, trips, { startKm: 50_000, endKm: 51_000 });
    expect(s.totalKm).toBe(1000);
    expect(s.businessPercent).toBe(10);
    expect(s.warnings).toEqual([]);
  });

  it('asks for missing readings and leaves the percentage unknown', () => {
    const s = summarizeYear(2026, trips, { startKm: 50_000, endKm: null });
    expect(s.totalKm).toBeNull();
    expect(s.businessPercent).toBeNull();
    expect(s.warnings).toEqual(['Add the odometer reading from the end of 2026.']);
  });

  it('flags business km above total km', () => {
    const s = summarizeYear(2026, trips, { startKm: 50_000, endKm: 50_050 });
    expect(s.businessPercent).toBeGreaterThan(100);
    expect(s.warnings.join(' ')).toMatch(/more than the total/);
  });

  it('formats km with one decimal', () => {
    expect(formatKm(1234.5)).toBe('1,234.5');
    expect(formatKm(12)).toBe('12.0');
  });
});

describe('CSV', () => {
  it('quotes, escapes and defuses formulas', () => {
    const csv = toCsv([['a,b', 'say "hi"', '=SUM(A1)', '-rm', -5, null, true]]);
    expect(csv).toBe('﻿"a,b","say ""hi""",\'=SUM(A1),\'-rm,-5,,Yes\r\n');
  });

  it('exports trips followed by the year summary', () => {
    const summary = summarizeYear(2026, [{ tripDate: '2026-05-01', distanceKm: 24.6 }], { startKm: 1000, endKm: 1246 });
    const csv = mileageCsv('Truck', [
      { tripDate: '2026-05-01', origin: 'Shop', destination: 'Client, Waterloo', purpose: 'Install', roundTrip: true, distanceKm: 24.6, notes: null },
    ], summary);
    const lines = csv.replace('﻿', '').trim().split('\r\n');
    expect(lines[0]).toBe('Date,From,To,Business purpose,Round trip,Distance (km),Notes');
    expect(lines[1]).toBe('2026-05-01,Shop,"Client, Waterloo",Install,Yes,24.6,');
    expect(lines).toContain('Business use (%),10');
  });
});
