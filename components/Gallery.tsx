'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface GalleryProps {
  images: string[];
}

export default function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get current image index
  const currentIndex = selectedImage ? images.indexOf(selectedImage) : -1;
  
  // Navigation functions
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setIsLoading(true);
      setSelectedImage(images[currentIndex - 1]);
    }
  };
  
  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      setIsLoading(true);
      setSelectedImage(images[currentIndex + 1]);
    }
  };
  
  const closeModal = () => {
    setSelectedImage(null);
    setIsLoading(false);
  };
  
  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex]);
  
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
      <section id="gallery" data-testid="gallery-section" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">
            Recent Projects
          </h2>
          <p className="text-stone-600 text-center mb-12">
            Custom woodworking and handcrafted furniture
          </p>
          
          {/* Gallery grid */}
          <div data-testid="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((filename, index) => (
              <button
                key={filename}
                data-testid={`gallery-image-${index}`}
                onClick={() => {
                  setSelectedImage(filename);
                  setIsLoading(true);
                }}
                className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-md hover:shadow-xl transition-shadow"
              >
                <Image
                  src={`/images/gallery/${filename}`}
                  alt={`Woodworking project - ${filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={85}
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
          data-testid="gallery-modal"
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
          <div className="relative max-w-7xl max-h-[90vh] pointer-events-none">
            <Image
              data-testid="modal-image"
              src={`/images/gallery/${selectedImage}`}
              alt={`Woodworking project - ${selectedImage.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}`}
              width={1920}
              height={1080}
              className="object-contain max-h-[90vh] w-auto"
              quality={95}
              priority
              onLoad={() => setIsLoading(false)}
            />
          </div>

          {/* Image counter and name */}
          <div data-testid="modal-image-counter" className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded flex flex-col items-center gap-1 pointer-events-none">
            <div className="font-semibold">
              {currentIndex + 1} / {images.length}
            </div>
            <div data-testid="modal-image-name" className="text-stone-300">
              {selectedImage.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}