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

test('every page has exactly one h1', async ({ page }) => {
  for (const path of ['/', '/gallery', '/tools', '/tools/trig-calculator', '/projects/walnut-coffee-table']) {
    await page.goto(path);
    await expect(page.locator('h1'), `${path} should have exactly one h1`).toHaveCount(1);
  }
});

test('the homepage h1 reads cleanly despite the animated tagline', async ({ page }) => {
  await page.goto('/');

  // Asserts on text content, which is what a crawler indexes — only the currently
  // shown word may be present. Stacking all three read "[diningcoffeeend] tables…".
  await expect(page.locator('h1')).toHaveText(
    /^\[(dining|coffee|end)\] tables and desks, handcrafted in Kitchener$/
  );
});

test('contact form status region is announced to screen readers', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByTestId('contact-show-form').click();
  await expect(page.getByTestId('contact-form')).toBeVisible();

  const status = page.getByRole('status');
  await expect(status).toHaveAttribute('aria-live', 'polite');
});

/**
 * The manifest used to list only the 48px favicon, so "Add to Home Screen" fell back
 * to a blurry upscale or a screenshot. Guard that the icons it names exist and are
 * the size they claim — browsers silently skip icons whose real size doesn't match.
 */
test('web manifest icons resolve at their declared sizes', async ({ request }) => {
  const manifest = await (await request.get('/manifest.json')).json();
  const icons: { src: string; sizes: string; purpose?: string }[] = manifest.icons;

  expect(icons.some(i => i.sizes === '192x192')).toBe(true);
  expect(icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true);

  for (const icon of icons) {
    const response = await request.get(icon.src);
    expect(response.status(), `${icon.src} does not resolve`).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');

    // PNG IHDR: width and height are big-endian uint32s at bytes 16 and 20.
    const png = await response.body();
    expect(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`).toBe(icon.sizes);
  }
});

test('homepage declares an apple-touch-icon that resolves', async ({ page, request }) => {
  await page.goto('/');

  const href = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect(href, 'missing apple-touch-icon').toBeTruthy();

  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
});
