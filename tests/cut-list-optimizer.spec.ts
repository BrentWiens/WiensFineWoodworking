import { test, expect } from '@playwright/test';

test.describe('Cut List Optimizer', () => {
  test('page loads with optimizer visible', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Page title should be correct
    await expect(page).toHaveTitle(/Cut List Optimizer/);

    // Optimizer should be visible
    const optimizer = page.getByTestId('cut-list-optimizer');
    await expect(optimizer).toBeVisible();

    // Sheet settings should have default values
    await expect(page.getByTestId('sheet-width')).toHaveValue('48');
    await expect(page.getByTestId('sheet-length')).toHaveValue('96');
    await expect(page.getByTestId('sheet-kerf')).toHaveValue('0.125');
    await expect(page.getByTestId('sheets-available')).toHaveValue('1');
  });

  test('can modify sheet settings', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Modify sheet dimensions
    await page.getByTestId('sheet-width').fill('24');
    await page.getByTestId('sheet-length').fill('48');
    await page.getByTestId('sheet-kerf').fill('0.25');
    await page.getByTestId('sheets-available').fill('5');

    // Verify values
    await expect(page.getByTestId('sheet-width')).toHaveValue('24');
    await expect(page.getByTestId('sheet-length')).toHaveValue('48');
    await expect(page.getByTestId('sheet-kerf')).toHaveValue('0.25');
    await expect(page.getByTestId('sheets-available')).toHaveValue('5');
  });

  test('can add pieces', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Initially one piece row
    await expect(page.getByTestId('piece-row-0')).toBeVisible();
    await expect(page.getByTestId('piece-row-1')).not.toBeVisible();

    // Click add piece button
    await page.getByTestId('add-piece').click();

    // Now should have two rows
    await expect(page.getByTestId('piece-row-0')).toBeVisible();
    await expect(page.getByTestId('piece-row-1')).toBeVisible();
  });

  test('can remove pieces', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Add a second piece
    await page.getByTestId('add-piece').click();
    await expect(page.getByTestId('piece-row-1')).toBeVisible();

    // Remove the second piece
    await page.getByTestId('remove-piece-1').click();
    await expect(page.getByTestId('piece-row-1')).not.toBeVisible();
  });

  test('cannot remove last piece', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Remove button for first piece should be disabled
    const removeButton = page.getByTestId('remove-piece-0');
    await expect(removeButton).toBeDisabled();
  });

  test('can enter piece dimensions', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Enter piece dimensions
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-length-0').fill('36');
    await page.getByTestId('piece-qty-0').fill('2');

    // Verify values
    await expect(page.getByTestId('piece-width-0')).toHaveValue('24');
    await expect(page.getByTestId('piece-length-0')).toHaveValue('36');
    await expect(page.getByTestId('piece-qty-0')).toHaveValue('2');
  });

  test('can select grain direction', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Default is 'no-preference'
    await expect(page.getByTestId('piece-grain-0')).toHaveValue('no-preference');

    // Select 'along-length'
    await page.getByTestId('piece-grain-0').selectOption('along-length');
    await expect(page.getByTestId('piece-grain-0')).toHaveValue('along-length');

    // Select 'along-width'
    await page.getByTestId('piece-grain-0').selectOption('along-width');
    await expect(page.getByTestId('piece-grain-0')).toHaveValue('along-width');
  });

  test('optimize button shows results', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Enter a piece
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-length-0').fill('36');
    await page.getByTestId('piece-qty-0').fill('1');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Results should be visible
    await expect(page.locator('text=Sheets Used')).toBeVisible();
    await expect(page.getByText('Efficiency', { exact: true })).toBeVisible();
    await expect(page.getByText('Waste', { exact: true })).toBeVisible();

    // Sheet visualization should appear
    await expect(page.getByText('Sheet 1', { exact: true })).toBeVisible();
  });

  test('asks for dimensions when every row is blank', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Leave dimensions empty and click optimize
    await page.getByTestId('optimize-button').click();

    await expect(page.locator('text=Enter dimensions for at least one piece')).toBeVisible();
  });

  test('ignores blank rows left over from adding pieces', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-length-0').fill('36');

    // Two spare rows the user tabbed past without filling in
    await page.getByTestId('add-piece').click();
    await page.getByTestId('add-piece').click();

    await page.getByTestId('optimize-button').click();

    await expect(page.locator('text=Sheets Used')).toBeVisible();
    await expect(page.locator('text=Invalid width')).not.toBeVisible();
  });

  test('still flags a half-filled row', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Width without a length is a mistake, not an untouched row
    await page.getByTestId('piece-width-0').fill('24');

    await page.getByTestId('optimize-button').click();

    await expect(page.locator('text=Invalid length')).toBeVisible();
  });

  test('shows validation error for invalid sheet config', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Clear sheet width
    await page.getByTestId('sheet-width').fill('');

    // Enter piece dimensions
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-length-0').fill('36');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Should show error about sheet config
    await expect(page.locator('text=Invalid sheet configuration')).toBeVisible();
  });

  test('shows validation error for piece too large', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Enter piece larger than sheet (sheet is 48x96)
    await page.getByTestId('piece-width-0').fill('100');
    await page.getByTestId('piece-length-0').fill('100');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Should show error about piece being too large
    await expect(page.locator('text=Too large')).toBeVisible();
  });

  test('clear button resets everything', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Modify sheet settings
    await page.getByTestId('sheet-width').fill('24');
    await page.getByTestId('sheets-available').fill('5');

    // Add a piece with values
    await page.getByTestId('piece-width-0').fill('12');
    await page.getByTestId('piece-length-0').fill('18');
    await page.getByTestId('piece-qty-0').fill('3');

    // Add another piece
    await page.getByTestId('add-piece').click();
    await page.getByTestId('piece-width-1').fill('6');
    await page.getByTestId('piece-length-1').fill('12');

    // Click optimize to show results
    await page.getByTestId('optimize-button').click();
    await expect(page.locator('text=Sheets Used')).toBeVisible();

    // Click clear
    await page.getByTestId('clear-button').click();

    // Sheet settings should reset to defaults
    await expect(page.getByTestId('sheet-width')).toHaveValue('48');
    await expect(page.getByTestId('sheet-length')).toHaveValue('96');
    await expect(page.getByTestId('sheets-available')).toHaveValue('1');

    // Piece list should be reset (one empty piece)
    await expect(page.getByTestId('piece-row-0')).toBeVisible();
    await expect(page.getByTestId('piece-row-1')).not.toBeVisible();
    await expect(page.getByTestId('piece-width-0')).toHaveValue('');
    await expect(page.getByTestId('piece-length-0')).toHaveValue('');
    await expect(page.getByTestId('piece-qty-0')).toHaveValue('1');

    // Results should be hidden
    await expect(page.locator('text=Sheets Used')).not.toBeVisible();
  });

  test('shows warning when pieces cannot be placed', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Set sheets available to 1
    await page.getByTestId('sheets-available').fill('1');

    // Add two large pieces that won't both fit
    await page.getByTestId('piece-width-0').fill('48');
    await page.getByTestId('piece-length-0').fill('96');
    await page.getByTestId('piece-qty-0').fill('2');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Should show warning about unplaced pieces with dimensions
    await expect(page.locator('text=Could not place: 96 x 48')).toBeVisible();
  });

  test('creates multiple sheets when needed', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Allow multiple sheets
    await page.getByTestId('sheets-available').fill('5');

    // Add pieces that require multiple sheets
    await page.getByTestId('piece-width-0').fill('48');
    await page.getByTestId('piece-length-0').fill('96');
    await page.getByTestId('piece-qty-0').fill('3');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Should show multiple sheets
    await expect(page.locator('text=Sheet 1')).toBeVisible();
    await expect(page.locator('text=Sheet 2')).toBeVisible();
    await expect(page.locator('text=Sheet 3')).toBeVisible();
  });

  test('displays piece labels in visualization', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Enter a piece
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-length-0').fill('36');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Piece label should appear in visualization
    // Length first, the order the inputs are in
    await expect(page.locator('svg text', { hasText: '36 x 24' })).toBeVisible();
  });

  test('handles decimal dimensions', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    // Enter decimal piece dimensions
    await page.getByTestId('piece-width-0').fill('23.5');
    await page.getByTestId('piece-length-0').fill('35.75');

    // Click optimize
    await page.getByTestId('optimize-button').click();

    // Should show results without errors
    await expect(page.locator('text=Sheets Used')).toBeVisible();
    await expect(page.locator('svg text', { hasText: '35.75 x 23.5' })).toBeVisible();
  });
});

