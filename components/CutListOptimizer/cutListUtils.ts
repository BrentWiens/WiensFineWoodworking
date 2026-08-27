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
type SortStrategy = 'area' | 'longest-side' | 'perimeter' | 'width' | 'shortest-side' | 'height';
type PlacementStrategy = 'first-fit' | 'best-fit';
type AlgorithmType = 'guillotine' | 'shelf' | 'skyline';

interface AlgorithmConfig {
  name: string;
  sortStrategy: SortStrategy;
  placementStrategy: PlacementStrategy;
  algorithmType: AlgorithmType;
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

/**
 * True for a row the user has typed no dimensions into. Adding rows is cheap and
 * blank ones carry no intent, so they are skipped rather than reported as errors —
 * a half-filled row still is, since that's a mistake worth surfacing.
 */
export function isPieceRowEmpty(piece: PieceInput): boolean {
  return piece.width.trim() === '' && piece.length.trim() === '';
}

export function parsePieces(pieces: PieceInput[]): { pieces: PieceData[]; errors: string[] } {
  const errors: string[] = [];
  const parsedPieces: PieceData[] = [];

  pieces.forEach((piece, index) => {
    if (isPieceRowEmpty(piece)) return;

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

  pieces.forEach((piece) => {
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
// Note: First Fit vs Best Fit rarely differ in guillotine packing with pre-sorted pieces,
// so we use Best Fit for guillotine (theoretically optimal) and First Fit for shelf (FFDH standard)
const ALGORITHM_CONFIGS: AlgorithmConfig[] = [
  // Guillotine algorithms with different sorting strategies
  { name: 'Area', sortStrategy: 'area', placementStrategy: 'best-fit', algorithmType: 'guillotine' },
  { name: 'Longest Side', sortStrategy: 'longest-side', placementStrategy: 'best-fit', algorithmType: 'guillotine' },
  { name: 'Perimeter', sortStrategy: 'perimeter', placementStrategy: 'best-fit', algorithmType: 'guillotine' },
  { name: 'Width', sortStrategy: 'width', placementStrategy: 'best-fit', algorithmType: 'guillotine' },
  { name: 'Shortest Side', sortStrategy: 'shortest-side', placementStrategy: 'best-fit', algorithmType: 'guillotine' },
  // Shelf algorithm (FFDH - First Fit Decreasing Height)
  { name: 'FFDH Shelf', sortStrategy: 'height', placementStrategy: 'first-fit', algorithmType: 'shelf' },
  // Skyline algorithms - places pieces at lowest available position
  { name: 'Skyline (Area)', sortStrategy: 'area', placementStrategy: 'best-fit', algorithmType: 'skyline' },
  { name: 'Skyline (Longest)', sortStrategy: 'longest-side', placementStrategy: 'best-fit', algorithmType: 'skyline' },
  { name: 'Skyline (Width)', sortStrategy: 'width', placementStrategy: 'best-fit', algorithmType: 'skyline' },
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

function sortByShortestSide(instances: PieceInstance[]): PieceInstance[] {
  return [...instances].sort((a, b) => {
    const minA = Math.min(a.width, a.length);
    const minB = Math.min(b.width, b.length);
    return minB - minA;
  });
}

function sortByHeight(instances: PieceInstance[]): PieceInstance[] {
  // For shelf algorithm, sort by height (length in our coordinate system) descending
  return [...instances].sort((a, b) => b.length - a.length);
}

function applySortStrategy(instances: PieceInstance[], strategy: SortStrategy): PieceInstance[] {
  switch (strategy) {
    case 'area': return sortByArea(instances);
    case 'longest-side': return sortByLongestSide(instances);
    case 'perimeter': return sortByPerimeter(instances);
    case 'width': return sortByWidth(instances);
    case 'shortest-side': return sortByShortestSide(instances);
    case 'height': return sortByHeight(instances);
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

  // Calculate remaining space
  const rightWidth = rect.width - consumedW;
  const bottomHeight = rect.height - consumedH;

  // Choose split direction based on which creates more usable rectangles
  // Horizontal split: bottom rect gets full width (better for stacking vertically)
  // Vertical split: right rect gets full height (better for stacking horizontally)

  // Use horizontal split if bottom area is larger, vertical if right area is larger
  // This tends to keep larger contiguous areas together
  const horizontalSplitArea = (bottomHeight >= MIN_USABLE_SIZE ? rect.width * bottomHeight : 0) +
                              (rightWidth >= MIN_USABLE_SIZE ? rightWidth * placedHeight : 0);
  const verticalSplitArea = (rightWidth >= MIN_USABLE_SIZE ? rightWidth * rect.height : 0) +
                            (bottomHeight >= MIN_USABLE_SIZE ? placedWidth * bottomHeight : 0);

  if (horizontalSplitArea >= verticalSplitArea) {
    // Horizontal split: bottom rectangle gets full width
    if (bottomHeight >= MIN_USABLE_SIZE) {
      newRects.push({
        x: rect.x,
        y: rect.y + consumedH,
        width: rect.width,
        height: bottomHeight,
      });
    }
    // Right rectangle gets only the placed piece height
    if (rightWidth >= MIN_USABLE_SIZE && placedHeight >= MIN_USABLE_SIZE) {
      newRects.push({
        x: rect.x + consumedW,
        y: rect.y,
        width: rightWidth,
        height: placedHeight,
      });
    }
  } else {
    // Vertical split: right rectangle gets full height
    if (rightWidth >= MIN_USABLE_SIZE) {
      newRects.push({
        x: rect.x + consumedW,
        y: rect.y,
        width: rightWidth,
        height: rect.height,
      });
    }
    // Bottom rectangle gets only the placed piece width
    if (bottomHeight >= MIN_USABLE_SIZE && placedWidth >= MIN_USABLE_SIZE) {
      newRects.push({
        x: rect.x,
        y: rect.y + consumedH,
        width: placedWidth,
        height: bottomHeight,
      });
    }
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

// === SHELF (FFDH) ALGORITHM ===
// First Fit Decreasing Height - creates horizontal shelves and packs pieces in rows

interface Shelf {
  y: number;           // Y position of shelf bottom
  height: number;      // Height of the shelf (determined by tallest piece)
  remainingWidth: number; // Remaining width on this shelf
  pieces: PlacedPiece[];
}

function runShelfAlgorithm(
  pieces: PieceData[],
  sheet: SheetConfigData,
  config: AlgorithmConfig
): { result: Omit<OptimizationResult, 'algorithmUsed' | 'algorithmsCompared'>; comparison: AlgorithmComparison } {
  const warnings: string[] = [];
  const unplacedPieces: PieceInstance[] = [];
  const sheets: SheetLayout[] = [];

  // Expand and sort pieces
  const instances = expandPiecesToInstances(pieces);
  const sortedInstances = applySortStrategy(instances, config.sortStrategy);

  // Track shelves per sheet
  const sheetShelves: Map<number, Shelf[]> = new Map();

  for (const piece of sortedInstances) {
    let placed = false;
    const orientations = getAllowedOrientations(piece);

    // Try each orientation
    for (const { w, h, rotated } of orientations) {
      if (placed) break;

      // Try existing sheets
      for (let sheetIdx = 0; sheetIdx < sheets.length; sheetIdx++) {
        if (placed) break;
        const shelves = sheetShelves.get(sheetIdx) || [];

        // Try existing shelves on this sheet
        for (const shelf of shelves) {
          // Check if piece fits on this shelf (width + kerf)
          if (w + sheet.kerfWidth <= shelf.remainingWidth + sheet.kerfWidth && h <= shelf.height) {
            // Place the piece
            const x = sheet.width - shelf.remainingWidth;
            const placement: PlacedPiece = {
              piece: { ...piece, rotated },
              x,
              y: shelf.y,
              width: w,
              height: h,
            };
            shelf.pieces.push(placement);
            shelf.remainingWidth -= (w + sheet.kerfWidth);
            sheets[sheetIdx].pieces.push(placement);
            sheets[sheetIdx].usedArea += w * h;
            placed = true;
            break;
          }
        }

        // If not placed on existing shelf, try creating new shelf on this sheet
        if (!placed) {
          const currentShelfHeight = shelves.reduce((sum, s) => sum + s.height + sheet.kerfWidth, 0);
          const availableHeight = sheet.length - currentShelfHeight;

          if (h <= availableHeight && w <= sheet.width) {
            // Create new shelf
            const newShelf: Shelf = {
              y: currentShelfHeight,
              height: h,
              remainingWidth: sheet.width - w - sheet.kerfWidth,
              pieces: [],
            };
            const placement: PlacedPiece = {
              piece: { ...piece, rotated },
              x: 0,
              y: newShelf.y,
              width: w,
              height: h,
            };
            newShelf.pieces.push(placement);
            shelves.push(newShelf);
            sheetShelves.set(sheetIdx, shelves);
            sheets[sheetIdx].pieces.push(placement);
            sheets[sheetIdx].usedArea += w * h;
            placed = true;
          }
        }
      }

      // If still not placed and we can add a new sheet
      if (!placed && sheets.length < sheet.sheetsAvailable) {
        if (w <= sheet.width && h <= sheet.length) {
          // Create new sheet with first shelf
          const newSheetIdx = sheets.length;
          const newSheet: SheetLayout = {
            sheetIndex: newSheetIdx,
            pieces: [],
            freeRectangles: [], // Not used in shelf algorithm
            usedArea: 0,
            wasteArea: 0,
            efficiency: 0,
          };
          sheets.push(newSheet);

          const newShelf: Shelf = {
            y: 0,
            height: h,
            remainingWidth: sheet.width - w - sheet.kerfWidth,
            pieces: [],
          };
          const placement: PlacedPiece = {
            piece: { ...piece, rotated },
            x: 0,
            y: 0,
            width: w,
            height: h,
          };
          newShelf.pieces.push(placement);
          sheetShelves.set(newSheetIdx, [newShelf]);
          newSheet.pieces.push(placement);
          newSheet.usedArea += w * h;
          placed = true;
        }
      }
    }

    if (!placed) {
      unplacedPieces.push(piece);
    }
  }

  // Calculate statistics
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
    const unplacedBySize = new Map<string, number>();
    for (const p of unplacedPieces) {
      const key = `${p.width} x ${p.length}`;
      unplacedBySize.set(key, (unplacedBySize.get(key) || 0) + 1);
    }
    const unplacedList = Array.from(unplacedBySize.entries())
      .map(([size, count]) => count > 1 ? `${size} (${count})` : size)
      .join(', ');
    warnings.push(`Could not place: ${unplacedList}. You may need more sheets.`);
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

// === SKYLINE (BOTTOM-LEFT) ALGORITHM ===
// Maintains a skyline contour and places pieces at the lowest available position

interface SkylineSegment {
  x: number;      // Start x position
  width: number;  // Width of this segment
  y: number;      // Height (y position of top of this segment)
}

function runSkylineAlgorithm(
  pieces: PieceData[],
  sheet: SheetConfigData,
  config: AlgorithmConfig
): { result: Omit<OptimizationResult, 'algorithmUsed' | 'algorithmsCompared'>; comparison: AlgorithmComparison } {
  const warnings: string[] = [];
  const unplacedPieces: PieceInstance[] = [];
  const sheets: SheetLayout[] = [];

  // Expand and sort pieces
  const instances = expandPiecesToInstances(pieces);
  const sortedInstances = applySortStrategy(instances, config.sortStrategy);

  // Track skyline per sheet
  const sheetSkylines: Map<number, SkylineSegment[]> = new Map();

  for (const piece of sortedInstances) {
    let placed = false;
    const orientations = getAllowedOrientations(piece);

    // Try each orientation
    for (const { w, h, rotated } of orientations) {
      if (placed) break;
      const pieceWidth = w + sheet.kerfWidth;
      const pieceHeight = h + sheet.kerfWidth;

      // Try existing sheets
      for (let sheetIdx = 0; sheetIdx < sheets.length; sheetIdx++) {
        if (placed) break;
        const skyline = sheetSkylines.get(sheetIdx) || [{ x: 0, width: sheet.width, y: 0 }];

        // Find the best position on this skyline
        const position = findBestSkylinePosition(skyline, pieceWidth, pieceHeight, sheet);
        if (position) {
          // Place the piece
          const placement: PlacedPiece = {
            piece: { ...piece, rotated },
            x: position.x,
            y: position.y,
            width: w,
            height: h,
          };
          sheets[sheetIdx].pieces.push(placement);
          sheets[sheetIdx].usedArea += w * h;

          // Update skyline
          const newSkyline = updateSkyline(skyline, position.x, pieceWidth, position.y + pieceHeight);
          sheetSkylines.set(sheetIdx, newSkyline);
          placed = true;
        }
      }

      // If still not placed and we can add a new sheet
      if (!placed && sheets.length < sheet.sheetsAvailable) {
        if (w <= sheet.width && h <= sheet.length) {
          // Create new sheet
          const newSheetIdx = sheets.length;
          const newSheet: SheetLayout = {
            sheetIndex: newSheetIdx,
            pieces: [],
            freeRectangles: [],
            usedArea: 0,
            wasteArea: 0,
            efficiency: 0,
          };
          sheets.push(newSheet);

          // Place at origin
          const placement: PlacedPiece = {
            piece: { ...piece, rotated },
            x: 0,
            y: 0,
            width: w,
            height: h,
          };
          newSheet.pieces.push(placement);
          newSheet.usedArea += w * h;

          // Initialize skyline with this piece
          const initialSkyline: SkylineSegment[] = [];
          if (pieceWidth < sheet.width) {
            // Segment for the piece
            initialSkyline.push({ x: 0, width: pieceWidth - sheet.kerfWidth, y: pieceHeight });
            // Segment for remaining space
            initialSkyline.push({ x: pieceWidth, width: sheet.width - pieceWidth, y: 0 });
          } else {
            initialSkyline.push({ x: 0, width: sheet.width, y: pieceHeight });
          }
          sheetSkylines.set(newSheetIdx, initialSkyline);
          placed = true;
        }
      }
    }

    if (!placed) {
      unplacedPieces.push(piece);
    }
  }

  // Calculate statistics
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
    const unplacedBySize = new Map<string, number>();
    for (const p of unplacedPieces) {
      const key = `${p.width} x ${p.length}`;
      unplacedBySize.set(key, (unplacedBySize.get(key) || 0) + 1);
    }
    const unplacedList = Array.from(unplacedBySize.entries())
      .map(([size, count]) => count > 1 ? `${size} (${count})` : size)
      .join(', ');
    warnings.push(`Could not place: ${unplacedList}. You may need more sheets.`);
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

// Find the best position on the skyline for a piece (lowest y that fits)
function findBestSkylinePosition(
  skyline: SkylineSegment[],
  pieceWidth: number,
  pieceHeight: number,
  sheet: SheetConfigData
): { x: number; y: number } | null {
  let bestPosition: { x: number; y: number } | null = null;
  let bestY = Infinity;

  // Try each segment as a potential starting position
  for (let i = 0; i < skyline.length; i++) {
    const startSegment = skyline[i];

    // Check if piece can start here and fit within sheet width
    if (startSegment.x + pieceWidth > sheet.width) continue;

    // Find the maximum height across all segments this piece would span
    let maxY = startSegment.y;
    let coveredWidth = 0;

    for (let j = i; j < skyline.length && coveredWidth < pieceWidth; j++) {
      const segment = skyline[j];
      maxY = Math.max(maxY, segment.y);
      coveredWidth += segment.width;
      if (j > i) coveredWidth += 0; // Segments are contiguous
    }

    // Check if piece fits vertically
    if (maxY + pieceHeight > sheet.length) continue;

    // This is a valid position - check if it's the best (lowest)
    if (maxY < bestY) {
      bestY = maxY;
      bestPosition = { x: startSegment.x, y: maxY };
    }
  }

  return bestPosition;
}

// Update the skyline after placing a piece
function updateSkyline(
  skyline: SkylineSegment[],
  pieceX: number,
  pieceWidth: number,
  newY: number
): SkylineSegment[] {
  const newSkyline: SkylineSegment[] = [];
  const pieceEndX = pieceX + pieceWidth;

  for (const segment of skyline) {
    const segmentEndX = segment.x + segment.width;

    // Segment is entirely before the piece
    if (segmentEndX <= pieceX) {
      newSkyline.push(segment);
      continue;
    }

    // Segment is entirely after the piece
    if (segment.x >= pieceEndX) {
      newSkyline.push(segment);
      continue;
    }

    // Segment overlaps with piece - need to split/modify

    // Part before the piece
    if (segment.x < pieceX) {
      newSkyline.push({
        x: segment.x,
        width: pieceX - segment.x,
        y: segment.y,
      });
    }

    // The piece itself (only add once, when we first encounter overlap)
    if (newSkyline.length === 0 || newSkyline[newSkyline.length - 1].x + newSkyline[newSkyline.length - 1].width <= pieceX) {
      newSkyline.push({
        x: pieceX,
        width: pieceWidth,
        y: newY,
      });
    }

    // Part after the piece
    if (segmentEndX > pieceEndX) {
      newSkyline.push({
        x: pieceEndX,
        width: segmentEndX - pieceEndX,
        y: segment.y,
      });
    }
  }

  // Merge adjacent segments with the same height
  const mergedSkyline: SkylineSegment[] = [];
  for (const segment of newSkyline) {
    if (mergedSkyline.length > 0) {
      const last = mergedSkyline[mergedSkyline.length - 1];
      if (Math.abs(last.y - segment.y) < 0.001 && Math.abs(last.x + last.width - segment.x) < 0.001) {
        last.width += segment.width;
        continue;
      }
    }
    mergedSkyline.push({ ...segment });
  }

  return mergedSkyline;
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
    // Choose algorithm implementation based on type
    let algorithmResult: { result: Omit<OptimizationResult, 'algorithmUsed' | 'algorithmsCompared'>; comparison: AlgorithmComparison };
    if (config.algorithmType === 'shelf') {
      algorithmResult = runShelfAlgorithm(pieces, sheet, config);
    } else if (config.algorithmType === 'skyline') {
      algorithmResult = runSkylineAlgorithm(pieces, sheet, config);
    } else {
      algorithmResult = runSingleAlgorithm(pieces, sheet, config);
    }
    results.push({ result: algorithmResult.result, comparison: algorithmResult.comparison, config });
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
