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

/**
 * The Google Business Profile listing, addressed by CID.
 *
 * Used for `hasMap` in the LocalBusiness schema and for the review link on the
 * homepage. Not the `share.google/…` shortlink the GBP share button hands out —
 * that one redirects twice and carries utm tracking params.
 *
 * The CID is the decimal form of the hex pair in the Maps place URL
 * (`0x882bf5a54aa47f5f:0x78544eeed2a492de` — the half after the colon).
 */
export const GOOGLE_BUSINESS_URL = 'https://www.google.com/maps?cid=8670641970238231262';
