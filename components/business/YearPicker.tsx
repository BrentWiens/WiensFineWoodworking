import Link from 'next/link';

/** Year chips linking to `${path}?year=…`. Hidden until there's more than one year to pick. */
export default function YearPicker({ years, selected, path }: { years: number[]; selected: number; path: string }) {
  if (years.length < 2) return null;
  return (
    <nav aria-label="Year" className="flex flex-wrap gap-2">
      {years.map(y => (
        <Link
          key={y}
          href={`${path}?year=${y}`}
          aria-current={y === selected ? 'page' : undefined}
          className={`px-3 py-1 rounded-full text-sm border ${
            y === selected ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
          }`}
        >
          {y}
        </Link>
      ))}
    </nav>
  );
}
