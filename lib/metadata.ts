import type { Metadata } from 'next';

/**
 * Shared OpenGraph image for the six /tools pages.
 *
 * Referenced explicitly rather than using the `opengraph-image.jpg` file
 * convention, because that convention applies only to the exact segment it sits in
 * and does NOT cascade to nested routes — so an `app/tools/opengraph-image.jpg`
 * would leave all five calculator subpages with no share image at all.
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
