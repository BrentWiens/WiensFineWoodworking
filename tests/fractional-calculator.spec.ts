import { test, expect } from '@playwright/test';

test.describe('Fractional Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // Page title should be correct
    await expect(page).toHaveTitle(/Fractional Calculator/);

    // Calculator should be visible
    const calculator = page.getByRole('group', { name: 'Fractional Calculator' });
    await expect(calculator).toBeVisible();

    // Should have three number pads
    const numberPads = calculator.getByText('Whole', { exact: true });
    await expect(numberPads).toBeVisible();

    const numeratorPad = calculator.getByText('Numerator', { exact: true });
    await expect(numeratorPad).toBeVisible();

    const denominatorPad = calculator.getByText('Denominator', { exact: true });
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

test.describe('Fractional Calculator - Negative results and errors', () => {
  test('keeps the minus sign on a result between -1 and 0', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // 1/4 - 1/2 = -1/4
    await page.getByRole('button', { name: 'Numerator 1' }).click();
    await page.getByRole('button', { name: 'Denominator 4' }).click();
    await page.getByRole('button', { name: 'Subtract' }).click();
    await page.getByRole('button', { name: 'Numerator 1' }).click();
    await page.getByRole('button', { name: 'Denominator 2' }).click();
    await page.getByRole('button', { name: 'Calculate result' }).click();

    await expect(page.getByTestId('display-sign')).toBeVisible();
    await expect(page.getByTestId('display-numerator')).toHaveText('1');
    await expect(page.getByTestId('display-denominator')).toHaveText('4');
    await expect(page.getByTestId('decimal-display')).toContainText('= -0.25');
  });

  test('carries a negative result into the next calculation', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    // 1 - 3 = -2, then + 5 = 3
    await page.getByRole('button', { name: 'Whole 1' }).click();
    await page.getByRole('button', { name: 'Subtract' }).click();
    await page.getByRole('button', { name: 'Whole 3' }).click();
    await page.getByRole('button', { name: 'Calculate result' }).click();
    await expect(page.getByTestId('decimal-display')).toContainText('= -2');

    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Whole 5' }).click();
    await page.getByRole('button', { name: 'Calculate result' }).click();
    await expect(page.getByTestId('display-whole')).toHaveText('3');
    await expect(page.getByTestId('display-sign')).toHaveCount(0);
  });

  test('reports division by zero instead of answering 0', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: 'Whole 5' }).click();
    await page.getByRole('button', { name: 'Divide' }).click();
    await page.getByRole('button', { name: 'Whole 0' }).click();
    await page.getByRole('button', { name: 'Calculate result' }).click();

    await expect(page.getByTestId('display-error')).toContainText('divide by zero');

    // Typing again clears the message
    await page.getByRole('button', { name: 'Whole 7' }).click();
    await expect(page.getByTestId('display-error')).toHaveCount(0);
    await expect(page.getByTestId('display-whole')).toHaveText('7');
  });
});

test.describe('Fractional Calculator - Keyboard', () => {
  test('types a mixed-number sum from the keyboard', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('calculator').focus();
    // 2 3/4 + 1 1/2 = 4 1/4
    await page.keyboard.type('2 3 4+1 1 2');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('display-whole')).toHaveText('4');
    await expect(page.getByTestId('display-numerator')).toHaveText('1');
    await expect(page.getByTestId('display-denominator')).toHaveText('4');
  });

  test('slash moves from numerator to denominator, and divides elsewhere', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('calculator').focus();
    // "1 1/2" then "/2" = 3/4
    await page.keyboard.type('1 1/2/2=');

    await expect(page.getByTestId('display-numerator')).toHaveText('3');
    await expect(page.getByTestId('display-denominator')).toHaveText('4');
    await expect(page.getByTestId('decimal-display')).toContainText('= 0.75');
  });

  test('Escape clears and Backspace deletes', async ({ page }) => {
    await page.goto('/tools/fractional-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('calculator').focus();
    await page.keyboard.type('125');
    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('display-whole')).toHaveText('12');

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('display-whole')).toHaveText('0');
  });
});
