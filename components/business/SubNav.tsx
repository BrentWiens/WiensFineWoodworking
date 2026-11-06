'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Tab strip for a business tool's pages. The first link is the tool's root, matched exactly. */
export default function SubNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Tool sections" className="flex gap-1 border-b border-stone-200 mb-6 overflow-x-auto">
      {links.map(({ href, label }, i) => {
        const active = i === 0 ? pathname === href || /^\/tools\/business\/[^/]+\/\d+$/.test(pathname) : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? 'border-stone-800 text-stone-900' : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
