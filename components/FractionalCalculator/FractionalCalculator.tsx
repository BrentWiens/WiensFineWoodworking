'use client';

import { useState, useCallback } from 'react';
import {
  Fraction,
  Operation,
  formatFraction,
  fractionToDecimal,
  calculate,
  entryToFraction,
  isNegativeFraction,
} from './fractionalUtils';

interface HistoryEntry {
  expression: string;
  result: string;
}

type EntryField = 'whole' | 'numerator' | 'denominator';

interface CalculatorState {
  whole: string;
  numerator: string;
  denominator: string;
  /** Sign of the value on screen. Only a result can be negative; the pads type magnitudes. */
  negative: boolean;
  /** The pad that keyboard digits go to. */
  activeField: EntryField;
  previousValue: Fraction | null;
  operation: Operation | null;
  waitingForOperand: boolean;
  currentExpression: string;
  error: string | null;
  history: HistoryEntry[];
  showHistory: boolean;
}

const INITIAL_STATE: CalculatorState = {
  whole: '',
  numerator: '',
  denominator: '',
  negative: false,
  activeField: 'whole',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  currentExpression: '',
  error: null,
  history: [],
  showHistory: false,
};

const DIVIDE_BY_ZERO = "Can't divide by zero";

const FIELD_ORDER: EntryField[] = ['whole', 'numerator', 'denominator'];

/** Appends a digit to one pad's value, or returns null when the pad won't take it. */
function appendDigit(field: EntryField, current: string, digit: string): string | null {
  if (field === 'whole') {
    if (current.length >= 6) return null;
    if (current === '0') return digit === '0' ? null : digit;
    return current + digit;
  }
  if (current.length >= 3) return null;
  if (current === '0') return field === 'denominator' && digit === '0' ? null : digit;
  return current + digit;
}

/** Drops the sign once there is no value left for it to apply to. */
function withSignCleared(state: CalculatorState): CalculatorState {
  const empty = state.whole === '' && state.numerator === '' && state.denominator === '';
  return empty ? { ...state, negative: false } : state;
}

