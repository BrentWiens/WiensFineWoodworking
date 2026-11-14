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
    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');

    // Result should be 1
    const result = page.getByTestId('result');
    await expect(result).toContainText('1');
  });

  test('calculates with decimal values', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions: 1.5" x 6" x 96" = 6 board feet
    await page.getByTestId('thickness-input-0').fill('1.5');
    await page.getByTestId('width-input-0').fill('6');
    await page.getByTestId('length-input-0').fill('96');

    // Result should be 6
    const result = page.getByTestId('result');
    await expect(result).toContainText('6');
  });

  test('multiplies by quantity', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter dimensions: 1" x 12" x 12" = 1 board foot, quantity 5
    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');
    await page.getByTestId('quantity-input-0').fill('5');

    // Result should be 5
    const result = page.getByTestId('result');
    await expect(result).toContainText('5');
  });

  test('supports multiple lumber entries', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter first entry: 1" x 12" x 12" = 1 bf
    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');

    // Add second entry
    await page.getByTestId('add-entry').click();

    // Enter second entry: 1" x 12" x 12" = 1 bf
    await page.getByTestId('thickness-input-1').fill('1');
    await page.getByTestId('width-input-1').fill('12');
    await page.getByTestId('length-input-1').fill('12');

    // Total should be 2
    const result = page.getByTestId('result');
    await expect(result).toContainText('2');
  });

  test('clear button resets all fields', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter some values
    await page.getByTestId('thickness-input-0').fill('2');
    await page.getByTestId('width-input-0').fill('8');
    await page.getByTestId('length-input-0').fill('48');
    await page.getByTestId('quantity-input-0').fill('10');

    // Click clear
    await page.getByTestId('clear-button').click();

    // All inputs should be cleared (thickness, width, length empty, quantity back to 1)
    await expect(page.getByTestId('thickness-input-0')).toHaveValue('');
    await expect(page.getByTestId('width-input-0')).toHaveValue('');
    await expect(page.getByTestId('length-input-0')).toHaveValue('');
    await expect(page.getByTestId('quantity-input-0')).toHaveValue('1');

    // Result should be 0
    const result = page.getByTestId('result');
    await expect(result).toContainText('0');
  });

  test('shows 0 when dimensions are incomplete', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Enter only thickness
    await page.getByTestId('thickness-input-0').fill('1');

    // Result should still be 0
    const result = page.getByTestId('result');
    await expect(result).toContainText('0');

    // Add width but not length
    await page.getByTestId('width-input-0').fill('12');

    // Result should still be 0
    await expect(result).toContainText('0');
  });

  test('only accepts numeric input', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // Try to enter non-numeric characters
    await page.getByTestId('thickness-input-0').fill('abc');

    // Input should be empty (rejected)
    await expect(page.getByTestId('thickness-input-0')).toHaveValue('');

    // Enter valid number
    await page.getByTestId('thickness-input-0').fill('1.5');
    await expect(page.getByTestId('thickness-input-0')).toHaveValue('1.5');
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

test.describe('Board Feet Calculator - Fractions, quantity, waste and cost', () => {
  test('accepts fractions and thicknesses given in quarters', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    // 8/4 x 5-1/2 x 96 = 2 x 5.5 x 96 / 144 = 7.33 bf
    await page.getByTestId('thickness-input-0').fill('8/4');
    await page.getByTestId('width-input-0').fill('5 1/2');
    await page.getByTestId('length-input-0').fill('96');
    await expect(page.getByTestId('result')).toHaveText('7.33');

    await page.getByTestId('width-input-0').fill('6');
    await expect(page.getByTestId('result')).toHaveText('8');
  });

  test('a quantity of zero counts no boards, and decimals are not accepted', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');
    await page.getByTestId('quantity-input-0').fill('0');
    await expect(page.getByTestId('result')).toHaveText('0');

    await page.getByTestId('quantity-input-0').fill('2.9');
    await expect(page.getByTestId('quantity-input-0')).toHaveValue('0');
  });

  test('adds a waste allowance and works out the cost', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');
    await page.getByTestId('quantity-input-0').fill('10');

    await page.getByTestId('waste-input').fill('20');
    await expect(page.getByTestId('result')).toHaveText('10');
    await expect(page.getByTestId('result-with-waste')).toHaveText('12 bf');

    await page.getByTestId('price-input').fill('8.50');
    await expect(page.getByTestId('result-cost')).toHaveText('$102.00');
  });

  test('switching units converts the entries and keeps the total', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('thickness-input-0').fill('1');
    await page.getByTestId('width-input-0').fill('12');
    await page.getByTestId('length-input-0').fill('12');
    await page.getByTestId('units-metric').click();

    await expect(page.getByTestId('thickness-input-0')).toHaveValue('25.4');
    await expect(page.getByTestId('width-input-0')).toHaveValue('304.8');
    await expect(page.getByTestId('result')).toHaveText('1');
  });

  test('every row input has an accessible name', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator', { waitUntil: 'networkidle' });

    await expect(page.getByLabel('Thickness, board 1')).toBeVisible();
    await expect(page.getByLabel('Quantity, board 1')).toBeVisible();
  });
});

test.describe('Tool pages - guide, related tools and structured data', () => {
  test('each calculator explains itself and links to the others', async ({ page }) => {
    await page.goto('/tools/board-feet-calculator');

    await expect(page.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible();
    await expect(page.getByTestId('tool-guide')).toContainText('144 cubic inches');

    const moreTools = page.getByRole('navigation', { name: 'More tools' });
    await expect(moreTools.getByRole('link', { name: /Cut List Optimizer/ })).toHaveAttribute('href', '/tools/cut-list-optimizer');
    await expect(moreTools.locator('a[href="/tools/board-feet-calculator"]')).toHaveCount(0);
  });

  test('each calculator carries WebApplication and breadcrumb structured data', async ({ page }) => {
    for (const slug of ['fractional-calculator', 'board-feet-calculator', 'cut-list-optimizer', 'trig-calculator', 'dovetail-calculator']) {
      await page.goto(`/tools/${slug}`);

      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const items = blocks.flatMap((block) => [JSON.parse(block)].flat());

      const app = items.find((item) => item['@type'] === 'WebApplication');
      expect(app, `${slug} is missing WebApplication data`).toBeTruthy();
      expect(app.url).toBe(`https://wfinew.com/tools/${slug}`);

      const breadcrumb = items.find((item) => item['@type'] === 'BreadcrumbList');
      expect(breadcrumb.itemListElement).toHaveLength(3);
    }
  });

  test('the tools index keeps its headings in order', async ({ page }) => {
    await page.goto('/tools');

    await expect(page.getByRole('heading', { level: 2, name: 'Board Feet Calculator' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Business tools' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Mileage Log' })).toBeVisible();
  });
});
