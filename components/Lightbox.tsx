'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';

export interface LightboxImage {
  src: string;
  alt: string;
  /** Shown under the counter. */
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onIndexChange: (index: number) => void;
  /** The caller owns focus: it knows which control opened the lightbox. */
  onClose: () => void;
  /** Extra content under the caption, such as a link out. */
  children?: ReactNode;
}

/**
 * Full-screen photo viewer shared by the gallery and the project pages.
 *
 * Renders as a modal dialog: focus moves in on open and Tab stays inside, since the
 * page behind is visually covered and a keyboard user would otherwise lose their place.
 */
export default function Lightbox({ images, index, onIndexChange, onClose, children }: LightboxProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const current = images[index];

  // Derived rather than toggled in the navigation handlers, so the spinner can't get
  // stuck on if a photo was already cached and loads before the state settles.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoading = loadedSrc !== current.src;

  const hasPrevious = index > 0;
  const hasNext = index < images.length - 1;

  const goToPrevious = useCallback(() => {
    if (hasPrevious) onIndexChange(index - 1);
  }, [hasPrevious, index, onIndexChange]);

  const goToNext = useCallback(() => {
    if (hasNext) onIndexChange(index + 1);
  }, [hasNext, index, onIndexChange]);

  // Keyboard handling: navigation, dismissal, and keeping Tab inside the dialog.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();

      if (e.key !== 'Tab') return;

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
  }, [onClose, goToPrevious, goToNext]);

  // Move focus into the dialog when it opens, and stop the page scrolling behind it.
  useEffect(() => {
    modalRef.current?.querySelector<HTMLElement>('button')?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div
      ref={modalRef}
      data-testid="gallery-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`Project photo ${index + 1} of ${images.length}`}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        data-testid="modal-close-button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 text-white hover:text-stone-300 transition-colors z-10 bg-black/50 rounded-full p-2"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasPrevious && (
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

      {hasNext && (
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

      {isLoading && (
        <div data-testid="modal-loading-spinner" className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-300 border-t-white"></div>
        </div>
      )}

      <div className="relative w-[90vw] h-[90vh] max-w-7xl pointer-events-none">
        <Image
          data-testid="modal-image"
          src={current.src}
          alt={current.alt}
          fill
          sizes="90vw"
          className="object-contain"
          quality={95}
          onLoad={() => setLoadedSrc(current.src)}
        />
      </div>

      <div data-testid="modal-image-counter" className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded flex flex-col items-center gap-1">
        <div className="font-semibold pointer-events-none">
          {index + 1} / {images.length}
        </div>
        {current.caption && (
          <div data-testid="modal-image-name" className="text-stone-300 pointer-events-none">
            {current.caption}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
