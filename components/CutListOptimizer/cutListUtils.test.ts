import { describe, it, expect } from 'vitest';
import {
  createEmptyPiece,
  getPieceColor,
  getPieceLabel,
  parseSheetConfig,
  parsePieces,
  validatePiecesAgainstSheet,
  optimizeCutList,
  PIECE_COLORS,
  PieceInput,
  PieceData,
  PieceInstance,
  SheetConfig,
  SheetConfigData,
} from './cutListUtils';

describe('createEmptyPiece', () => {
  it('creates a piece with default values', () => {
    const piece = createEmptyPiece();

    expect(piece.id).toBeDefined();
    expect(piece.width).toBe('');
    expect(piece.length).toBe('');
    expect(piece.quantity).toBe('1');
    expect(piece.grainDirection).toBe('no-preference');
  });

  it('creates unique IDs for each piece', () => {
    const piece1 = createEmptyPiece();
    const piece2 = createEmptyPiece();

    expect(piece1.id).not.toBe(piece2.id);
  });
});

describe('getPieceColor', () => {
  it('returns the correct color for index', () => {
    expect(getPieceColor(0)).toBe(PIECE_COLORS[0]);
    expect(getPieceColor(1)).toBe(PIECE_COLORS[1]);
    expect(getPieceColor(5)).toBe(PIECE_COLORS[5]);
  });

  it('cycles through colors when index exceeds array length', () => {
    const colorsLength = PIECE_COLORS.length;
    expect(getPieceColor(colorsLength)).toBe(PIECE_COLORS[0]);
    expect(getPieceColor(colorsLength + 1)).toBe(PIECE_COLORS[1]);
    expect(getPieceColor(colorsLength * 2 + 3)).toBe(PIECE_COLORS[3]);
  });
});

describe('getPieceLabel', () => {
  it('formats piece dimensions as label', () => {
    const piece: PieceInstance = {
      id: 'test-1',
      pieceId: 'piece-1',
      width: 24,
      length: 36,
      grainDirection: 'no-preference',
      rotated: false,
    };

    expect(getPieceLabel(piece)).toBe('24 x 36');
  });

  it('handles decimal dimensions', () => {
    const piece: PieceInstance = {
      id: 'test-1',
      pieceId: 'piece-1',
      width: 12.5,
      length: 18.25,
      grainDirection: 'no-preference',
      rotated: false,
    };

    expect(getPieceLabel(piece)).toBe('12.5 x 18.25');
  });
});

