import { describe, expect, it } from 'vitest';
import { centsToInput, formatCents, hstIncluded, parseMoney } from './money';

describe('parseMoney', () => {
  it.each([
    ['12.34', 1234],
    ['12', 1200],
    ['12.5', 1250],
    ['.99', 99],
    ['0.01', 1],
    ['$1,234.56', 123456],
    [' $ 45.00 ', 4500],
    ['12.', 1200],
  ])('reads %j as %i cents', (input, cents) => {
    expect(parseMoney(input)).toBe(cents);
  });

  it.each(['', '  ', '.', '$', 'abc', '12.345', '-5', '1e3', '12.3.4', '12,34.5x'])('rejects %j', input => {
    expect(parseMoney(input)).toBeNull();
  });

  it('avoids floating-point error', () => {
    // 0.29 * 100 is 28.999999999999996 in floating point.
    expect(parseMoney('0.29')).toBe(29);
    expect(parseMoney('19.99')).toBe(1999);
  });
});

describe('formatCents', () => {
  it('formats as Canadian dollars', () => {
    expect(formatCents(123456)).toBe('$1,234.56');
    expect(formatCents(5)).toBe('$0.05');
    expect(formatCents(0)).toBe('$0.00');
  });
});

describe('centsToInput', () => {
  it('always shows two decimals and no grouping', () => {
    expect(centsToInput(123450)).toBe('1234.50');
    expect(centsToInput(7)).toBe('0.07');
  });
});

describe('hstIncluded', () => {
  it('takes 13/113 of a tax-included total', () => {
    expect(hstIncluded(11300)).toBe(1300);
    expect(hstIncluded(5649)).toBe(650); // $49.99 + 13% = $56.49 → $6.50 HST
  });

  it('rounds to the nearest cent', () => {
    expect(hstIncluded(100)).toBe(12); // 11.5 → 12
    expect(hstIncluded(1)).toBe(0);
  });
});
