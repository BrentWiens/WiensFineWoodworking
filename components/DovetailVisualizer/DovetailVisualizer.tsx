'use client';

import { useState, useMemo, useId } from 'react';
import {
  DovetailParams, DovetailGeometry, InputValues, DEFAULT_PARAMS,
  formatDimension, calculateGeometry, generateTailPath, generatePinPath, getWarnings
} from './dovetailUtils';
import UnitToggle from '../UnitToggle';
import { UnitSystem, convertMeasurement, inchesToMm } from '../units';

// SVG units per inch. Metric drawings use the same physical scale (see scaleFor).
const PX_PER_INCH = 20;

/**
 * SVG units per measurement unit. Dividing by 25.4 for metric draws a 200 mm board
 * the same size as an 8 in one; at 20 units per mm the drawing was so large that
 * its labels shrank to nothing.
 */
function scaleFor(units: UnitSystem): number {
  return units === 'metric' ? PX_PER_INCH / 25.4 : PX_PER_INCH;
}

/** The fields that hold a length, and so change when the unit system does. */
const LENGTH_FIELDS = [
  'pinPieceLength', 'tailPieceLength', 'boardWidth', 'thickness',
  'tailWidth', 'pinWidth', 'topOffset', 'bottomOffset',
] as const satisfies readonly (keyof InputValues)[];

/** An inch default in the current unit system, rounded to a tidy number of mm. */
function defaultFor(inches: number, units: UnitSystem): number {
  return units === 'metric' ? Math.round(inchesToMm(inches) * 10) / 10 : inches;
}

function formatDimensionForUnit(value: number, units: UnitSystem): string {
  if (units === 'metric') {
    const rounded = Math.round(value * 100) / 100;
    return `${rounded}mm`;
  }
  return `${formatDimension(value)}"`;
}

interface DovetailVisualizerProps {
  initialPinPieceLength?: number;
  initialTailPieceLength?: number;
  initialBoardWidth?: number;
}

function NumberInput({
  label, value, onChange, onBlur, placeholder, step = "0.5", min = "0.5"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-medium placeholder:text-stone-400"
      />
    </div>
  );
}

// Dimension markers component
function WidthDimensions({ geometry, offsetX, units, scale }: { geometry: DovetailGeometry; offsetX: number; units: UnitSystem; scale: number }) {
  const { halfPinWidth, tailWidth, pinWidth, numberOfTails, topOffset, bottomOffset } = geometry;
  
  type MarkerType = 'half-pin' | 'tail' | 'pin' | 'offset';
  const markers: { y1: number; y2: number; label: string; type: MarkerType }[] = [];
  let y = 0;
  
  const fmt = (v: number) => formatDimensionForUnit(v, units);
  if (topOffset > 0) {
    markers.push({ y1: y, y2: y + topOffset, label: fmt(topOffset), type: 'offset' });
    y += topOffset;
  }
  markers.push({ y1: y, y2: y + halfPinWidth, label: fmt(halfPinWidth), type: 'half-pin' });
  y += halfPinWidth;

  for (let i = 0; i < numberOfTails; i++) {
    markers.push({ y1: y, y2: y + tailWidth, label: fmt(tailWidth), type: 'tail' });
    y += tailWidth;
    if (i < numberOfTails - 1) {
      markers.push({ y1: y, y2: y + pinWidth, label: fmt(pinWidth), type: 'pin' });
      y += pinWidth;
    }
  }

  markers.push({ y1: y, y2: y + halfPinWidth, label: fmt(halfPinWidth), type: 'half-pin' });
  y += halfPinWidth;
  if (bottomOffset > 0) {
    markers.push({ y1: y, y2: y + bottomOffset, label: fmt(bottomOffset), type: 'offset' });
  }

  const colors: Record<MarkerType, string> = {
    tail: '#B45309', pin: '#059669', offset: '#7C3AED', 'half-pin': '#6B7280'
  };
  const xPos = offsetX + 15;

  return (
    <>
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={xPos} y1={m.y1 * scale} x2={xPos} y2={m.y2 * scale} stroke={colors[m.type]} strokeWidth="1.5" />
          <line x1={xPos - 4} y1={m.y1 * scale} x2={xPos + 4} y2={m.y1 * scale} stroke={colors[m.type]} strokeWidth="1" />
          <line x1={xPos - 4} y1={m.y2 * scale} x2={xPos + 4} y2={m.y2 * scale} stroke={colors[m.type]} strokeWidth="1" />
          <text x={xPos + 8} y={((m.y1 + m.y2) / 2) * scale + 3} fontSize="9" fill={colors[m.type]} fontWeight="500">
            {m.label}
          </text>
        </g>
      ))}
    </>
  );
}

