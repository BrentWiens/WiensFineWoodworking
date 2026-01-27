'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  PieceInput,
  SheetConfig,
  GrainDirection,
  OptimizationResult,
  PlacedPiece,
  SheetLayout,
  SheetConfigData,
  DEFAULT_SHEET_CONFIG,
  createEmptyPiece,
  parseSheetConfig,
  parsePieces,
  validatePiecesAgainstSheet,
  optimizeCutList,
  getPieceColor,
  getPieceLabel,
} from './cutListUtils';

// SVG scale: pixels per inch
const SCALE = 6;

export default function CutListOptimizer() {
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(DEFAULT_SHEET_CONFIG);
  const [pieces, setPieces] = useState<PieceInput[]>([createEmptyPiece()]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Parse and validate inputs
  const sheetData = useMemo(() => parseSheetConfig(sheetConfig), [sheetConfig]);

  const handleSheetChange = useCallback((field: keyof SheetConfig, value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setSheetConfig((prev) => ({ ...prev, [field]: value }));
      setResult(null);
    }
  }, []);

  const handlePieceChange = useCallback(
    (id: string, field: keyof PieceInput, value: string | GrainDirection) => {
      setPieces((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
      setResult(null);
    },
    []
  );

  const handleAddPiece = useCallback(() => {
    setPieces((prev) => [...prev, createEmptyPiece()]);
    setResult(null);
  }, []);

  const handleRemovePiece = useCallback((id: string) => {
    setPieces((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((p) => p.id !== id);
    });
    setResult(null);
  }, []);

  const handleOptimize = useCallback(() => {
    setErrors([]);
    setResult(null);

    // Validate sheet config
    const sheet = parseSheetConfig(sheetConfig);
    if (!sheet) {
      setErrors(['Invalid sheet configuration. Please check dimensions.']);
      return;
    }

    // Parse and validate pieces
    const { pieces: parsedPieces, errors: parseErrors } = parsePieces(pieces);
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      return;
    }

    if (parsedPieces.length === 0) {
      setErrors(['Please add at least one piece.']);
      return;
    }

    // Validate pieces against sheet size
    const sizeErrors = validatePiecesAgainstSheet(parsedPieces, sheet);
    if (sizeErrors.length > 0) {
      setErrors(sizeErrors);
      return;
    }

    // Run optimization
    const optimizationResult = optimizeCutList(parsedPieces, sheet);
    setResult(optimizationResult);
  }, [sheetConfig, pieces]);

  const handleClear = useCallback(() => {
    setSheetConfig(DEFAULT_SHEET_CONFIG);
    setPieces([createEmptyPiece()]);
    setResult(null);
    setErrors([]);
  }, []);

  // Build piece color map for consistent colors
  const pieceColorMap = useMemo(() => {
    const map = new Map<string, string>();
    pieces.forEach((piece, index) => {
      map.set(piece.id, getPieceColor(index));
    });
    return map;
  }, [pieces]);

  return (
    <div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      data-testid="cut-list-optimizer"
    >
      {/* Header */}
      <div className="bg-stone-800 p-6">
        <h2 className="text-white text-2xl font-bold">Cut List Optimizer</h2>
        <p className="text-stone-400 text-sm mt-1">
          Optimize plywood cuts to minimize waste
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Sheet Configuration */}
        <div className="bg-stone-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">Sheet Settings</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Width (in)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={sheetConfig.width}
                onChange={(e) => handleSheetChange('width', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono"
                data-testid="sheet-width"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Length (in)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={sheetConfig.length}
                onChange={(e) => handleSheetChange('length', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono"
                data-testid="sheet-length"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Blade Kerf (in)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={sheetConfig.kerfWidth}
                onChange={(e) => handleSheetChange('kerfWidth', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono"
                data-testid="sheet-kerf"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Sheets Available
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={sheetConfig.sheetsAvailable}
                onChange={(e) => handleSheetChange('sheetsAvailable', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono"
                data-testid="sheets-available"
              />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Grain direction runs along the length dimension
          </p>
        </div>

        {/* Pieces List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-stone-800">Pieces</h3>
            <button
              onClick={handleAddPiece}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
              type="button"
              data-testid="add-piece"
            >
              + Add Piece
            </button>
          </div>

          <div className="space-y-3">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-stone-600 px-1">
              <div className="col-span-3">Width (in)</div>
              <div className="col-span-3">Length (in)</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Grain</div>
              <div className="col-span-1"></div>
            </div>

            {/* Piece rows */}
            {pieces.map((piece, index) => (
              <div
                key={piece.id}
                className="grid grid-cols-12 gap-2 items-center"
                data-testid={`piece-row-${index}`}
              >
                <div className="col-span-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={piece.width}
                    onChange={(e) => handlePieceChange(piece.id, 'width', e.target.value)}
                    placeholder="24"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                    style={{ borderLeftColor: pieceColorMap.get(piece.id), borderLeftWidth: '4px' }}
                    data-testid={`piece-width-${index}`}
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={piece.length}
                    onChange={(e) => handlePieceChange(piece.id, 'length', e.target.value)}
                    placeholder="36"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                    data-testid={`piece-length-${index}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={piece.quantity}
                    onChange={(e) => handlePieceChange(piece.id, 'quantity', e.target.value)}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                    data-testid={`piece-qty-${index}`}
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={piece.grainDirection}
                    onChange={(e) =>
                      handlePieceChange(piece.id, 'grainDirection', e.target.value as GrainDirection)
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 bg-white"
                    data-testid={`piece-grain-${index}`}
                  >
                    <option value="no-preference">No Preference</option>
                    <option value="along-length">Along Length</option>
                    <option value="along-width">Along Width</option>
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleRemovePiece(piece.id)}
                    disabled={pieces.length <= 1}
                    className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    aria-label="Remove piece"
                    data-testid={`remove-piece-${index}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Errors</h4>
            <ul className="text-red-700 space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleOptimize}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="optimize-button"
          >
            Optimize Cut List
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="clear-button"
          >
            Clear
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-stone-800 p-6 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-stone-400 text-sm">Sheets Used</div>
                  <div className="text-white text-3xl font-bold font-mono">
                    {result.totalSheets}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-sm">Efficiency</div>
                  <div className="text-white text-3xl font-bold font-mono">
                    {result.overallEfficiency.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-sm">Waste</div>
                  <div className="text-white text-3xl font-bold font-mono">
                    {result.totalWasteArea.toFixed(0)} in²
                  </div>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2">Warnings</h4>
                <ul className="text-amber-700 space-y-1">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sheet Visualizations */}
            {sheetData && (
              <div className="space-y-6">
                {result.sheets.map((layout) => (
                  <SheetVisualization
                    key={layout.sheetIndex}
                    layout={layout}
                    sheet={sheetData}
                    pieceColorMap={pieceColorMap}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Sheet Visualization Component
// Length is on X axis (horizontal), Width is on Y axis (vertical)
// Grain runs along the length (horizontal)
function SheetVisualization({
  layout,
  sheet,
  pieceColorMap,
}: {
  layout: SheetLayout;
  sheet: SheetConfigData;
  pieceColorMap: Map<string, string>;
}) {
  const padding = 40;
  // Length on X axis, Width on Y axis
  const svgWidth = sheet.length * SCALE + padding * 2;
  const svgHeight = sheet.width * SCALE + padding * 2;

  return (
    <div className="bg-stone-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-stone-800">
          Sheet {layout.sheetIndex + 1}
        </h4>
        <span className="text-sm text-stone-600">
          {layout.efficiency.toFixed(1)}% efficiency
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto bg-white border border-stone-200 rounded"
          style={{ maxHeight: '400px' }}
        >
          {/* Sheet background */}
          <rect
            x={padding}
            y={padding}
            width={sheet.length * SCALE}
            height={sheet.width * SCALE}
            fill="#E7E5E4"
            stroke="#78716C"
            strokeWidth="2"
          />

          {/* Wood grain pattern - wavy lines running along length (horizontal) */}
          <defs>
            <pattern
              id={`woodGrain-${layout.sheetIndex}`}
              patternUnits="userSpaceOnUse"
              width="100"
              height="8"
            >
              <path
                d="M0 4 Q25 2, 50 4 T100 4"
                stroke="#A8998A"
                strokeWidth="0.5"
                fill="none"
                opacity="0.5"
              />
            </pattern>
          </defs>
          <rect
            x={padding}
            y={padding}
            width={sheet.length * SCALE}
            height={sheet.width * SCALE}
            fill={`url(#woodGrain-${layout.sheetIndex})`}
          />

          {/* Placed pieces */}
          {/* Algorithm uses: x along width, y along length */}
          {/* Display uses: X along length, Y along width */}
          {/* So we swap: display_x = placed.y, display_y = placed.x */}
          {layout.pieces.map((placed, index) => {
            const color = pieceColorMap.get(placed.piece.pieceId) || '#888';
            // Swap coordinates: algorithm y -> display x, algorithm x -> display y
            const x = padding + placed.y * SCALE;
            const y = padding + placed.x * SCALE;
            // Swap dimensions: algorithm height (along y/length) -> display width
            const w = placed.height * SCALE;
            const h = placed.width * SCALE;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={color}
                  fillOpacity="0.7"
                  stroke={color}
                  strokeWidth="2"
                />
                {/* Piece label */}
                <text
                  x={x + w / 2}
                  y={y + h / 2}
                  fill="#000"
                  fontSize={Math.min(w, h) > 60 ? '12' : '10'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontWeight="bold"
                >
                  {getPieceLabel(placed.piece)}
                </text>
                {/* Rotation indicator */}
                {placed.piece.rotated && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 14}
                    fill="#000"
                    fontSize="9"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    (rotated)
                  </text>
                )}
              </g>
            );
          })}

          {/* Dimension labels */}
          {/* Length label on top (X axis) */}
          <text
            x={padding + (sheet.length * SCALE) / 2}
            y={padding - 10}
            fill="#57534E"
            fontSize="12"
            textAnchor="middle"
          >
            {sheet.length}&quot; (length)
          </text>
          {/* Width label on left (Y axis) */}
          <text
            x={padding - 10}
            y={padding + (sheet.width * SCALE) / 2}
            fill="#57534E"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-90, ${padding - 10}, ${padding + (sheet.width * SCALE) / 2})`}
          >
            {sheet.width}&quot; (width)
          </text>
        </svg>
      </div>
    </div>
  );
}
