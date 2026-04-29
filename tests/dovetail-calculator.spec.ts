import { test, expect, type Locator, type Page } from '@playwright/test';

// The NumberInput component renders <div><label>text</label><input/></div>
// Labels aren't linked via htmlFor, so we find the label then get its sibling input
function getInput(page: Page, labelText: string): Locator {
  return page.locator('label', { hasText: new RegExp(`^${labelText}$`) }).locator('..').locator('input');
}

test.describe('Dovetail Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle(/Dovetail.*Joint.*Calculator/);

    const calculator = page.getByTestId('dovetail-calculator');
    await expect(calculator).toBeVisible();
  });

  test('displays board dimension inputs', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(getInput(page, 'Tail Piece Length')).toBeVisible();
    await expect(getInput(page, 'Pin Piece Length')).toBeVisible();
    await expect(getInput(page, 'Board Width')).toBeVisible();
    await expect(getInput(page, 'Material Thickness')).toBeVisible();
  });

  test('displays joint configuration inputs', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(getInput(page, 'Number of Tails')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
  });

  test('renders tail and pin board SVGs', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(page.getByText('Tail Board')).toBeVisible();
    await expect(page.getByText('Pin Board')).toBeVisible();

    const svgs = page.getByTestId('dovetail-calculator').locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('changing number of tails updates visualization', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    const tailsInput = getInput(page, 'Number of Tails');
    await tailsInput.fill('5');
    await tailsInput.blur();

    const svgs = page.getByTestId('dovetail-calculator').locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('switching to box joint mode changes labels', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await page.locator('select').selectOption('1:0');

    await expect(page.getByText('Number of Fingers')).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Board A' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Board B' })).toBeVisible();
  });

  test('switching back to dovetail mode restores labels', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await page.locator('select').selectOption('1:0');
    await expect(page.locator('label', { hasText: 'Number of Fingers' })).toBeVisible();

    await page.locator('select').selectOption('1:8');
    await expect(page.locator('label', { hasText: 'Number of Tails' })).toBeVisible();
    await expect(page.getByText('Tail Board')).toBeVisible();
    await expect(page.getByText('Pin Board')).toBeVisible();
  });

  test('displays legend with correct items', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(page.getByText('Half-pin')).toBeVisible();
    await expect(page.getByText('Tail', { exact: true })).toBeVisible();
    await expect(page.getByText('Pin', { exact: true })).toBeVisible();
  });

  test('can modify board width', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    const boardWidth = getInput(page, 'Board Width');
    await boardWidth.fill('8');
    await boardWidth.blur();

    const calculator = page.getByTestId('dovetail-calculator');
    await expect(calculator).toBeVisible();
    const svgs = calculator.locator('svg');
    await expect(svgs.first()).toBeVisible();
  });

  test('can modify material thickness', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    const thickness = getInput(page, 'Material Thickness');
    await thickness.fill('0.75');
    await thickness.blur();

    const calculator = page.getByTestId('dovetail-calculator');
    await expect(calculator).toBeVisible();
  });

  test('shows warnings for extreme values', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    // Shrink board width and increase tails to trigger halfPinWidth < 0
    const boardWidth = getInput(page, 'Board Width');
    await boardWidth.fill('2');
    await boardWidth.blur();

    const tails = getInput(page, 'Number of Tails');
    await tails.fill('20');
    await tails.blur();

    await expect(page.getByText('Warnings', { exact: false })).toBeVisible();
  });

  test('offset inputs are available', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    await expect(getInput(page, 'Top Offset')).toBeVisible();
    await expect(getInput(page, 'Bottom Offset')).toBeVisible();
  });
});

test.describe('Dovetail Calculator - Navigation', () => {
  test('can navigate from tools page', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'networkidle' });

    await page.locator('a[href="/tools/dovetail-calculator"]').click();

    await page.waitForURL('/tools/dovetail-calculator');
    await expect(page).toHaveTitle(/Dovetail.*Joint.*Calculator/);
  });
});
