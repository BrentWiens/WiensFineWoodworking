import { describe, it, expect } from 'vitest';
import {
  gcd,
  lcm,
  reduceFraction,
  toImproper,
  toMixed,
  addFractions,
  subtractFractions,
  multiplyFractions,
  divideFractions,
  parseFraction,
  formatFraction,
  fractionToDecimal,
  calculate,
  Fraction,
} from './fractionalUtils';

describe('gcd', () => {
  it('finds greatest common divisor of two numbers', () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(17, 13)).toBe(1);
    expect(gcd(100, 25)).toBe(25);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(5, 0)).toBe(5);
  });

  it('handles negative numbers', () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
    expect(gcd(-12, -8)).toBe(4);
  });
});

describe('lcm', () => {
  it('finds least common multiple of two numbers', () => {
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(3, 5)).toBe(15);
    expect(lcm(8, 12)).toBe(24);
  });
});

describe('reduceFraction', () => {
  it('reduces fractions to lowest terms', () => {
    expect(reduceFraction(4, 8)).toEqual({ numerator: 1, denominator: 2 });
    expect(reduceFraction(6, 9)).toEqual({ numerator: 2, denominator: 3 });
    expect(reduceFraction(15, 25)).toEqual({ numerator: 3, denominator: 5 });
  });

  it('handles already reduced fractions', () => {
    expect(reduceFraction(3, 4)).toEqual({ numerator: 3, denominator: 4 });
    expect(reduceFraction(1, 7)).toEqual({ numerator: 1, denominator: 7 });
  });

  it('handles zero denominator', () => {
    expect(reduceFraction(5, 0)).toEqual({ numerator: 0, denominator: 1 });
  });
});

describe('toImproper', () => {
  it('converts mixed numbers to improper fractions', () => {
    expect(toImproper({ whole: 2, numerator: 3, denominator: 4 }))
      .toEqual({ numerator: 11, denominator: 4 });
    expect(toImproper({ whole: 1, numerator: 1, denominator: 2 }))
      .toEqual({ numerator: 3, denominator: 2 });
  });

  it('handles whole numbers only', () => {
    expect(toImproper({ whole: 5, numerator: 0, denominator: 1 }))
      .toEqual({ numerator: 5, denominator: 1 });
  });

  it('handles fractions only', () => {
    expect(toImproper({ whole: 0, numerator: 3, denominator: 4 }))
      .toEqual({ numerator: 3, denominator: 4 });
  });

  it('handles negative whole numbers', () => {
    expect(toImproper({ whole: -2, numerator: 1, denominator: 4 }))
      .toEqual({ numerator: -9, denominator: 4 });
  });
});

describe('toMixed', () => {
  it('converts improper fractions to mixed numbers', () => {
    expect(toMixed(11, 4)).toEqual({ whole: 2, numerator: 3, denominator: 4 });
    expect(toMixed(7, 2)).toEqual({ whole: 3, numerator: 1, denominator: 2 });
  });

  it('handles proper fractions', () => {
    expect(toMixed(3, 4)).toEqual({ whole: 0, numerator: 3, denominator: 4 });
  });

  it('handles exact whole numbers', () => {
    expect(toMixed(8, 4)).toEqual({ whole: 2, numerator: 0, denominator: 1 });
  });

  it('reduces the fraction part', () => {
    expect(toMixed(10, 4)).toEqual({ whole: 2, numerator: 1, denominator: 2 });
  });

  it('handles negative fractions', () => {
    expect(toMixed(-7, 2)).toEqual({ whole: -3, numerator: 1, denominator: 2 });
  });

  it('handles zero denominator', () => {
    expect(toMixed(5, 0)).toEqual({ whole: 0, numerator: 0, denominator: 1 });
  });
});

describe('addFractions', () => {
  it('adds two fractions', () => {
    const a: Fraction = { whole: 1, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 2, numerator: 1, denominator: 4 };
    expect(addFractions(a, b)).toEqual({ whole: 3, numerator: 3, denominator: 4 });
  });

  it('adds fractions with different denominators', () => {
    const a: Fraction = { whole: 0, numerator: 1, denominator: 3 };
    const b: Fraction = { whole: 0, numerator: 1, denominator: 4 };
    expect(addFractions(a, b)).toEqual({ whole: 0, numerator: 7, denominator: 12 });
  });

  it('adds fractions that result in whole number', () => {
    const a: Fraction = { whole: 0, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 0, numerator: 1, denominator: 2 };
    expect(addFractions(a, b)).toEqual({ whole: 1, numerator: 0, denominator: 1 });
  });

  it('adds woodworking fractions correctly', () => {
    // 2-3/8 + 1-1/4 = 3-5/8
    const a: Fraction = { whole: 2, numerator: 3, denominator: 8 };
    const b: Fraction = { whole: 1, numerator: 1, denominator: 4 };
    expect(addFractions(a, b)).toEqual({ whole: 3, numerator: 5, denominator: 8 });
  });
});

