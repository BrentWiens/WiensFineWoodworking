'use client';

import { useState, useMemo, useCallback } from 'react';
import UnitToggle from '../UnitToggle';
import { UnitSystem, convertMeasurement, mmToInches } from '../units';
import { parseMeasurement } from '../FractionalCalculator/fractionalUtils';
import {
  calculateBoardFeet,
  formatBoardFeet,
  isValidDimensionInput,
  isValidNumericInput,
  isValidQuantityInput,
  parseQuantity,
  addWaste,
  formatCost,
} from './boardFeetUtils';

interface LumberEntry {
  id: string;
  thickness: string;
  width: string;
  length: string;
  quantity: string;
}

type DimensionField = 'thickness' | 'width' | 'length';

const DIMENSION_FIELDS: { field: DimensionField; label: string; placeholder: Record<UnitSystem, string> }[] = [
  { field: 'thickness', label: 'Thickness', placeholder: { imperial: '1.5', metric: '38' } },
  { field: 'width', label: 'Width', placeholder: { imperial: '6', metric: '150' } },
  { field: 'length', label: 'Length', placeholder: { imperial: '96', metric: '2440' } },
];

const INPUT_CLASS = 'w-full px-2 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 font-mono placeholder:text-stone-400';

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
  // A blank or half-typed dimension counts as 0, which leaves the row out of the total
  const inches = (value: string) => {
    const parsed = parseMeasurement(value) ?? 0;
    return units === 'metric' ? mmToInches(parsed) : parsed;
  };

  return calculateBoardFeet({
    thickness: inches(entry.thickness),
    width: inches(entry.width),
    length: inches(entry.length),
    quantity: parseQuantity(entry.quantity),
  }).totalBoardFeet;
}

export default function BoardFeetCalculator() {
  const [entries, setEntries] = useState<LumberEntry[]>([createEntry()]);
  const [units, setUnits] = useState<UnitSystem>('imperial');
  const [wastePercent, setWastePercent] = useState('');
  const [pricePerBoardFoot, setPricePerBoardFoot] = useState('');

  const totalBoardFeet = useMemo(
    () => entries.reduce((sum, e) => sum + calcBoardFeet(e, units), 0),
    [entries, units]
  );

  const waste = parseFloat(wastePercent) || 0;
  const price = parseFloat(pricePerBoardFoot) || 0;
  const totalWithWaste = addWaste(totalBoardFeet, waste);

  const handleChange = useCallback(
    (id: string, field: keyof LumberEntry, value: string) => {
      const valid = field === 'quantity' ? isValidQuantityInput(value) : isValidDimensionInput(value);
      if (valid) {
        setEntries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
        );
      }
    },
    []
  );

  // Switching units converts what's already entered, so the boards stay the same size
  const handleUnitsChange = useCallback(
    (next: UnitSystem) => {
      if (next === units) return;
      setEntries((prev) =>
        prev.map((e) => ({
          ...e,
          thickness: convertMeasurement(e.thickness, units, next),
          width: convertMeasurement(e.width, units, next),
          length: convertMeasurement(e.length, units, next),
        }))
      );
      setUnits(next);
    },
    [units]
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
    setWastePercent('');
    setPricePerBoardFoot('');
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
        {(waste > 0 || price > 0) && (
          <dl className="mt-4 pt-4 border-t border-stone-700 space-y-1 text-sm font-mono">
            {waste > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-400">With {parseFloat(waste.toFixed(1))}% waste</dt>
                <dd className="text-white" data-testid="result-with-waste">
                  {formatBoardFeet(totalWithWaste)} bf
                </dd>
              </div>
            )}
            {price > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-stone-400">Estimated cost</dt>
                <dd className="text-white" data-testid="result-cost">
                  {formatCost(totalWithWaste * price)}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Lumber Entries */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-stone-800">Lumber</h2>
          <UnitToggle units={units} onChange={handleUnitsChange} />
        </div>

        {/* Column headers. Each input carries its own aria-label, so these are visual only. */}
        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-stone-600 px-1" aria-hidden="true">
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
              {DIMENSION_FIELDS.map(({ field, label, placeholder }) => (
                <div key={field} className="col-span-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={entry[field]}
                    onChange={(e) => handleChange(entry.id, field, e.target.value)}
                    placeholder={placeholder[units]}
                    aria-label={`${label}, board ${index + 1}`}
                    className={INPUT_CLASS}
                    data-testid={`${field}-input-${index}`}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={entry.quantity}
                  onChange={(e) =>
                    handleChange(entry.id, 'quantity', e.target.value)
                  }
                  placeholder="1"
                  aria-label={`Quantity, board ${index + 1}`}
                  className={INPUT_CLASS}
                  data-testid={`quantity-input-${index}`}
                />
              </div>
              <div className="col-span-3 text-stone-700 font-mono text-sm px-2">
                {bf > 0 ? `${formatBoardFeet(bf)} bf` : '—'}
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  onClick={() => handleRemove(entry.id)}
                  disabled={entries.length <= 1}
                  className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  type="button"
                  aria-label={`Remove board ${index + 1}`}
                  data-testid={`remove-entry-${index}`}
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
          );
        })}

        <p className="text-xs text-stone-500">
          {units === 'metric'
            ? 'Dimensions in mm (converted to inches). Board feet = (T×W×L in inches × Qty) / 144'
            : 'All dimensions in inches, as decimals or fractions (3/4, 1-1/2). Board feet = (Thickness × Width × Length × Qty) / 144'}
        </p>

        {/* Waste and price */}
        <div className="grid grid-cols-2 gap-4 bg-stone-50 p-4 rounded-lg">
          <div>
            <label htmlFor="bf-waste" className="block text-sm font-medium text-stone-700 mb-1">
              Waste allowance (%)
            </label>
            <input
              id="bf-waste"
              type="text"
              inputMode="decimal"
              value={wastePercent}
              onChange={(e) => {
                if (isValidNumericInput(e.target.value)) setWastePercent(e.target.value);
              }}
              placeholder="0"
              className={INPUT_CLASS}
              data-testid="waste-input"
            />
          </div>
          <div>
            <label htmlFor="bf-price" className="block text-sm font-medium text-stone-700 mb-1">
              Price per board foot ($)
            </label>
            <input
              id="bf-price"
              type="text"
              inputMode="decimal"
              value={pricePerBoardFoot}
              onChange={(e) => {
                if (isValidNumericInput(e.target.value)) setPricePerBoardFoot(e.target.value);
              }}
              placeholder="0.00"
              className={INPUT_CLASS}
              data-testid="price-input"
            />
          </div>
        </div>

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
