import { describe, it, expect } from 'vitest';
import {
  calculateBoardFeet,
  formatBoardFeet,
  isValidNumericInput,
} from './boardFeetUtils';

describe('calculateBoardFeet', () => {
  it('calculates 1 board foot correctly (1" x 12" x 12")', () => {
    const result = calculateBoardFeet({
      thickness: 1,
      width: 12,
      length: 12,
      quantity: 1,
    });

    expect(result.boardFeet).toBe(1);
    expect(result.totalBoardFeet).toBe(1);
    expect(result.isValid).toBe(true);
  });

  it('calculates standard lumber dimensions', () => {
    // 4/4 (1") x 6" x 8' (96") = 4 board feet
    const result = calculateBoardFeet({
      thickness: 1,
      width: 6,
      length: 96,
      quantity: 1,
    });

    expect(result.boardFeet).toBe(4);
    expect(result.totalBoardFeet).toBe(4);
    expect(result.isValid).toBe(true);
  });

  it('handles fractional thickness', () => {
    // 1.5" x 6" x 96" = 6 board feet
    const result = calculateBoardFeet({
      thickness: 1.5,
      width: 6,
      length: 96,
      quantity: 1,
    });

    expect(result.boardFeet).toBe(6);
    expect(result.totalBoardFeet).toBe(6);
    expect(result.isValid).toBe(true);
  });

  it('multiplies by quantity correctly', () => {
    const result = calculateBoardFeet({
      thickness: 1,
      width: 12,
      length: 12,
      quantity: 5,
    });

    expect(result.boardFeet).toBe(1);
    expect(result.totalBoardFeet).toBe(5);
    expect(result.isValid).toBe(true);
  });

  it('returns invalid for zero thickness', () => {
    const result = calculateBoardFeet({
      thickness: 0,
      width: 12,
      length: 12,
      quantity: 1,
    });

    expect(result.boardFeet).toBe(0);
    expect(result.totalBoardFeet).toBe(0);
    expect(result.isValid).toBe(false);
  });

  it('returns invalid for zero width', () => {
    const result = calculateBoardFeet({
      thickness: 1,
      width: 0,
      length: 12,
      quantity: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it('returns invalid for zero length', () => {
    const result = calculateBoardFeet({
      thickness: 1,
      width: 12,
      length: 0,
      quantity: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it('returns invalid for negative dimensions', () => {
    const result = calculateBoardFeet({
      thickness: -1,
      width: 12,
      length: 12,
      quantity: 1,
    });

    expect(result.isValid).toBe(false);
  });

  it('handles zero quantity by treating as 1', () => {
    const result = calculateBoardFeet({
      thickness: 1,
      width: 12,
      length: 12,
      quantity: 0,
    });

    expect(result.boardFeet).toBe(1);
    expect(result.totalBoardFeet).toBe(1);
    expect(result.isValid).toBe(true);
  });

  it('calculates small pieces correctly', () => {
    // 0.5" x 3" x 6" = 0.0625 board feet
    const result = calculateBoardFeet({
      thickness: 0.5,
      width: 3,
      length: 6,
      quantity: 1,
    });

    expect(result.boardFeet).toBeCloseTo(0.0625, 4);
    expect(result.isValid).toBe(true);
  });
});

describe('formatBoardFeet', () => {
  it('formats zero as "0"', () => {
    expect(formatBoardFeet(0)).toBe('0');
  });

  it('formats very small values with 4 decimals', () => {
    expect(formatBoardFeet(0.0052)).toBe('0.0052');
    expect(formatBoardFeet(0.0001)).toBe('0.0001');
  });

  it('formats values less than 1 with 3 decimals', () => {
    expect(formatBoardFeet(0.5)).toBe('0.500');
    expect(formatBoardFeet(0.125)).toBe('0.125');
    expect(formatBoardFeet(0.333)).toBe('0.333');
  });

  it('formats values >= 1 with up to 2 decimals', () => {
    expect(formatBoardFeet(1)).toBe('1');
    expect(formatBoardFeet(1.5)).toBe('1.5');
    expect(formatBoardFeet(2.25)).toBe('2.25');
    expect(formatBoardFeet(10.123)).toBe('10.12');
  });

  it('strips trailing zeros for values >= 1', () => {
    expect(formatBoardFeet(5.0)).toBe('5');
    expect(formatBoardFeet(3.10)).toBe('3.1');
  });
});

describe('isValidNumericInput', () => {
  it('allows empty string', () => {
    expect(isValidNumericInput('')).toBe(true);
  });

  it('allows whole numbers', () => {
    expect(isValidNumericInput('0')).toBe(true);
    expect(isValidNumericInput('1')).toBe(true);
    expect(isValidNumericInput('123')).toBe(true);
  });

  it('allows decimal numbers', () => {
    expect(isValidNumericInput('1.5')).toBe(true);
    expect(isValidNumericInput('0.25')).toBe(true);
    expect(isValidNumericInput('.5')).toBe(true);
    expect(isValidNumericInput('10.125')).toBe(true);
  });

  it('allows trailing decimal point', () => {
    expect(isValidNumericInput('1.')).toBe(true);
  });

  it('rejects letters', () => {
    expect(isValidNumericInput('abc')).toBe(false);
    expect(isValidNumericInput('1a')).toBe(false);
    expect(isValidNumericInput('a1')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidNumericInput('-1')).toBe(false);
    expect(isValidNumericInput('+1')).toBe(false);
    expect(isValidNumericInput('1,000')).toBe(false);
    expect(isValidNumericInput('1/2')).toBe(false);
  });

  it('rejects multiple decimal points', () => {
    expect(isValidNumericInput('1.2.3')).toBe(false);
  });
});
