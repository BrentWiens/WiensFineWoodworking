import Link from 'next/link';
import { CATEGORY_LABELS, PROJECTS, type ProjectCategory } from '@/lib/projects';

const ORDER: ProjectCategory[] = ['tables', 'finish-carpentry', 'other'];

/**
 * A plain, crawlable list of every project page.
 *
 * The gallery itself is a client-side lightbox, so without this the individual
 * project pages would only be reachable from the sitemap. Pages with no internal
 * links pointing at them tend not to rank, however good they are.
 */
export default function ProjectIndex() {
  return (
    <section id="all-projects" className="py-20 px-6 bg-white border-t border-stone-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-stone-800 mb-4 text-center">All Projects</h2>
        <p className="text-stone-600 text-center mb-12 max-w-2xl mx-auto">
          Each piece has its own page with the materials and details behind it.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {ORDER.map(category => {
            const projects = PROJECTS.filter(p => p.category === category);
            if (projects.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-lg font-semibold text-stone-800 mb-4 pb-2 border-b border-stone-200">
                  {CATEGORY_LABELS[category]}
                </h3>
                <ul className="space-y-2">
                  {projects.map(project => (
                    <li key={project.slug}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-stone-600 hover:text-stone-900 hover:underline underline-offset-4 transition-colors"
                      >
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
