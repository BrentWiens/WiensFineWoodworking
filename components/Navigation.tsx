'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PHONE } from '@/lib/metadata';
import PhoneIcon from './PhoneIcon';

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
        {/* Three layouts, widest first:
            - lg and up: logo on one line, links beside it (needs about 975px).
            - 880px to lg: links still beside it, with FINE / WOODWORKING on two lines.
            - below 880px: links stacked under the logo. Any earlier switch to a row
              squeezes the logo and pushes Contact off the right edge. */}
        <div className="flex flex-col nav:flex-row items-center nav:justify-between py-2 sm:py-3 gap-2 nav:gap-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
            <span
              className="text-lg min-[375px]:text-xl sm:text-3xl font-bold tracking-wider"
              style={{ fontFamily: 'Georgia, serif', color: '#2C1810' }}
            >
              WIENS
            </span>
            <div className="w-[2px] h-6 sm:w-[3px] sm:h-10 bg-stone-400" />
            <span
              className="text-lg min-[375px]:text-xl sm:text-3xl font-normal tracking-wider sm:tracking-widest"
              style={{ fontFamily: 'Georgia, serif', color: '#78716C' }}
            >
              {/* Breaks onto two lines in the mid range, so the links can stay on the
                  logo's row instead of dropping underneath it. */}
              <span className="nav:max-lg:block">FINE</span>{' '}
              <span className="nav:max-lg:block">WOODWORKING</span>
            </span>
          </Link>

          {/* Navigation Links */}
          {/* Slightly tighter in the two-line-logo range, so the logo isn't crowded. */}
          <div className="flex items-center gap-4 sm:gap-8 nav:gap-6 lg:gap-8">
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
            {/* Icon only until there's room for the number beside the logo; on a phone
                the icon is the useful part anyway, since it dials. */}
            <a
              href={PHONE.href}
              data-testid="nav-phone"
              aria-label={`Call ${PHONE.display}`}
              className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              <PhoneIcon className="h-5 w-5" />
              {/* xl, not lg: at 1024px the number squeezes the logo onto two lines. */}
              <span className="hidden xl:inline">{PHONE.display}</span>
            </a>
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
