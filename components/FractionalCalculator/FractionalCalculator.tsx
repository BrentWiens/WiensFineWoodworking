'use client';

import { useState, useCallback } from 'react';
import {
  Fraction,
  Operation,
  formatFraction,
  fractionToDecimal,
  calculate,
  toMixed,
} from './fractionalUtils';

interface HistoryEntry {
  expression: string;
  result: string;
}

interface CalculatorState {
  whole: string;
  numerator: string;
  denominator: string;
  previousValue: Fraction | null;
  operation: Operation | null;
  waitingForOperand: boolean;
  currentExpression: string;
  history: HistoryEntry[];
  showHistory: boolean;
}

const INITIAL_STATE: CalculatorState = {
  whole: '',
  numerator: '',
  denominator: '',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  currentExpression: '',
  history: [],
  showHistory: false,
};

// Button component for consistent styling
function CalcButton({
  onClick,
  children,
  variant = 'default',
  className = '',
  ariaLabel,
  testId,
}: {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'number' | 'operation' | 'action' | 'equals' | 'history';
  className?: string;
  ariaLabel?: string;
  testId?: string;
}) {
  const baseClasses = 'font-semibold rounded-lg transition-all active:scale-95 select-none touch-manipulation focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-stone-200 hover:bg-stone-300 text-stone-800',
    number: 'bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 shadow-sm',
    operation: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    action: 'bg-stone-400 hover:bg-stone-500 text-white',
    equals: 'bg-green-600 hover:bg-green-700 text-white shadow-sm',
    history: 'bg-stone-600 hover:bg-stone-700 text-white shadow-sm',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label={ariaLabel}
      type="button"
      data-testid={testId}
    >
      {children}
    </button>
  );
}

// Number pad component - equal size for all three
function NumberPad({
  onNumber,
  onBackspace,
  onDecimal,
  label,
  showDecimal = false,
  padId,
}: {
  onNumber: (num: string) => void;
  onBackspace: () => void;
  onDecimal?: () => void;
  label: string;
  showDecimal?: boolean;
  padId: string;
}) {
  return (
    <div className="flex flex-col flex-1" role="group" aria-label={`${label} input`} data-testid={`${padId}-pad`}>
      <div className="text-xs text-stone-500 mb-2 font-medium uppercase tracking-wide text-center" id={`${label.toLowerCase()}-label`}>
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <CalcButton
            key={num}
            onClick={() => onNumber(num)}
            variant="number"
            className="h-11 sm:h-12 text-lg sm:text-xl"
            ariaLabel={`${label} ${num}`}
            testId={`${padId}-${num}`}
          >
            {num}
          </CalcButton>
        ))}
        <CalcButton
          onClick={() => onNumber('0')}
          variant="number"
          className="h-11 sm:h-12 text-lg sm:text-xl"
          ariaLabel={`${label} 0`}
          testId={`${padId}-0`}
        >
          0
        </CalcButton>
        {showDecimal && onDecimal ? (
          <>
            <CalcButton
              onClick={onDecimal}
              variant="number"
              className="h-11 sm:h-12 text-lg sm:text-xl"
              ariaLabel="Decimal point"
              testId={`${padId}-decimal`}
            >
              .
            </CalcButton>
            <CalcButton
              onClick={onBackspace}
              variant="default"
              className="h-11 sm:h-12 text-base"
              ariaLabel={`Delete last ${label.toLowerCase()} digit`}
              testId={`${padId}-backspace`}
            >
              ⌫
            </CalcButton>
          </>
        ) : (
          <CalcButton
            onClick={onBackspace}
            variant="default"
            className="h-11 sm:h-12 text-base col-span-2"
            ariaLabel={`Delete last ${label.toLowerCase()} digit`}
            testId={`${padId}-backspace`}
          >
            ⌫
          </CalcButton>
        )}
      </div>
    </div>
  );
}

