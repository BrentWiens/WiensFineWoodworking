import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// Content Security Policy.
//
// script-src needs 'unsafe-inline' because Next injects inline bootstrap scripts
// and we have no nonce. Nonces require middleware, and middleware would opt every
// route out of static generation — a bad trade for a site that is entirely static.
// Dev additionally needs 'unsafe-eval' for React Fast Refresh.
//
// Third parties in play: Cloudflare Turnstile (script + iframe) and Vercel
// Analytics / Speed Insights, whose beacons post back to this same origin.
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self'${isDev ? ' ws: http://localhost:*' : ''} https://challenges.cloudflare.com`,
  `frame-src https://challenges.cloudflare.com`,
  `worker-src 'self'`,
  `manifest-src 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year (images rarely change)
    // Every quality value used anywhere in the app must be listed here or Next
    // rejects it at request time. 80 is used by the project detail pages.
    qualities: [60, 70, 75, 80, 95]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default nextConfig;
