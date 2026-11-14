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

test.describe('Dovetail Calculator - Units and labels', () => {
  test('switching to metric converts the dimensions and keeps the drawing readable', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    const tailBoard = page.getByRole('img', { name: 'Tail board layout' });
    const before = await tailBoard.getAttribute('viewBox');
    await page.getByTestId('units-metric').click();

    await expect(getInput(page, 'Board Width')).toHaveValue('203.2');
    await expect(getInput(page, 'Material Thickness')).toHaveValue('12.7');

    // Same joint, same drawing: the view box barely moves rather than growing 20-fold
    const after = await tailBoard.getAttribute('viewBox');
    const width = (viewBox: string | null) => Number(viewBox!.split(' ')[2]);
    expect(Math.abs(width(after) - width(before))).toBeLessThan(1);
    await expect(page.locator('svg text', { hasText: '203.2mm' }).first()).toBeVisible();

    await page.getByTestId('units-imperial').click();
    await expect(getInput(page, 'Board Width')).toHaveValue('8');
  });

  test('a single width override fills the rest of the board', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });

    // 8 in board, 4 tails at 1.5: the pins take 8 / 4 - 1.5 = 0.5
    const tails = getInput(page, 'Number of Tails');
    await tails.fill('4');
    await tails.blur();
    const tailWidth = page.getByLabel('Tail Width (override)');
    await tailWidth.fill('1.5');
    await tailWidth.blur();

    await expect(page.locator('svg text', { hasText: '0.5 (1/2)"' }).first()).toBeVisible();
    await expect(page.getByText('Warnings', { exact: false })).toHaveCount(0);
  });

  test('the joint angle select is labelled', async ({ page }) => {
    await page.goto('/tools/dovetail-calculator', { waitUntil: 'networkidle' });
    await expect(page.getByLabel('Joint Angle')).toHaveValue('1:8');
  });
});
