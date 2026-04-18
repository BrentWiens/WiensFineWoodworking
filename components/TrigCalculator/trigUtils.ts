// Right triangle solver utility functions
// Reuses Fraction type and helpers from FractionalCalculator

import {
  type Fraction,
  reduceFraction,
  fractionToDecimal,
  formatFraction,
  parseFraction,
} from '../FractionalCalculator/fractionalUtils';

export interface TriangleValues {
  a: number | null; // side opposite angle A
  b: number | null; // side opposite angle B
  c: number | null; // hypotenuse (opposite the right angle C)
  A: number | null; // angle A in degrees
  B: number | null; // angle B in degrees
}

export interface SolveResult {
  values: TriangleValues;
  error: string | null;
}

// Parse user input: accepts decimals ("3.5") or fractions ("3-1/2", "1/4")
export function parseInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try as a plain number first
  const num = parseFloat(trimmed);
  if (!isNaN(num) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return num;
  }

  // Try as a fraction
  const fraction = parseFraction(trimmed);
  if (fraction) {
    return fractionToDecimal(fraction);
  }

  return null;
}

// Convert a decimal to a fraction approximation (max denominator 64)
export function decimalToFraction(value: number, maxDenominator: number = 64): Fraction {
  if (Number.isInteger(value)) {
    return { whole: value, numerator: 0, denominator: 1 };
  }

  const sign = value < 0 ? -1 : 1;
  const absValue = Math.abs(value);
  const whole = Math.floor(absValue);
  const decimal = absValue - whole;

  if (decimal < 1e-10) {
    return { whole: sign * whole, numerator: 0, denominator: 1 };
  }

  let bestNumerator = 0;
  let bestDenominator = 1;
  let bestError = decimal;

  for (let d = 1; d <= maxDenominator; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);
    if (error < bestError) {
      bestError = error;
      bestNumerator = n;
      bestDenominator = d;
      if (error < 1e-10) break;
    }
  }

  if (bestNumerator >= bestDenominator) {
    return { whole: sign * (whole + 1), numerator: 0, denominator: 1 };
  }

  const reduced = reduceFraction(bestNumerator, bestDenominator);

  return {
    whole: sign * whole,
    numerator: reduced.numerator,
    denominator: reduced.denominator,
  };
}

// Format a number for display: decimal with up to 4 decimal places
export function formatDecimal(value: number): string {
  return parseFloat(value.toFixed(4)).toString();
}

// Format a side value: max 3 decimal places
export function formatSide(value: number): string {
  return parseFloat(value.toFixed(3)).toString();
}

// Format an angle value: 1 decimal place
export function formatAngle(value: number): string {
  return parseFloat(value.toFixed(1)).toString();
}

// Format a number as a fraction string
export function formatAsFraction(value: number): string {
  const fraction = decimalToFraction(value);
  return formatFraction(fraction);
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

// Count how many values are provided (non-null)
function countKnown(values: TriangleValues): number {
  let count = 0;
  if (values.a !== null) count++;
  if (values.b !== null) count++;
  if (values.c !== null) count++;
  if (values.A !== null) count++;
  if (values.B !== null) count++;
  return count;
}

// Solve a right triangle given at least 2 known values (one must be a side)
export function solveTriangle(input: TriangleValues): SolveResult {
  const known = countKnown(input);

  if (known < 2) {
    return { values: input, error: 'Enter at least 2 values to solve the triangle.' };
  }

  let { a, b, c, A, B } = input;

  // Validate provided values
  if (a !== null && a <= 0) return { values: input, error: 'Side a must be positive.' };
  if (b !== null && b <= 0) return { values: input, error: 'Side b must be positive.' };
  if (c !== null && c <= 0) return { values: input, error: 'Side c must be positive.' };
  if (A !== null && (A <= 0 || A >= 90)) return { values: input, error: 'Angle A must be between 0° and 90°.' };
  if (B !== null && (B <= 0 || B >= 90)) return { values: input, error: 'Angle B must be between 0° and 90°.' };

  // If both angles are given, check they sum to 90
  if (A !== null && B !== null && Math.abs(A + B - 90) > 0.001) {
    return { values: input, error: 'Angles A and B must sum to 90°.' };
  }

  // Need at least one side
  if (a === null && b === null && c === null) {
    return { values: input, error: 'At least one side must be provided.' };
  }

  // Derive missing angle from the other
  if (A !== null && B === null) B = 90 - A;
  if (B !== null && A === null) A = 90 - B;

  // Now solve for sides using available info
  // Case: two sides known
  if (a !== null && b !== null && c === null) {
    c = Math.sqrt(a * a + b * b);
  } else if (a !== null && c !== null && b === null) {
    if (a >= c) return { values: input, error: 'Hypotenuse c must be greater than side a.' };
    b = Math.sqrt(c * c - a * a);
  } else if (b !== null && c !== null && a === null) {
    if (b >= c) return { values: input, error: 'Hypotenuse c must be greater than side b.' };
    a = Math.sqrt(c * c - b * b);
  }

  // Case: one side and one angle known — solve for the other sides
  if (A !== null) {
    const sinA = Math.sin(degreesToRadians(A));
    const cosA = Math.cos(degreesToRadians(A));
    const tanA = Math.tan(degreesToRadians(A));

    if (a !== null && b === null) b = a / tanA;
    if (a !== null && c === null) c = a / sinA;
    if (b !== null && a === null) a = b * tanA;
    if (b !== null && c === null) c = b / cosA;
    if (c !== null && a === null) a = c * sinA;
    if (c !== null && b === null) b = c * cosA;
  }

  // Derive angles from sides if still missing
  if (A === null && a !== null && c !== null) {
    A = radiansToDegrees(Math.asin(a / c));
  }
  if (B === null && A !== null) {
    B = 90 - A;
  }
  if (A === null && B !== null) {
    A = 90 - B;
  }

  // Final Pythagorean check
  if (a !== null && b !== null && c !== null) {
    const expected = Math.sqrt(a * a + b * b);
    if (Math.abs(expected - c) > 0.01 * c) {
      return { values: input, error: 'The given sides do not form a valid right triangle.' };
    }
  }

  return {
    values: { a, b, c, A, B },
    error: null,
  };
}

export { type Fraction, fractionToDecimal, formatFraction };