test.describe('Cut List Optimizer - Navigation', () => {
  test('can navigate from tools page', async ({ page }) => {
    await page.goto('/tools', { waitUntil: 'networkidle' });

    // Click on Cut List Optimizer link
    await page.locator('a[href="/tools/cut-list-optimizer"]').click();

    // Should navigate to optimizer page
    await page.waitForURL('/tools/cut-list-optimizer');
    await expect(page).toHaveTitle(/Cut List Optimizer/);
  });
});

test.describe('Cut List Optimizer - Fractions, names and sheets', () => {
  test('reads fractional dimensions instead of truncating them', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-length-0').fill('35 3/4');
    await page.getByTestId('piece-width-0').fill('23-1/2');
    await page.getByTestId('optimize-button').click();

    await expect(page.locator('svg text', { hasText: '35.75 x 23.5' })).toBeVisible();
  });

  test('rejects a dimension it cannot read', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-length-0').fill('36in');
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('optimize-button').click();

    await expect(page.locator('text=Invalid length')).toBeVisible();
  });

  test('shows a piece name on the drawing and in the cut list', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-name-0').fill('Shelf');
    await page.getByTestId('piece-length-0').fill('36');
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('piece-qty-0').fill('2');
    await page.getByTestId('optimize-button').click();

    await expect(page.locator('svg text', { hasText: 'Shelf' }).first()).toBeVisible();
    const row = page.getByTestId('cut-list-table').locator('tbody tr').first();
    await expect(row).toContainText('Shelf');
    await expect(row).toContainText('36 x 24');
    await expect(page.getByTestId('print-button')).toBeVisible();
  });

  test('says how many sheets are needed and can switch to that many', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-length-0').fill('96');
    await page.getByTestId('piece-width-0').fill('48');
    await page.getByTestId('piece-qty-0').fill('3');
    await page.getByTestId('optimize-button').click();

    await expect(page.locator('text=The full list needs 3 sheets')).toBeVisible();

    await page.getByTestId('use-sheets-needed').click();
    await expect(page.getByTestId('sheets-available')).toHaveValue('3');
    await expect(page.getByText('Sheet 3', { exact: true })).toBeVisible();
    await expect(page.locator('text=Could not place')).toHaveCount(0);
  });
});

