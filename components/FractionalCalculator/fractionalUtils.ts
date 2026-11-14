// Fractional calculator utility functions and types

export interface Fraction {
  whole: number;
  numerator: number;
  denominator: number;
}

// Greatest common divisor using Euclidean algorithm
export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

// Least common multiple
export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

// Reduce a fraction to lowest terms
export function reduceFraction(numerator: number, denominator: number): { numerator: number; denominator: number } {
  if (denominator === 0) return { numerator: 0, denominator: 1 };
  const divisor = gcd(numerator, denominator);
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

// Convert mixed number to improper fraction
export function toImproper(fraction: Fraction): { numerator: number; denominator: number } {
  const sign = fraction.whole < 0 ? -1 : 1;
  const absWhole = Math.abs(fraction.whole);
  return {
    numerator: sign * (absWhole * fraction.denominator + fraction.numerator),
    denominator: fraction.denominator,
  };
}

// Convert improper fraction to mixed number.
// The sign lives on the whole part, or on the numerator when the whole part is 0
// (so -1/4 is { whole: 0, numerator: -1, denominator: 4 }).
export function toMixed(numerator: number, denominator: number): Fraction {
  if (denominator === 0) return { whole: 0, numerator: 0, denominator: 1 };

  const sign = (numerator < 0) !== (denominator < 0) ? -1 : 1;
  numerator = Math.abs(numerator);
  denominator = Math.abs(denominator);

  const reduced = reduceFraction(numerator, denominator);
  const whole = Math.floor(reduced.numerator / reduced.denominator);
  const remainder = reduced.numerator % reduced.denominator;

  // Further reduce the remainder
  const finalReduced = reduceFraction(remainder, reduced.denominator);

  // `|| 0` turns the -0 that sign * 0 produces back into a plain 0
  return {
    whole: sign * whole || 0,
    numerator: whole === 0 ? sign * finalReduced.numerator || 0 : finalReduced.numerator,
    denominator: finalReduced.denominator,
  };
}

// Add two fractions
export function addFractions(a: Fraction, b: Fraction): Fraction {
  const aImp = toImproper(a);
  const bImp = toImproper(b);

  const commonDenom = lcm(aImp.denominator, bImp.denominator);
  const aNum = aImp.numerator * (commonDenom / aImp.denominator);
  const bNum = bImp.numerator * (commonDenom / bImp.denominator);

  return toMixed(aNum + bNum, commonDenom);
}

// Subtract two fractions
export function subtractFractions(a: Fraction, b: Fraction): Fraction {
  const negB: Fraction = {
    whole: -b.whole,
    numerator: b.numerator,
    denominator: b.denominator,
  };
  // Handle the case where whole is 0 but we need to negate the fraction
  if (b.whole === 0 && b.numerator !== 0) {
    negB.numerator = -b.numerator;
    negB.whole = 0;
  }
  return addFractions(a, negB);
}

// Multiply two fractions
export function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  const aImp = toImproper(a);
  const bImp = toImproper(b);

  return toMixed(aImp.numerator * bImp.numerator, aImp.denominator * bImp.denominator);
}

// Divide two fractions. Returns null when dividing by zero.
export function divideFractions(a: Fraction, b: Fraction): Fraction | null {
  const aImp = toImproper(a);
  const bImp = toImproper(b);

  if (bImp.numerator === 0) {
    return null;
  }

  return toMixed(aImp.numerator * bImp.denominator, aImp.denominator * bImp.numerator);
}

// Parse a string to a fraction
export function parseFraction(str: string): Fraction | null {
  str = str.trim();
  if (!str) return null;

  // Handle negative sign
  const isNegative = str.startsWith('-');
  if (isNegative) str = str.slice(1).trim();

  // Check for mixed number like "2-1/4" or "2 1/4"
  const mixedMatch = str.match(/^(\d+)[-\s]+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    if (denominator === 0) return null;
    return {
      whole: isNegative ? -whole : whole,
      numerator,
      denominator,
    };
  }

  // Check for simple fraction like "1/4"
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    if (denominator === 0) return null;
    return {
      whole: 0,
      numerator: isNegative ? -numerator : numerator,
      denominator,
    };
  }

  // Check for whole number
  const wholeMatch = str.match(/^(\d+)$/);
  if (wholeMatch) {
    const whole = parseInt(wholeMatch[1], 10);
    return {
      whole: isNegative ? -whole : whole,
      numerator: 0,
      denominator: 1,
    };
  }

  return null;
}

// Parse a typed measurement: a decimal ("3.5"), a fraction ("3/4") or a mixed
// number ("3-1/2" or "3 1/2"). Returns null for anything else.
export function parseMeasurement(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^-?(\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return parseFloat(trimmed);
  }

  const fraction = parseFraction(trimmed);
  return fraction ? fractionToDecimal(fraction) : null;
}

// Round to the nearest 1/denominator. The default of 64 gives tape-measure fractions.
export function toNearestFraction(value: number, denominator: number = 64): Fraction {
  return toMixed(Math.round(value * denominator), denominator);
}

// What the calculator's three number pads currently hold. The strings are always
// unsigned; `whole` may carry a decimal part ("2.5").
export interface FractionEntry {
  whole: string;
  numerator: string;
  denominator: string;
  negative: boolean;
}

// Combine a keypad entry into a single reduced fraction
export function entryToFraction(entry: FractionEntry): Fraction {
  const [intPart, decimalPart = ''] = entry.whole.split('.');
  const wholeInt = parseInt(intPart, 10) || 0;
  const decimalNum = parseInt(decimalPart, 10) || 0;
  const decimalDenom = Math.pow(10, decimalPart.length);
  const numerator = parseInt(entry.numerator, 10) || 0;
  // An empty or zero denominator is treated as 1
  const denominator = parseInt(entry.denominator, 10) || 1;

  // wholeInt + decimalNum/decimalDenom + numerator/denominator, over one denominator
  const combinedDenom = decimalDenom * denominator;
  const combinedNum = wholeInt * combinedDenom + decimalNum * denominator + numerator * decimalDenom;

  return toMixed(entry.negative ? -combinedNum : combinedNum, combinedDenom);
}

export function isNegativeFraction(fraction: Fraction): boolean {
  return fraction.whole < 0 || fraction.numerator < 0;
}

// Format a fraction as a string
export function formatFraction(fraction: Fraction): string {
  const { whole, numerator, denominator } = fraction;

  if (numerator === 0) {
    return whole.toString();
  }

  if (whole === 0) {
    return `${numerator}/${denominator}`;
  }

  // Handle negative mixed numbers
  if (whole < 0) {
    return `${whole}-${Math.abs(numerator)}/${denominator}`;
  }

  return `${whole}-${numerator}/${denominator}`;
}

// Convert fraction to decimal
export function fractionToDecimal(fraction: Fraction): number {
  const { whole, numerator, denominator } = fraction;
  if (denominator === 0) return whole;

  const sign = whole < 0 ? -1 : 1;
  return sign * (Math.abs(whole) + numerator / denominator);
}

export type Operation = '+' | '-' | '×' | '÷';

// Perform calculation. Returns null when dividing by zero.
export function calculate(a: Fraction, b: Fraction, op: Operation): Fraction | null {
  switch (op) {
    case '+':
      return addFractions(a, b);
    case '-':
      return subtractFractions(a, b);
    case '×':
      return multiplyFractions(a, b);
    case '÷':
      return divideFractions(a, b);
    default:
      return b;
  }
}
