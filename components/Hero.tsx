import Image from 'next/image';
import Link from 'next/link';
import AnimatedTagline from './AnimatedTagline';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/coffee-table-walnut-angled.jpg"
          alt="Coffee table"
          fill
          className="object-cover"
          priority
          quality={70}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <AnimatedTagline />
        <div className="flex gap-4 justify-center">
          <Link
            href="/gallery"
            className="bg-white text-stone-800 px-8 py-3 rounded-lg hover:bg-stone-100 transition-colors font-semibold shadow-lg"
          >
            View Gallery
          </Link>
          <a
            href="#contact"
            className="bg-stone-800/90 text-white px-8 py-3 rounded-lg hover:bg-stone-900 transition-colors font-semibold border-2 border-white shadow-lg backdrop-blur-sm"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}