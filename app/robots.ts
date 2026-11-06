import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private business tools and sign-in: nothing to index, and they all redirect
      // to Google sign-in anyway. Pages also send noindex (next.config.ts headers).
      disallow: ['/tools/business', '/login', '/api/'],
    },
    sitemap: 'https://wfinew.com/sitemap.xml',
  }
}
