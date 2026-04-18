import Image from 'next/image';
import Link from 'next/link';

interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition?: 'center' | 'top';
}

export default function ToolCard({
  href,
  title,
  description,
  imageSrc,
  imageAlt,
  imageObjectPosition = 'center',
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-stone-200 overflow-hidden"
    >
      <div className="relative aspect-[5/4] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover ${imageObjectPosition === 'top' ? 'object-top' : ''}`}
        />
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold text-stone-800 mb-2">{title}</h2>
        <p className="text-stone-600 text-sm">{description}</p>
      </div>
    </Link>
  );
}
