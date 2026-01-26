import { test, expect } from '@playwright/test';

test.describe('Fractional Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Page title should be correct
    await expect(page).toHaveTitle(/Fractional Calculator/);

    // Calculator should be visible
    const calculator = page.getByRole('application', { name: 'Fractional Calculator' });
    await expect(calculator).toBeVisible();

    // Should have three number pads
    const numberPads = page.locator('text=Whole');
    await expect(numberPads).toBeVisible();

    const numeratorPad = page.locator('text=Numerator');
    await expect(numeratorPad).toBeVisible();

    const denominatorPad = page.locator('text=Denominator');
    await expect(denominatorPad).toBeVisible();
  });

  test('can enter whole numbers', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Click number buttons using aria-labels
    await page.getByRole('button', { name: 'Whole 1' }).click();
    await page.getByRole('button', { name: 'Whole 2' }).click();

    // Display should show "12"
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('12');
  });

  test('can enter fractions', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter numerator using aria-label
    await page.getByRole('button', { name: 'Numerator 3' }).click();

    // Enter denominator using aria-label
    await page.getByRole('button', { name: 'Denominator 4' }).click();

    // Display should show fraction notation (3 over 4)
    const fractionDisplay = page.getByTestId('display-fraction');
    await expect(fractionDisplay).toBeVisible();
  });

  test('can perform addition', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter first number: 2
    await page.getByRole('button', { name: 'Whole 2' }).click();

    // Click + operator
    await page.getByRole('button', { name: 'Add' }).click();

    // Display should show "Enter value..."
    await expect(page.locator('text=Enter value...')).toBeVisible();

    // Enter second number: 3
    await page.getByRole('button', { name: 'Whole 3' }).click();

    // Click equals
    await page.getByRole('button', { name: 'Calculate result' }).click();

    // Result should be 5
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('5');
  });

  test('clear button resets calculator', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter a number
    await page.getByRole('button', { name: 'Whole 5' }).click();

    // Click Clear
    await page.getByRole('button', { name: 'Clear calculator' }).click();

    // Display should show 0
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('0');
  });

  test('history button toggles history panel', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // History panel should not be visible initially
    await expect(page.locator('text=No history yet')).not.toBeVisible();

    // Click History button
    await page.getByRole('button', { name: 'Show history' }).click();

    // History panel should appear
    await expect(page.locator('text=No history yet')).toBeVisible();

    // Click Hide button
    await page.getByRole('button', { name: 'Hide history' }).click();

    // History panel should disappear
    await expect(page.locator('text=No history yet')).not.toBeVisible();
  });

  test('calculation appears in history', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Perform a calculation
    await page.getByRole('button', { name: 'Whole 5' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Whole 3' }).click();
    await page.getByRole('button', { name: 'Calculate result' }).click();

    // Open history
    await page.getByRole('button', { name: 'Show history' }).click();

    // History should contain the calculation expression and result
    await expect(page.locator('text=5 + 3')).toBeVisible();
    // Check the history panel has the result (use more specific selector)
    await expect(page.locator('.bg-stone-100 >> text== 8')).toBeVisible();
  });

  test('backspace removes last digit', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter 12
    await page.getByRole('button', { name: 'Whole 1' }).click();
    await page.getByRole('button', { name: 'Whole 2' }).click();

    // Click backspace in whole pad
    await page.getByRole('button', { name: 'Delete last whole digit' }).click();

    // Display should show 1
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('1');
  });

  test('shows decimal equivalent', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter 1/2
    await page.getByRole('button', { name: 'Numerator 1' }).click();
    await page.getByRole('button', { name: 'Denominator 2' }).click();

    // Should show decimal equivalent (0.5 - trailing zeros are stripped)
    await expect(page.getByTestId('decimal-display')).toContainText('= 0.5');
  });
});

test.describe('Fractional Calculator - Navigation', () => {
  test('can navigate from tools page', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'networkidle' });

    // Click on Fractional Calculator link
    await page.locator('a[href="/tools/fractional-calculator"]').click();

    // Should navigate to calculator page
    await page.waitForURL('/tools/fractional-calculator');
    await expect(page).toHaveTitle(/Fractional Calculator/);
  });
});
