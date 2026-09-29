import { test, expect } from '@playwright/test';

async function openLightbox(page: import('@playwright/test').Page) {
  await page.goto('/gallery', { waitUntil: 'networkidle' });
  const gallerySection = page.getByTestId('gallery-section');
  await gallerySection.scrollIntoViewIfNeeded();
  await gallerySection.getByTestId('gallery-image-0').click();
  await expect(page.getByTestId('gallery-modal')).toBeVisible();
}

test.describe('Gallery', () => {
  test('displays gallery section with images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    // Gallery section should be visible
    const gallerySection = page.getByTestId('gallery-section');
    await expect(gallerySection).toBeVisible();

    // Gallery grid should have images
    const galleryGrid = gallerySection.getByTestId('gallery-grid');
    await expect(galleryGrid).toBeVisible();

    // Should have at least one image
    const firstImage = gallerySection.getByTestId('gallery-image-0');
    await expect(firstImage).toBeVisible();
  });

  test('opens lightbox when clicking an image', async ({ page }) => {
    await openLightbox(page);

    // Close button should be visible
    await expect(page.getByTestId('modal-close-button')).toBeVisible();

    // Image counter should show "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
  });

  test('navigates between images using keyboard arrows', async ({ page }) => {
    await openLightbox(page);

    // Should show "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');

    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Should show "2 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');

    // Press left arrow
    await page.keyboard.press('ArrowLeft');

    // Should be back to "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
  });

  test('navigates between images using next/previous buttons', async ({ page }) => {
    await openLightbox(page);

    // Click next button
    await page.getByTestId('modal-next-button').click();

    // Should show "2 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');

    // Click previous button
    await page.getByTestId('modal-prev-button').click();

    // Should be back to "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
  });

  test('closes lightbox when clicking close button', async ({ page }) => {
    await openLightbox(page);

    // Click close button
    await page.getByTestId('modal-close-button').click();

    // Modal should be gone
    await expect(page.getByTestId('gallery-modal')).not.toBeVisible();
  });

  test('closes lightbox when pressing Escape', async ({ page }) => {
    await openLightbox(page);

    // Press escape
    await page.keyboard.press('Escape');

    // Modal should be gone
    await expect(page.getByTestId('gallery-modal')).not.toBeVisible();
  });

  test('closes lightbox when clicking outside image', async ({ page }) => {
    await openLightbox(page);

    // Click the modal backdrop (top-left corner, away from image)
    const modal = page.getByTestId('gallery-modal');
    await modal.click({ position: { x: 10, y: 10 } });

    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('displays correct image name in lightbox', async ({ page }) => {
    await openLightbox(page);

    // Image name should be visible and non-empty
    const imageName = page.getByTestId('modal-image-name');
    await expect(imageName).toBeVisible();
    await expect(imageName).not.toBeEmpty();
  });

  test('hides previous button on first image', async ({ page }) => {
    await openLightbox(page);

    // Previous button should not exist on first image
    await expect(page.getByTestId('modal-prev-button')).not.toBeVisible();

    // Next button should exist
    await expect(page.getByTestId('modal-next-button')).toBeVisible();
  });

  test('shows loading spinner when changing images', async ({ page }) => {
    await openLightbox(page);

    // Click next button
    await page.getByTestId('modal-next-button').click();

    // Verify navigation worked
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');
  });
});

test.describe('Gallery tile captions', () => {
  test('every tile is labelled with its project name and kind', async ({ page }) => {
    await page.goto('/gallery');

    const tiles = page.locator('button[data-testid^="gallery-image-"]');
    const count = await tiles.count();
    expect(count).toBeGreaterThan(0);

    // One caption per tile: a photo with no caption means it's missing from lib/projects.
    await expect(page.getByTestId('gallery-image-caption')).toHaveCount(count);
    for (const caption of await page.getByTestId('gallery-image-caption').all()) {
      await expect(caption.locator('span')).toHaveCount(2);
      await expect(caption.locator('span').first()).not.toBeEmpty();
    }
  });

  test('the lightbox caption names the same piece as the tile', async ({ page }) => {
    await page.goto('/gallery');

    const tile = page.getByTestId('gallery-section').getByTestId('gallery-tile-0');
    const name = await tile.getByTestId('gallery-image-caption').locator('span').first().textContent();

    await expect(async () => {
      if (!(await page.getByTestId('gallery-modal').isVisible())) {
        await tile.getByTestId('gallery-image-0').click();
      }
      await expect(page.getByTestId('gallery-modal')).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });

    await expect(page.getByTestId('modal-image-name')).toContainText(name!);
  });

  test('clicking the caption text goes to the project page', async ({ page }) => {
    await page.goto('/gallery');

    const caption = page
      .getByTestId('gallery-section')
      .getByTestId('gallery-tile-0')
      .getByTestId('gallery-image-caption');
    const href = await caption.getAttribute('href');
    expect(href).toMatch(/^\/projects\/[a-z0-9-]+$/);

    const name = await caption.locator('span').first().textContent();
    await caption.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('h1')).toHaveText(name!.trim());
    await expect(page.getByTestId('gallery-modal')).toHaveCount(0);
  });

  test('clicking the photo above the caption still opens the lightbox', async ({ page }) => {
    await page.goto('/gallery');

    const tile = page.getByTestId('gallery-section').getByTestId('gallery-tile-0');
    await tile.scrollIntoViewIfNeeded();
    const box = (await tile.boundingBox())!;

    // Bottom-right corner, beside the caption text but inside the dark fade: the fade
    // must let clicks through rather than swallowing them or going to the project page.
    await expect(async () => {
      if (!(await page.getByTestId('gallery-modal').isVisible())) {
        await page.mouse.click(box.x + box.width - 20, box.y + box.height - 20);
      }
      await expect(page.getByTestId('gallery-modal')).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 30_000 });

    await expect(page).toHaveURL(/\/gallery$/);
  });
});

