'use client';

import Image from 'next/image';
import { useState, useCallback, useRef } from 'react';
import Lightbox from './Lightbox';

export interface ProjectPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * The photos on a project page, each shown whole at its own aspect ratio and opening
 * full-screen on click. Dimensions come from the server so the layout doesn't jump
 * as each photo loads.
 */
export default function ProjectPhotos({ photos }: { photos: ProjectPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  return (
    <>
      <div className="space-y-6 mb-12">
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            data-testid={`project-photo-${index}`}
            onClick={(e) => {
              triggerRef.current = e.currentTarget;
              setSelectedIndex(index);
            }}
            aria-label={`View full size: ${photo.alt}`}
            className="group relative block mx-auto overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow cursor-zoom-in"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              // Capped at 80vh so a portrait photo doesn't need several screens of
              // scrolling; width follows from the aspect ratio.
              className="block w-auto h-auto max-w-full max-h-[80vh]"
              sizes="(max-width: 1024px) 100vw, 960px"
              quality={80}
              priority={index === 0}
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-3">
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                View full size
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <Lightbox
          images={photos.map(({ src, alt }) => ({ src, alt }))}
          index={selectedIndex}
          onIndexChange={setSelectedIndex}
          onClose={closeLightbox}
        />
      )}
    </>
  );
}
