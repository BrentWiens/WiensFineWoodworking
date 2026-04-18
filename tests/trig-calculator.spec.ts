import { test, expect } from '@playwright/test';

test.describe('Trigonometry Calculator', () => {
  test('page loads with calculator visible', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await expect(page).toHaveTitle(/Trigonometry Calculator/);

    const calculator = page.getByRole('application', { name: 'Trigonometry Calculator' });
    await expect(calculator).toBeVisible();

    // Should have side and angle inputs
    await expect(page.getByTestId('input-a')).toBeVisible();
    await expect(page.getByTestId('input-b')).toBeVisible();
    await expect(page.getByTestId('input-c')).toBeVisible();
    await expect(page.getByTestId('input-A')).toBeVisible();
    await expect(page.getByTestId('input-B')).toBeVisible();
  });

  test('has calculate and reset buttons', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('calculate')).toBeVisible();
    await expect(page.getByTestId('reset')).toBeVisible();
  });

  test('shows triangle diagram', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await expect(page.getByTestId('triangle-diagram')).toBeVisible();
  });

  test('solves 3-4-5 triangle from two sides', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-a').fill('3');
    await page.getByTestId('input-b').fill('4');
    await page.getByTestId('calculate').click();

    // Hypotenuse should be filled in
    await expect(page.getByTestId('input-c')).toHaveValue('5');
  });

  test('solves from side and angle', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-a').fill('5');
    await page.getByTestId('input-A').fill('30');
    await page.getByTestId('calculate').click();

    // c should be 10 (sin(30°) = 5/10)
    await expect(page.getByTestId('input-c')).toHaveValue('10');

    // B should be 60
    await expect(page.getByTestId('input-B')).toHaveValue('60');
  });

  test('accepts fractional input', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    // Enter 3-1/2 for side a and 4 for side b
    await page.getByTestId('input-a').fill('3-1/2');
    await page.getByTestId('input-b').fill('4');
    await page.getByTestId('calculate').click();

    // c should be sqrt(3.5^2 + 4^2) = sqrt(28.25) ≈ 5.315
    const cValue = await page.getByTestId('input-c').inputValue();
    const c = parseFloat(cValue);
    expect(c).toBeGreaterThan(5.3);
    expect(c).toBeLessThan(5.4);
  });

  test('shows error with insufficient input', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    // Only enter one value
    await page.getByTestId('input-a').fill('5');
    await page.getByTestId('calculate').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('at least 2');
  });

  test('shows error for two angles only', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-A').fill('30');
    await page.getByTestId('input-B').fill('60');
    await page.getByTestId('calculate').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('one side');
  });

  test('shows error for invalid triangle sides', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    // Side a larger than hypotenuse c
    await page.getByTestId('input-a').fill('5');
    await page.getByTestId('input-c').fill('3');
    await page.getByTestId('calculate').click();

    await expect(page.getByTestId('error-message')).toBeVisible();
  });

  test('reset clears all fields', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-a').fill('3');
    await page.getByTestId('input-b').fill('4');
    await page.getByTestId('calculate').click();

    await page.getByTestId('reset').click();

    await expect(page.getByTestId('input-a')).toHaveValue('');
    await expect(page.getByTestId('input-b')).toHaveValue('');
    await expect(page.getByTestId('input-c')).toHaveValue('');
    await expect(page.getByTestId('input-A')).toHaveValue('');
    await expect(page.getByTestId('input-B')).toHaveValue('');
  });

  test('solves 45-45-90 triangle', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-a').fill('1');
    await page.getByTestId('input-A').fill('45');
    await page.getByTestId('calculate').click();

    // b should also be 1
    await expect(page.getByTestId('input-b')).toHaveValue('1');

    // B should be 45
    await expect(page.getByTestId('input-B')).toHaveValue('45');
  });

  test('fills solved values into empty fields only', async ({ page }) => {
    await page.goto('/tools/trig-calculator', { waitUntil: 'networkidle' });

    await page.getByTestId('input-a').fill('3');
    await page.getByTestId('input-b').fill('4');
    await page.getByTestId('calculate').click();

    // Original values should be preserved
    await expect(page.getByTestId('input-a')).toHaveValue('3');
    await expect(page.getByTestId('input-b')).toHaveValue('4');

    // Solved values should be filled
    const cValue = await page.getByTestId('input-c').inputValue();
    expect(cValue).not.toBe('');
  });
});

test.describe('Trigonometry Calculator - Navigation', () => {
  test('can navigate from tools page', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'networkidle' });

    await page.locator('a[href="/tools/trig-calculator"]').click();

    await page.waitForURL('/tools/trig-calculator');
    await expect(page).toHaveTitle(/Trigonometry Calculator/);
  });
});
