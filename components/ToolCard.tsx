import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  /** A preview screenshot. Without one, `icon` is shown on a plain tile. */
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: 'center' | 'top';
  icon?: ReactNode;
  /** A private tool: shows a sign-in badge and skips prefetching (it would only hit the sign-in redirect). */
  locked?: boolean;
  /** Heading level for the title: h3 when the cards sit under a section's own h2. */
  headingLevel?: 'h2' | 'h3';
}

export default function ToolCard({
  href,
  title,
  description,
  imageSrc,
  imageAlt = '',
  imageObjectPosition = 'center',
  icon,
  locked = false,
  headingLevel: Heading = 'h2',
}: ToolCardProps) {
  return (
    <Link
      href={href}
      prefetch={locked ? false : undefined}
      className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200 overflow-hidden"
    >
      <div className="relative aspect-[5/4] w-full">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover ${imageObjectPosition === 'top' ? 'object-top' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-700 to-stone-900 text-stone-100">
            {icon}
          </div>
        )}
        {locked && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-800 shadow">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
            </svg>
            Private
          </span>
        )}
      </div>
      <div className="p-5">
        <Heading className="text-xl font-bold text-stone-800 mb-2">{title}</Heading>
        <p className="text-stone-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}
