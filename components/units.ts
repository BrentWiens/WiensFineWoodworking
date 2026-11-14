import { parseMeasurement } from './FractionalCalculator/fractionalUtils';

export type UnitSystem = 'imperial' | 'metric';

const MM_PER_INCH = 25.4;

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

export function unitLabel(units: UnitSystem): string {
  return units === 'metric' ? 'mm' : 'in';
}

/**
 * Converts a typed measurement to the other unit system, for when the unit toggle
 * is flipped with values already entered. Blank or unreadable text is left alone.
 *
 * Rounds to 0.001 mm or 0.0001 in — fine enough that common sizes survive a round
 * trip (1/16 in → 1.588 mm → 0.0625 in), without printing float noise.
 */
export function convertMeasurement(value: string, from: UnitSystem, to: UnitSystem): string {
  if (from === to) return value;

  const parsed = parseMeasurement(value);
  if (parsed === null) return value;

  const converted = to === 'metric' ? inchesToMm(parsed) : mmToInches(parsed);
  return String(parseFloat(converted.toFixed(to === 'metric' ? 3 : 4)));
}
