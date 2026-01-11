import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Mobile: Stacked layout */}
        <div className="flex sm:hidden flex-col items-center py-2 gap-2">
          {/* Logo row - full version */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif', color: '#2C1810' }}>
              WIENS
            </span>
            
            <div className="w-[2px] h-6 bg-stone-400"></div>
            
            <span className="text-xl font-normal tracking-wider" style={{ fontFamily: 'Georgia, serif', color: '#78716C' }}>
              FINE WOODWORKING
            </span>
          </Link>
          
          {/* Nav links row */}
          <div className="flex items-center gap-4">
            <Link 
              href="/gallery" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              Gallery
            </Link>
            <Link 
              href="/#about" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/tools" 
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              Tools
            </Link>
            <Link 
              href="/#contact" 
              className="text-sm bg-stone-800 text-white px-5 py-1.5 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex py-3 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <span className="text-3xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif', color: '#2C1810' }}>
              WIENS
            </span>
            
            <div className="w-[3px] h-10 bg-stone-400"></div>
            
            <span className="text-3xl font-normal tracking-widest" style={{ fontFamily: 'Georgia, serif', color: '#78716C' }}>
              FINE WOODWORKING
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link 
              href="/gallery" 
              className="text-base text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              Gallery
            </Link>
            <Link 
              href="/#about" 
              className="text-base text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/tools" 
              className="text-base text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              Tools
            </Link>
            <Link 
              href="/#contact" 
              className="bg-stone-800 text-white px-6 py-2 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}