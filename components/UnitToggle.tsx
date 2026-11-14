'use client';

import type { UnitSystem } from './units';

interface UnitToggleProps {
  units: UnitSystem;
  onChange: (units: UnitSystem) => void;
}

const OPTIONS: { value: UnitSystem; label: string }[] = [
  { value: 'imperial', label: 'Imperial (in)' },
  { value: 'metric', label: 'Metric (mm)' },
];

export default function UnitToggle({ units, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Units"
      className="inline-flex items-center rounded-lg border border-stone-300 overflow-hidden text-sm no-print"
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={units === value}
          data-testid={`units-${value}`}
          className={`px-3 py-1.5 font-medium transition-colors ${
            units === value
              ? 'bg-amber-500 text-white'
              : 'bg-white text-stone-600 hover:bg-stone-100'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
