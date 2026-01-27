// === TYPES ===

export type GrainDirection = 'along-length' | 'along-width' | 'no-preference';

export interface PieceInput {
  id: string;
  width: string;
  length: string;
  quantity: string;
  grainDirection: GrainDirection;
}

export interface PieceData {
  id: string;
  width: number;
  length: number;
  quantity: number;
  grainDirection: GrainDirection;
}

export interface PieceInstance {
  id: string;
  pieceId: string;
  width: number;
  length: number;
  grainDirection: GrainDirection;
  rotated: boolean;
}

export interface SheetConfig {
  width: string;
  length: string;
  kerfWidth: string;
  sheetsAvailable: string;
}

export interface SheetConfigData {
  width: number;
  length: number;
  kerfWidth: number;
  sheetsAvailable: number;
}

export interface PlacedPiece {
  piece: PieceInstance;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FreeRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetLayout {
  sheetIndex: number;
  pieces: PlacedPiece[];
  freeRectangles: FreeRectangle[];
  usedArea: number;
  wasteArea: number;
  efficiency: number;
}

export interface OptimizationResult {
  sheets: SheetLayout[];
  totalSheets: number;
  totalUsedArea: number;
  totalWasteArea: number;
  overallEfficiency: number;
  unplacedPieces: PieceInstance[];
  warnings: string[];
  algorithmUsed: string;
  algorithmsCompared: AlgorithmComparison[];
}

export interface AlgorithmComparison {
  name: string;
  efficiency: number;
  sheetsUsed: number;
  unplacedCount: number;
}

// Algorithm strategy types
type SortStrategy = 'area' | 'longest-side' | 'perimeter' | 'width';
type PlacementStrategy = 'first-fit' | 'best-fit';

interface AlgorithmConfig {
  name: string;
  sortStrategy: SortStrategy;
  placementStrategy: PlacementStrategy;
}

// === CONSTANTS ===

export const DEFAULT_SHEET_CONFIG: SheetConfig = {
  width: '48',
  length: '96',
  kerfWidth: '0.125',
  sheetsAvailable: '1',
};

export const MIN_USABLE_SIZE = 1; // Minimum 1 inch for usable scrap

export const PIECE_COLORS = [
  '#F59E0B', // amber-500
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
  '#6366F1', // indigo-500
  '#14B8A6', // teal-500
  '#A855F7', // purple-500
];

// === UTILITY FUNCTIONS ===

export function createEmptyPiece(): PieceInput {
  return {
    id: crypto.randomUUID(),
    width: '',
    length: '',
    quantity: '1',
    grainDirection: 'no-preference',
  };
}

export function getPieceColor(pieceIndex: number): string {
  return PIECE_COLORS[pieceIndex % PIECE_COLORS.length];
}

export function getPieceLabel(piece: PieceInstance): string {
  return `${piece.width} x ${piece.length}`;
}

// === VALIDATION ===

export function parseSheetConfig(config: SheetConfig): SheetConfigData | null {
  const width = parseFloat(config.width);
  const length = parseFloat(config.length);
  const kerfWidth = parseFloat(config.kerfWidth);
  const sheetsAvailable = parseInt(config.sheetsAvailable, 10);

  if (isNaN(width) || width <= 0) return null;
  if (isNaN(length) || length <= 0) return null;
  if (isNaN(kerfWidth) || kerfWidth < 0) return null;
  if (isNaN(sheetsAvailable) || sheetsAvailable < 1) return null;

  return { width, length, kerfWidth, sheetsAvailable };
}

export function parsePieces(pieces: PieceInput[]): { pieces: PieceData[]; errors: string[] } {
  const errors: string[] = [];
  const parsedPieces: PieceData[] = [];

  pieces.forEach((piece, index) => {
    const width = parseFloat(piece.width);
    const length = parseFloat(piece.length);
    const quantity = parseInt(piece.quantity, 10);

    if (isNaN(width) || width <= 0) {
      errors.push(`Row ${index + 1}: Invalid width`);
      return;
    }
    if (isNaN(length) || length <= 0) {
      errors.push(`Row ${index + 1}: Invalid length`);
      return;
    }
    if (isNaN(quantity) || quantity < 1) {
      errors.push(`Row ${index + 1}: Quantity must be at least 1`);
      return;
    }

    parsedPieces.push({
      id: piece.id,
      width,
      length,
      quantity,
      grainDirection: piece.grainDirection,
    });
  });

  return { pieces: parsedPieces, errors };
}

export function validatePiecesAgainstSheet(
  pieces: PieceData[],
  sheet: SheetConfigData
): string[] {
  const errors: string[] = [];

  pieces.forEach((piece, index) => {
    const fitsNormal = piece.width <= sheet.width && piece.length <= sheet.length;
    const fitsRotated = piece.length <= sheet.width && piece.width <= sheet.length;

    if (piece.grainDirection === 'along-length') {
      // Piece length must align with sheet length (grain), so no rotation
      if (!fitsNormal) {
        errors.push(
          `Piece ${piece.width} x ${piece.length}: Too large for sheet with "Along Length" grain`
        );
      }
    } else if (piece.grainDirection === 'along-width') {
      // Piece width must align with sheet length (grain), so must rotate
      if (!fitsRotated) {
        errors.push(
          `Piece ${piece.width} x ${piece.length}: Too large for sheet with "Along Width" grain`
        );
      }
    } else {
      // No preference - can try both
      if (!fitsNormal && !fitsRotated) {
        errors.push(
          `Piece ${piece.width} x ${piece.length}: Too large to fit on sheet in any orientation`
        );
      }
    }
  });

  return errors;
}

// === OPTIMIZATION ALGORITHM ===

// Algorithm configurations to try
const ALGORITHM_CONFIGS: AlgorithmConfig[] = [
  { name: 'Area + First Fit', sortStrategy: 'area', placementStrategy: 'first-fit' },
  { name: 'Area + Best Fit', sortStrategy: 'area', placementStrategy: 'best-fit' },
  { name: 'Longest Side + First Fit', sortStrategy: 'longest-side', placementStrategy: 'first-fit' },
  { name: 'Longest Side + Best Fit', sortStrategy: 'longest-side', placementStrategy: 'best-fit' },
  { name: 'Perimeter + Best Fit', sortStrategy: 'perimeter', placementStrategy: 'best-fit' },
];

// Sorting functions
function sortByArea(instances: PieceInstance[]): PieceInstance[] {
  return [...instances].sort((a, b) => b.width * b.length - a.width * a.length);
}

function sortByLongestSide(instances: PieceInstance[]): PieceInstance[] {
  return [...instances].sort((a, b) => {
    const maxA = Math.max(a.width, a.length);
    const maxB = Math.max(b.width, b.length);
    return maxB - maxA;
  });
}

function sortByPerimeter(instances: PieceInstance[]): PieceInstance[] {
  return [...instances].sort((a, b) => {
    const perimA = 2 * (a.width + a.length);
    const perimB = 2 * (b.width + b.length);
    return perimB - perimA;
  });
}

function sortByWidth(instances: PieceInstance[]): PieceInstance[] {
  return [...instances].sort((a, b) => b.width - a.width);
}

function applySortStrategy(instances: PieceInstance[], strategy: SortStrategy): PieceInstance[] {
  switch (strategy) {
    case 'area': return sortByArea(instances);
    case 'longest-side': return sortByLongestSide(instances);
    case 'perimeter': return sortByPerimeter(instances);
    case 'width': return sortByWidth(instances);
  }
}

function expandPiecesToInstances(pieces: PieceData[]): PieceInstance[] {
  const instances: PieceInstance[] = [];

  pieces.forEach((piece) => {
    for (let i = 0; i < piece.quantity; i++) {
      instances.push({
        id: `${piece.id}-${i}`,
        pieceId: piece.id,
        width: piece.width,
        length: piece.length,
        grainDirection: piece.grainDirection,
        rotated: false,
      });
    }
  });

  return instances;
}

function getAllowedOrientations(
  piece: PieceInstance
): Array<{ w: number; h: number; rotated: boolean }> {
  // Sheet grain runs along LENGTH (height in our coordinate system)
  // x-axis = width, y-axis = length

  switch (piece.grainDirection) {
    case 'along-length':
      // Piece length must align with sheet length (y-axis)
      // So piece is placed with width on x, length on y - no rotation
      return [{ w: piece.width, h: piece.length, rotated: false }];

    case 'along-width':
      // Piece width must align with sheet length (y-axis)
      // So piece is rotated: length on x, width on y
      return [{ w: piece.length, h: piece.width, rotated: true }];

    case 'no-preference':
      // Try both orientations
      return [
        { w: piece.width, h: piece.length, rotated: false },
        { w: piece.length, h: piece.width, rotated: true },
      ];
  }
}

function createNewSheet(sheetIndex: number, sheet: SheetConfigData): SheetLayout {
  return {
    sheetIndex,
    pieces: [],
    freeRectangles: [{ x: 0, y: 0, width: sheet.width, height: sheet.length }],
    usedArea: 0,
    wasteArea: 0,
    efficiency: 0,
  };
}

function splitRectangleGuillotine(
  rect: FreeRectangle,
  placedWidth: number,
  placedHeight: number,
  kerf: number
): FreeRectangle[] {
  const newRects: FreeRectangle[] = [];

  // Add kerf to consumed dimensions
  const consumedW = placedWidth + kerf;
  const consumedH = placedHeight + kerf;

  // Right rectangle (space to the right of placed piece, full height)
  const rightWidth = rect.width - consumedW;
  if (rightWidth >= MIN_USABLE_SIZE) {
    newRects.push({
      x: rect.x + consumedW,
      y: rect.y,
      width: rightWidth,
      height: rect.height,
    });
  }

  // Bottom rectangle (space below placed piece, only under the piece width)
  const bottomHeight = rect.height - consumedH;
  if (bottomHeight >= MIN_USABLE_SIZE) {
    newRects.push({
      x: rect.x,
      y: rect.y + consumedH,
      width: Math.min(consumedW - kerf, rect.width), // Width of the piece only
      height: bottomHeight,
    });
  }

  return newRects;
}

function tryPlacePiece(
  piece: PieceInstance,
  layout: SheetLayout,
  kerf: number,
  placementStrategy: PlacementStrategy = 'first-fit'
): PlacedPiece | null {
  const orientations = getAllowedOrientations(piece);
  let bestPlacement: PlacedPiece | null = null;
  let bestRectIndex = -1;
  let bestScore = Infinity;

  for (let rectIndex = 0; rectIndex < layout.freeRectangles.length; rectIndex++) {
    const rect = layout.freeRectangles[rectIndex];

    for (const { w, h, rotated } of orientations) {
      // Check if piece fits (with kerf on right and bottom edges)
      const effectiveWidth = w + kerf;
      const effectiveHeight = h + kerf;

      if (effectiveWidth <= rect.width + kerf && effectiveHeight <= rect.height + kerf) {
        let score: number;

        if (placementStrategy === 'best-fit') {
          // Best Fit: minimize leftover area (prefer tighter fit)
          const leftoverArea = (rect.width * rect.height) - (w * h);
          // Tie-breaker: prefer upper-left
          score = leftoverArea * 1000000 + rect.y * 1000 + rect.x;
        } else {
          // First Fit: prefer upper-left placement (smaller y, then smaller x)
          score = rect.y * 10000 + rect.x;
        }

        if (score < bestScore) {
          bestScore = score;
          bestRectIndex = rectIndex;
          bestPlacement = {
            piece: { ...piece, rotated },
            x: rect.x,
            y: rect.y,
            width: w,
            height: h,
          };
        }
      }
    }
  }

  // If we found a placement, update the free rectangles
  if (bestPlacement && bestRectIndex >= 0) {
    const usedRect = layout.freeRectangles[bestRectIndex];
    const newRects = splitRectangleGuillotine(
      usedRect,
      bestPlacement.width,
      bestPlacement.height,
      kerf
    );

    // Remove used rectangle and add new ones
    layout.freeRectangles.splice(bestRectIndex, 1, ...newRects);
  }

  return bestPlacement;
}

// Run optimization with a specific algorithm configuration
function runSingleAlgorithm(
  pieces: PieceData[],
  sheet: SheetConfigData,
  config: AlgorithmConfig
): { result: Omit<OptimizationResult, 'algorithmUsed' | 'algorithmsCompared'>; comparison: AlgorithmComparison } {
  const warnings: string[] = [];
  const unplacedPieces: PieceInstance[] = [];
  const sheets: SheetLayout[] = [];

  // Step 1: Expand pieces by quantity
  const instances = expandPiecesToInstances(pieces);

  // Step 2: Sort using the configured strategy
  const sortedInstances = applySortStrategy(instances, config.sortStrategy);

  // Step 3: Place each piece
  for (const piece of sortedInstances) {
    let placed = false;

    // Try existing sheets first
    for (const sheetLayout of sheets) {
      const placement = tryPlacePiece(piece, sheetLayout, sheet.kerfWidth, config.placementStrategy);
      if (placement) {
        sheetLayout.pieces.push(placement);
        sheetLayout.usedArea += placement.width * placement.height;
        placed = true;
        break;
      }
    }

    // If not placed, try creating a new sheet
    if (!placed) {
      if (sheets.length < sheet.sheetsAvailable) {
        const newSheet = createNewSheet(sheets.length, sheet);
        const placement = tryPlacePiece(piece, newSheet, sheet.kerfWidth, config.placementStrategy);

        if (placement) {
          newSheet.pieces.push(placement);
          newSheet.usedArea += placement.width * placement.height;
          sheets.push(newSheet);
          placed = true;
        }
      }
    }

    if (!placed) {
      unplacedPieces.push(piece);
    }
  }

  // Step 4: Calculate statistics
  const sheetArea = sheet.width * sheet.length;

  for (const sheetLayout of sheets) {
    sheetLayout.wasteArea = sheetArea - sheetLayout.usedArea;
    sheetLayout.efficiency = (sheetLayout.usedArea / sheetArea) * 100;
  }

  const totalUsedArea = sheets.reduce((sum, s) => sum + s.usedArea, 0);
  const totalSheetArea = sheets.length * sheetArea;
  const totalWasteArea = totalSheetArea - totalUsedArea;
  const overallEfficiency = totalSheetArea > 0 ? (totalUsedArea / totalSheetArea) * 100 : 0;

  if (unplacedPieces.length > 0) {
    // Group unplaced pieces by dimensions
    const unplacedBySize = new Map<string, number>();
    for (const piece of unplacedPieces) {
      const key = `${piece.width} x ${piece.length}`;
      unplacedBySize.set(key, (unplacedBySize.get(key) || 0) + 1);
    }

    const unplacedList = Array.from(unplacedBySize.entries())
      .map(([size, count]) => count > 1 ? `${size} (${count})` : size)
      .join(', ');

    warnings.push(
      `Could not place: ${unplacedList}. You may need more sheets.`
    );
  }

  return {
    result: {
      sheets,
      totalSheets: sheets.length,
      totalUsedArea,
      totalWasteArea,
      overallEfficiency,
      unplacedPieces,
      warnings,
    },
    comparison: {
      name: config.name,
      efficiency: overallEfficiency,
      sheetsUsed: sheets.length,
      unplacedCount: unplacedPieces.length,
    },
  };
}

export function optimizeCutList(
  pieces: PieceData[],
  sheet: SheetConfigData
): OptimizationResult {
  // Run all algorithm configurations
  const results: Array<{
    result: Omit<OptimizationResult, 'algorithmUsed' | 'algorithmsCompared'>;
    comparison: AlgorithmComparison;
    config: AlgorithmConfig;
  }> = [];

  for (const config of ALGORITHM_CONFIGS) {
    const { result, comparison } = runSingleAlgorithm(pieces, sheet, config);
    results.push({ result, comparison, config });
  }

  // Find the best result:
  // 1. Fewest unplaced pieces
  // 2. Fewest sheets used
  // 3. Highest efficiency
  results.sort((a, b) => {
    // First: fewer unplaced pieces is better
    if (a.comparison.unplacedCount !== b.comparison.unplacedCount) {
      return a.comparison.unplacedCount - b.comparison.unplacedCount;
    }
    // Second: fewer sheets is better
    if (a.comparison.sheetsUsed !== b.comparison.sheetsUsed) {
      return a.comparison.sheetsUsed - b.comparison.sheetsUsed;
    }
    // Third: higher efficiency is better
    return b.comparison.efficiency - a.comparison.efficiency;
  });

  const best = results[0];
  const algorithmsCompared = results.map(r => r.comparison);

  return {
    ...best.result,
    algorithmUsed: best.config.name,
    algorithmsCompared,
  };
}
