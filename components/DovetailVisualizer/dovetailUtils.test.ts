import { describe, it, expect } from 'vitest'
import {
  decimalToFraction,
  formatDimension,
  calculateGeometry,
  getWarnings,
  DEFAULT_PARAMS,
  ANGLE_RATIOS,
  DovetailParams,
} from './dovetailUtils'

describe('decimalToFraction', () => {
  it('returns null for whole numbers', () => {
    expect(decimalToFraction(1)).toBeNull()
    expect(decimalToFraction(5)).toBeNull()
    expect(decimalToFraction(0)).toBeNull()
  })

  it('converts common fractions correctly', () => {
    expect(decimalToFraction(0.5)).toBe('1/2')
    expect(decimalToFraction(0.25)).toBe('1/4')
    expect(decimalToFraction(0.75)).toBe('3/4')
    expect(decimalToFraction(0.125)).toBe('1/8')
    expect(decimalToFraction(0.375)).toBe('3/8')
    expect(decimalToFraction(0.625)).toBe('5/8')
    expect(decimalToFraction(0.875)).toBe('7/8')
  })

  it('converts mixed numbers correctly', () => {
    expect(decimalToFraction(1.5)).toBe('1-1/2')
    expect(decimalToFraction(2.25)).toBe('2-1/4')
    expect(decimalToFraction(3.75)).toBe('3-3/4')
    expect(decimalToFraction(5.125)).toBe('5-1/8')
  })

  it('handles 16ths', () => {
    expect(decimalToFraction(0.0625)).toBe('1/16')
    expect(decimalToFraction(0.1875)).toBe('3/16')
    expect(decimalToFraction(0.3125)).toBe('5/16')
  })

  it('handles 32nds', () => {
    expect(decimalToFraction(0.03125)).toBe('1/32')
    expect(decimalToFraction(0.09375)).toBe('3/32')
  })

  it('reduces fractions to lowest terms', () => {
    expect(decimalToFraction(0.5)).toBe('1/2')
    expect(decimalToFraction(0.25)).toBe('1/4')
  })
})

describe('formatDimension', () => {
  it('formats whole numbers without fraction', () => {
    expect(formatDimension(1)).toBe('1')
    expect(formatDimension(5)).toBe('5')
    expect(formatDimension(10)).toBe('10')
  })

  it('formats decimals with fractions', () => {
    expect(formatDimension(1.5)).toBe('1.5 (1-1/2)')
    expect(formatDimension(2.25)).toBe('2.25 (2-1/4)')
    expect(formatDimension(0.75)).toBe('0.75 (3/4)')
  })

  it('handles small fractions', () => {
    expect(formatDimension(0.125)).toBe('0.125 (1/8)')
    expect(formatDimension(0.0625)).toBe('0.0625 (1/16)')
  })

  it('rounds to 4 decimal places', () => {
    expect(formatDimension(1.23456789)).toBe('1.2346')
  })
})

describe('ANGLE_RATIOS', () => {
  it('has correct ratio values', () => {
    expect(ANGLE_RATIOS['1:4']).toBe(0.25)
    expect(ANGLE_RATIOS['1:6']).toBeCloseTo(0.1667, 3)
    expect(ANGLE_RATIOS['1:8']).toBe(0.125)
  })
})

describe('calculateGeometry', () => {
  it('calculates geometry with default params', () => {
    const geometry = calculateGeometry(DEFAULT_PARAMS)

    expect(geometry.boardWidth).toBe(8)
    expect(geometry.thickness).toBe(0.5)
    expect(geometry.numberOfTails).toBe(3)
    expect(geometry.ratio).toBe(0.125)
    expect(geometry.topOffset).toBe(0)
    expect(geometry.bottomOffset).toBe(0)
  })

  it('calculates auto tail/pin widths evenly', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      boardWidth: 6,
      numberOfTails: 2,
    }
    const geometry = calculateGeometry(params)

    // 2 tails + 1 pin + 2 half-pins = 4 divisions
    // 6 / 4 = 1.5 per division
    expect(geometry.tailWidth).toBe(1.5)
    expect(geometry.pinWidth).toBe(1.5)
    expect(geometry.halfPinWidth).toBe(0.75)
  })

  it('respects manual tail width', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      boardWidth: 8,
      numberOfTails: 3,
      tailWidth: 1.5,
    }
    const geometry = calculateGeometry(params)

    expect(geometry.tailWidth).toBe(1.5)
    expect(geometry.pinWidth).toBe(1) // default when tailWidth is set but not pinWidth
  })

  it('respects manual pin width', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      boardWidth: 8,
      numberOfTails: 3,
      pinWidth: 0.75,
    }
    const geometry = calculateGeometry(params)

    expect(geometry.pinWidth).toBe(0.75)
    expect(geometry.tailWidth).toBe(1) // default when pinWidth is set but not tailWidth
  })

  it('calculates tail extension based on angle', () => {
    const params1: DovetailParams = { ...DEFAULT_PARAMS, tailAngle: '1:8' }
    const params2: DovetailParams = { ...DEFAULT_PARAMS, tailAngle: '1:6' }
    const params3: DovetailParams = { ...DEFAULT_PARAMS, tailAngle: '1:4' }

    const g1 = calculateGeometry(params1)
    const g2 = calculateGeometry(params2)
    const g3 = calculateGeometry(params3)

    // tailExtension = thickness * ratio
    expect(g1.tailExtension).toBe(0.5 * 0.125)
    expect(g2.tailExtension).toBeCloseTo(0.5 * (1/6), 5)
    expect(g3.tailExtension).toBe(0.5 * 0.25)
  })

  it('accounts for top and bottom offsets', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      boardWidth: 10,
      numberOfTails: 2,
      topOffset: 1,
      bottomOffset: 1,
    }
    const geometry = calculateGeometry(params)

    // Available width = 10 - 1 - 1 = 8
    expect(geometry.topOffset).toBe(1)
    expect(geometry.bottomOffset).toBe(1)
  })

  it('preserves board lengths', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      pinPieceLength: 15,
      tailPieceLength: 8,
    }
    const geometry = calculateGeometry(params)

    expect(geometry.totalPinLength).toBe(15)
    expect(geometry.totalTailLength).toBe(8)
  })
})

describe('getWarnings', () => {
  it('returns empty array for valid geometry', () => {
    const geometry = calculateGeometry(DEFAULT_PARAMS)
    const warnings = getWarnings(geometry)

    expect(warnings).toEqual([])
  })

  it('warns when board is too narrow', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      boardWidth: 2,
      numberOfTails: 10,
      tailWidth: 1,
      pinWidth: 1,
    }
    const geometry = calculateGeometry(params)
    const warnings = getWarnings(geometry)

    expect(warnings).toContain('Board too narrow for the number of tails specified')
  })

  it('warns when thickness exceeds board length', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      thickness: 10,
      tailPieceLength: 5,
      pinPieceLength: 5,
    }
    const geometry = calculateGeometry(params)
    const warnings = getWarnings(geometry)

    expect(warnings).toContain('Material thickness exceeds board length')
  })

  it('warns when tail angle is too steep', () => {
    const params: DovetailParams = {
      ...DEFAULT_PARAMS,
      thickness: 2,
      tailAngle: '1:4',
      boardWidth: 4,
      numberOfTails: 3,
      tailWidth: 0.5,
      pinWidth: 0.5,
    }
    const geometry = calculateGeometry(params)
    const warnings = getWarnings(geometry)

    expect(warnings).toContain('Tail angle too steep for tail width - tails will have no base width')
  })
})
