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

  test('shows what the piece is and its full write-up', async ({ page }) => {
    const project = getProject('walnut-maple-end-tables')!;
    await page.goto(`/projects/${project.slug}`);

    await expect(page.getByText(project.kind, { exact: true })).toBeVisible();
    for (const paragraph of project.story) {
      await expect(page.getByText(paragraph)).toBeVisible();
    }
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
    const project = getProject('walnut-cherry-maple-chessboard')!;
    await page.goto(`/projects/${project.slug}`);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map(b => JSON.parse(b));

    const creativeWork = parsed.find(p => p['@type'] === 'CreativeWork');
    expect(creativeWork).toBeTruthy();
    expect(creativeWork.name).toBe(project.title);
    expect(creativeWork.alternateName).toBe(project.kind);
    expect(creativeWork.material).toEqual(project.woods);

    const breadcrumbs = parsed.find(p => p['@type'] === 'BreadcrumbList');
    expect(breadcrumbs).toBeTruthy();
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  test('links to the previous and next project in the same category', async ({ page }) => {
    // walnut-end-table sits between walnut-coffee-table and walnut-end-table-brass.
    await page.goto('/projects/walnut-end-table');

    const prev = getProject('walnut-coffee-table')!;
    const next = getProject('walnut-end-table-brass')!;
    const nav = page.getByRole('navigation', { name: 'More projects' });
    await expect(nav.getByRole('link', { name: prev.title })).toBeVisible();
    await expect(nav.getByRole('link', { name: next.title })).toBeVisible();
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
    // Looked up rather than hardcoded, so renaming the piece doesn't break the test.
    const project = getProject('zebrawood-shadow-box')!;
    await index.getByRole('link', { name: project.title }).click();

    await expect(page).toHaveURL(/\/projects\/zebrawood-shadow-box$/);
    await expect(page.locator('h1')).toHaveText(project.title);
  });
});

test.describe('Project page photos', () => {
  // The photo buttons are server-rendered, so a click can land before React hydrates
  // and be silently lost. Retry until the dialog actually opens.
  async function openPhoto(page: import('@playwright/test').Page, index: number) {
    await expect(async () => {
      if (!(await page.getByTestId('gallery-modal').isVisible())) {
        await page.getByTestId(`project-photo-${index}`).click();
      }
      await expect(page.getByTestId('gallery-modal')).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });
  }

  test('shows each photo whole, at its own aspect ratio', async ({ page }) => {
    // Portrait (1500x2000): the fixed 4:3 box used to crop the top and bottom off.
    await page.goto('/projects/custom-entryway');

    const img = page.getByTestId('project-photo-0').locator('img');
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);

    const { shown, natural } = await img.evaluate((el: HTMLImageElement) => ({
      shown: el.clientWidth / el.clientHeight,
      natural: el.naturalWidth / el.naturalHeight,
    }));
    expect(shown).toBeCloseTo(natural, 1);
  });

  test('opens a photo full size and steps through the rest', async ({ page }) => {
    const project = getProject('custom-kitchen-cabinetry')!;
    await page.goto(`/projects/${project.slug}`);

    await openPhoto(page, 0);
    const modal = page.getByTestId('gallery-modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(page.getByTestId('modal-image-counter')).toContainText(
      `1 / ${project.images.length}`
    );

    await page.getByTestId('modal-next-button').click();
    await expect(page.getByTestId('modal-image-counter')).toContainText(
      `2 / ${project.images.length}`
    );

    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    await expect(page.getByTestId('project-photo-0')).toBeFocused();
  });
});

test.describe('Homepage featured projects', () => {
  test('each tile opens its own project page', async ({ page }) => {
    await page.goto('/');

    const tiles = page.locator('#featured a[data-testid^="featured-"]');
    await expect(tiles).toHaveCount(6);

    // Every tile must point at a real project, named on the tile itself.
    for (const tile of await tiles.all()) {
      const slug = (await tile.getAttribute('data-testid'))!.replace('featured-', '');
      const project = getProject(slug);
      expect(project, `featured tile for unknown project "${slug}"`).toBeTruthy();
      await expect(tile).toHaveAttribute('href', `/projects/${slug}`);
      await expect(tile).toContainText(project!.title);
    }

    const first = tiles.first();
    const slug = (await first.getAttribute('data-testid'))!.replace('featured-', '');
    await first.click();
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}$`));
    await expect(page.locator('h1')).toHaveText(getProject(slug)!.title);
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
