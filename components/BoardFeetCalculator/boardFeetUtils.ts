export interface BoardDimensions {
  thickness: number;
  width: number;
  length: number;
  quantity: number;
}

export interface BoardFeetResult {
  boardFeet: number;
  totalBoardFeet: number;
  isValid: boolean;
}

/**
 * Calculate board feet from dimensions
 * Formula: (Thickness × Width × Length) / 144
 * Where all dimensions are in inches
 */
export function calculateBoardFeet(dimensions: BoardDimensions): BoardFeetResult {
  const { thickness, width, length, quantity } = dimensions;

  if (thickness <= 0 || width <= 0 || length <= 0) {
    return { boardFeet: 0, totalBoardFeet: 0, isValid: false };
  }

  const boardFeet = (thickness * width * length) / 144;
  const totalBoardFeet = boardFeet * Math.max(0, quantity);

  return { boardFeet, totalBoardFeet, isValid: true };
}

/**
 * Format board feet for display
 * Shows appropriate decimal places based on value
 */
export function formatBoardFeet(value: number): string {
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(3);
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Validate input string for numeric values
 * Allows empty string, numbers, and decimals
 */
export function isValidNumericInput(value: string): boolean {
  return value === '' || /^\d*\.?\d*$/.test(value);
}

/**
 * Validate input string for a dimension as it is being typed
 * Allows what a decimal ("1.5"), fraction ("3/4") or mixed number ("1-1/2", "1 1/2") is made of
 */
export function isValidDimensionInput(value: string): boolean {
  return /^[\d\s./-]*$/.test(value);
}

/**
 * Validate input string for a whole-number quantity
 */
export function isValidQuantityInput(value: string): boolean {
  return /^\d*$/.test(value);
}

/**
 * Read a quantity field. Blank means one board, the same as the placeholder shows;
 * an explicit 0 means none.
 */
export function parseQuantity(value: string): number {
  const quantity = parseInt(value, 10);
  return Number.isNaN(quantity) ? 1 : quantity;
}

/**
 * Add a waste allowance, given as a percentage, to a board feet total
 */
export function addWaste(boardFeet: number, wastePercent: number): number {
  return boardFeet * (1 + Math.max(0, wastePercent) / 100);
}

/**
 * Format a dollar amount for display
 */
export function formatCost(value: number): string {
  return `$${value.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
