'use client';

import { useState, useMemo, useCallback } from 'react';
import UnitToggle, { UnitSystem, mmToInches } from '../UnitToggle';

interface LumberEntry {
  id: string;
  thickness: string;
  width: string;
  length: string;
  quantity: string;
}

function createEntry(): LumberEntry {
  return {
    id: crypto.randomUUID(),
    thickness: '',
    width: '',
    length: '',
    quantity: '1',
  };
}

function calcBoardFeet(entry: LumberEntry, units: UnitSystem) {
  let t = parseFloat(entry.thickness) || 0;
  let w = parseFloat(entry.width) || 0;
  let l = parseFloat(entry.length) || 0;
  const q = parseInt(entry.quantity, 10) || 1;
  if (t <= 0 || w <= 0 || l <= 0) return 0;
  if (units === 'metric') {
    t = mmToInches(t);
    w = mmToInches(w);
    l = mmToInches(l);
  }
  return (t * w * l * q) / 144;
}

function formatBoardFeet(value: number): string {
  if (value === 0) return '0';
  if (value < 0.01) return value.toFixed(4);
  if (value < 1) return value.toFixed(3);
  return parseFloat(value.toFixed(2)).toString();
}

export default function BoardFeetCalculator() {
  const [entries, setEntries] = useState<LumberEntry[]>([createEntry()]);
  const [units, setUnits] = useState<UnitSystem>('imperial');

  const totalBoardFeet = useMemo(
    () => entries.reduce((sum, e) => sum + calcBoardFeet(e, units), 0),
    [entries, units]
  );

  const handleChange = useCallback(
    (id: string, field: keyof LumberEntry, value: string) => {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
      }
    },
    []
  );

  const handleAdd = useCallback(() => {
    setEntries((prev) => [...prev, createEntry()]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setEntries((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const handleClear = useCallback(() => {
    setEntries([createEntry()]);
  }, []);

  return (
    <div
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      data-testid="board-feet-calculator"
    >
      {/* Result Display */}
      <div className="bg-stone-800 p-6">
        <div className="text-stone-400 text-sm mb-2">Total Board Feet</div>
        <div className="flex items-baseline gap-4">
          <span
            className="text-white text-5xl font-bold font-mono"
            data-testid="result"
          >
            {formatBoardFeet(totalBoardFeet)}
          </span>
          <span className="text-stone-400 text-lg">bf</span>
        </div>
      </div>

      {/* Lumber Entries */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-stone-800">Lumber</h3>
          <UnitToggle units={units} onChange={setUnits} />
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-stone-600 px-1">
          <div className="col-span-2">Thickness</div>
          <div className="col-span-2">Width</div>
          <div className="col-span-2">Length</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-3">Board Feet</div>
          <div className="col-span-1"></div>
        </div>

        {/* Entry rows */}
        {entries.map((entry, index) => {
          const bf = calcBoardFeet(entry, units);
          return (
            <div
              key={entry.id}
              className="grid grid-cols-12 gap-2 items-center"
              data-testid={`entry-row-${index}`}
            >
              <div className="col-span-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={entry.thickness}
                  onChange={(e) =>
                    handleChange(entry.id, 'thickness', e.target.value)
                  }
                  placeholder={units === 'metric' ? '38' : '1.5'}
                  className="w-full px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                  data-testid={`thickness-input-${index}`}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={entry.width}
                  onChange={(e) =>
                    handleChange(entry.id, 'width', e.target.value)
                  }
                  placeholder={units === 'metric' ? '150' : '6'}
                  className="w-full px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                  data-testid={`width-input-${index}`}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={entry.length}
                  onChange={(e) =>
                    handleChange(entry.id, 'length', e.target.value)
                  }
                  placeholder={units === 'metric' ? '2440' : '96'}
                  className="w-full px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                  data-testid={`length-input-${index}`}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={entry.quantity}
                  onChange={(e) =>
                    handleChange(entry.id, 'quantity', e.target.value)
                  }
                  placeholder="1"
                  className="w-full px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400"
                  data-testid={`quantity-input-${index}`}
                />
              </div>
              <div className="col-span-3 text-stone-700 font-mono text-sm px-2">
                {bf > 0 ? `${formatBoardFeet(bf)} bf` : '\u2014'}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleRemove(entry.id)}
                  disabled={entries.length <= 1}
                  className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  type="button"
                  aria-label="Remove entry"
                  data-testid={`remove-entry-${index}`}
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
          );
        })}

        <p className="text-xs text-stone-500">
          {units === 'metric'
            ? 'Dimensions in mm (converted to inches). Board feet = (T\u00d7W\u00d7L in inches \u00d7 Qty) / 144'
            : 'All dimensions in inches. Board feet = (Thickness \u00d7 Width \u00d7 Length \u00d7 Qty) / 144'}
        </p>

        {/* Add Entry sits with Clear at the foot of the list rather than in the
            header, so adding a run of boards doesn't mean scrolling back up. */}
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="add-entry"
          >
            + Add Entry
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
            type="button"
            data-testid="clear-button"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
