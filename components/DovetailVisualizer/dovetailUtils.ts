// Dovetail calculator utility functions and types

export interface DovetailParams {
  pinPieceLength: number;
  tailPieceLength: number;
  boardWidth: number;
  thickness: number;
  numberOfTails: number;
  tailAngle: '1:4' | '1:6' | '1:8' | '1:0';
  tailWidth?: number;
  pinWidth?: number;
  topOffset: number;
  bottomOffset: number;
}

export interface DovetailGeometry {
  tailWidth: number;
  pinWidth: number;
  halfPinWidth: number;
  ratio: number;
  tailExtension: number;
  totalTailLength: number;
  totalPinLength: number;
  boardWidth: number;
  thickness: number;
  numberOfTails: number;
  topOffset: number;
  bottomOffset: number;
}

export interface InputValues {
  pinPieceLength: string;
  tailPieceLength: string;
  boardWidth: string;
  thickness: string;
  numberOfTails: string;
  tailWidth: string;
  pinWidth: string;
  topOffset: string;
  bottomOffset: string;
}

export const DEFAULT_PARAMS: DovetailParams = {
  pinPieceLength: 12,
  tailPieceLength: 6,
  boardWidth: 8,
  thickness: 0.5,
  numberOfTails: 3,
  tailAngle: '1:8',
  topOffset: 0,
  bottomOffset: 0,
};

export const ANGLE_RATIOS: Record<string, number> = {
  '1:0': 0,    // Box joint (90°)
  '1:4': 1/4,
  '1:6': 1/6,
  '1:8': 1/8
};

// Convert decimal to fraction (up to 64ths)
export function decimalToFraction(decimal: number): string | null {
  const wholePart = Math.floor(decimal);
  const fractionalPart = decimal - wholePart;
  
  if (Math.abs(fractionalPart) < 0.0001) return null;
  
  const denominators = [2, 4, 8, 16, 32, 64];
  
  for (const denom of denominators) {
    const numerator = Math.round(fractionalPart * denom);
    if (Math.abs(fractionalPart - numerator / denom) < 0.0001) {
      let n = numerator, d = denom;
      while (n % 2 === 0 && d % 2 === 0) { n /= 2; d /= 2; }
      return wholePart === 0 ? `${n}/${d}` : `${wholePart}-${n}/${d}`;
    }
  }
  return null;
}

// Format a dimension value with optional fraction
export function formatDimension(value: number): string {
  // Round to 4 decimal places
  const rounded = Math.round(value * 10000) / 10000;
  
  // Format without unnecessary trailing zeros
  let decimal = rounded.toString();
  if (decimal.includes('.')) {
    decimal = parseFloat(decimal).toString();
  }
  
  const fraction = decimalToFraction(rounded);
  return fraction ? `${decimal} (${fraction})` : decimal;
}

// Calculate geometry from params
export function calculateGeometry(params: DovetailParams): DovetailGeometry {
  const { 
    tailPieceLength, boardWidth, pinPieceLength, thickness, 
    numberOfTails, tailAngle, tailWidth: manualTailWidth,
    pinWidth: manualPinWidth, topOffset, bottomOffset,
  } = params;

  const ratio = ANGLE_RATIOS[tailAngle];
  const availableWidth = boardWidth - topOffset - bottomOffset;

  let tailWidth: number, pinWidth: number, halfPinWidth: number;

  if (manualTailWidth !== undefined || manualPinWidth !== undefined) {
    tailWidth = manualTailWidth ?? 1;
    pinWidth = manualPinWidth ?? 1;
    const totalTailsAndPins = (numberOfTails * tailWidth) + ((numberOfTails - 1) * pinWidth);
    halfPinWidth = (availableWidth - totalTailsAndPins) / 2;
  } else {
    const totalDivisions = numberOfTails + (numberOfTails - 1) + 1;
    const divisionWidth = availableWidth / totalDivisions;
    tailWidth = pinWidth = divisionWidth;
    halfPinWidth = divisionWidth / 2;
  }

  return {
    tailWidth, pinWidth, halfPinWidth, ratio,
    tailExtension: thickness * ratio,
    totalTailLength: tailPieceLength,
    totalPinLength: pinPieceLength,
    boardWidth, thickness, numberOfTails, topOffset, bottomOffset,
  };
}

