import Image from 'next/image';
import Link from 'next/link';
import { getProject, imagePath, type Project } from '@/lib/projects';

/** Slugs from lib/projects, in display order. Each tile shows the project's lead photo. */
const FEATURED_SLUGS = [
  'walnut-end-table-brass',
  'walnut-drawers',
  'cherry-desk',
  'walnut-coffee-table',
  'walnut-maple-end-tables',
  'walnut-end-table',
];

// Resolved once at module load. A slug that no longer exists fails the build here
// instead of rendering a broken tile.
const FEATURED: Project[] = FEATURED_SLUGS.map(slug => {
  const project = getProject(slug);
  if (!project) throw new Error(`Featured project "${slug}" is not in lib/projects`);
  return project;
});

export default function FeaturedProjects() {
  return (
    <section id="featured" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">
          Featured Projects
        </h2>

        {/* Featured project grid - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {FEATURED.map(project => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              data-testid={`featured-${project.slug}`}
              className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow"
            >
              <Image
                src={imagePath(project)}
                alt={`${project.title} — ${project.kind}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={75}
              />

              {/* Name and kind, so the tile says what you'll get before you click. */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4 pt-12">
                <span className="block text-lg font-semibold text-white">{project.title}</span>
                <span className="block text-sm text-white/80">{project.kind}</span>
              </div>
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
