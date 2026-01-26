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
  const totalBoardFeet = boardFeet * (quantity > 0 ? quantity : 1);

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
