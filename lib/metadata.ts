import type { Metadata } from 'next';

/**
 * Shared OpenGraph image for the /tools section.
 *
 * The `opengraph-image.jpg` file convention only applies to the exact segment it
 * sits in — it does NOT cascade to nested routes. An `app/tools/opengraph-image.jpg`
 * therefore covered /tools but left all five calculator subpages with no share
 * image at all. Rather than copy the same photo into six directories, the six pages
 * reference this one file explicitly.
 */
export const TOOLS_OG_IMAGE: NonNullable<Metadata['openGraph']>['images'] = [
  {
    url: '/og/tools.jpg',
    width: 1200,
    height: 630,
    alt: 'Wiens Fine Woodworking',
  },
];

export const TOOLS_TWITTER_IMAGE = ['/og/tools.jpg'];
