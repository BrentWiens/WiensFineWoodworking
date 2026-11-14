import Link from 'next/link';
import type { ReactNode } from 'react';
import { SITE_URL, TOOLS, getTool } from '@/lib/tools';

interface ToolGuideProps {
  /** Which calculator this is, as in lib/tools.ts. */
  slug: string;
  /** The "how it works" copy: paragraphs, and an h3 for any sub-topic. */
  children: ReactNode;
}

/**
 * The part of a calculator page that sits under the calculator: a short explanation
 * of how it works, links to the other tools, and the page's structured data.
 *
 * The calculators themselves are client-rendered widgets with almost no text, so
 * this is what gives a search engine (and a first-time visitor) something to read.
 */
export default function ToolGuide({ slug, children }: ToolGuideProps) {
  const tool = getTool(slug);
  const url = `${SITE_URL}${tool.href}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: tool.title,
      url,
      description: tool.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
      provider: {
        '@type': 'Organization',
        name: 'Wiens Fine Woodworking',
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: `${SITE_URL}/tools` },
        { '@type': 'ListItem', position: 3, name: tool.title, item: url },
      ],
    },
  ];

  return (
    <div className="px-4 pb-12 no-print">
      {/* "<" is escaped so nothing in the payload can close the script tag early */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="max-w-3xl mx-auto space-y-10">
        <section
          aria-labelledby="tool-guide-heading"
          className="space-y-3 text-stone-700 leading-relaxed [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-stone-800 [&_h3]:pt-3"
          data-testid="tool-guide"
        >
          <h2 id="tool-guide-heading" className="text-2xl font-bold text-stone-800">
            How it works
          </h2>
          {children}
        </section>

        <nav aria-labelledby="more-tools-heading" data-testid="more-tools">
          <h2 id="more-tools-heading" className="text-2xl font-bold text-stone-800 mb-4">
            More tools
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOOLS.filter(other => other.slug !== slug).map(other => (
              <li key={other.slug}>
                <Link
                  href={other.href}
                  className="block h-full bg-white border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <span className="block font-semibold text-stone-800">{other.title}</span>
                  <span className="block text-sm text-stone-600 mt-1">{other.description}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            <Link href="/tools" className="text-stone-700 underline underline-offset-2 hover:text-stone-900">
              ← All tools
            </Link>
          </p>
        </nav>
      </div>
    </div>
  );
}