describe('subtractFractions', () => {
  it('subtracts two fractions', () => {
    const a: Fraction = { whole: 3, numerator: 3, denominator: 4 };
    const b: Fraction = { whole: 1, numerator: 1, denominator: 2 };
    expect(subtractFractions(a, b)).toEqual({ whole: 2, numerator: 1, denominator: 4 });
  });

  it('subtracts fractions resulting in negative', () => {
    const a: Fraction = { whole: 1, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 2, numerator: 0, denominator: 1 };
    expect(subtractFractions(a, b)).toEqual({ whole: -1, numerator: 0, denominator: 1 });
  });

  it('subtracts fraction from whole number', () => {
    const a: Fraction = { whole: 5, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 0, numerator: 1, denominator: 4 };
    expect(subtractFractions(a, b)).toEqual({ whole: 4, numerator: 3, denominator: 4 });
  });
});

describe('multiplyFractions', () => {
  it('multiplies two fractions', () => {
    const a: Fraction = { whole: 2, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 1, numerator: 1, denominator: 3 };
    // 2-1/2 * 1-1/3 = 5/2 * 4/3 = 20/6 = 3-2/6 = 3-1/3
    expect(multiplyFractions(a, b)).toEqual({ whole: 3, numerator: 1, denominator: 3 });
  });

  it('multiplies whole numbers', () => {
    const a: Fraction = { whole: 3, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 4, numerator: 0, denominator: 1 };
    expect(multiplyFractions(a, b)).toEqual({ whole: 12, numerator: 0, denominator: 1 });
  });

  it('multiplies by fraction less than 1', () => {
    const a: Fraction = { whole: 4, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 0, numerator: 1, denominator: 2 };
    expect(multiplyFractions(a, b)).toEqual({ whole: 2, numerator: 0, denominator: 1 });
  });
});

describe('divideFractions', () => {
  it('divides two fractions', () => {
    const a: Fraction = { whole: 3, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 1, numerator: 1, denominator: 2 };
    // 3 / 1-1/2 = 3 / (3/2) = 3 * 2/3 = 2
    expect(divideFractions(a, b)).toEqual({ whole: 2, numerator: 0, denominator: 1 });
  });

  it('divides by whole number', () => {
    const a: Fraction = { whole: 7, numerator: 3, denominator: 8 };
    const b: Fraction = { whole: 2, numerator: 0, denominator: 1 };
    // 7-3/8 / 2 = 59/8 / 2 = 59/16 = 3-11/16
    expect(divideFractions(a, b)).toEqual({ whole: 3, numerator: 11, denominator: 16 });
  });

  it('handles division by zero', () => {
    const a: Fraction = { whole: 5, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 0, numerator: 0, denominator: 1 };
    expect(divideFractions(a, b)).toEqual({ whole: 0, numerator: 0, denominator: 1 });
  });
});

describe('parseFraction', () => {
  it('parses whole numbers', () => {
    expect(parseFraction('5')).toEqual({ whole: 5, numerator: 0, denominator: 1 });
    expect(parseFraction('123')).toEqual({ whole: 123, numerator: 0, denominator: 1 });
  });

  it('parses simple fractions', () => {
    expect(parseFraction('3/4')).toEqual({ whole: 0, numerator: 3, denominator: 4 });
    expect(parseFraction('1/16')).toEqual({ whole: 0, numerator: 1, denominator: 16 });
  });

  it('parses mixed numbers with hyphen', () => {
    expect(parseFraction('2-3/4')).toEqual({ whole: 2, numerator: 3, denominator: 4 });
    expect(parseFraction('10-1/8')).toEqual({ whole: 10, numerator: 1, denominator: 8 });
  });

  it('parses mixed numbers with space', () => {
    expect(parseFraction('2 3/4')).toEqual({ whole: 2, numerator: 3, denominator: 4 });
  });

  it('parses negative numbers', () => {
    expect(parseFraction('-5')).toEqual({ whole: -5, numerator: 0, denominator: 1 });
    expect(parseFraction('-3/4')).toEqual({ whole: 0, numerator: -3, denominator: 4 });
    expect(parseFraction('-2-3/4')).toEqual({ whole: -2, numerator: 3, denominator: 4 });
  });

  it('returns null for invalid input', () => {
    expect(parseFraction('')).toBeNull();
    expect(parseFraction('abc')).toBeNull();
    expect(parseFraction('1/0')).toBeNull();
  });

  it('handles whitespace', () => {
    expect(parseFraction('  5  ')).toEqual({ whole: 5, numerator: 0, denominator: 1 });
  });
});

