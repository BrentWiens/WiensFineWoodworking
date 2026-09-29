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

interface GalleryProps {
  images: string[];
  folder: string;
  title?: string;
  sectionId?: string;
  background?: 'white' | 'stone';
  /**
   * Image filename -> project slug, resolved on the server. Must stay a prop:
   * this is a client component, so importing `lib/projects` here would ship the
   * whole registry to the browser to look up a slug.
   */
  projectSlugs?: Record<string, string>;
}

export default function Gallery({ images, folder, title, sectionId = 'gallery', background = 'white', projectSlugs = {} }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  // The thumbnail that opened the lightbox, so focus can go back where it came from.
  const triggerRef = useRef<HTMLElement | null>(null);

  // The project page behind the photo currently open, if there is one.
  const selectedProjectSlug =
    selectedIndex !== null ? projectSlugs[images[selectedIndex]] : undefined;

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return (
    <>
      <section id={sectionId} data-testid={`${sectionId}-section`} className={`py-20 px-6 ${background === 'stone' ? 'bg-stone-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          {title && (
            <h2 className="text-3xl font-bold text-stone-800 mb-10 text-center">{title}</h2>
          )}
          <div data-testid="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((filename, index) => (
              <button
                key={filename}
                data-testid={`gallery-image-${index}`}
                onClick={(e) => {
                  triggerRef.current = e.currentTarget;
                  setSelectedIndex(index);
                }}
                className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={`/images/gallery/${folder}/${filename}`}
                  alt={formatAltText(filename, folder)}
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
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </button>
            ))}
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
            alt: `Woodworking project - ${formatCaption(filename)}`,
            caption: formatCaption(filename),
          }))}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={closeLightbox}
        >
          {selectedProjectSlug && (
            <Link
              data-testid="modal-project-link"
              href={`/projects/${selectedProjectSlug}`}
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
