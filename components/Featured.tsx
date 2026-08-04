import Image from 'next/image';
import Link from 'next/link';

const FEATURED_PROJECTS = [
  'end-table-walnut-brass.jpg',
  'drawers-walnut.jpg',
  'cherry-desk.jpg',
  'coffee-table-walnut.jpg',
  'end-tables-walnut-maple.jpg',
  'end-table-walnut.jpg',
];

export default function FeaturedProjects() {
  return (
    <section id="featured" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">
          Featured Projects
        </h2>

        {/* Featured project grid - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {FEATURED_PROJECTS.map((filename) => (
            <Link
              key={filename}
              href="/gallery"
              className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow"
            >
              <Image
                src={`/images/gallery/tables/${filename}`}
                alt={`Featured woodworking project - ${filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={75}
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
            </Link>
          ))}
        </div>

        {/* View Full Gallery Button */}
        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-block bg-stone-800 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-semibold shadow-lg"
          >
            View Full Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}