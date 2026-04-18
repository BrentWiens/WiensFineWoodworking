import { MetadataRoute } from 'next'

const BASE_URL = 'https://wfinew.com'
const LAST_MODIFIED = '2026-04-18'

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
    ...tools.map(slug => ({
      url: `${BASE_URL}/tools/${slug}`,
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