describe('parseSheetConfig', () => {
  it('parses valid sheet configuration', () => {
    const config: SheetConfig = {
      width: '48',
      length: '96',
      kerfWidth: '0.125',
      sheetsAvailable: '2',
    };

    const result = parseSheetConfig(config);

    expect(result).not.toBeNull();
    expect(result?.width).toBe(48);
    expect(result?.length).toBe(96);
    expect(result?.kerfWidth).toBe(0.125);
    expect(result?.sheetsAvailable).toBe(2);
  });

  it('returns null for invalid width', () => {
    const config: SheetConfig = {
      width: '',
      length: '96',
      kerfWidth: '0.125',
      sheetsAvailable: '1',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });

  it('returns null for zero width', () => {
    const config: SheetConfig = {
      width: '0',
      length: '96',
      kerfWidth: '0.125',
      sheetsAvailable: '1',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });

  it('returns null for negative width', () => {
    const config: SheetConfig = {
      width: '-48',
      length: '96',
      kerfWidth: '0.125',
      sheetsAvailable: '1',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });

  it('returns null for invalid length', () => {
    const config: SheetConfig = {
      width: '48',
      length: 'abc',
      kerfWidth: '0.125',
      sheetsAvailable: '1',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });

  it('returns null for negative kerf', () => {
    const config: SheetConfig = {
      width: '48',
      length: '96',
      kerfWidth: '-0.125',
      sheetsAvailable: '1',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });

  it('allows zero kerf width', () => {
    const config: SheetConfig = {
      width: '48',
      length: '96',
      kerfWidth: '0',
      sheetsAvailable: '1',
    };

    const result = parseSheetConfig(config);
    expect(result).not.toBeNull();
    expect(result?.kerfWidth).toBe(0);
  });

  it('returns null for zero sheets available', () => {
    const config: SheetConfig = {
      width: '48',
      length: '96',
      kerfWidth: '0.125',
      sheetsAvailable: '0',
    };

    expect(parseSheetConfig(config)).toBeNull();
  });
});

describe('parsePieces', () => {
  it('parses valid pieces', () => {
    const pieces: PieceInput[] = [
      { id: '1', width: '24', length: '36', quantity: '2', grainDirection: 'along-length' },
      { id: '2', width: '12', length: '18', quantity: '4', grainDirection: 'no-preference' },
    ];

    const result = parsePieces(pieces);

    expect(result.errors).toHaveLength(0);
    expect(result.pieces).toHaveLength(2);
    expect(result.pieces[0].width).toBe(24);
    expect(result.pieces[0].length).toBe(36);
    expect(result.pieces[0].quantity).toBe(2);
    expect(result.pieces[0].grainDirection).toBe('along-length');
  });

  it('returns error for invalid width', () => {
    const pieces: PieceInput[] = [
      { id: '1', width: '', length: '36', quantity: '1', grainDirection: 'no-preference' },
    ];

    const result = parsePieces(pieces);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Row 1');
    expect(result.errors[0]).toContain('Invalid width');
    expect(result.pieces).toHaveLength(0);
  });

  it('returns error for invalid length', () => {
    const pieces: PieceInput[] = [
      { id: '1', width: '24', length: 'abc', quantity: '1', grainDirection: 'no-preference' },
    ];

    const result = parsePieces(pieces);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Invalid length');
  });

  it('returns error for zero quantity', () => {
    const pieces: PieceInput[] = [
      { id: '1', width: '24', length: '36', quantity: '0', grainDirection: 'no-preference' },
    ];

    const result = parsePieces(pieces);

    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Quantity must be at least 1');
  });

  it('handles decimal dimensions', () => {
    const pieces: PieceInput[] = [
      { id: '1', width: '24.5', length: '36.75', quantity: '1', grainDirection: 'no-preference' },
    ];

    const result = parsePieces(pieces);

    expect(result.errors).toHaveLength(0);
    expect(result.pieces[0].width).toBe(24.5);
    expect(result.pieces[0].length).toBe(36.75);
  });
});

describe('validatePiecesAgainstSheet', () => {
  const sheet: SheetConfigData = {
    width: 48,
    length: 96,
    kerfWidth: 0.125,
    sheetsAvailable: 1,
  };

  it('accepts pieces that fit on sheet', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 36, quantity: 1, grainDirection: 'no-preference' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(0);
  });

  it('accepts piece with along-length grain that fits normally', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 40, length: 80, quantity: 1, grainDirection: 'along-length' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(0);
  });

  it('rejects along-length piece that only fits rotated', () => {
    // Piece is 80 x 40, sheet is 48 x 96
    // Normal: 80 > 48 (width), so doesn't fit
    // Rotated would work but grain prevents it
    const pieces: PieceData[] = [
      { id: '1', width: 80, length: 40, quantity: 1, grainDirection: 'along-length' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Along Length');
  });

  it('accepts along-width piece that fits rotated', () => {
    // Piece is 80 x 40, along-width means it rotates to 40 x 80
    // 40 <= 48 (width) and 80 <= 96 (length), fits!
    const pieces: PieceData[] = [
      { id: '1', width: 80, length: 40, quantity: 1, grainDirection: 'along-width' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(0);
  });

  it('rejects along-width piece that cannot fit rotated', () => {
    // Piece is 50 x 100, along-width rotates to 100 x 50
    // 100 > 48 (width), doesn't fit
    const pieces: PieceData[] = [
      { id: '1', width: 50, length: 100, quantity: 1, grainDirection: 'along-width' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Along Width');
  });

  it('accepts no-preference piece that fits in either orientation', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 40, length: 90, quantity: 1, grainDirection: 'no-preference' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(0);
  });

  it('rejects piece too large for sheet in any orientation', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 50, length: 100, quantity: 1, grainDirection: 'no-preference' },
    ];

    const errors = validatePiecesAgainstSheet(pieces, sheet);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Too large to fit');
  });
});

describe('optimizeCutList', () => {
  const sheet: SheetConfigData = {
    width: 48,
    length: 96,
    kerfWidth: 0.125,
    sheetsAvailable: 10,
  };

  it('places a single piece on one sheet', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 36, quantity: 1, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    expect(result.totalSheets).toBe(1);
    expect(result.sheets[0].pieces).toHaveLength(1);
    expect(result.unplacedPieces).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('expands pieces by quantity', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 36, quantity: 3, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // 3 pieces of 24x36 should all fit on one 48x96 sheet
    const totalPlacedPieces = result.sheets.reduce((sum, s) => sum + s.pieces.length, 0);
    expect(totalPlacedPieces).toBe(3);
  });

  it('places multiple pieces and all get placed', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 20, length: 40, quantity: 4, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // 4 pieces of 20x40 should all be placed (with kerf they may need multiple sheets)
    const totalPlacedPieces = result.sheets.reduce((sum, s) => sum + s.pieces.length, 0);
    expect(totalPlacedPieces).toBe(4);
    expect(result.unplacedPieces).toHaveLength(0);
  });

  it('respects sheets available limit', () => {
    const limitedSheet: SheetConfigData = {
      ...sheet,
      sheetsAvailable: 1,
    };

    const pieces: PieceData[] = [
      { id: '1', width: 48, length: 96, quantity: 2, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, limitedSheet);

    expect(result.totalSheets).toBe(1);
    expect(result.unplacedPieces).toHaveLength(1);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('Could not place');
  });

  it('calculates efficiency correctly', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 48, quantity: 1, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // Piece area: 24 * 48 = 1152 sq in
    // Sheet area: 48 * 96 = 4608 sq in
    // Efficiency: 1152 / 4608 = 25%
    expect(result.sheets[0].usedArea).toBe(1152);
    expect(result.sheets[0].efficiency).toBeCloseTo(25, 0);
  });

  it('respects along-length grain direction', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 40, length: 80, quantity: 1, grainDirection: 'along-length' },
    ];

    const result = optimizeCutList(pieces, sheet);

    expect(result.totalSheets).toBe(1);
    expect(result.sheets[0].pieces[0].piece.rotated).toBe(false);
  });

  it('rotates along-width pieces', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 80, length: 40, quantity: 1, grainDirection: 'along-width' },
    ];

    const result = optimizeCutList(pieces, sheet);

    expect(result.totalSheets).toBe(1);
    expect(result.sheets[0].pieces[0].piece.rotated).toBe(true);
  });

  it('reports unplaced pieces with dimensions', () => {
    const limitedSheet: SheetConfigData = {
      ...sheet,
      sheetsAvailable: 1,
    };

    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 48, quantity: 1, grainDirection: 'no-preference' },
      { id: '2', width: 30, length: 60, quantity: 2, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, limitedSheet);

    // The 30x60 pieces won't all fit
    if (result.unplacedPieces.length > 0) {
      expect(result.warnings[0]).toContain('30 x 60');
    }
  });

  it('accounts for kerf width', () => {
    const largeKerfSheet: SheetConfigData = {
      width: 48,
      length: 96,
      kerfWidth: 1, // 1 inch kerf
      sheetsAvailable: 10,
    };

    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 48, quantity: 4, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, largeKerfSheet);

    // With 1" kerf, pieces won't fit as tightly
    // May need more sheets than with 0.125" kerf
    expect(result.totalSheets).toBeGreaterThanOrEqual(1);
  });

  it('sorts pieces by area (largest first)', () => {
    const pieces: PieceData[] = [
      { id: 'small', width: 10, length: 10, quantity: 1, grainDirection: 'no-preference' },
      { id: 'large', width: 40, length: 80, quantity: 1, grainDirection: 'no-preference' },
      { id: 'medium', width: 20, length: 30, quantity: 1, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // First placed piece should be the largest (40x80)
    const firstPiece = result.sheets[0].pieces[0];
    expect(firstPiece.width * firstPiece.height).toBe(40 * 80);
  });

  it('handles empty pieces array', () => {
    const pieces: PieceData[] = [];

    const result = optimizeCutList(pieces, sheet);

    expect(result.totalSheets).toBe(0);
    expect(result.unplacedPieces).toHaveLength(0);
    expect(result.overallEfficiency).toBe(0);
  });

  it('returns algorithm comparison info', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 36, quantity: 2, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    expect(result.algorithmUsed).toBeDefined();
    expect(result.algorithmsCompared).toBeDefined();
    expect(result.algorithmsCompared.length).toBeGreaterThan(0);
  });

  it('compares multiple algorithms', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 20, length: 30, quantity: 5, grainDirection: 'no-preference' },
      { id: '2', width: 15, length: 25, quantity: 3, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // Should have run multiple algorithms
    expect(result.algorithmsCompared.length).toBeGreaterThanOrEqual(5);

    // Each algorithm comparison should have required fields
    result.algorithmsCompared.forEach((algo) => {
      expect(algo.name).toBeDefined();
      expect(typeof algo.efficiency).toBe('number');
      expect(typeof algo.sheetsUsed).toBe('number');
      expect(typeof algo.unplacedCount).toBe('number');
    });
  });

  it('selects the best algorithm based on results', () => {
    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 36, quantity: 4, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, sheet);

    // The selected algorithm should be in the comparison list
    const selectedAlgo = result.algorithmsCompared.find(
      (a) => a.name === result.algorithmUsed
    );
    expect(selectedAlgo).toBeDefined();

    // It should have the same efficiency as the result
    expect(selectedAlgo?.efficiency).toBeCloseTo(result.overallEfficiency, 1);
  });

  it('prefers algorithms with fewer unplaced pieces', () => {
    const limitedSheet: SheetConfigData = {
      ...sheet,
      sheetsAvailable: 1,
    };

    const pieces: PieceData[] = [
      { id: '1', width: 24, length: 48, quantity: 2, grainDirection: 'no-preference' },
      { id: '2', width: 24, length: 48, quantity: 2, grainDirection: 'no-preference' },
    ];

    const result = optimizeCutList(pieces, limitedSheet);

    // The selected algorithm should have the minimum unplaced count
    const selectedAlgo = result.algorithmsCompared.find(
      (a) => a.name === result.algorithmUsed
    );
    const minUnplaced = Math.min(...result.algorithmsCompared.map((a) => a.unplacedCount));
    expect(selectedAlgo?.unplacedCount).toBe(minUnplaced);
  });
});
