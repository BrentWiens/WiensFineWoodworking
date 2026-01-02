import Link from 'next/link';
import Image from 'next/image';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        {/* Logo - constrained by height */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png"
            alt="Wiens Fine Woodworking"
            width={200}
            height={48}
            className="object-contain h-12 w-auto"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link 
            href="#gallery" 
            className="text-stone-600 hover:text-stone-900 transition-colors font-medium"
          >
            Gallery
          </Link>
          <Link 
            href="#about" 
            className="text-stone-600 hover:text-stone-900 transition-colors font-medium"
          >
            About
          </Link>
          <Link 
            href="#contact" 
            className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}