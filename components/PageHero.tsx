import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  /** Tailwind object-position utilities, e.g. `object-top`. */
  imagePosition?: string;
  /** Darkness of the scrim over the photo; heavier where text needs more contrast. */
  overlay?: 'light' | 'medium' | 'dark';
}

const OVERLAY_CLASS = {
  light: 'bg-black/30',
  medium: 'bg-black/40',
  dark: 'bg-black/50',
} as const;

/**
 * Full-bleed page header with a photo behind it.
 *
 * Shared by the gallery, the tools index and all five calculator pages, which
 * previously each carried their own copy of this markup.
 */
export default function PageHero({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  imagePosition = '',
  overlay = 'medium',
}: PageHeroProps) {
  return (
    <div className="relative pt-30 pb-16 px-6">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="100vw"
          className={`object-cover ${imagePosition}`}
          priority
          quality={60}
        />
        <div className={`absolute inset-0 ${OVERLAY_CLASS[overlay]}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4 text-center drop-shadow-lg">
          {title}
        </h1>
        <p className="text-white/90 text-center text-lg max-w-2xl mx-auto drop-shadow-md">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