test.describe('Cut List Optimizer - Units and saved state', () => {
  test('switching to metric converts the values already entered', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('piece-length-0').fill('36');
    await page.getByTestId('piece-width-0').fill('24');
    await page.getByTestId('units-metric').click();

    await expect(page.getByTestId('sheet-length')).toHaveValue('2438.4');
    await expect(page.getByTestId('sheet-width')).toHaveValue('1219.2');
    await expect(page.getByTestId('sheet-kerf')).toHaveValue('3.175');
    await expect(page.getByTestId('piece-length-0')).toHaveValue('914.4');
    await expect(page.getByTestId('units-metric')).toHaveAttribute('aria-pressed', 'true');

    // And back again without drifting
    await page.getByTestId('units-imperial').click();
    await expect(page.getByTestId('sheet-length')).toHaveValue('96');
    await expect(page.getByTestId('sheet-kerf')).toHaveValue('0.125');
  });

  test('a metric sheet is drawn at a readable size', async ({ page }) => {
    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });

    await page.getByTestId('units-metric').click();
    await page.getByTestId('sheet-length').fill('2440');
    await page.getByTestId('sheet-width').fill('1220');
    await page.getByTestId('piece-length-0').fill('900');
    await page.getByTestId('piece-width-0').fill('600');
    await page.getByTestId('optimize-button').click();

    // The drawing is the same number of SVG units wide whatever the sheet is measured in
    const viewBox = await page.getByRole('img', { name: /Layout of sheet 1/ }).getAttribute('viewBox');
    const width = Number(viewBox!.split(' ')[2]);
    expect(width).toBeLessThan(1000);
    await expect(page.locator('svg text', { hasText: '900 x 600' })).toBeVisible();
  });

  test('restores a saved cut list without a hydration error', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) problems.push(message.text());
    });
    page.on('pageerror', (error) => problems.push(error.message));

    await page.goto('/tools/cut-list-optimizer', { waitUntil: 'networkidle' });
    await page.getByTestId('units-metric').click();
    await page.getByTestId('piece-name-0').fill('Door');
    await page.getByTestId('piece-length-0').fill('700');
    await page.getByTestId('add-piece').click();

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByTestId('piece-name-0')).toHaveValue('Door');
    await expect(page.getByTestId('piece-length-0')).toHaveValue('700');
    await expect(page.getByTestId('piece-row-1')).toBeVisible();
    await expect(page.getByTestId('units-metric')).toHaveAttribute('aria-pressed', 'true');
    expect(problems).toEqual([]);
  });
});
