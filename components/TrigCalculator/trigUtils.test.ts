import { describe, it, expect } from 'vitest';
import {
  parseInput,
  decimalToFraction,
  formatDecimal,
  formatSide,
  formatAngle,
  formatAsFraction,
  solveTriangle,
  type TriangleValues,
} from './trigUtils';

const empty: TriangleValues = { a: null, b: null, c: null, A: null, B: null };

describe('parseInput', () => {
  it('parses whole numbers', () => {
    expect(parseInput('5')).toBe(5);
    expect(parseInput('12')).toBe(12);
    expect(parseInput('0')).toBe(0);
  });

  it('parses decimals', () => {
    expect(parseInput('3.5')).toBe(3.5);
    expect(parseInput('0.25')).toBe(0.25);
  });

  it('parses fractions', () => {
    expect(parseInput('1/2')).toBe(0.5);
    expect(parseInput('3/4')).toBe(0.75);
  });

  it('parses mixed numbers', () => {
    expect(parseInput('3-1/2')).toBe(3.5);
    expect(parseInput('2 1/4')).toBe(2.25);
  });

  it('returns null for empty or invalid input', () => {
    expect(parseInput('')).toBeNull();
    expect(parseInput('  ')).toBeNull();
    expect(parseInput('abc')).toBeNull();
  });

  it('handles negative numbers', () => {
    expect(parseInput('-5')).toBe(-5);
    expect(parseInput('-3.5')).toBe(-3.5);
  });
});

describe('decimalToFraction', () => {
  it('converts whole numbers', () => {
    expect(decimalToFraction(5)).toEqual({ whole: 5, numerator: 0, denominator: 1 });
  });

  it('converts simple fractions', () => {
    expect(decimalToFraction(0.5)).toEqual({ whole: 0, numerator: 1, denominator: 2 });
    expect(decimalToFraction(0.25)).toEqual({ whole: 0, numerator: 1, denominator: 4 });
    expect(decimalToFraction(0.75)).toEqual({ whole: 0, numerator: 3, denominator: 4 });
  });

  it('converts mixed numbers', () => {
    expect(decimalToFraction(2.5)).toEqual({ whole: 2, numerator: 1, denominator: 2 });
  });

  it('handles woodworking fractions', () => {
    expect(decimalToFraction(0.125)).toEqual({ whole: 0, numerator: 1, denominator: 8 });
    expect(decimalToFraction(0.0625)).toEqual({ whole: 0, numerator: 1, denominator: 16 });
  });
});

describe('formatDecimal', () => {
  it('formats with up to 4 decimal places', () => {
    expect(formatDecimal(3.5)).toBe('3.5');
    expect(formatDecimal(5)).toBe('5');
    expect(formatDecimal(1.23456)).toBe('1.2346');
  });

  it('strips trailing zeros', () => {
    expect(formatDecimal(3.0)).toBe('3');
    expect(formatDecimal(3.10)).toBe('3.1');
  });
});

describe('formatSide', () => {
  it('formats with up to 3 decimal places', () => {
    expect(formatSide(3.5)).toBe('3.5');
    expect(formatSide(5)).toBe('5');
    expect(formatSide(1.23456)).toBe('1.235');
  });

  it('strips trailing zeros', () => {
    expect(formatSide(3.0)).toBe('3');
    expect(formatSide(3.10)).toBe('3.1');
  });
});

describe('formatAngle', () => {
  it('formats with 1 decimal place', () => {
    expect(formatAngle(36.8699)).toBe('36.9');
    expect(formatAngle(45)).toBe('45');
    expect(formatAngle(53.1301)).toBe('53.1');
  });

  it('strips trailing zeros', () => {
    expect(formatAngle(30.0)).toBe('30');
    expect(formatAngle(60.0)).toBe('60');
  });
});

describe('formatAsFraction', () => {
  it('formats as fractions', () => {
    expect(formatAsFraction(0.5)).toBe('1/2');
    expect(formatAsFraction(2.5)).toBe('2-1/2');
    expect(formatAsFraction(5)).toBe('5');
  });
});

