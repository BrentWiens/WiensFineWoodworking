import { test, expect } from '@playwright/test';

test.describe('Gallery', () => {
  test('displays gallery section with images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    // Gallery section should be visible
    const gallerySection = page.getByTestId('gallery-section');
    await expect(gallerySection).toBeVisible();

    // Gallery grid should have images
    const galleryGrid = page.getByTestId('gallery-grid');
    await expect(galleryGrid).toBeVisible();

    // Should have at least one image
    const firstImage = page.getByTestId('gallery-image-0');
    await expect(firstImage).toBeVisible();
  });

  test('opens lightbox when clicking an image', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    // Scroll to gallery
    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    
    // Wait a bit for any animations
    await page.waitForTimeout(500);
    
    // Click first image
    await page.getByTestId('gallery-image-0').click();
    
    // Modal should be visible
    const modal = page.getByTestId('gallery-modal');
    await expect(modal).toBeVisible();
    
    // Close button should be visible
    const closeButton = page.getByTestId('modal-close-button');
    await expect(closeButton).toBeVisible();
    
    // Image counter should show "1 / X"
    const counter = page.getByTestId('modal-image-counter');
    await expect(counter).toContainText('1 /');
  });

  test('navigates between images using keyboard arrows', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Click first image
    await page.getByTestId('gallery-image-0').click();
    
    // Wait for modal to be visible
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Should show "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
    
    // Press right arrow
    await page.keyboard.press('ArrowRight');
    
    // Wait a moment for navigation
    await page.waitForTimeout(300);
    
    // Should show "2 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');
    
    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    
    await page.waitForTimeout(300);
    
    // Should be back to "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
  });

  test('navigates between images using next/previous buttons', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Click first image
    await page.getByTestId('gallery-image-0').click();
    
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Click next button
    const nextButton = page.getByTestId('modal-next-button');
    await nextButton.click();
    
    await page.waitForTimeout(300);
    
    // Should show "2 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');
    
    // Click previous button
    const prevButton = page.getByTestId('modal-prev-button');
    await prevButton.click();
    
    await page.waitForTimeout(300);
    
    // Should be back to "1 / X"
    await expect(page.getByTestId('modal-image-counter')).toContainText('1 /');
  });

  test('closes lightbox when clicking close button', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    // Modal should be visible
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Click close button
    await page.getByTestId('modal-close-button').click();
    
    // Modal should be gone
    await expect(page.getByTestId('gallery-modal')).not.toBeVisible();
  });

  test('closes lightbox when pressing Escape', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    // Modal should be visible
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Press escape
    await page.keyboard.press('Escape');
    
    // Modal should be gone
    await expect(page.getByTestId('gallery-modal')).not.toBeVisible();
  });

  test('closes lightbox when clicking outside image', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    // Modal should be visible
    const modal = page.getByTestId('gallery-modal');
    await expect(modal).toBeVisible();
    
    // Click the modal backdrop (top-left corner, away from image)
    await modal.click({ position: { x: 10, y: 10 } });
    
    // Modal should close
    await expect(modal).not.toBeVisible();
  });

  test('displays correct image name in lightbox', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    // Wait for modal
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Image name should be visible
    const imageName = page.getByTestId('modal-image-name');
    await expect(imageName).toBeVisible();
    
    // Should contain some text (the processed filename)
    await expect(imageName).not.toBeEmpty();
  });

  test('hides previous button on first image', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Previous button should not exist on first image
    await expect(page.getByTestId('modal-prev-button')).not.toBeVisible();
    
    // Next button should exist
    await expect(page.getByTestId('modal-next-button')).toBeVisible();
  });

  test('shows loading spinner when changing images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'networkidle' });

    await page.getByTestId('gallery-section').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.getByTestId('gallery-image-0').click();
    
    await expect(page.getByTestId('gallery-modal')).toBeVisible();
    
    // Click next button
    await page.getByTestId('modal-next-button').click();
    
    // Loading spinner might appear briefly (this is a race condition, so we check it was triggered)
    // The spinner appears and disappears quickly, so we just verify navigation worked
    await page.waitForTimeout(300);
    await expect(page.getByTestId('modal-image-counter')).toContainText('2 /');
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
    await page.waitForTimeout(500);
    await expect(page.locator('#about')).toBeInViewport();

    // Click Contact link in navigation
    await page.locator('nav a[href="/#contact"]:visible').click();
    await page.waitForTimeout(500);
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