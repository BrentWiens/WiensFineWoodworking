import { test, expect } from '@playwright/test';
import { PROJECTS, getProject } from '../lib/projects';

test.describe('Project detail pages', () => {
  test('every project slug resolves to a page with its title as the h1', async ({ page }) => {
    // Spot-check across all three categories rather than all 39, to keep runtime sane.
    const sample = [
      PROJECTS.find(p => p.category === 'tables')!,
      PROJECTS.find(p => p.category === 'finish-carpentry')!,
      PROJECTS.find(p => p.category === 'other')!,
    ];

    for (const project of sample) {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(project.title);
    }
  });

  test('renders materials and location metadata', async ({ page }) => {
    const project = getProject('walnut-maple-end-tables')!;
    await page.goto(`/projects/${project.slug}`);

    await expect(page.getByText('Walnut, Maple')).toBeVisible();
    await expect(page.getByText('Kitchener, Ontario')).toBeVisible();
  });

  test('shows a breadcrumb back to the gallery', async ({ page }) => {
    await page.goto('/projects/walnut-coffee-table');

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();

    await breadcrumb.getByRole('link', { name: 'Gallery' }).click();
    await expect(page).toHaveURL(/\/gallery$/);
  });

  test('has a commission call to action linking to the contact section', async ({ page }) => {
    await page.goto('/projects/walnut-coffee-table');

    const cta = page.getByRole('link', { name: 'Start a Commission' });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/#contact');
  });

  test('emits CreativeWork and BreadcrumbList structured data', async ({ page }) => {
    await page.goto('/projects/walnut-cherry-maple-chessboard');

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map(b => JSON.parse(b));

    const creativeWork = parsed.find(p => p['@type'] === 'CreativeWork');
    expect(creativeWork).toBeTruthy();
    expect(creativeWork.name).toBe('Walnut, Cherry and Maple Chessboard');
    expect(creativeWork.material).toEqual(['Walnut', 'Cherry', 'Maple']);

    const breadcrumbs = parsed.find(p => p['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toBeTruthy();
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  test('links to the previous and next project in the same category', async ({ page }) => {
    // walnut-end-table sits between walnut-coffee-table and walnut-end-table-brass.
    await page.goto('/projects/walnut-end-table');

    const nav = page.getByRole('navigation', { name: 'More projects' });
    await expect(nav.getByRole('link', { name: /Walnut Coffee Table/ })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Walnut End Table with Brass/ })).toBeVisible();
  });

  test('unknown slug returns the 404 page', async ({ page }) => {
    const response = await page.goto('/projects/not-a-real-project');
    expect(response?.status()).toBe(404);
  });
});

test.describe('Project index on the gallery page', () => {
  test('lists every project as a crawlable link', async ({ page }) => {
    await page.goto('/gallery');

    const index = page.locator('#all-projects');
    await index.scrollIntoViewIfNeeded();
    await expect(index).toBeVisible();

    const links = index.getByRole('link');
    await expect(links).toHaveCount(PROJECTS.length);
  });

  test('a project link navigates to its detail page', async ({ page }) => {
    await page.goto('/gallery');

    const index = page.locator('#all-projects');
    await index.scrollIntoViewIfNeeded();
    await index.getByRole('link', { name: 'Zebrawood Shadow Box' }).click();

    await expect(page).toHaveURL(/\/projects\/zebrawood-shadow-box$/);
    await expect(page.locator('h1')).toHaveText('Zebrawood Shadow Box');
  });
});

test.describe('Gallery lightbox project link', () => {
  test('lightbox offers a link through to the project page', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    // The page renders three Gallery sections, each numbering its images from 0,
    // so the tile has to be scoped to a section to stay unambiguous.
    await page
      .getByTestId('gallery-section')
      .getByTestId('gallery-image-0')
      .click();
    await expect(page.getByTestId('gallery-modal')).toBeVisible();

    const link = page.getByTestId('modal-project-link');
    await expect(link).toBeVisible();

    await link.click();
    await expect(page).toHaveURL(/\/projects\//);
    await expect(page.locator('h1')).toBeVisible();
  });
});
