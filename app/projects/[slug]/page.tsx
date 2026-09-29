import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation, Footer } from '@/components';
import ProjectPhotos from '@/components/ProjectPhotos';
import { getImageDimensions } from '@/lib/imageDimensions';
import {
  CATEGORY_LABELS,
  PROJECTS,
  getProject,
  getSiblings,
  imagePath,
} from '@/lib/projects';

const BASE_URL = 'https://wfinew.com';

export function generateStaticParams() {
  return PROJECTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${project.kind} | Wiens Fine Woodworking`;
  const url = `/projects/${project.slug}`;

  return {
    title,
    description: project.description,
    keywords: [
      project.kind.toLowerCase(),
      ...project.woods.map(w => `${w.toLowerCase()} furniture`),
      'custom furniture Kitchener',
      'woodworking Ontario',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: project.description,
      url,
      type: 'article',
      // Points at the full-size gallery photo rather than a purpose-built 1200x630
      // crop. Social platforms will letterbox or crop it to fit their card.
      images: [{ url: imagePath(project), alt: `${project.title} — ${project.kind}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: project.description,
      images: [imagePath(project)],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { prev, next } = getSiblings(project);
  const categoryLabel = CATEGORY_LABELS[project.category];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    alternateName: project.kind,
    description: project.description,
    url: `${BASE_URL}/projects/${project.slug}`,
    image: project.images.map(f => `${BASE_URL}/images/gallery/${project.category}/${f}`),
    ...(project.woods.length ? { material: project.woods } : {}),
    creator: {
      '@type': 'Organization',
      name: 'Wiens Fine Woodworking',
      url: BASE_URL,
    },
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Gallery', item: `${BASE_URL}/gallery` },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: `${BASE_URL}/projects/${project.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Navigation />

      <main id="main-content" className="min-h-screen bg-stone-50 pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-stone-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-stone-800 transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/gallery" className="hover:text-stone-800 transition-colors">
                  Gallery
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-stone-800 font-medium">{project.title}</li>
            </ol>
          </nav>

          <p className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
            {project.kind}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-4">{project.title}</h1>

          <p className="text-xl text-stone-700 leading-relaxed mb-4 max-w-3xl">
            {project.description}
          </p>

          <div className="space-y-4 mb-6 max-w-3xl">
            {project.story.map(paragraph => (
              <p key={paragraph} className="text-stone-600 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Spec chips */}
          <dl className="flex flex-wrap gap-x-8 gap-y-3 mb-10 text-sm">
            <div>
              <dt className="text-stone-500">Category</dt>
              <dd className="text-stone-800 font-medium">{categoryLabel}</dd>
            </div>
            {project.woods.length > 0 && (
              <div>
                <dt className="text-stone-500">Materials</dt>
                <dd className="text-stone-800 font-medium">{project.woods.join(', ')}</dd>
              </div>
            )}
            <div>
              <dt className="text-stone-500">Built in</dt>
              <dd className="text-stone-800 font-medium">Kitchener, Ontario</dd>
            </div>
          </dl>

          <ProjectPhotos
            photos={project.images.map((_, index) => {
              const src = imagePath(project, index);
              return {
                src,
                alt:
                  index === 0
                    ? `${project.title} — ${project.kind}`
                    : `${project.title} — ${project.kind}, view ${index + 1}`,
                ...getImageDimensions(src),
              };
            })}
          />

          {/* Commission CTA */}
          <div className="bg-stone-800 text-white rounded-lg p-8 sm:p-10 text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Want something like this?
            </h2>
            <p className="text-stone-300 mb-6 max-w-xl mx-auto">
              Every piece is designed around the space it&apos;s going into. Tell me what you
              have in mind and I&apos;ll get back to you.
            </p>
            <Link
              href="/#contact"
              className="inline-block bg-white text-stone-800 px-8 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold shadow-lg"
            >
              Start a Commission
            </Link>
          </div>

          {/* Prev / next within the same category */}
          <nav
            aria-label="More projects"
            className="flex flex-col sm:flex-row justify-between gap-4 border-t border-stone-200 pt-8"
          >
            {prev ? (
              <Link
                href={`/projects/${prev.slug}`}
                className="text-stone-600 hover:text-stone-900 transition-colors"
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            <Link
              href="/gallery"
              className="text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              All projects
            </Link>
            {next ? (
              <Link
                href={`/projects/${next.slug}`}
                className="text-stone-600 hover:text-stone-900 transition-colors sm:text-right"
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </main>

      <Footer />
    </>
  );
}
