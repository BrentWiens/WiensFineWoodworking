import { MetadataRoute } from 'next'

const BASE_URL = 'https://wfinew.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: '2025-01-20',
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/gallery`,
      lastModified: '2025-01-20',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: '2025-01-20',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/dovetail-calculator`,
      lastModified: '2025-01-20',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}