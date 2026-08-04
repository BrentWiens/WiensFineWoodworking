import { MetadataRoute } from 'next'
import { PROJECTS } from '@/lib/projects'

const BASE_URL = 'https://wfinew.com'

/**
 * Evaluated once per build, so it tracks the current deploy.
 *
 * Don't swap this for per-file mtimes: Vercel builds from a fresh git clone, which
 * stamps every file with the checkout time, so they all collapse to the build time
 * anyway — while forcing Turbopack to trace the whole project into the server bundle.
 */
const LAST_MODIFIED = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'dovetail-calculator',
    'fractional-calculator',
    'board-feet-calculator',
    'cut-list-optimizer',
    'trig-calculator',
  ]

  return [
    {
      url: BASE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...PROJECTS.map(project => ({
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...tools.map(slug => ({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