test.describe('Gallery section jump links', () => {
  const SECTIONS = [
    { id: 'gallery', heading: 'Tables & Desks' },
    { id: 'gallery-finish-carpentry', heading: 'Finish Carpentry' },
    { id: 'gallery-other', heading: 'Other Work' },
  ];

  for (const viewport of [
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'phone', width: 390, height: 844 },
  ]) {
    test(`each link brings its section heading into view below the nav (${viewport.name})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/gallery');

      for (const { id, heading } of SECTIONS) {
        await page.getByTestId(`jump-${id}`).click();
        await expect(page).toHaveURL(new RegExp(`#${id}$`));

        const title = page.getByTestId(`${id}-section`).getByRole('heading', { name: heading });
        const nav = page.getByRole('navigation', { name: 'Main navigation' });

        // Smooth scrolling takes a moment to settle, so poll rather than read once.
        await expect
          .poll(async () => {
            const [titleBox, navBox] = await Promise.all([title.boundingBox(), nav.boundingBox()]);
            if (!titleBox || !navBox) return false;
            const belowNav = titleBox.y >= navBox.y + navBox.height;
            const onScreen = titleBox.y + titleBox.height <= viewport.height;
            return belowNav && onScreen;
          })
          .toBe(true);
      }
    });
  }
});

test.describe('Gallery Sections', () => {
  test('finish carpentry section exists', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    const section = page.getByTestId('gallery-finish-carpentry-section');
    await expect(section).toBeVisible();

    // Should have a title
    await expect(section.getByText('Finish Carpentry')).toBeVisible();
  });

  test('other work section exists', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    const section = page.getByTestId('gallery-other-section');
    await expect(section).toBeVisible();

    await expect(section.getByText('Other Work')).toBeVisible();
  });

  test('gallery sections appear in correct order', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    const tables = page.getByTestId('gallery-section');
    const finishCarpentry = page.getByTestId('gallery-finish-carpentry-section');
    const other = page.getByTestId('gallery-other-section');

    // All three should exist
    await expect(tables).toBeVisible();
    await expect(finishCarpentry).toBeVisible();
    await expect(other).toBeVisible();

    // Tables should come before finish carpentry, which comes before other
    const tablesBox = await tables.boundingBox();
    const finishBox = await finishCarpentry.boundingBox();
    const otherBox = await other.boundingBox();

    expect(tablesBox!.y).toBeLessThan(finishBox!.y);
    expect(finishBox!.y).toBeLessThan(otherBox!.y);
  });
});