/** State after a calculation fails: everything cleared except the history, with a message. */
function failed(prev: CalculatorState, error: string): CalculatorState {
  return { ...INITIAL_STATE, history: prev.history, showHistory: prev.showHistory, error };
}

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
  active,
}: {
  onNumber: (num: string) => void;
  onBackspace: () => void;
  onDecimal?: () => void;
  label: string;
  showDecimal?: boolean;
  padId: string;
  /** Whether keyboard digits currently go to this pad. */
  active: boolean;
}) {
  return (
    <div className="flex flex-col flex-1" role="group" aria-label={`${label} input`} data-testid={`${padId}-pad`}>
      <div
        className={`text-xs mb-2 font-medium uppercase tracking-wide text-center ${
          active ? 'text-amber-700 underline underline-offset-4 decoration-2' : 'text-stone-500'
        }`}
        data-active={active}
      >
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

  // Handle a digit typed into one of the three pads
  const handleDigit = useCallback((field: EntryField, digit: string) => {
    setState((prev) => {
      const next = appendDigit(field, prev[field], digit);
      if (next === null) return { ...prev, activeField: field, error: null };
      return { ...prev, [field]: next, activeField: field, waitingForOperand: false, error: null };
    });
  }, []);

  // Handle decimal input for whole
  const handleWholeDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.whole.includes('.')) return { ...prev, activeField: 'whole' };
      return {
        ...prev,
        whole: prev.whole === '' ? '0.' : prev.whole + '.',
        activeField: 'whole',
        waitingForOperand: false,
        error: null,
      };
    });
  }, []);

  // Handle backspace for one pad
  const handleBackspace = useCallback((field: EntryField) => {
    setState((prev) => withSignCleared({ ...prev, [field]: prev[field].slice(0, -1), activeField: field }));
  }, []);

  // Handle operation
  const handleOperation = useCallback((op: Operation) => {
    setState((prev) => {
      // Still waiting for the second number: just swap the operator
      if (prev.waitingForOperand) {
        if (!prev.previousValue) return prev;
        return { ...prev, operation: op, currentExpression: `${formatFraction(prev.previousValue)} ${op}` };
      }

      // If no input entered, ignore
      if (prev.whole === '' && prev.numerator === '' && prev.denominator === '') {
        return prev;
      }

      const current = entryToFraction(prev);

      // If we already have a previous value and operation, calculate first
      const value = prev.previousValue && prev.operation
        ? calculate(prev.previousValue, current, prev.operation)
        : current;
      if (!value) return failed(prev, DIVIDE_BY_ZERO);

      return {
        ...prev,
        whole: '',
        numerator: '',
        denominator: '',
        negative: false,
        activeField: 'whole',
        previousValue: value,
        operation: op,
        waitingForOperand: true,
        currentExpression: `${formatFraction(value)} ${op}`,
        error: null,
      };
    });
  }, []);

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

      const current = entryToFraction(prev);
      const result = calculate(prev.previousValue, current, prev.operation);
      if (!result) return failed(prev, DIVIDE_BY_ZERO);

      const expression = `${formatFraction(prev.previousValue)} ${prev.operation} ${formatFraction(current)}`;
      const newHistoryEntry: HistoryEntry = {
        expression,
        result: formatFraction(result),
      };

      const whole = Math.abs(result.whole);
      const numerator = Math.abs(result.numerator);

      return {
        ...prev,
        whole: whole !== 0 ? whole.toString() : '',
        numerator: numerator !== 0 ? numerator.toString() : '',
        denominator: numerator !== 0 ? result.denominator.toString() : '',
        negative: isNegativeFraction(result),
        activeField: 'whole',
        previousValue: null,
        operation: null,
        waitingForOperand: false,
        currentExpression: '',
        error: null,
        history: [newHistoryEntry, ...prev.history].slice(0, 20),
      };
    });
  }, []);

  // Handle clear
  const handleClear = useCallback(() => {
    setState((prev) => ({
      ...INITIAL_STATE,
      history: prev.history,
      showHistory: prev.showHistory,
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

  // Keyboard entry. Digits go to the active pad; Space steps whole → numerator →
  // denominator, and "/" does double duty: after a numerator it moves on to the
  // denominator (so "3 1/4" types naturally), anywhere else it divides.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Leave Enter and Space alone on a focused button so it still presses that button
    const onButton = (e.target as HTMLElement).tagName === 'BUTTON';
    const { key } = e;

    if (/^\d$/.test(key)) {
      handleDigit(state.activeField, key);
    } else if (key === '.') {
      handleWholeDecimal();
    } else if (key === ' ') {
      if (onButton) return;
      setState((prev) => ({
        ...prev,
        activeField: FIELD_ORDER[(FIELD_ORDER.indexOf(prev.activeField) + 1) % FIELD_ORDER.length],
      }));
    } else if (key === '/') {
      if (state.activeField === 'numerator' && state.numerator !== '') {
        setState((prev) => ({ ...prev, activeField: 'denominator' }));
      } else {
        handleOperation('÷');
      }
    } else if (key === '+') {
      handleOperation('+');
    } else if (key === '-') {
      handleOperation('-');
    } else if (key === '*' || key === 'x' || key === 'X') {
      handleOperation('×');
    } else if (key === '=') {
      handleEquals();
    } else if (key === 'Enter') {
      if (onButton) return;
      handleEquals();
    } else if (key === 'Backspace') {
      handleBackspace(state.activeField);
    } else if (key === 'Escape') {
      handleClear();
    } else {
      return;
    }
    e.preventDefault();
  };

  // Calculate display values
  const currentFraction = entryToFraction(state);
  const displayWhole = state.whole || '0';
  const displayNumerator = state.numerator || '0';
  const displayDenominator = state.denominator || '1';
  const hasFraction = Boolean(state.numerator || state.denominator);
  const showSign = state.negative && fractionToDecimal(currentFraction) !== 0;
  // Calculate running total - what the result would be if equals was pressed now.
  // null while the pending calculation is a division by zero.
  const runningTotal = (() => {
    if (state.previousValue && state.operation && !state.waitingForOperand) {
      // We have a previous value, operation, and current input - show the result
      const result = calculate(state.previousValue, currentFraction, state.operation);
      return result ? fractionToDecimal(result) : null;
    } else if (state.previousValue && state.waitingForOperand) {
      // Waiting for input - show previous value
      return fractionToDecimal(state.previousValue);
    } else {
      // Just the current value
      return fractionToDecimal(currentFraction);
    }
  })();
  const runningTotalText = runningTotal === null ? '—' : String(parseFloat(runningTotal.toFixed(4)));

  // Generate accessible description of current value
  const accessibleValue = state.error
    ?? (state.waitingForOperand
      ? 'Waiting for input'
      : `${showSign ? 'minus ' : ''}${displayWhole}${hasFraction ? ` and ${displayNumerator} over ${displayDenominator}` : ''} equals ${runningTotalText}`);

  return (
    <div
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      role="group"
      aria-label="Fractional Calculator"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-testid="calculator"
    >
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
          {state.error ? (
            <span className="text-red-300 text-2xl sm:text-3xl font-mono" data-testid="display-error">
              {state.error}
            </span>
          ) : state.waitingForOperand ? (
            /* Show placeholder when waiting for input */
            <span className="text-stone-500 text-3xl sm:text-4xl font-mono" data-testid="display-placeholder">
              Enter value...
            </span>
          ) : (
            /* Current value display */
            <div className="flex items-center gap-3" data-testid="display-value">
              {showSign && (
                <span className="text-white text-3xl font-bold font-mono" data-testid="display-sign">
                  −
                </span>
              )}

              {/* Whole number */}
              <span className="text-white text-4xl sm:text-5xl font-bold font-mono" data-testid="display-whole">
                {displayWhole !== '0' || !hasFraction ? displayWhole : ''}
              </span>

              {/* Fraction part */}
              {hasFraction && (
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
          {`= ${runningTotalText}`}
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
                type="button"
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
            onNumber={(num) => handleDigit('whole', num)}
            onBackspace={() => handleBackspace('whole')}
            onDecimal={handleWholeDecimal}
            label="Whole"
            showDecimal
            padId="whole"
            active={state.activeField === 'whole'}
          />

          {/* Divider */}
          <div className="w-px bg-stone-300 self-stretch my-6" />

          <NumberPad
            onNumber={(num) => handleDigit('numerator', num)}
            onBackspace={() => handleBackspace('numerator')}
            label="Numerator"
            padId="numerator"
            active={state.activeField === 'numerator'}
          />

          {/* Fraction slash visual */}
          <div className="flex items-center">
            <span className="text-3xl text-stone-400 font-light">/</span>
          </div>

          <NumberPad
            onNumber={(num) => handleDigit('denominator', num)}
            onBackspace={() => handleBackspace('denominator')}
            label="Denominator"
            padId="denominator"
            active={state.activeField === 'denominator'}
          />
        </div>

        {/* Equals button */}
        <CalcButton onClick={handleEquals} variant="equals" className="w-full h-12 sm:h-14 text-2xl" ariaLabel="Calculate result" testId="equals">
          =
        </CalcButton>

        {/* Only useful with a hardware keyboard, so it stays off phone-sized screens */}
        <p className="hidden sm:block text-xs text-stone-500 mt-3 text-center" data-testid="keyboard-hint">
          Keyboard: type digits, <kbd className="font-mono">Space</kbd> moves to the next pad,{' '}
          <kbd className="font-mono">+ − * /</kbd> for operations, <kbd className="font-mono">Enter</kbd> for =,{' '}
          <kbd className="font-mono">Esc</kbd> to clear.
        </p>
      </div>
    </div>
  );
}
