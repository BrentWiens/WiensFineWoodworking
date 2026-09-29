import Image from 'next/image';

export interface GallerySectionLink {
  id: string;
  label: string;
  projectCount: number;
  /** Public path of the photo behind the label. */
  cover: string;
}

/**
 * Jump links to the gallery's sections, shown under the page header.
 *
 * Deliberately short and wide rather than square: square tiles look like more
 * gallery photos, so people click them expecting a close-up rather than a jump, and
 * three of them stacked on a phone push the actual gallery a long way down.
 */
export default function GallerySectionNav({ sections }: { sections: GallerySectionLink[] }) {
  return (
    <nav aria-label="Gallery sections" className="bg-white px-6 pt-12">
      <ul className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sections.map(section => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              data-testid={`jump-${section.id}`}
              className="group relative flex h-24 sm:h-36 items-end overflow-hidden rounded-lg bg-stone-800 shadow-md hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-stone-400"
            >
              <Image
                src={section.cover}
                alt=""
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, 33vw"
                quality={70}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

              <div className="relative flex w-full items-end justify-between gap-3 p-4">
                <div>
                  <span className="block text-lg sm:text-xl font-semibold text-white">
                    {section.label}
                  </span>
                  <span className="block text-sm text-white/80">
                    {section.projectCount} projects
                  </span>
                </div>
                <svg
                  className="h-6 w-6 shrink-0 text-white transition-transform group-hover:translate-y-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
