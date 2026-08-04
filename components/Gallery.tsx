'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef } from 'react';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // The thumbnail that opened the modal, so focus can go back where it came from.
  const triggerRef = useRef<HTMLElement | null>(null);

  const currentIndex = selectedImage ? images.indexOf(selectedImage) : -1;

  // The project page behind the photo currently open, if there is one.
  const selectedProjectSlug = selectedImage ? projectSlugs[selectedImage] : undefined;

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsLoading(true);
      setSelectedImage(images[currentIndex - 1]);
    }
  }, [currentIndex, images]);

  const goToNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setIsLoading(true);
      setSelectedImage(images[currentIndex + 1]);
    }
  }, [currentIndex, images]);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setIsLoading(false);
    // Send focus back to the thumbnail rather than dropping it to the document.
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  // Keyboard handling: navigation, dismissal, and keeping Tab inside the dialog.
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();

      if (e.key !== 'Tab') return;

      // Without this, Tab walks out of the overlay and into the page behind it,
      // which is still visually covered — keyboard users lose their place entirely.
      const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, closeModal, goToPrevious, goToNext]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (!selectedImage) return;
    modalRef.current?.querySelector<HTMLElement>('button')?.focus();
  }, [selectedImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

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
                  setSelectedImage(filename);
                  setIsLoading(true);
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

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          ref={modalRef}
          data-testid="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Project photo ${currentIndex + 1} of ${images.length}`}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Close button */}
          <button
            data-testid="modal-close-button"
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
            className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors z-10 bg-black/50 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous button */}
          {currentIndex > 0 && (
            <button
              data-testid="modal-prev-button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 transition-colors z-10 bg-black/50 rounded-full p-3"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next button */}
          {currentIndex < images.length - 1 && (
            <button
              data-testid="modal-next-button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-stone-300 transition-colors z-10 bg-black/50 rounded-full p-3"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div data-testid="modal-loading-spinner" className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-300 border-t-white"></div>
            </div>
          )}

          {/* Image - now directly in the modal container */}
          <div className="relative w-[90vw] h-[90vh] max-w-7xl pointer-events-none">
            <Image
              data-testid="modal-image"
              src={`/images/gallery/${folder}/${selectedImage}`}
              alt={`Woodworking project - ${selectedImage.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}`}
              fill
              sizes="90vw"
              className="object-contain"
              quality={95}
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Image counter and name */}
          <div data-testid="modal-image-counter" className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded flex flex-col items-center gap-1">
            <div className="font-semibold pointer-events-none">
              {currentIndex + 1} / {images.length}
            </div>
            <div data-testid="modal-image-name" className="text-stone-300 pointer-events-none">
              {selectedImage.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}
            </div>
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
          </div>
        </div>
      )}
    </>
  );
}