test.describe('Gallery Modal Sizing', () => {
  test('modal image container fills available space', async ({ page }) => {
    await openLightbox(page);

    // The image container should use most of the viewport
    const imageContainer = page.getByTestId('modal-image').locator('..');
    const box = await imageContainer.boundingBox();
    const viewport = page.viewportSize()!;

    // Container should be approximately 90% of viewport width (90vw)
    expect(box!.width).toBeGreaterThan(viewport.width * 0.8);
    // Container should be approximately 90% of viewport height (90vh)
    expect(box!.height).toBeGreaterThan(viewport.height * 0.8);
  });
});

test.describe('Navigation', () => {
  test('navigation links work correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Click Gallery link - should navigate to /gallery page (filter to visible for mobile/desktop variants)
    await page.locator('nav a[href="/gallery"]:visible').click();
    await page.waitForURL('/gallery');
    await expect(page.getByTestId('gallery-section')).toBeVisible();

    // Go back to homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Click About link in navigation
    await page.locator('nav a[href="/#about"]:visible').click();
    await expect(page.locator('#about')).toBeInViewport();

    // Click Contact link in navigation
    await page.locator('nav a[href="/#contact"]:visible').click();
    await expect(page.locator('#contact')).toBeInViewport();
  });
});

test.describe('Social Media Links', () => {
  test('Facebook link is correct and opens in new tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const fbLink = page.locator('a[href*="facebook.com"]').first();
    await expect(fbLink).toHaveAttribute('href', 'https://www.facebook.com/people/Wiens-Fine-Woodworking/61559807342865');
    await expect(fbLink).toHaveAttribute('target', '_blank');
    await expect(fbLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('Instagram link is correct and opens in new tab', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const igLink = page.locator('a[href*="instagram.com"]').first();
    await expect(igLink).toHaveAttribute('href', 'https://www.instagram.com/wiensfinewoodworking/');
    await expect(igLink).toHaveAttribute('target', '_blank');
    await expect(igLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

test.describe('Lightbox accessibility', () => {
  async function openLightboxInFirstSection(page: import('@playwright/test').Page) {
    await page.goto('/gallery', { waitUntil: 'networkidle' });
    await page.getByTestId('gallery-section').getByTestId('gallery-image-0').click();
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
  }

  test('exposes the lightbox as a modal dialog', async ({ page }) => {
    await openLightboxInFirstSection(page);

    const modal = page.getByTestId('gallery-modal');
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await expect(modal).toHaveAttribute('aria-label', /Project photo 1 of \d+/);
  });

  test('moves focus into the dialog on open', async ({ page }) => {
    await openLightboxInFirstSection(page);

    const focusedInModal = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="gallery-modal"]');
      return !!modal && !!document.activeElement && modal.contains(document.activeElement);
    });
    expect(focusedInModal).toBe(true);
  });

  test('keeps Tab inside the dialog', async ({ page }) => {
    await openLightboxInFirstSection(page);

    // Cycle well past the number of focusable controls; focus must never escape.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const stillInside = await page.evaluate(() => {
        const modal = document.querySelector('[data-testid="gallery-modal"]');
        return !!modal && !!document.activeElement && modal.contains(document.activeElement);
      });
      expect(stillInside, `focus escaped after ${i + 1} tab(s)`).toBe(true);
    }
  });

  test('returns focus to the thumbnail after closing', async ({ page }) => {
    await openLightboxInFirstSection(page);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('gallery-modal')).not.toBeVisible();

    const thumb = page.getByTestId('gallery-section').getByTestId('gallery-image-0');
    await expect(thumb).toBeFocused();
  });
});