describe('formatFraction', () => {
  it('formats whole numbers', () => {
    expect(formatFraction({ whole: 5, numerator: 0, denominator: 1 })).toBe('5');
    expect(formatFraction({ whole: 0, numerator: 0, denominator: 1 })).toBe('0');
  });

  it('formats simple fractions', () => {
    expect(formatFraction({ whole: 0, numerator: 3, denominator: 4 })).toBe('3/4');
  });

  it('formats mixed numbers', () => {
    expect(formatFraction({ whole: 2, numerator: 3, denominator: 4 })).toBe('2-3/4');
  });

  it('formats negative mixed numbers', () => {
    expect(formatFraction({ whole: -2, numerator: 3, denominator: 4 })).toBe('-2-3/4');
  });
});

describe('fractionToDecimal', () => {
  it('converts whole numbers', () => {
    expect(fractionToDecimal({ whole: 5, numerator: 0, denominator: 1 })).toBe(5);
  });

  it('converts fractions', () => {
    expect(fractionToDecimal({ whole: 0, numerator: 1, denominator: 2 })).toBe(0.5);
    expect(fractionToDecimal({ whole: 0, numerator: 1, denominator: 4 })).toBe(0.25);
  });

  it('converts mixed numbers', () => {
    expect(fractionToDecimal({ whole: 2, numerator: 1, denominator: 2 })).toBe(2.5);
    expect(fractionToDecimal({ whole: 3, numerator: 3, denominator: 4 })).toBe(3.75);
  });

  it('converts negative values', () => {
    expect(fractionToDecimal({ whole: -2, numerator: 1, denominator: 2 })).toBe(-2.5);
  });

  it('handles common woodworking fractions', () => {
    expect(fractionToDecimal({ whole: 0, numerator: 1, denominator: 8 })).toBe(0.125);
    expect(fractionToDecimal({ whole: 0, numerator: 1, denominator: 16 })).toBe(0.0625);
    expect(fractionToDecimal({ whole: 0, numerator: 1, denominator: 32 })).toBe(0.03125);
  });
});

describe('calculate', () => {
  it('performs addition', () => {
    const a: Fraction = { whole: 1, numerator: 1, denominator: 2 };
    const b: Fraction = { whole: 2, numerator: 1, denominator: 4 };
    expect(calculate(a, b, '+')).toEqual({ whole: 3, numerator: 3, denominator: 4 });
  });

  it('performs subtraction', () => {
    const a: Fraction = { whole: 3, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 1, numerator: 1, denominator: 4 };
    expect(calculate(a, b, '-')).toEqual({ whole: 1, numerator: 3, denominator: 4 });
  });

  it('performs multiplication', () => {
    const a: Fraction = { whole: 2, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 3, numerator: 1, denominator: 2 };
    expect(calculate(a, b, '×')).toEqual({ whole: 7, numerator: 0, denominator: 1 });
  });

  it('performs division', () => {
    const a: Fraction = { whole: 6, numerator: 0, denominator: 1 };
    const b: Fraction = { whole: 2, numerator: 0, denominator: 1 };
    expect(calculate(a, b, '÷')).toEqual({ whole: 3, numerator: 0, denominator: 1 });
  });
});

describe('woodworking scenarios', () => {
  it('calculates board length for multiple pieces', () => {
    // Need 4 pieces at 12-3/4" each
    const pieceLength: Fraction = { whole: 12, numerator: 3, denominator: 4 };
    const pieces: Fraction = { whole: 4, numerator: 0, denominator: 1 };
    const total = multiplyFractions(pieceLength, pieces);
    expect(total).toEqual({ whole: 51, numerator: 0, denominator: 1 });
  });

  it('calculates remaining length after cuts', () => {
    // 96" board, cut off 23-5/8"
    const boardLength: Fraction = { whole: 96, numerator: 0, denominator: 1 };
    const cutLength: Fraction = { whole: 23, numerator: 5, denominator: 8 };
    const remaining = subtractFractions(boardLength, cutLength);
    expect(remaining).toEqual({ whole: 72, numerator: 3, denominator: 8 });
  });

  it('divides board into equal pieces', () => {
    // Divide 48" into 6 pieces
    const boardLength: Fraction = { whole: 48, numerator: 0, denominator: 1 };
    const numPieces: Fraction = { whole: 6, numerator: 0, denominator: 1 };
    const pieceLength = divideFractions(boardLength, numPieces);
    expect(pieceLength).toEqual({ whole: 8, numerator: 0, denominator: 1 });
  });

  it('adds dado depth to material thickness', () => {
    // 3/4" material + 1/4" dado = 1"
    const material: Fraction = { whole: 0, numerator: 3, denominator: 4 };
    const dado: Fraction = { whole: 0, numerator: 1, denominator: 4 };
    const total = addFractions(material, dado);
    expect(total).toEqual({ whole: 1, numerator: 0, denominator: 1 });
  });
});