describe('solveTriangle', () => {
  describe('validation', () => {
    it('requires at least 2 values', () => {
      const result = solveTriangle({ ...empty, a: 3 });
      expect(result.error).toContain('at least 2');
    });

    it('requires at least one side', () => {
      const result = solveTriangle({ ...empty, A: 30, B: 60 });
      expect(result.error).toContain('one side');
    });

    it('rejects negative sides', () => {
      const result = solveTriangle({ ...empty, a: -3, b: 4 });
      expect(result.error).toContain('positive');
    });

    it('rejects angles outside 0-90', () => {
      expect(solveTriangle({ ...empty, a: 3, A: 0 }).error).toContain('between');
      expect(solveTriangle({ ...empty, a: 3, A: 90 }).error).toContain('between');
      expect(solveTriangle({ ...empty, a: 3, A: 100 }).error).toContain('between');
    });

    it('rejects angles that do not sum to 90', () => {
      const result = solveTriangle({ ...empty, a: 3, A: 40, B: 40 });
      expect(result.error).toContain('sum to 90');
    });

    it('rejects side a >= hypotenuse c', () => {
      const result = solveTriangle({ ...empty, a: 5, c: 3 });
      expect(result.error).toContain('greater than');
    });
  });

  describe('solving with two sides', () => {
    it('solves from sides a and b (3-4-5 triangle)', () => {
      const result = solveTriangle({ ...empty, a: 3, b: 4 });
      expect(result.error).toBeNull();
      expect(result.values.c).toBeCloseTo(5);
      expect(result.values.A).toBeCloseTo(36.8699, 3);
      expect(result.values.B).toBeCloseTo(53.1301, 3);
    });

    it('solves from sides a and c', () => {
      const result = solveTriangle({ ...empty, a: 3, c: 5 });
      expect(result.error).toBeNull();
      expect(result.values.b).toBeCloseTo(4);
      expect(result.values.A).toBeCloseTo(36.8699, 3);
    });

    it('solves from sides b and c', () => {
      const result = solveTriangle({ ...empty, b: 4, c: 5 });
      expect(result.error).toBeNull();
      expect(result.values.a).toBeCloseTo(3);
    });
  });

  describe('solving with one side and one angle', () => {
    it('solves from side a and angle A', () => {
      const result = solveTriangle({ ...empty, a: 5, A: 30 });
      expect(result.error).toBeNull();
      expect(result.values.b).toBeCloseTo(8.6603, 3);
      expect(result.values.c).toBeCloseTo(10);
      expect(result.values.B).toBeCloseTo(60);
    });

    it('solves from side b and angle A', () => {
      const result = solveTriangle({ ...empty, b: 10, A: 45 });
      expect(result.error).toBeNull();
      expect(result.values.a).toBeCloseTo(10);
      expect(result.values.c).toBeCloseTo(14.1421, 3);
      expect(result.values.B).toBeCloseTo(45);
    });

    it('solves from hypotenuse c and angle A', () => {
      const result = solveTriangle({ ...empty, c: 10, A: 30 });
      expect(result.error).toBeNull();
      expect(result.values.a).toBeCloseTo(5);
      expect(result.values.b).toBeCloseTo(8.6603, 3);
      expect(result.values.B).toBeCloseTo(60);
    });

    it('solves from side a and angle B', () => {
      const result = solveTriangle({ ...empty, a: 5, B: 60 });
      expect(result.error).toBeNull();
      expect(result.values.A).toBeCloseTo(30);
      expect(result.values.c).toBeCloseTo(10);
    });
  });

  describe('special triangles', () => {
    it('solves 45-45-90 triangle', () => {
      const result = solveTriangle({ ...empty, a: 1, A: 45 });
      expect(result.error).toBeNull();
      expect(result.values.b).toBeCloseTo(1);
      expect(result.values.c).toBeCloseTo(Math.SQRT2);
      expect(result.values.B).toBeCloseTo(45);
    });

    it('solves 30-60-90 triangle', () => {
      const result = solveTriangle({ ...empty, c: 2, A: 30 });
      expect(result.error).toBeNull();
      expect(result.values.a).toBeCloseTo(1);
      expect(result.values.b).toBeCloseTo(Math.sqrt(3));
    });
  });

  describe('overspecified but consistent', () => {
    it('accepts all 3 sides of a valid triangle', () => {
      const result = solveTriangle({ ...empty, a: 3, b: 4, c: 5 });
      expect(result.error).toBeNull();
      expect(result.values.A).toBeCloseTo(36.8699, 3);
    });

    it('rejects 3 sides that do not form a right triangle', () => {
      const result = solveTriangle({ ...empty, a: 3, b: 4, c: 6 });
      expect(result.error).toContain('valid right triangle');
    });
  });
});