export default function FractionalCalculator() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  // Get current fraction from state
  const getCurrentFraction = useCallback((): Fraction => {
    const wholeValue = parseFloat(state.whole) || 0;
    const whole = Math.floor(wholeValue);
    const decimalPart = wholeValue - whole;
    let numerator = parseInt(state.numerator, 10) || 0;
    let denominator = parseInt(state.denominator, 10) || 1;

    // If denominator is 0, treat as 1
    const safeDenom = denominator === 0 ? 1 : denominator;

    // If there's a decimal part in the whole number, convert it to fraction
    if (decimalPart > 0.0001) {
      // Convert decimal to fraction with denominator based on precision
      const precision = (state.whole.split('.')[1]?.length || 0);
      const decimalDenom = Math.pow(10, precision);
      const decimalNum = Math.round(decimalPart * decimalDenom);

      // Add the decimal fraction to the existing fraction
      // (decimalNum/decimalDenom) + (numerator/safeDenom)
      const combinedNum = decimalNum * safeDenom + numerator * decimalDenom;
      const combinedDenom = decimalDenom * safeDenom;

      const result = toMixed(whole * combinedDenom + combinedNum, combinedDenom);
      return result;
    }

    // Convert to proper mixed number if numerator >= denominator
    if (numerator >= safeDenom && safeDenom > 0) {
      const result = toMixed(whole * safeDenom + numerator, safeDenom);
      return result;
    }

    return { whole, numerator, denominator: safeDenom };
  }, [state.whole, state.numerator, state.denominator]);

  // Handle number input for whole
  const handleWholeNumber = useCallback((num: string) => {
    setState((prev) => {
      if (prev.whole.length >= 6) return prev;
      if (prev.whole === '0' && num !== '0') return { ...prev, whole: num, waitingForOperand: false };
      if (prev.whole === '0' && num === '0') return prev;
      return { ...prev, whole: prev.whole + num, waitingForOperand: false };
    });
  }, []);

  // Handle decimal input for whole
  const handleWholeDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.whole.includes('.')) return prev;
      if (prev.whole === '') return { ...prev, whole: '0.', waitingForOperand: false };
      return { ...prev, whole: prev.whole + '.', waitingForOperand: false };
    });
  }, []);

  // Handle number input for numerator
  const handleNumerator = useCallback((num: string) => {
    setState((prev) => {
      if (prev.numerator.length >= 3) return prev;
      if (prev.numerator === '0') return { ...prev, numerator: num, waitingForOperand: false };
      return { ...prev, numerator: prev.numerator + num, waitingForOperand: false };
    });
  }, []);

  // Handle number input for denominator
  const handleDenominator = useCallback((num: string) => {
    setState((prev) => {
      if (prev.denominator.length >= 3) return prev;
      if (prev.denominator === '0' && num === '0') return prev;
      if (prev.denominator === '0') return { ...prev, denominator: num, waitingForOperand: false };
      return { ...prev, denominator: prev.denominator + num, waitingForOperand: false };
    });
  }, []);

  // Handle backspace for each field
  const handleWholeBackspace = useCallback(() => {
    setState((prev) => ({
      ...prev,
      whole: prev.whole.slice(0, -1),
    }));
  }, []);

  const handleNumeratorBackspace = useCallback(() => {
    setState((prev) => ({
      ...prev,
      numerator: prev.numerator.slice(0, -1),
    }));
  }, []);

  const handleDenominatorBackspace = useCallback(() => {
    setState((prev) => ({
      ...prev,
      denominator: prev.denominator.slice(0, -1),
    }));
  }, []);

  // Check if current input has any value entered
  const hasCurrentInput = useCallback(() => {
    return state.whole !== '' || state.numerator !== '' || state.denominator !== '';
  }, [state.whole, state.numerator, state.denominator]);

  // Handle operation
  const handleOperation = useCallback((op: Operation) => {
    setState((prev) => {
      // If waiting for operand (nothing entered yet), ignore
      if (prev.waitingForOperand) {
        return prev;
      }

      // If no input entered, ignore
      if (prev.whole === '' && prev.numerator === '' && prev.denominator === '') {
        return prev;
      }

      const current = getCurrentFraction();
      const currentFormatted = formatFraction(current);

      // If we already have a previous value and operation, calculate first
      if (prev.previousValue && prev.operation) {
        const result = calculate(prev.previousValue, current, prev.operation);
        const resultFormatted = formatFraction(result);
        return {
          ...prev,
          whole: '',
          numerator: '',
          denominator: '',
          previousValue: result,
          operation: op,
          waitingForOperand: true,
          currentExpression: `${resultFormatted} ${op}`,
        };
      }

      return {
        ...prev,
        whole: '',
        numerator: '',
        denominator: '',
        previousValue: current,
        operation: op,
        waitingForOperand: true,
        currentExpression: `${currentFormatted} ${op}`,
      };
    });
  }, [getCurrentFraction]);

  // Handle equals
  const handleEquals = useCallback(() => {
    setState((prev) => {
      // If waiting for operand (nothing entered yet), ignore
      if (prev.waitingForOperand) {
        return prev;
      }

      if (!prev.previousValue || !prev.operation) {
        return prev;
      }

      const current = getCurrentFraction();
      const result = calculate(prev.previousValue, current, prev.operation);

      const prevFormatted = formatFraction(prev.previousValue);
      const currentFormatted = formatFraction(current);
      const resultFormatted = formatFraction(result);

      const expression = `${prevFormatted} ${prev.operation} ${currentFormatted}`;
      const newHistoryEntry: HistoryEntry = {
        expression,
        result: resultFormatted,
      };

      return {
        ...prev,
        whole: result.whole !== 0 ? result.whole.toString() : '',
        numerator: result.numerator !== 0 ? result.numerator.toString() : '',
        denominator: result.numerator !== 0 ? result.denominator.toString() : '',
        previousValue: null,
        operation: null,
        waitingForOperand: false,
        currentExpression: '',
        history: [newHistoryEntry, ...prev.history].slice(0, 20),
      };
    });
  }, [getCurrentFraction]);

  // Handle clear
  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      history: prev.history,
    }));
  }, []);

  // Toggle history
  const toggleHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showHistory: !prev.showHistory,
    }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
    }));
  }, []);

  // Calculate display values
  const currentFraction = getCurrentFraction();
  const displayWhole = state.whole || '0';
  const displayNumerator = state.numerator || '0';
  const displayDenominator = state.denominator || '1';
  const hasInput = hasCurrentInput();

  // Calculate running total - what the result would be if equals was pressed now
  const runningTotal = (() => {
    if (state.previousValue && state.operation && !state.waitingForOperand) {
      // We have a previous value, operation, and current input - show the result
      const result = calculate(state.previousValue, currentFraction, state.operation);
      return fractionToDecimal(result);
    } else if (state.previousValue && state.waitingForOperand) {
      // Waiting for input - show previous value
      return fractionToDecimal(state.previousValue);
    } else {
      // Just the current value
      return fractionToDecimal(currentFraction);
    }
  })();

  // Generate accessible description of current value
  const accessibleValue = state.waitingForOperand
    ? 'Waiting for input'
    : `${displayWhole}${state.numerator || state.denominator ? ` and ${displayNumerator} over ${displayDenominator}` : ''} equals ${parseFloat(runningTotal.toFixed(4))}`;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden" role="application" aria-label="Fractional Calculator" data-testid="calculator">
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {accessibleValue}
      </div>

      {/* Display */}
      <div className="bg-stone-800 p-4 sm:p-6">
        {/* Expression display */}
        <div className="text-stone-400 text-right text-sm h-6 font-mono">
          {state.currentExpression}
        </div>

        {/* Main display with fraction notation */}
        <div className="flex items-center justify-end gap-3 min-h-[5rem]" data-testid="display">
          {state.waitingForOperand ? (
            /* Show placeholder when waiting for input */
            <span className="text-stone-500 text-3xl sm:text-4xl font-mono" data-testid="display-placeholder">
              Enter value...
            </span>
          ) : (
            /* Current value display */
            <div className="flex items-center gap-3" data-testid="display-value">
              {/* Whole number */}
              <span className="text-white text-4xl sm:text-5xl font-bold font-mono" data-testid="display-whole">
                {displayWhole !== '0' || (!state.numerator && !state.denominator) ? displayWhole : ''}
              </span>

              {/* Fraction part */}
              {(state.numerator || state.denominator) && (
                <div className="flex flex-col items-center text-white leading-none" data-testid="display-fraction">
                  <span className="text-2xl sm:text-3xl font-mono border-b-2 border-white px-2 pb-1" data-testid="display-numerator">
                    {displayNumerator}
                  </span>
                  <span className="text-2xl sm:text-3xl font-mono px-2 pt-1" data-testid="display-denominator">
                    {displayDenominator}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Decimal equivalent - always shows running total */}
        <div className="text-stone-400 text-right text-sm mt-2 font-mono" data-testid="decimal-display">
          {`= ${parseFloat(runningTotal.toFixed(4))}`}
        </div>
      </div>

      {/* History Panel */}
      {state.showHistory && (
        <div className="bg-stone-100 border-b border-stone-300 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 bg-stone-200 sticky top-0">
            <span className="text-sm font-medium text-stone-700">History</span>
            {state.history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-stone-500 hover:text-stone-700"
              >
                Clear
              </button>
            )}
          </div>
          {state.history.length === 0 ? (
            <div className="px-4 py-3 text-sm text-stone-500 text-center">
              No history yet
            </div>
          ) : (
            <div className="divide-y divide-stone-200">
              {state.history.map((entry, index) => (
                <div key={index} className="px-4 py-2 text-sm font-mono">
                  <div className="text-stone-600">{entry.expression}</div>
                  <div className="text-stone-800 font-semibold">= {entry.result}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Keypad */}
      <div className="p-3 sm:p-4 bg-stone-50">
        {/* Top row: Clear, History, Operations */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          <CalcButton onClick={handleClear} variant="action" className="h-11 sm:h-12 text-lg" ariaLabel="Clear calculator" testId="clear">
            C
          </CalcButton>
          <CalcButton onClick={toggleHistory} variant="history" className="h-11 sm:h-12 text-sm" ariaLabel={state.showHistory ? 'Hide history' : 'Show history'} testId="history">
            {state.showHistory ? 'Hide' : 'History'}
          </CalcButton>
          <CalcButton onClick={() => handleOperation('÷')} variant="operation" className="h-11 sm:h-12 text-xl" ariaLabel="Divide" testId="divide">
            ÷
          </CalcButton>
          <CalcButton onClick={() => handleOperation('×')} variant="operation" className="h-11 sm:h-12 text-xl" ariaLabel="Multiply" testId="multiply">
            ×
          </CalcButton>
          <CalcButton onClick={() => handleOperation('-')} variant="operation" className="h-11 sm:h-12 text-xl" ariaLabel="Subtract" testId="subtract">
            −
          </CalcButton>
          <CalcButton onClick={() => handleOperation('+')} variant="operation" className="h-11 sm:h-12 text-xl" ariaLabel="Add" testId="add">
            +
          </CalcButton>
        </div>

        {/* Three number pads in a row */}
        <div className="flex gap-3 sm:gap-4 mb-3">
          <NumberPad
            onNumber={handleWholeNumber}
            onBackspace={handleWholeBackspace}
            onDecimal={handleWholeDecimal}
            label="Whole"
            showDecimal
            padId="whole"
          />

          {/* Divider */}
          <div className="w-px bg-stone-300 self-stretch my-6" />

          <NumberPad
            onNumber={handleNumerator}
            onBackspace={handleNumeratorBackspace}
            label="Numerator"
            padId="numerator"
          />

          {/* Fraction slash visual */}
          <div className="flex items-center">
            <span className="text-3xl text-stone-400 font-light">/</span>
          </div>

          <NumberPad
            onNumber={handleDenominator}
            onBackspace={handleDenominatorBackspace}
            label="Denominator"
            padId="denominator"
          />
        </div>

        {/* Equals button */}
        <CalcButton onClick={handleEquals} variant="equals" className="w-full h-12 sm:h-14 text-2xl" ariaLabel="Calculate result" testId="equals">
          =
        </CalcButton>
      </div>
    </div>
  );
}
