'use client';

export type UnitSystem = 'imperial' | 'metric';

const MM_PER_INCH = 25.4;

export function inchesToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

export function mmToInches(mm: number): number {
  return mm / MM_PER_INCH;
}

/** Convert a display value (which may be in mm) to inches for internal use */
export function toInches(value: number, units: UnitSystem): number {
  return units === 'metric' ? mmToInches(value) : value;
}

/** Convert an internal value (in inches) to the display unit */
export function fromInches(value: number, units: UnitSystem): number {
  return units === 'metric' ? inchesToMm(value) : value;
}

export function unitLabel(units: UnitSystem): string {
  return units === 'metric' ? 'mm' : 'in';
}

interface UnitToggleProps {
  units: UnitSystem;
  onChange: (units: UnitSystem) => void;
}

export default function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-stone-300 overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => onChange('imperial')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          units === 'imperial'
            ? 'bg-amber-500 text-white'
            : 'bg-white text-stone-600 hover:bg-stone-100'
        }`}
      >
        Imperial (in)
      </button>
      <button
        type="button"
        onClick={() => onChange('metric')}
        className={`px-3 py-1.5 font-medium transition-colors ${
          units === 'metric'
            ? 'bg-amber-500 text-white'
            : 'bg-white text-stone-600 hover:bg-stone-100'
        }`}
      >
        Metric (mm)
      </button>
    </div>
  );
}