// Overall dimension lines component
function OverallDimensions({
  width, height, xLineStart, xLineEnd, yLineXPos, units, scale
}: {
  width: number;
  height: number;
  xLineStart: number;
  xLineEnd: number;
  yLineXPos: number;
  units: UnitSystem;
  scale: number;
}) {
  return (
    <>
      {/* X dimension */}
      <g>
        <line x1={xLineStart * scale} y1={-12} x2={xLineEnd * scale} y2={-12} stroke="#374151" strokeWidth="1" />
        <line x1={xLineStart * scale} y1={-16} x2={xLineStart * scale} y2={-8} stroke="#374151" strokeWidth="1" />
        <line x1={xLineEnd * scale} y1={-16} x2={xLineEnd * scale} y2={-8} stroke="#374151" strokeWidth="1" />
        <text x={((xLineStart + xLineEnd) / 2) * scale} y={-16} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">
          {formatDimensionForUnit(width, units)}
        </text>
      </g>
      {/* Y dimension */}
      <g>
        <line x1={yLineXPos * scale - 12} y1={0} x2={yLineXPos * scale - 12} y2={height * scale} stroke="#374151" strokeWidth="1" />
        <line x1={yLineXPos * scale - 16} y1={0} x2={yLineXPos * scale - 8} y2={0} stroke="#374151" strokeWidth="1" />
        <line x1={yLineXPos * scale - 16} y1={height * scale} x2={yLineXPos * scale - 8} y2={height * scale} stroke="#374151" strokeWidth="1" />
        <text x={yLineXPos * scale - 16} y={height * scale / 2} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600"
          transform={`rotate(-90, ${yLineXPos * scale - 16}, ${height * scale / 2})`}>
          {formatDimensionForUnit(height, units)}
        </text>
      </g>
    </>
  );
}

// Board SVG component
function BoardSVG({
  geometry, type, units
}: {
  geometry: DovetailGeometry;
  type: 'tail' | 'pin';
  units: UnitSystem;
}) {
  const isTail = type === 'tail';
  const scale = scaleFor(units);
  const path =isTail ? generateTailPath(geometry, scale) : generatePinPath(geometry, scale);
  const length = isTail ? geometry.totalTailLength : geometry.totalPinLength;
  const patternId = `woodGrain${type}`;
  const fill = isTail ? '#D4A574' : '#C19A6B';
  const grainStroke = isTail ? '#C4956A' : '#A8845A';
  
  // X dimension line positions - visually align with outer edges of the board
  const xLineStart = isTail ? -geometry.thickness : 0;
  const xLineEnd = isTail ? length + geometry.thickness : length;
  
  // Y dimension line position - to the left of the leftmost part of the board
  const yLineXPos = isTail ? -geometry.thickness : 0;
  
  // Use consistent viewBox for both boards based on the larger of the two lengths
  // Plus thickness on each side to account for tails/sockets
  const maxLength = Math.max(geometry.totalTailLength, geometry.totalPinLength);
  const viewBoxXStart = -geometry.thickness * scale - 35;
  const viewBoxWidth = (maxLength + geometry.thickness * 2) * scale + 120;

  return (
    <svg
      viewBox={`${viewBoxXStart} -30 ${viewBoxWidth} ${geometry.boardWidth * scale + 50}`}
      className="w-full h-auto"
      style={{ maxHeight: '400px' }}
      role="img"
      aria-label={`${geometry.ratio === 0 ? (isTail ? 'Board A' : 'Board B') : (isTail ? 'Tail board' : 'Pin board')} layout`}
    >
      <defs>
        <pattern id={patternId} patternUnits="userSpaceOnUse" width="100" height="8">
          <path d="M0 4 Q25 2, 50 4 T100 4" stroke={grainStroke} strokeWidth="0.5" fill="none" opacity="0.4"/>
        </pattern>
      </defs>
      <path d={path} fill={fill} stroke="#8B4513" strokeWidth="2" />
      <path d={path} fill={`url(#${patternId})`} />
      <OverallDimensions
        width={length}
        height={geometry.boardWidth}
        xLineStart={xLineStart}
        xLineEnd={xLineEnd}
        yLineXPos={yLineXPos}
        units={units}
        scale={scale}
      />
      <WidthDimensions geometry={geometry} offsetX={length * scale + (isTail ? geometry.thickness * scale : 0)} units={units} scale={scale} />
    </svg>
  );
}

