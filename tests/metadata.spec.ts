import { test, expect } from '@playwright/test';

/**
 * Regression guard for the broken share previews: og:image used to point at
 * /images/handplanes.jpg while the file actually lived at /handplanes.jpg, so every
 * Facebook, LinkedIn and iMessage preview rendered an empty card. These tests assert
 * the tag exists AND that the URL it names actually serves an image.
 */
const PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/gallery', name: 'gallery' },
  { path: '/tools', name: 'tools' },
  { path: '/tools/board-feet-calculator', name: 'a tool subpage' },
  { path: '/projects/walnut-coffee-table', name: 'a project page' },
];

/**
 * Metadata URLs are absolute against metadataBase (https://wfinew.com), so strip the
 * origin to fetch the same asset from the server under test rather than production.
 */
function toLocalPath(absoluteUrl: string): string {
  const { pathname, search } = new URL(absoluteUrl);
  return `${pathname}${search}`;
}

for (const { path, name } of PAGES) {
  test(`${name} has an og:image that actually resolves`, async ({ page, request }) => {
    await page.goto(path);

    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(ogImage, `${path} is missing og:image`).toBeTruthy();

    const response = await request.get(toLocalPath(ogImage!));
    expect(response.status(), `${path} og:image 404s at ${ogImage}`).toBe(200);
    expect(response.headers()['content-type']).toContain('image/');
  });

  test(`${name} has a twitter:image that actually resolves`, async ({ page, request }) => {
    await page.goto(path);

    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .first()
      .getAttribute('content');
    expect(twitterImage, `${path} is missing twitter:image`).toBeTruthy();

    const response = await request.get(toLocalPath(twitterImage!));
    expect(response.status(), `${path} twitter:image 404s at ${twitterImage}`).toBe(200);
  });

  test(`${name} has a canonical URL`, async ({ page }) => {
    await page.goto(path);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBeTruthy();
  });
}

test('homepage og:image is sized for social cards', async ({ page }) => {
  await page.goto('/');

  const width = await page.locator('meta[property="og:image:width"]').getAttribute('content');
  const height = await page.locator('meta[property="og:image:height"]').getAttribute('content');

  expect(width).toBe('1200');
  expect(height).toBe('630');
});

test('LocalBusiness structured data covers the service area', async ({ page }) => {
  await page.goto('/');

  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const business = blocks.map(b => JSON.parse(b)).find(b => b['@type'] === 'LocalBusiness');

  expect(business).toBeTruthy();
  expect(business.address.addressLocality).toBe('Kitchener');
  expect(business.areaServed.map((a: { name: string }) => a.name)).toContain('Waterloo');
  expect(business.founder.name).toBe('Brent Wiens');
});

test('sitemap lists the project pages', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.status()).toBe(200);

  const xml = await response.text();
  expect(xml).toContain('/projects/walnut-coffee-table');
  expect(xml).toContain('/projects/custom-kitchen-cabinetry');
});

test('security headers are present', async ({ request }) => {
  const response = await request.get('/');
  const headers = response.headers();

  expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(headers['content-security-policy']).toContain('challenges.cloudflare.com');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
});
