'use client';

import { useState, useCallback } from 'react';
import {
  type TriangleValues,
  type SolveResult,
  parseInput,
  solveTriangle,
  formatSide,
  formatAngle,
} from './trigUtils';

interface FieldState {
  a: string;
  b: string;
  c: string;
  A: string;
  B: string;
}

const INITIAL_FIELDS: FieldState = { a: '', b: '', c: '', A: '', B: '' };

type FieldKey = keyof FieldState;

const SIDE_FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'a', label: 'Side a' },
  { key: 'b', label: 'Side b' },
  { key: 'c', label: 'Side c' },
];

const ANGLE_FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'A', label: 'Angle A' },
  { key: 'B', label: 'Angle B' },
];

function TriangleDiagram({ result }: { result: SolveResult | null }) {
  const solved = result?.error === null ? result.values : null;

  const W = 300, H = 260;
  const pad = { top: 30, right: 45, bottom: 40, left: 35 };
  const maxW = W - pad.left - pad.right;
  const maxH = H - pad.top - pad.bottom;

  // Use solved proportions or default (classic 3-4-5 shape)
  let ra = 3, rb = 4;
  if (solved?.a != null && solved?.b != null && solved.a > 0 && solved.b > 0) {
    ra = solved.a;
    rb = solved.b;
  }

  const sc = Math.min(maxW / rb, maxH / ra);
  const dA = ra * sc; // drawn height (side a)
  const dB = rb * sc; // drawn width (side b)

  // Vertices: right angle at bottom-right
  const BR = { x: W - pad.right, y: H - pad.bottom };
  const BL = { x: BR.x - dB, y: BR.y };
  const TR = { x: BR.x, y: BR.y - dA };

  // Right angle indicator size
  const sq = Math.max(8, Math.min(20, Math.min(dA, dB) * 0.1));

  // Hypotenuse midpoint and rotation
  const hypMid = { x: (BL.x + TR.x) / 2, y: (BL.y + TR.y) / 2 };
  const hypDeg = Math.atan2(TR.y - BL.y, TR.x - BL.x) * 180 / Math.PI;
  const hypLen = Math.sqrt(dA * dA + dB * dB);

  // Perpendicular offset (away from the right angle, above hypotenuse)
  const ox = -dA / hypLen * 14;
  const oy = -dB / hypLen * 14;
  const cLbl = { x: hypMid.x + ox, y: hypMid.y + oy };

  // Angle arc radius
  const ar = Math.max(12, Math.min(25, Math.min(dA, dB) * 0.2));

  // Arc A at bottom-left: from bottom edge toward hypotenuse
  const haRad = Math.atan2(TR.y - BL.y, TR.x - BL.x);
  const arcAS = { x: BL.x + ar, y: BL.y };
  const arcAE = { x: BL.x + ar * Math.cos(haRad), y: BL.y + ar * Math.sin(haRad) };

  // Arc B at top-right: from right edge (down) toward hypotenuse
  const hbRad = Math.atan2(BL.y - TR.y, BL.x - TR.x);
  const arcBS = { x: TR.x, y: TR.y + ar };
  const arcBE = { x: TR.x + ar * Math.cos(hbRad), y: TR.y + ar * Math.sin(hbRad) };

  // Side a label: midpoint of right edge
  const aMid = { x: BR.x, y: (BR.y + TR.y) / 2 };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Right triangle diagram">
      {/* Triangle */}
      <polygon
        points={`${BL.x},${BL.y} ${BR.x},${BR.y} ${TR.x},${TR.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-stone-700"
      />

      {/* Right angle square */}
      <polyline
        points={`${BR.x - sq},${BR.y} ${BR.x - sq},${BR.y - sq} ${BR.x},${BR.y - sq}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-stone-500"
      />

      {/* Side labels */}
      {/* b - bottom */}
      <text x={(BL.x + BR.x) / 2} y={BL.y + 20} textAnchor="middle" className="text-sm font-semibold fill-stone-700">
        b{solved?.b != null ? ` = ${formatSide(solved.b)}` : ''}
      </text>

      {/* a - right side */}
      <text x={aMid.x + 15} y={aMid.y} textAnchor="start" className="text-sm font-semibold fill-stone-700">
        a
      </text>
      {solved?.a != null && (
        <text x={aMid.x + 15} y={aMid.y + 17} textAnchor="start" className="text-xs fill-stone-700">
          {formatSide(solved.a)}
        </text>
      )}

      {/* c - hypotenuse */}
      <text x={cLbl.x} y={cLbl.y} textAnchor="middle" className="text-sm font-semibold fill-stone-700" transform={`rotate(${hypDeg}, ${cLbl.x}, ${cLbl.y})`}>
        c{solved?.c != null ? ` = ${formatSide(solved.c)}` : ''}
      </text>

      {/* Angle labels */}
      {/* A - bottom left */}
      <text x={BL.x + ar + 8} y={BL.y - 8} textAnchor="start" className="text-sm font-semibold fill-amber-700">
        A{solved?.A != null ? ` = ${formatAngle(solved.A)}°` : ''}
      </text>

      {/* B - top right */}
      <text x={TR.x - 10} y={TR.y + ar + 18} textAnchor="end" className="text-sm font-semibold fill-amber-700">
        B{solved?.B != null ? ` = ${formatAngle(solved.B)}°` : ''}
      </text>

      {/* C = 90° label */}
      <text x={BR.x - sq - 3} y={BR.y - sq - 3} textAnchor="end" className="text-xs fill-stone-500">
        C = 90°
      </text>

      {/* Angle arcs */}
      {/* Arc for angle A at bottom-left */}
      <path
        d={`M ${arcAS.x},${arcAS.y} A ${ar},${ar} 0 0,0 ${arcAE.x},${arcAE.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-amber-600"
      />

      {/* Arc for angle B at top-right */}
      <path
        d={`M ${arcBS.x},${arcBS.y} A ${ar},${ar} 0 0,0 ${arcBE.x},${arcBE.y}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        className="text-amber-600"
      />
    </svg>
  );
}

export default function TrigCalculator() {
  const [fields, setFields] = useState<FieldState>(INITIAL_FIELDS);
  const [result, setResult] = useState<SolveResult | null>(null);

  const handleChange = useCallback((key: FieldKey, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
    setResult(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const input: TriangleValues = {
      a: parseInput(fields.a),
      b: parseInput(fields.b),
      c: parseInput(fields.c),
      A: parseInput(fields.A),
      B: parseInput(fields.B),
    };
    const solved = solveTriangle(input);
    setResult(solved);

    // Fill in solved values into fields (only fill empty ones)
    if (!solved.error) {
      setFields(prev => ({
        a: prev.a || (solved.values.a != null ? formatSide(solved.values.a) : ''),
        b: prev.b || (solved.values.b != null ? formatSide(solved.values.b) : ''),
        c: prev.c || (solved.values.c != null ? formatSide(solved.values.c) : ''),
        A: prev.A || (solved.values.A != null ? formatAngle(solved.values.A) : ''),
        B: prev.B || (solved.values.B != null ? formatAngle(solved.values.B) : ''),
      }));
    }
  }, [fields]);

  const handleReset = useCallback(() => {
    setFields(INITIAL_FIELDS);
    setResult(null);
  }, []);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden" role="application" aria-label="Trigonometry Calculator" data-testid="trig-calculator">

      <div className="p-4 sm:p-6 bg-stone-50">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Triangle diagram */}
          <div className="flex items-center justify-center" data-testid="triangle-diagram">
            <TriangleDiagram result={result} />
          </div>

          {/* Input fields */}
          <div>
            <div className="space-y-3">
              {/* Side inputs */}
              <div className="text-xs text-stone-500 font-medium uppercase tracking-wide">Sides</div>
              {SIDE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label htmlFor={`field-${key}`} className="w-20 text-sm font-semibold text-stone-700 flex-shrink-0">
                    {label}
                  </label>
                  <input
                    id={`field-${key}`}
                    type="text"
                    inputMode="decimal"
                    value={fields[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="e.g. 5 or 3-1/2"
                    className="flex-1 px-3 py-2 border rounded-lg text-stone-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white border-stone-300"
                    data-testid={`input-${key}`}
                  />
                </div>
              ))}

              {/* Angle inputs */}
              <div className="text-xs text-stone-500 font-medium uppercase tracking-wide mt-4">Angles (degrees)</div>
              {ANGLE_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <label htmlFor={`field-${key}`} className="w-20 text-sm font-semibold text-stone-900 flex-shrink-0">
                    {label}
                  </label>
                  <input
                    id={`field-${key}`}
                    type="text"
                    inputMode="decimal"
                    value={fields[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder="e.g. 45 or 30"
                    className="flex-1 px-3 py-2 border rounded-lg text-stone-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white border-stone-300"
                    data-testid={`input-${key}`}
                  />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors active:scale-95 shadow-sm"
                data-testid="calculate"
              >
                Calculate
              </button>
              <button
                onClick={handleReset}
                className="flex-1 bg-stone-400 hover:bg-stone-500 text-white font-semibold py-3 rounded-lg transition-colors active:scale-95"
                data-testid="reset"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {result?.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center" data-testid="error-message">
            {result.error}
          </div>
        )}

      </div>
    </div>
  );
}
