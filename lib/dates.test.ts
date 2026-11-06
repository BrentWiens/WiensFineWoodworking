import { describe, expect, it } from 'vitest';
import { addDays, currentYear, formatShortDate, isIsoDate, parseYearParam, todayIso } from './dates';

describe('todayIso', () => {
  it('uses Toronto time, not UTC', () => {
    // 02:00 UTC on Jan 1 is still Dec 31 in Toronto.
    expect(todayIso(new Date('2027-01-01T02:00:00Z'))).toBe('2026-12-31');
    expect(currentYear(new Date('2027-01-01T02:00:00Z'))).toBe(2026);
    expect(todayIso(new Date('2027-01-01T06:00:00Z'))).toBe('2027-01-01');
  });
});

describe('isIsoDate', () => {
  it('accepts real dates only', () => {
    expect(isIsoDate('2026-11-06')).toBe(true);
    expect(isIsoDate('2028-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('2026-1-01')).toBe(false);
    expect(isIsoDate('Nov 6')).toBe(false);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('formatShortDate', () => {
  it('formats without shifting the day', () => {
    expect(formatShortDate('2026-11-06')).toMatch(/Fri.*Nov.*6/);
  });
});

describe('parseYearParam', () => {
  const now = new Date('2026-06-01T12:00:00Z');
  it('reads a sensible year and ignores junk', () => {
    expect(parseYearParam('2025', now)).toBe(2025);
    expect(parseYearParam(['2024', '2023'], now)).toBe(2024);
    expect(parseYearParam(undefined, now)).toBe(2026);
    expect(parseYearParam('abc', now)).toBe(2026);
    expect(parseYearParam('1066', now)).toBe(2026);
  });
});
