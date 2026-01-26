'use client';

import { useState, useMemo } from 'react';

interface BoardDimensions {
  thickness: string;
  width: string;
  length: string;
  quantity: string;
}

const INITIAL_DIMENSIONS: BoardDimensions = {
  thickness: '',
  width: '',
  length: '',
  quantity: '1',
};

export default function BoardFeetCalculator() {
  const [dimensions, setDimensions] = useState<BoardDimensions>(INITIAL_DIMENSIONS);

  // Calculate board feet
  const calculation = useMemo(() => {
    const thickness = parseFloat(dimensions.thickness) || 0;
    const width = parseFloat(dimensions.width) || 0;
    const length = parseFloat(dimensions.length) || 0;
    const quantity = parseInt(dimensions.quantity, 10) || 1;

    if (thickness <= 0 || width <= 0 || length <= 0) {
      return { boardFeet: 0, totalBoardFeet: 0, isValid: false };
    }

    // Board feet formula: (T × W × L) / 144
    const boardFeet = (thickness * width * length) / 144;
    const totalBoardFeet = boardFeet * quantity;

    return { boardFeet, totalBoardFeet, isValid: true };
  }, [dimensions]);

  const handleInputChange = (field: keyof BoardDimensions, value: string) => {
    // Allow empty string, numbers, and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDimensions((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleClear = () => {
    setDimensions(INITIAL_DIMENSIONS);
  };

  const formatBoardFeet = (value: number) => {
    if (value === 0) return '0';
    if (value < 0.01) return value.toFixed(4);
    if (value < 1) return value.toFixed(3);
    return parseFloat(value.toFixed(2)).toString();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden" data-testid="board-feet-calculator">
      {/* Result Display */}
      <div className="bg-stone-800 p-6">
        <div className="text-stone-400 text-sm mb-2">Board Feet</div>
        <div className="flex items-baseline gap-4">
          <span className="text-white text-5xl font-bold font-mono" data-testid="result">
            {formatBoardFeet(calculation.totalBoardFeet)}
          </span>
          <span className="text-stone-400 text-lg">bf</span>
        </div>
        {calculation.isValid && parseInt(dimensions.quantity) > 1 && (
          <div className="text-stone-400 text-sm mt-2">
            {formatBoardFeet(calculation.boardFeet)} bf × {dimensions.quantity} pieces
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-6 space-y-4">
        {/* Thickness */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Thickness (inches)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={dimensions.thickness}
            onChange={(e) => handleInputChange('thickness', e.target.value)}
            placeholder="1.5"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono text-stone-900 placeholder:text-stone-400"
            data-testid="thickness-input"
          />
        </div>

        {/* Width */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Width (inches)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={dimensions.width}
            onChange={(e) => handleInputChange('width', e.target.value)}
            placeholder="6"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono text-stone-900 placeholder:text-stone-400"
            data-testid="width-input"
          />
        </div>

        {/* Length */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Length (inches)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={dimensions.length}
            onChange={(e) => handleInputChange('length', e.target.value)}
            placeholder="96"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono text-stone-900 placeholder:text-stone-400"
            data-testid="length-input"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Quantity
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={dimensions.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="1"
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-lg font-mono text-stone-900 placeholder:text-stone-400"
            data-testid="quantity-input"
          />
        </div>

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="w-full py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors"
          type="button"
          data-testid="clear-button"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
