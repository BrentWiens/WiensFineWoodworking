import { test, expect } from '@playwright/test';

test.describe('Fractional Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Page title should be correct
    await expect(page).toHaveTitle(/Fractional Calculator/);

    // Calculator should be visible
    const calculator = page.locator('.max-w-2xl');
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

    // Click number buttons in whole number pad (first pad)
    const wholePad = page.locator('text=Whole').locator('..').locator('..');
    await wholePad.locator('button:has-text("1")').click();
    await wholePad.locator('button:has-text("2")').click();

    // Display should show "12"
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('12');
  });

  test('can enter fractions', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter numerator
    const numeratorPad = page.locator('text=Numerator').locator('..').locator('..');
    await numeratorPad.locator('button:has-text("3")').click();

    // Enter denominator
    const denominatorPad = page.locator('text=Denominator').locator('..').locator('..');
    await denominatorPad.locator('button:has-text("4")').click();

    // Display should show fraction notation (3 over 4)
    const fractionDisplay = page.locator('.bg-stone-800 .flex.flex-col');
    await expect(fractionDisplay).toBeVisible();
  });

  test('can perform addition', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter first number: 2
    const wholePad = page.locator('text=Whole').locator('..').locator('..');
    await wholePad.locator('button:has-text("2")').click();

    // Click + operator
    await page.locator('button:has-text("+")').click();

    // Display should show "Enter value..."
    await expect(page.locator('text=Enter value...')).toBeVisible();

    // Enter second number: 3
    await wholePad.locator('button:has-text("3")').click();

    // Click equals
    await page.locator('button:has-text("=")').click();

    // Result should be 5
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('5');
  });

  test('clear button resets calculator', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter a number
    const wholePad = page.locator('text=Whole').locator('..').locator('..');
    await wholePad.locator('button:has-text("5")').click();

    // Click Clear
    await page.locator('button:has-text("C")').click();

    // Display should show 0
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('0');
  });

  test('history button toggles history panel', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // History panel should not be visible initially
    await expect(page.locator('text=No history yet')).not.toBeVisible();

    // Click History button
    await page.locator('button:has-text("History")').click();

    // History panel should appear
    await expect(page.locator('text=No history yet')).toBeVisible();

    // Click Hide button
    await page.locator('button:has-text("Hide")').click();

    // History panel should disappear
    await expect(page.locator('text=No history yet')).not.toBeVisible();
  });

  test('calculation appears in history', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Perform a calculation
    const wholePad = page.locator('text=Whole').locator('..').locator('..');
    await wholePad.locator('button:has-text("5")').click();
    await page.locator('button:has-text("+")').click();
    await wholePad.locator('button:has-text("3")').click();
    await page.locator('button:has-text("=")').click();

    // Open history
    await page.locator('button:has-text("History")').click();

    // History should contain the calculation
    await expect(page.locator('text=5 + 3')).toBeVisible();
    await expect(page.locator('text== 8')).toBeVisible();
  });

  test('backspace removes last digit', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter 12
    const wholePad = page.locator('text=Whole').locator('..').locator('..');
    await wholePad.locator('button:has-text("1")').click();
    await wholePad.locator('button:has-text("2")').click();

    // Click backspace in whole pad
    await wholePad.locator('button:has-text("⌫")').click();

    // Display should show 1
    const display = page.locator('.bg-stone-800 .text-4xl, .bg-stone-800 .text-5xl');
    await expect(display).toContainText('1');
  });

  test('shows decimal equivalent', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Enter 1/2
    const numeratorPad = page.locator('text=Numerator').locator('..').locator('..');
    await numeratorPad.locator('button:has-text("1")').click();

    const denominatorPad = page.locator('text=Denominator').locator('..').locator('..');
    await denominatorPad.locator('button:has-text("2")').click();

    // Should show decimal equivalent (0.5000)
    await expect(page.locator('text=0.5000')).toBeVisible();
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
