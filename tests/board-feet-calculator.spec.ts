import { test, expect } from '@playwright/test';

test.describe('Board Feet Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Page title should be correct
    await expect(page).toHaveTitle(/Board Feet Calculator/);

    // Calculator should be visible
    const calculator = page.getByTestId('board-feet-calculator');
    await expect(calculator).toBeVisible();

    // Result should show 0 initially
    const result = page.getByTestId('result');
    await expect(result).toContainText('0');
  });

  test('calculates board feet correctly', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions: 1" x 12" x 12" = 1 board foot
    await page.getByTestId('thickness-input').fill('1');
    await page.getByTestId('width-input').fill('12');
    await page.getByTestId('length-input').fill('12');

    // Result should be 1
    const result = page.getByTestId('result');
    await expect(result).toContainText('1');
  });

  test('calculates with decimal values', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions: 1.5" x 6" x 96" = 6 board feet
    await page.getByTestId('thickness-input').fill('1.5');
    await page.getByTestId('width-input').fill('6');
    await page.getByTestId('length-input').fill('96');

    // Result should be 6
    const result = page.getByTestId('result');
    await expect(result).toContainText('6');
  });

  test('multiplies by quantity', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions: 1" x 12" x 12" = 1 board foot, quantity 5
    await page.getByTestId('thickness-input').fill('1');
    await page.getByTestId('width-input').fill('12');
    await page.getByTestId('length-input').fill('12');
    await page.getByTestId('quantity-input').fill('5');

    // Result should be 5
    const result = page.getByTestId('result');
    await expect(result).toContainText('5');
  });

  test('shows per-piece calculation when quantity > 1', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions with quantity > 1
    await page.getByTestId('thickness-input').fill('1');
    await page.getByTestId('width-input').fill('12');
    await page.getByTestId('length-input').fill('12');
    await page.getByTestId('quantity-input').fill('3');

    // Should show per-piece breakdown
    await expect(page.locator('text=1 bf × 3 pieces')).toBeVisible();
  });

  test('clear button resets all fields', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter some values
    await page.getByTestId('thickness-input').fill('2');
    await page.getByTestId('width-input').fill('8');
    await page.getByTestId('length-input').fill('48');
    await page.getByTestId('quantity-input').fill('10');

    // Click clear
    await page.getByTestId('clear-button').click();

    // All inputs should be cleared (thickness, width, length empty, quantity back to 1)
    await expect(page.getByTestId('thickness-input')).toHaveValue('');
    await expect(page.getByTestId('width-input')).toHaveValue('');
    await expect(page.getByTestId('length-input')).toHaveValue('');
    await expect(page.getByTestId('quantity-input')).toHaveValue('1');

    // Result should be 0
    const result = page.getByTestId('result');
    await expect(result).toContainText('0');
  });

  test('shows 0 when dimensions are incomplete', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter only thickness
    await page.getByTestId('thickness-input').fill('1');

    // Result should still be 0
    const result = page.getByTestId('result');
    await expect(result).toContainText('0');

    // Add width but not length
    await page.getByTestId('width-input').fill('12');

    // Result should still be 0
    await expect(result).toContainText('0');
  });

  test('only accepts numeric input', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Try to enter non-numeric characters
    await page.getByTestId('thickness-input').fill('abc');

    // Input should be empty (rejected)
    await expect(page.getByTestId('thickness-input')).toHaveValue('');

    // Enter valid number
    await page.getByTestId('thickness-input').fill('1.5');
    await expect(page.getByTestId('thickness-input')).toHaveValue('1.5');
  });
});

test.describe('Board Feet Calculator - Navigation', () => {
  test('can navigate from tools page', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'networkidle' });

    // Click on Board Feet Calculator link
    await page.locator('a[href="/tools/board-feet-calculator"]').click();

    // Should navigate to calculator page
    await page.waitForURL('/tools/board-feet-calculator');
    await expect(page).toHaveTitle(/Board Feet Calculator/);
  });
});
