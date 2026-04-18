'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/gallery', label: 'Gallery' },
  { href: '/#about', label: 'About' },
  { href: '/tools', label: 'Tools' },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 bg-white border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between py-2 sm:py-3 gap-2 sm:gap-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
            <span
              className="text-xl sm:text-3xl font-bold tracking-wider"
              style={{ fontFamily: 'Georgia, serif', color: '#2C1810' }}
            >
              WIENS
            </span>
            <div className="w-[2px] h-6 sm:w-[3px] sm:h-10 bg-stone-400" />
            <span
              className="text-xl sm:text-3xl font-normal tracking-wider sm:tracking-widest"
              style={{ fontFamily: 'Georgia, serif', color: '#78716C' }}
            >
              FINE WOODWORKING
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-8">
            {NAV_LINKS.map(({ href, label }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`text-sm sm:text-base transition-colors font-medium ${
                    active
                      ? 'text-stone-900 underline underline-offset-4 decoration-2'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/#contact"
              className="text-sm sm:text-base bg-stone-800 text-white px-5 py-1.5 sm:px-6 sm:py-2 rounded-lg hover:bg-stone-700 transition-colors font-semibold"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
