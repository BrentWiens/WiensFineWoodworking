'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback, useRef } from 'react';
import Lightbox from './Lightbox';

const FOLDER_LABELS: Record<string, string> = {
  tables: 'Custom table',
  'finish-carpentry': 'Finish carpentry',
  other: 'Handcrafted',
};

function formatAltText(filename: string, folder: string): string {
  const name = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  const prefix = FOLDER_LABELS[folder] ?? 'Woodworking';
  return `${prefix} - ${name}`;
}

function formatCaption(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
}

/** The slice of a project each gallery tile needs. */
export interface GalleryProject {
  slug: string;
  title: string;
  kind: string;
}

interface GalleryProps {
  images: string[];
  folder: string;
  title?: string;
  sectionId?: string;
  background?: 'white' | 'stone';
  /**
   * Image filename -> its project, resolved on the server. Must stay a prop: this is
   * a client component, so importing `lib/projects` here would ship the whole
   * registry to the browser.
   */
  projects?: Record<string, GalleryProject>;
}

export default function Gallery({ images, folder, title, sectionId = 'gallery', background = 'white', projects = {} }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // The thumbnail that opened the lightbox, so focus can go back where it came from.
  const triggerRef = useRef<HTMLElement | null>(null);

  // The project behind the photo currently open, if there is one.
  const selectedProject = selectedIndex !== null ? projects[images[selectedIndex]] : undefined;

  // Every photo belongs to a project (lib/projects.test.ts enforces it); the filename
  // fallbacks only cover a photo dropped in before its registry entry is written.
  const describe = (filename: string) => {
    const project = projects[filename];
    return project ? `${project.title} — ${project.kind}` : formatAltText(filename, folder);
  };

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return (
    <>
      {/* scroll-mt: the fixed nav is taller on phones (it wraps to two rows), so a
          jump link would otherwise land with the heading tucked under it. */}
      <section id={sectionId} data-testid={`${sectionId}-section`} className={`py-20 px-6 scroll-mt-8 sm:scroll-mt-0 ${background === 'stone' ? 'bg-stone-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          {title && (
            <h2 className="text-3xl font-bold text-stone-800 mb-10 text-center">{title}</h2>
          )}
          <div data-testid="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((filename, index) => {
              const project = projects[filename];
              return (
                // The photo and the caption are siblings, not nested: a link inside a
                // button is invalid HTML and browsers disagree on which one a click hits.
                <div
                  key={filename}
                  data-testid={`gallery-tile-${index}`}
                  className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow"
                >
                  <button
                    data-testid={`gallery-image-${index}`}
                    onClick={(e) => {
                      triggerRef.current = e.currentTarget;
                      setSelectedIndex(index);
                    }}
                    className="group absolute inset-0 h-full w-full"
                  >
                    <Image
                      src={`/images/gallery/${folder}/${filename}`}
                      alt={describe(filename)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      quality={75}
                    />

                    {/* Click indicator overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </button>

                  {/* Same caption treatment as the homepage's featured tiles. The fade lets
                      clicks through to the photo; only the text itself is a link, so the
                      rest of the tile still opens the lightbox. */}
                  {project && (
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4 pt-12 pointer-events-none">
                      <Link
                        data-testid="gallery-image-caption"
                        href={`/projects/${project.slug}`}
                        className="group/caption pointer-events-auto inline-block rounded text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <span className="flex items-center gap-1.5 text-lg font-semibold group-hover/caption:underline underline-offset-4">
                          {project.title}
                          <svg
                            className="h-4 w-4 transition-transform group-hover/caption:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span className="block text-sm text-white/80">{project.kind}</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {images.length === 0 && (
            <p className="text-center text-stone-500">No images found in gallery</p>
          )}
        </div>
      </section>

      {selectedIndex !== null && (
        <Lightbox
          images={images.map(filename => ({
            src: `/images/gallery/${folder}/${filename}`,
            alt: describe(filename),
            caption: projects[filename] ? describe(filename) : formatCaption(filename),
          }))}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={closeLightbox}
        >
          {selectedProject && (
            <Link
              data-testid="modal-project-link"
              href={`/projects/${selectedProject.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 text-white underline underline-offset-4 hover:text-stone-300 transition-colors"
            >
              View project details →
            </Link>
          )}
        </Lightbox>
      )}
    </>
  );
}
