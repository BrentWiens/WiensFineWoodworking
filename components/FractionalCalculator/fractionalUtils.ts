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

// Convert improper fraction to mixed number
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

  return {
    whole: sign * whole,
    numerator: finalReduced.numerator,
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

// Divide two fractions
export function divideFractions(a: Fraction, b: Fraction): Fraction {
  const aImp = toImproper(a);
  const bImp = toImproper(b);

  if (bImp.numerator === 0) {
    return { whole: 0, numerator: 0, denominator: 1 }; // Division by zero
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

// Common woodworking fractions
export const COMMON_FRACTIONS = [
  { label: '1/2', numerator: 1, denominator: 2 },
  { label: '1/4', numerator: 1, denominator: 4 },
  { label: '3/4', numerator: 3, denominator: 4 },
  { label: '1/8', numerator: 1, denominator: 8 },
  { label: '3/8', numerator: 3, denominator: 8 },
  { label: '5/8', numerator: 5, denominator: 8 },
  { label: '7/8', numerator: 7, denominator: 8 },
  { label: '1/16', numerator: 1, denominator: 16 },
  { label: '3/16', numerator: 3, denominator: 16 },
  { label: '5/16', numerator: 5, denominator: 16 },
  { label: '7/16', numerator: 7, denominator: 16 },
  { label: '9/16', numerator: 9, denominator: 16 },
  { label: '11/16', numerator: 11, denominator: 16 },
  { label: '13/16', numerator: 13, denominator: 16 },
  { label: '15/16', numerator: 15, denominator: 16 },
  { label: '1/32', numerator: 1, denominator: 32 },
] as const;

export type Operation = '+' | '-' | '×' | '÷';

export interface CalculatorState {
  display: string;
  currentValue: Fraction | null;
  previousValue: Fraction | null;
  operation: Operation | null;
  waitingForOperand: boolean;
  history: string;
}

export const INITIAL_STATE: CalculatorState = {
  display: '0',
  currentValue: null,
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  history: '',
};

// Perform calculation
export function calculate(a: Fraction, b: Fraction, op: Operation): Fraction {
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
