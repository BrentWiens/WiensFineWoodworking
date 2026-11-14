'use client';

import { useState, useMemo, useCallback, useEffect, useSyncExternalStore } from 'react';
import {
  PieceInput,
  SheetConfig,
  GrainDirection,
  OptimizationResult,
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
import UnitToggle from '../UnitToggle';
import { UnitSystem, convertMeasurement, unitLabel } from '../units';

// The sheet's longer side is always drawn this many SVG units long, whatever the
// sheet size or unit system, so the labels stay the same size on screen. (At a fixed
// scale per unit, a sheet entered in mm drew so large its text shrank to nothing.)
const SHEET_DRAW_SIZE = 576;

const STORAGE_KEY = 'wiens-cut-list-optimizer';

const INPUT_CLASS = 'w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400';

const GRAIN_LABELS: Record<GrainDirection, string> = {
  'no-preference': 'No Preference',
  'along-length': 'Along Length',
  'along-width': 'Along Width',
};

interface SavedState {
  sheetConfig: SheetConfig;
  pieces: PieceInput[];
  /** Missing on cut lists saved before the unit choice was remembered. */
  units?: UnitSystem;
}

function loadSavedState(): SavedState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.sheetConfig && Array.isArray(parsed.pieces) && parsed.pieces.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore invalid data
  }
  return null;
}

/** One row of the cut list shown (and printed) with the results. */
interface CutRow {
  pieceId: string;
  label: string;
  size: string;
  placed: number;
  unplaced: number;
  sheets: number[];
}

function buildCutRows(result: OptimizationResult, pieces: PieceInput[]): CutRow[] {
  const rows = new Map<string, CutRow>();

  const rowFor = (piece: { pieceId: string; name?: string; width: number; length: number }) => {
    let row = rows.get(piece.pieceId);
    if (!row) {
      const position = pieces.findIndex((p) => p.id === piece.pieceId) + 1;
      row = {
        pieceId: piece.pieceId,
        label: piece.name || `Piece ${position}`,
        size: getPieceLabel(piece),
        placed: 0,
        unplaced: 0,
        sheets: [],
      };
      rows.set(piece.pieceId, row);
    }
    return row;
  };

  for (const layout of result.sheets) {
    for (const placed of layout.pieces) {
      const row = rowFor(placed.piece);
      row.placed++;
      if (!row.sheets.includes(layout.sheetIndex + 1)) row.sheets.push(layout.sheetIndex + 1);
    }
  }
  for (const piece of result.unplacedPieces) {
    rowFor(piece).unplaced++;
  }

  // Same order as the input rows
  return pieces.flatMap((p) => rows.get(p.id) ?? []);
}

const subscribeToNothing = () => () => {};

/**
 * The saved cut list lives in localStorage, which the server can't see. Reading it
 * during the first client render would make that render differ from the server's
 * HTML, so the form is rendered with defaults while hydrating and then remounted
 * (via the key) once on the client, where it can restore what was saved.
 */
export default function CutListOptimizer() {
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  return <CutListForm key={hydrated ? 'client' : 'server'} restore={hydrated} />;
}