// Generate SVG path for tail board
export function generateTailPath(g: DovetailGeometry, scale: number): string {
  const { halfPinWidth, tailWidth, pinWidth, tailExtension, thickness,
    numberOfTails, totalTailLength, boardWidth, topOffset, bottomOffset } = g;

  let path = `M 0 0 L ${totalTailLength * scale} 0 `;
  
  // Right edge tails
  let y = topOffset + halfPinWidth;
  for (let i = 0; i < numberOfTails; i++) {
    const tailEnd = totalTailLength + thickness;
    path += `L ${totalTailLength * scale} ${(y + tailExtension) * scale} `;
    path += `L ${tailEnd * scale} ${y * scale} L ${tailEnd * scale} ${(y + tailWidth) * scale} `;
    path += `L ${totalTailLength * scale} ${(y + tailWidth - tailExtension) * scale} `;
    if (i < numberOfTails - 1) {
      y += tailWidth + pinWidth;
      path += `L ${totalTailLength * scale} ${(y + tailExtension) * scale} `;
    }
  }
  
  path += `L ${totalTailLength * scale} ${boardWidth * scale} L 0 ${boardWidth * scale} `;
  
  // Left edge tails
  y = boardWidth - bottomOffset - halfPinWidth - tailWidth;
  for (let i = 0; i < numberOfTails; i++) {
    const tailEnd = -thickness;
    path += `L 0 ${(y + tailWidth - tailExtension) * scale} `;
    path += `L ${tailEnd * scale} ${(y + tailWidth) * scale} L ${tailEnd * scale} ${y * scale} `;
    path += `L 0 ${(y + tailExtension) * scale} `;
    if (i < numberOfTails - 1) {
      y -= tailWidth + pinWidth;
      path += `L 0 ${(y + tailWidth - tailExtension) * scale} `;
    }
  }
  
  return path + 'Z';
}

// Generate SVG path for pin board
export function generatePinPath(g: DovetailGeometry, scale: number): string {
  const { halfPinWidth, tailWidth, pinWidth, thickness,
    numberOfTails, totalPinLength, boardWidth, topOffset, bottomOffset } = g;

  let path = `M 0 0 L ${totalPinLength * scale} 0 `;
  
  // Right edge sockets
  let y = topOffset + halfPinWidth;
  for (let i = 0; i < numberOfTails; i++) {
    const socketDepth = totalPinLength - thickness;
    path += `L ${totalPinLength * scale} ${y * scale} `;
    path += `L ${socketDepth * scale} ${y * scale} L ${socketDepth * scale} ${(y + tailWidth) * scale} `;
    path += `L ${totalPinLength * scale} ${(y + tailWidth) * scale} `;
    y += tailWidth + pinWidth;
  }
  
  path += `L ${totalPinLength * scale} ${boardWidth * scale} L 0 ${boardWidth * scale} `;
  
  // Left edge sockets
  y = boardWidth - bottomOffset - halfPinWidth;
  for (let i = 0; i < numberOfTails; i++) {
    path += `L 0 ${y * scale} L ${thickness * scale} ${y * scale} `;
    path += `L ${thickness * scale} ${(y - tailWidth) * scale} L 0 ${(y - tailWidth) * scale} `;
    y -= tailWidth + pinWidth;
  }
  
  return path + 'Z';
}

// Get validation warnings
export function getWarnings(g: DovetailGeometry): string[] {
  const warnings: string[] = [];
  if (g.halfPinWidth < 0) warnings.push('Board too narrow for the number of tails/fingers specified');
  if (g.thickness > g.totalTailLength || g.thickness > g.totalPinLength)
    warnings.push('Material thickness exceeds board length');
  // Only check tail angle warning for dovetails (not box joints where ratio is 0)
  if (g.ratio > 0 && g.tailExtension >= g.tailWidth / 2)
    warnings.push('Tail angle too steep for tail width - tails will have no base width');
  return warnings;
}