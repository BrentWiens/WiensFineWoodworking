import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo as HTML/CSS */}
        <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          {/* WIENS */}
          <span className="text-3xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif', color: '#2C1810' }}>
            WIENS
          </span>
          
          {/* Separator - more visible */}
          <div className="w-[3px] h-10 bg-stone-400"></div>
          
          {/* FINE WOODWORKING - same height */}
          <span className="text-3xl font-normal tracking-widest" style={{ fontFamily: 'Georgia, serif', color: '#78716C' }}>
            FINE WOODWORKING
          </span>
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