function CutListForm({ restore }: { restore: boolean }) {
  const [saved] = useState(() => (restore ? loadSavedState() : null));
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(saved?.sheetConfig ?? DEFAULT_SHEET_CONFIG);
  const [pieces, setPieces] = useState<PieceInput[]>(() => saved?.pieces ?? [createEmptyPiece()]);
  const [units, setUnits] = useState<UnitSystem>(saved?.units === 'metric' ? 'metric' : 'imperial');
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Save state to localStorage when inputs change. Skipped for the hydration pass,
  // whose defaults would otherwise overwrite the saved list before it is restored.
  useEffect(() => {
    if (!restore) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sheetConfig, pieces, units }));
    } catch {
      // Ignore storage errors
    }
  }, [restore, sheetConfig, pieces, units]);

  // Parse and validate inputs
  const sheetData = useMemo(() => parseSheetConfig(sheetConfig), [sheetConfig]);

  const handleSheetChange = useCallback((field: keyof SheetConfig, value: string) => {
    // Whole sheets only; dimensions may be decimals or fractions
    const valid = field === 'sheetsAvailable' ? /^\d*$/.test(value) : /^[\d\s./-]*$/.test(value);
    if (valid) {
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

  // Switching units converts what's already entered, so a 48 in sheet becomes a
  // 1219.2 mm one rather than a 48 mm one.
  const handleUnitsChange = useCallback(
    (next: UnitSystem) => {
      if (next === units) return;
      const convert = (value: string) => convertMeasurement(value, units, next);
      setSheetConfig((prev) => ({
        ...prev,
        width: convert(prev.width),
        length: convert(prev.length),
        kerfWidth: convert(prev.kerfWidth),
      }));
      setPieces((prev) => prev.map((p) => ({ ...p, width: convert(p.width), length: convert(p.length) })));
      setUnits(next);
      setResult(null);
    },
    [units]
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

  const runOptimize = useCallback((config: SheetConfig) => {
    setErrors([]);
    setResult(null);

    // Validate sheet config
    const sheet = parseSheetConfig(config);
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
      setErrors(['Enter dimensions for at least one piece.']);
      return;
    }

    // Validate pieces against sheet size
    const sizeErrors = validatePiecesAgainstSheet(parsedPieces, sheet);
    if (sizeErrors.length > 0) {
      setErrors(sizeErrors);
      return;
    }

    // Show loading state, then run optimization
    setIsOptimizing(true);

    // Use setTimeout to allow UI to update before running optimization
    setTimeout(() => {
      const optimizationResult = optimizeCutList(parsedPieces, sheet);
      setResult(optimizationResult);
      setIsOptimizing(false);
    }, 10);
  }, [pieces]);

  const handleOptimize = useCallback(() => runOptimize(sheetConfig), [runOptimize, sheetConfig]);

  // From the "could not place" warning: take the suggested sheet count and lay it out again
  const handleUseSheetsNeeded = useCallback((sheetsNeeded: number) => {
    const next = { ...sheetConfig, sheetsAvailable: String(sheetsNeeded) };
    setSheetConfig(next);
    runOptimize(next);
  }, [runOptimize, sheetConfig]);

  const handleClear = useCallback(() => {
    setSheetConfig(DEFAULT_SHEET_CONFIG);
    setPieces([createEmptyPiece()]);
    setUnits('imperial');
    setResult(null);
    setErrors([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // Build piece color map for consistent colors
  const pieceColorMap = useMemo(() => {
    const map = new Map<string, string>();
    pieces.forEach((piece, index) => {
      map.set(piece.id, getPieceColor(index));
    });
    return map;
  }, [pieces]);

  const cutRows = useMemo(() => (result ? buildCutRows(result, pieces) : []), [result, pieces]);

  return (
    <div
      className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      data-testid="cut-list-optimizer"
    >
      {/* Header */}
      <div className="bg-stone-800 p-6 flex flex-wrap gap-3 justify-between items-center no-print">
        <p className="text-stone-300 text-sm">
          Enter your sheet size and the pieces you need, as decimals or fractions.
        </p>
        <UnitToggle units={units} onChange={handleUnitsChange} />
      </div>

      <div className="p-6 space-y-6">
        {/* Sheet Configuration */}
        <div className="bg-stone-50 p-4 rounded-lg no-print">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Sheets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="sheet-length" className="block text-sm font-medium text-stone-700 mb-1">
                Length ({unitLabel(units)})
              </label>
              <input
                id="sheet-length"
                type="text"
                inputMode="decimal"
                value={sheetConfig.length}
                onChange={(e) => handleSheetChange('length', e.target.value)}
                className={INPUT_CLASS}
                data-testid="sheet-length"
              />
            </div>
            <div>
              <label htmlFor="sheet-width" className="block text-sm font-medium text-stone-700 mb-1">
                Width ({unitLabel(units)})
              </label>
              <input
                id="sheet-width"
                type="text"
                inputMode="decimal"
                value={sheetConfig.width}
                onChange={(e) => handleSheetChange('width', e.target.value)}
                className={INPUT_CLASS}
                data-testid="sheet-width"
              />
            </div>
            <div>
              <label htmlFor="sheet-kerf" className="block text-sm font-medium text-stone-700 mb-1">
                Blade Kerf ({unitLabel(units)})
              </label>
              <input
                id="sheet-kerf"
                type="text"
                inputMode="decimal"
                value={sheetConfig.kerfWidth}
                onChange={(e) => handleSheetChange('kerfWidth', e.target.value)}
                className={INPUT_CLASS}
                data-testid="sheet-kerf"
              />
            </div>
            <div>
              <label htmlFor="sheets-available" className="block text-sm font-medium text-stone-700 mb-1">
                Sheets Available
              </label>
              <input
                id="sheets-available"
                type="text"
                inputMode="numeric"
                value={sheetConfig.sheetsAvailable}
                onChange={(e) => handleSheetChange('sheetsAvailable', e.target.value)}
                className={INPUT_CLASS}
                data-testid="sheets-available"
              />
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Grain direction runs along the length dimension
          </p>
        </div>

        {/* Pieces List */}
        <div className="no-print">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Pieces</h2>

          <div className="space-y-3">
            {/* Header row. Each input carries its own aria-label, so this is visual only.
                Below sm the name sits on its own line above the row, so it has no column here. */}
            <div className="grid grid-cols-12 gap-2 text-sm font-medium text-stone-600 px-1" aria-hidden="true">
              <div className="hidden sm:block sm:col-span-2">Name</div>
              <div className="col-span-3 sm:col-span-2">Length ({unitLabel(units)})</div>
              <div className="col-span-3 sm:col-span-2">Width ({unitLabel(units)})</div>
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
                <div className="col-span-12 sm:col-span-2">
                  <input
                    type="text"
                    value={piece.name ?? ''}
                    onChange={(e) => handlePieceChange(piece.id, 'name', e.target.value)}
                    placeholder="Name (optional)"
                    maxLength={40}
                    aria-label={`Name, piece ${index + 1}`}
                    className={INPUT_CLASS.replace('font-mono ', '')}
                    style={{ borderLeftColor: pieceColorMap.get(piece.id), borderLeftWidth: '4px' }}
                    data-testid={`piece-name-${index}`}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={piece.length}
                    onChange={(e) => handlePieceChange(piece.id, 'length', e.target.value)}
                    placeholder={units === 'metric' ? '900' : '36'}
                    aria-label={`Length, piece ${index + 1}`}
                    className={INPUT_CLASS}
                    data-testid={`piece-length-${index}`}
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={piece.width}
                    onChange={(e) => handlePieceChange(piece.id, 'width', e.target.value)}
                    placeholder={units === 'metric' ? '600' : '24'}
                    aria-label={`Width, piece ${index + 1}`}
                    className={INPUT_CLASS}
                    data-testid={`piece-width-${index}`}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={piece.quantity}
                    onChange={(e) => handlePieceChange(piece.id, 'quantity', e.target.value)}
                    placeholder="1"
                    aria-label={`Quantity, piece ${index + 1}`}
                    className={INPUT_CLASS}
                    data-testid={`piece-qty-${index}`}
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={piece.grainDirection}
                    onChange={(e) =>
                      handlePieceChange(piece.id, 'grainDirection', e.target.value as GrainDirection)
                    }
                    aria-label={`Grain direction, piece ${index + 1}`}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 bg-white"
                    data-testid={`piece-grain-${index}`}
                  >
                    {(Object.keys(GRAIN_LABELS) as GrainDirection[]).map((grain) => (
                      <option key={grain} value={grain}>{GRAIN_LABELS[grain]}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => handleRemovePiece(piece.id)}
                    disabled={pieces.length <= 1}
                    className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    aria-label={`Remove piece ${index + 1}`}
                    data-testid={`remove-piece-${index}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
            <ul className="text-red-700 space-y-1">
              {errors.map((error, i) => (
                <li key={i} className="text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons — Add Piece lives down here, next to the list it appends
            to, so entering a long cut list doesn't mean scrolling back to the top. */}
        <div className="flex flex-wrap gap-3 no-print">
          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="basis-full sm:basis-0 sm:flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            type="button"
            data-testid="optimize-button"
          >
            {isOptimizing ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Optimizing...
              </>
            ) : (
              'Optimize Cut List'
            )}
          </button>
          <button
            onClick={handleAddPiece}
            disabled={isOptimizing}
            className="flex-1 sm:flex-none px-6 py-3 border-2 border-amber-500 text-amber-700 hover:bg-amber-50 disabled:opacity-50 font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="add-piece"
          >
            + Add Piece
          </button>
          <button
            onClick={handleClear}
            disabled={isOptimizing}
            className="flex-1 sm:flex-none px-6 py-3 bg-stone-200 hover:bg-stone-300 disabled:bg-stone-100 text-stone-800 font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="clear-button"
          >
            Clear
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary. The dark panel goes light for print, where backgrounds are usually dropped. */}
            <div className="bg-stone-800 p-6 rounded-lg print:bg-white print:border print:border-stone-300">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-stone-400 text-sm print:text-stone-600">Sheets Used</div>
                  <div className="text-white text-2xl sm:text-3xl font-bold font-mono print:text-black">
                    {result.totalSheets}
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-sm print:text-stone-600">Efficiency</div>
                  <div className="text-white text-2xl sm:text-3xl font-bold font-mono print:text-black">
                    {result.overallEfficiency.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-stone-400 text-sm print:text-stone-600">Waste</div>
                  <div className="text-white text-2xl sm:text-3xl font-bold font-mono print:text-black">
                    {units === 'metric'
                      ? (result.totalWasteArea / 1000000).toFixed(2) + ' m²'
                      : (result.totalWasteArea / 144).toFixed(1) + ' ft²'}
                  </div>
                </div>
              </div>

              {/* Algorithm comparison */}
              <div className="mt-4 pt-4 border-t border-stone-700 no-print">
                <div className="text-stone-400 text-xs mb-2">
                  Best algorithm: <span className="text-amber-400 font-medium">{result.algorithmUsed}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.algorithmsCompared.map((algo) => (
                    <div
                      key={algo.name}
                      className={`text-xs px-2 py-1 rounded ${
                        algo.name === result.algorithmUsed
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-stone-700/50 text-stone-400'
                      }`}
                      title={`${algo.sheetsUsed} sheets, ${algo.unplacedCount} unplaced`}
                    >
                      {algo.name}: {algo.efficiency.toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg" role="status">
                <h3 className="font-semibold text-amber-800 mb-2">Warnings</h3>
                <ul className="text-amber-700 space-y-1">
                  {result.warnings.map((warning, i) => (
                    <li key={i} className="text-sm">
                      • {warning}
                    </li>
                  ))}
                </ul>
                {result.sheetsNeeded !== undefined && (
                  <button
                    onClick={() => handleUseSheetsNeeded(result.sheetsNeeded!)}
                    className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors no-print"
                    type="button"
                    data-testid="use-sheets-needed"
                  >
                    Use {result.sheetsNeeded} sheets
                  </button>
                )}
              </div>
            )}

            {/* Cut list: what to cut and which sheet it comes from */}
            <div className="bg-stone-50 p-4 rounded-lg" data-testid="cut-list-table">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-stone-800">Cut list</h3>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-sm font-semibold rounded-lg transition-colors no-print"
                  type="button"
                  data-testid="print-button"
                >
                  Print / save as PDF
                </button>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="text-stone-600">
                  <tr>
                    <th scope="col" className="py-1 pr-2 font-medium">Piece</th>
                    <th scope="col" className="py-1 pr-2 font-medium">Length x width ({unitLabel(units)})</th>
                    <th scope="col" className="py-1 pr-2 font-medium">Qty</th>
                    <th scope="col" className="py-1 font-medium">Sheet</th>
                  </tr>
                </thead>
                <tbody className="text-stone-800">
                  {cutRows.map((row) => (
                    <tr key={row.pieceId} className="border-t border-stone-200">
                      <td className="py-1.5 pr-2">
                        <span
                          className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                          style={{ backgroundColor: pieceColorMap.get(row.pieceId) }}
                          aria-hidden="true"
                        />
                        {row.label}
                      </td>
                      <td className="py-1.5 pr-2 font-mono">{row.size}</td>
                      <td className="py-1.5 pr-2 font-mono">
                        {row.placed}
                        {row.unplaced > 0 && (
                          <span className="text-amber-700"> ({row.unplaced} not placed)</span>
                        )}
                      </td>
                      <td className="py-1.5 font-mono">{row.sheets.length > 0 ? row.sheets.join(', ') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sheet Visualizations */}
            {sheetData && (
              <div className="space-y-6">
                {result.sheets.map((layout) => (
                  <SheetVisualization
                    key={layout.sheetIndex}
                    layout={layout}
                    sheet={sheetData}
                    pieceColorMap={pieceColorMap}
                    units={units}
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
  units,
}: {
  layout: SheetLayout;
  sheet: SheetConfigData;
  pieceColorMap: Map<string, string>;
  units: UnitSystem;
}) {
  const padding = 40;
  const scale = SHEET_DRAW_SIZE / Math.max(sheet.length, sheet.width);
  // Length on X axis, Width on Y axis
  const svgWidth = sheet.length * scale + padding * 2;
  const svgHeight = sheet.width * scale + padding * 2;
  const unitSuffix = units === 'metric' ? 'mm' : '"';

  return (
    <div className="bg-stone-50 p-4 rounded-lg break-inside-avoid">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-stone-800">
          Sheet {layout.sheetIndex + 1}
        </h3>
        <span className="text-sm text-stone-600">
          {layout.efficiency.toFixed(1)}% efficiency
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto bg-white border border-stone-200 rounded"
          style={{ maxHeight: '400px' }}
          role="img"
          aria-label={`Layout of sheet ${layout.sheetIndex + 1} with ${layout.pieces.length} pieces`}
        >
          {/* Sheet background */}
          <rect
            x={padding}
            y={padding}
            width={sheet.length * scale}
            height={sheet.width * scale}
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
            width={sheet.length * scale}
            height={sheet.width * scale}
            fill={`url(#woodGrain-${layout.sheetIndex})`}
          />

          {/* Placed pieces */}
          {/* Algorithm uses: x along width, y along length */}
          {/* Display uses: X along length, Y along width */}
          {/* So we swap: display_x = placed.y, display_y = placed.x */}
          {layout.pieces.map((placed, index) => {
            const color = pieceColorMap.get(placed.piece.pieceId) || '#888';
            // Swap coordinates: algorithm y -> display x, algorithm x -> display y
            const x = padding + placed.y * scale;
            const y = padding + placed.x * scale;
            // Swap dimensions: algorithm height (along y/length) -> display width
            const w = placed.height * scale;
            const h = placed.width * scale;
            const fontSize = Math.min(w, h) > 60 ? 12 : 10;
            const name = placed.piece.name;
            const label = getPieceLabel(placed.piece);
            // Rough width of the bold label. One that fits neither way is left off rather
            // than spilling over its neighbours; the cut list above has every size.
            const labelWidth = label.length * fontSize * 0.6;
            const upright = labelWidth > w - 4 && labelWidth <= h - 4;
            const showLabel = upright || labelWidth <= w - 4;
            // The name goes on its own line above the size when the piece is tall enough for two
            const showName = Boolean(name) && !upright && showLabel && h > fontSize * 3;

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
                {showName && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 - fontSize * 0.7}
                    fill="#000"
                    fontSize={fontSize}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {name}
                  </text>
                )}
                {showLabel && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + (showName ? fontSize * 0.7 : 0)}
                    fill="#000"
                    fontSize={fontSize}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight={showName ? 'normal' : 'bold'}
                    transform={upright ? `rotate(-90, ${x + w / 2}, ${y + h / 2})` : undefined}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Dimension labels */}
          {/* Length label on top (X axis) */}
          <text
            x={padding + (sheet.length * scale) / 2}
            y={padding - 10}
            fill="#57534E"
            fontSize="12"
            textAnchor="middle"
          >
            {sheet.length}{unitSuffix} (length)
          </text>
          {/* Width label on left (Y axis) */}
          <text
            x={padding - 10}
            y={padding + (sheet.width * scale) / 2}
            fill="#57534E"
            fontSize="12"
            textAnchor="middle"
            transform={`rotate(-90, ${padding - 10}, ${padding + (sheet.width * scale) / 2})`}
          >
            {sheet.width}{unitSuffix} (width)
          </text>
        </svg>
      </div>
    </div>
  );
}
