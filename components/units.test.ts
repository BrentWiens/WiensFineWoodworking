import { describe, it, expect } from 'vitest';
import { convertMeasurement, inchesToMm, mmToInches, unitLabel } from './units';

describe('unit helpers', () => {
  it('converts between inches and millimetres', () => {
    expect(inchesToMm(1)).toBe(25.4);
    expect(mmToInches(50.8)).toBe(2);
  });

  it('labels each system', () => {
    expect(unitLabel('imperial')).toBe('in');
    expect(unitLabel('metric')).toBe('mm');
  });
});

describe('convertMeasurement', () => {
  it('converts inches to millimetres', () => {
    expect(convertMeasurement('48', 'imperial', 'metric')).toBe('1219.2');
    expect(convertMeasurement('0.125', 'imperial', 'metric')).toBe('3.175');
  });

  it('converts millimetres to inches', () => {
    expect(convertMeasurement('2440', 'metric', 'imperial')).toBe('96.063');
    expect(convertMeasurement('19', 'metric', 'imperial')).toBe('0.748');
  });

  it('reads fractions before converting', () => {
    expect(convertMeasurement('23 1/2', 'imperial', 'metric')).toBe('596.9');
    expect(convertMeasurement('3/4', 'imperial', 'metric')).toBe('19.05');
  });

  it('brings common sizes back to where they started', () => {
    for (const inches of ['48', '96', '0.125', '0.0625', '0.75', '23.5']) {
      const mm = convertMeasurement(inches, 'imperial', 'metric');
      expect(convertMeasurement(mm, 'metric', 'imperial')).toBe(inches);
    }
  });

  it('leaves blank, unreadable and same-system values untouched', () => {
    expect(convertMeasurement('', 'imperial', 'metric')).toBe('');
    expect(convertMeasurement('abc', 'imperial', 'metric')).toBe('abc');
    expect(convertMeasurement('48', 'imperial', 'imperial')).toBe('48');
  });
});