export default function DovetailVisualizer({
  initialPinPieceLength = 12,
  initialTailPieceLength = 6,
  initialBoardWidth = 8,
}: DovetailVisualizerProps = {}) {
  
  const [params, setParams] = useState<DovetailParams>({
    ...DEFAULT_PARAMS,
    pinPieceLength: initialPinPieceLength,
    tailPieceLength: initialTailPieceLength,
    boardWidth: initialBoardWidth,
  });

  const [inputValues, setInputValues] = useState<InputValues>({
    pinPieceLength: String(initialPinPieceLength),
    tailPieceLength: String(initialTailPieceLength),
    boardWidth: String(initialBoardWidth),
    thickness: '0.5',
    numberOfTails: '3',
    tailWidth: '',
    pinWidth: '',
    topOffset: '',
    bottomOffset: '',
  });

  const handleChange = (field: keyof InputValues, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    const num = parseFloat(value);
    if (isNaN(num)) {
      if (['tailWidth', 'pinWidth'].includes(field)) setParams(p => ({ ...p, [field]: undefined }));
      if (['topOffset', 'bottomOffset'].includes(field)) setParams(p => ({ ...p, [field]: 0 }));
      return;
    }
    if (field === 'numberOfTails' && num >= 1) {
      setParams(p => ({ ...p, numberOfTails: Math.floor(num) }));
    } else if (['tailWidth', 'pinWidth'].includes(field) && num > 0) {
      setParams(p => ({ ...p, [field]: num }));
    } else if (['topOffset', 'bottomOffset'].includes(field) && num >= 0) {
      setParams(p => ({ ...p, [field]: num }));
    } else if (num > 0) {
      setParams(p => ({ ...p, [field]: num }));
    }
  };

  const handleBlur = (field: keyof InputValues, defaultVal?: number) => {
    const val = inputValues[field];
    const num = parseFloat(val);
    if (['tailWidth', 'pinWidth'].includes(field)) {
      if (!val || isNaN(num) || num <= 0) {
        setInputValues(p => ({ ...p, [field]: '' }));
        setParams(p => ({ ...p, [field]: undefined }));
      }
    } else if (['topOffset', 'bottomOffset'].includes(field)) {
      if (!val || isNaN(num) || num < 0) {
        setInputValues(p => ({ ...p, [field]: '' }));
        setParams(p => ({ ...p, [field]: 0 }));
      }
    } else if (!val || isNaN(num) || num <= 0) {
      // The defaults are in inches; the tail count is the one field that isn't a length
      const inches = (defaultVal ?? DEFAULT_PARAMS[field as keyof typeof DEFAULT_PARAMS]) as number;
      const reset = field === 'numberOfTails' ? inches : defaultFor(inches, units);
      setInputValues(p => ({ ...p, [field]: String(reset) }));
      setParams(p => ({ ...p, [field]: reset }));
    }
  };

  const [units, setUnits] = useState<UnitSystem>('imperial');

  // Switching units converts what's already entered, so the joint stays the same size
  const handleUnitsChange = (next: UnitSystem) => {
    if (next === units) return;

    const converted = { ...inputValues };
    for (const field of LENGTH_FIELDS) {
      converted[field] = convertMeasurement(inputValues[field], units, next);
    }
    setInputValues(converted);

    // Re-read the numbers from the converted text so the drawing matches the inputs exactly
    setParams(p => {
      const nextParams = { ...p };
      for (const field of LENGTH_FIELDS) {
        const num = parseFloat(converted[field]);
        if (field === 'tailWidth' || field === 'pinWidth') {
          nextParams[field] = num > 0 ? num : undefined;
        } else if (field === 'topOffset' || field === 'bottomOffset') {
          nextParams[field] = num >= 0 ? num : 0;
        } else if (num > 0) {
          nextParams[field] = num;
        }
      }
      return nextParams;
    });
    setUnits(next);
  };

  // Spinner steps that suit each unit system
  const metric = units === 'metric';
  const coarse = { step: metric ? '10' : '0.5', min: metric ? '1' : '0.5' };
  const fine = { step: metric ? '1' : '0.125', min: metric ? '1' : '0.125' };
  const override = { step: metric ? '1' : '0.125', min: metric ? '1' : '0.25' };
  const offset = { step: metric ? '1' : '0.125', min: '0' };

  const jointAngleId = useId();
  const geometry = useMemo(() => calculateGeometry(params), [params]);
  const warnings = useMemo(() => getWarnings(geometry), [geometry]);
  const isBoxJoint = params.tailAngle === '1:0';

  return (
    <div data-testid="dovetail-calculator" className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-stone-700">Board Dimensions</h2>
            <UnitToggle units={units} onChange={handleUnitsChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label={isBoxJoint ? "Board A Length" : "Tail Piece Length"} value={inputValues.tailPieceLength} {...coarse}
              onChange={v => handleChange('tailPieceLength', v)} onBlur={() => handleBlur('tailPieceLength', initialTailPieceLength)} />
            <NumberInput label={isBoxJoint ? "Board B Length" : "Pin Piece Length"} value={inputValues.pinPieceLength} {...coarse}
              onChange={v => handleChange('pinPieceLength', v)} onBlur={() => handleBlur('pinPieceLength', initialPinPieceLength)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="Board Width" value={inputValues.boardWidth} {...coarse}
              onChange={v => handleChange('boardWidth', v)} onBlur={() => handleBlur('boardWidth', initialBoardWidth)} />
            <NumberInput label="Material Thickness" value={inputValues.thickness} {...fine}
              onChange={v => handleChange('thickness', v)} onBlur={() => handleBlur('thickness')} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-700 mb-3">Joint Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label={isBoxJoint ? "Number of Fingers" : "Number of Tails"} value={inputValues.numberOfTails} step="1" min="1"
              onChange={v => handleChange('numberOfTails', v)} onBlur={() => handleBlur('numberOfTails')} />
            <div>
              <label htmlFor={jointAngleId} className="block text-sm font-medium text-stone-600 mb-1">Joint Angle</label>
              <select id={jointAngleId} value={params.tailAngle} onChange={e => setParams(p => ({ ...p, tailAngle: e.target.value as DovetailParams['tailAngle'] }))}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-medium">
                <option value="1:0">Box Joint (90°)</option>
                <option value="1:8">1:8 (7°) - Hardwood</option>
                <option value="1:6">1:6 (9.5°) - Softwood</option>
                <option value="1:4">1:4 (14°) - Stylistic / Thin Material</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label={isBoxJoint ? "Finger Width (override)" : "Tail Width (override)"} value={inputValues.tailWidth} placeholder="Auto" {...override}
              onChange={v => handleChange('tailWidth', v)} onBlur={() => handleBlur('tailWidth')} />
            <NumberInput label={isBoxJoint ? "Socket Width (override)" : "Pin Width (override)"} value={inputValues.pinWidth} placeholder="Auto" {...override}
              onChange={v => handleChange('pinWidth', v)} onBlur={() => handleBlur('pinWidth')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput label="Top Offset" value={inputValues.topOffset} placeholder="0" {...offset}
              onChange={v => handleChange('topOffset', v)} onBlur={() => handleBlur('topOffset')} />
            <NumberInput label="Bottom Offset" value={inputValues.bottomOffset} placeholder="0" {...offset}
              onChange={v => handleChange('bottomOffset', v)} onBlur={() => handleBlur('bottomOffset')} />
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-semibold text-amber-800 mb-2">⚠️ Warnings</h3>
          <ul className="text-amber-700 space-y-1">
            {warnings.map((w, i) => <li key={i} className="text-sm">• {w}</li>)}
          </ul>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {[
          { color: '#6B7280', label: isBoxJoint ? 'Half-finger' : 'Half-pin' },
          { color: '#B45309', label: isBoxJoint ? 'Finger' : 'Tail' },
          { color: '#059669', label: isBoxJoint ? 'Socket' : 'Pin' },
          ...(params.topOffset > 0 || params.bottomOffset > 0 ? [{ color: '#7C3AED', label: 'Offset' }] : [])
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-stone-600">{label}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
          <h3 className="text-xl font-semibold text-stone-800 mb-4">{isBoxJoint ? 'Board A' : 'Tail Board'}</h3>
          <div className="bg-white border border-stone-300 rounded p-4">
            <BoardSVG geometry={geometry} type="tail" units={units} />
          </div>
        </div>
        <div className="bg-stone-50 p-6 rounded-lg border border-stone-200">
          <h3 className="text-xl font-semibold text-stone-800 mb-4">{isBoxJoint ? 'Board B' : 'Pin Board'}</h3>
          <div className="bg-white border border-stone-300 rounded p-4">
            <BoardSVG geometry={geometry} type="pin" units={units} />
          </div>
        </div>
      </div>
    </div>
  );
}