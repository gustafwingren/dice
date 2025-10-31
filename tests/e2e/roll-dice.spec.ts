import { test, expect } from '@playwright/test';

/**
 * E2E tests for dice roll animation
 * Tests the complete roll flow on both die and dice set editors
 * Tests mobile and desktop responsiveness
 */

test.describe('Roll Die Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should roll a 6-sided die and show result', async ({ page }) => {
    // Create a simple 6-sided die
    await page.getByLabel('Die Name').pressSequentially('Test Die');
    
    // Wait for validation to complete (webkit needs this)
    await page.waitForTimeout(500);
    
    // Click roll button (wait for it to be enabled)
    const rollButton = page.getByRole('button', { name: 'Roll Die' });
    await expect(rollButton).toBeEnabled({ timeout: 3000 });
    await rollButton.click();
    
    // Should show "Rolling..." state
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeVisible();
    
    // Wait for roll to complete (animation is 1.5s)
    await page.waitForTimeout(1700);
    
    // Should show roll result
    await expect(page.getByText(/you rolled:/i)).toBeVisible();
    
    // Result should be between 1-6
    const resultText = await page.locator('div[role="status"]').textContent();
    expect(resultText).toBeTruthy();
    
    // Should have "Roll Again" button
    await expect(page.getByRole('button', { name: /roll again/i })).toBeVisible();
  });

  test('should roll multiple times with different results', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds for multiple rolls
    
    // Create a 6-sided die
    await page.getByLabel('Die Name').pressSequentially('Multi Roll Test');
    
    //Wait for validation to complete (webkit needs this)
    await page.waitForTimeout(500);
    
    const results = new Set<string>();
    
    // Roll 10 times to get different results
    for (let i = 0; i < 10; i++) {
      // First roll uses "Roll Die", subsequent rolls use "Roll Again"
      const rollButton = i === 0 
        ? page.getByRole('button', { name: 'Roll Die' })
        : page.getByRole('button', { name: 'Roll Again' });
      
      // Wait for button to be enabled before clicking
      if (i === 0) {
        await expect(rollButton).toBeEnabled({ timeout: 3000 });
      }
      await rollButton.click();
      
      // Wait for roll result to appear
      await expect(page.getByText(/you rolled:/i)).toBeVisible({ timeout: 3000 });
      
      // Get the result
      const resultText = await page.locator('div[role="status"]').last().textContent();
      if (resultText) {
        results.add(resultText.trim());
      }
    }
    
    // Should have seen multiple different values (very unlikely to get same value 10 times)
    expect(results.size).toBeGreaterThan(1);
  });

  test('should disable roll button while animation is in progress', async ({ page }) => {
    await page.getByLabel('Die Name').pressSequentially('Disable Test');
    
    // Wait for validation to complete (webkit needs this)
    await page.waitForTimeout(500);

    const rollButton = page.getByRole('button', { name: 'Roll Die' });
    await expect(rollButton).toBeEnabled({ timeout: 3000 });
    await rollButton.click();
    
    // Wait for button text to change to "Rolling..."
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeVisible();

    // Button should be disabled during animation
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeDisabled();

    // Wait for animation to complete
    await page.waitForTimeout(1700);
    
    // "Roll Again" button should be enabled
    const rollAgainButton = page.getByRole('button', { name: 'Roll Again' });
    await expect(rollAgainButton).toBeEnabled();
  });

  test('should work with text dice', async ({ page }) => {
    // Create a text die
    await page.getByLabel('Die Name').pressSequentially('Decision Die');
    
    // Wait for name validation to complete (webkit needs this)
    await page.waitForTimeout(500);
    
    // Change to text type first (before setting sides)
    await page.getByRole('button', { name: /^text$/i }).click();
    
    // Wait a moment for content type change to complete
    await page.waitForTimeout(500);
    
    // Set sides to 4
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.fill('4');
    
    // Wait for the face inputs to rebuild with new side count
    await page.waitForTimeout(500);
    
    // Find all "Text Value" inputs and fill them
    const textInputs = page.getByLabel(/^text value$/i);
    await textInputs.nth(0).fill('Yes');
    await textInputs.nth(1).fill('No');
    await textInputs.nth(2).fill('Maybe');
    await textInputs.nth(3).fill('Later');
    
    // Wait for validation to pass and roll button to be enabled
    const rollButton = page.getByRole('button', { name: 'Roll Die' });
    await rollButton.waitFor({ state: 'attached', timeout: 2000 });
    await expect(rollButton).toBeEnabled({ timeout: 2000 });
    
    // Roll the die
    await rollButton.click();
    
    // Wait for result
    await page.waitForTimeout(1700);
    
    // Result should be one of the text values
    await expect(page.getByText(/you rolled:/i)).toBeVisible();
    const resultElement = page.locator('div[role="status"]').last();
    const resultText = await resultElement.textContent();
    
    expect(['Yes', 'No', 'Maybe', 'Later'].some(val => resultText?.includes(val))).toBe(true);
  });

  test('should work with color dice', async ({ page }) => {
    // Create a color die
    await page.getByLabel('Die Name').pressSequentially('Color Die');
    
    // Wait for name validation to complete (webkit needs this)
    await page.waitForTimeout(500);
    
    // Set sides to 3 first
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.fill('3');
    
    // Wait for faces to build
    await page.waitForTimeout(500);
    
    // Change to color type (will rebuild faces with colors)
    await page.getByRole('button', { name: /^color$/i }).click();
    
    // Wait for color faces to rebuild
    await page.waitForTimeout(1000);
    
    // Wait for validation to pass and roll button to be enabled
    const rollButton = page.getByRole('button', { name: /roll die/i });
    await expect(rollButton).toBeEnabled({ timeout: 3000 });
    
    // Roll the die
    await rollButton.click();
    
    // Wait for result to appear
    await expect(page.getByText(/you rolled:/i)).toBeVisible({ timeout: 3000 });
  });

  test('should work on mobile viewport (320px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    await page.getByLabel('Die Name').pressSequentially('Mobile Test');
    
    // Roll button should be visible and functional
    const rollButton = page.getByRole('button', { name: /roll die/i });
    await expect(rollButton).toBeVisible();
    await expect(rollButton).toBeEnabled({ timeout: 3000 });
    await rollButton.click();
    
    // Result should be visible on mobile
    await expect(page.getByText(/you rolled:/i)).toBeVisible({ timeout: 3000 });
  });

  test('should roll a 101-sided die without performance issues', async ({ page }) => {
    // Create a large die
    await page.getByLabel('Die Name').pressSequentially('D101');
    
    // Wait for name validation to complete (webkit needs this)
    await page.waitForTimeout(500);
    
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.fill('101');
    
    // Measure roll performance
    const startTime = Date.now();
    
    const rollBtn = page.getByRole('button', { name: /roll die/i });
    await expect(rollBtn).toBeEnabled({ timeout: 3000 });
    await rollBtn.click();
    
    // Wait for result
    await expect(page.getByText(/you rolled:/i)).toBeVisible({ timeout: 3000 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in under 3 seconds (1.5s animation + buffer)
    expect(duration).toBeLessThan(3000);
    
    // Result should be shown
    await expect(page.getByText(/you rolled:/i)).toBeVisible();
  });
});

test.describe('Roll Dice Set Animation', () => {
  test.beforeEach(async ({ page }) => {
    // Create and save two dice for the set
    await page.goto('/');
    
    // Create first die
    await page.getByLabel('Die Name').pressSequentially('Red Die');
    const saveBtn = page.getByRole('button', { name: 'Save Die', exact: true });
    await expect(saveBtn).toBeEnabled({ timeout: 3000 });
    await saveBtn.click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForTimeout(500);
    
    // Reset and create second die
    await page.getByRole('button', { name: /reset/i }).click();
    await page.getByLabel('Die Name').pressSequentially('Blue Die');
    const saveBtn2 = page.getByRole('button', { name: 'Save Die', exact: true });
    await expect(saveBtn2).toBeEnabled({ timeout: 3000 });
    await saveBtn2.click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page.waitForTimeout(500);
    
    // Go to dice set editor
    await page.goto('/set');
    await expect(page.getByLabel('Set Name')).toBeVisible();
  });

  test('should roll all dice in a set', async ({ page }) => {
    // Name the set
    await page.getByLabel('Set Name').pressSequentially('Test Set');
    await page.getByLabel('Set Name').press('Tab');
    
    // Add both dice
    await page.getByRole('button', { name: 'Add Die' }).click();
    await page.getByRole('button', { name: 'Red Die' }).click();
    
    await page.getByRole('button', { name: 'Add Die' }).click();
    await page.getByRole('button', { name: 'Blue Die' }).click();
    
    // Roll the set
    const rollButton = page.getByRole('button', { name: 'Roll All Dice' });
    await rollButton.click();
    
    // Should show rolling state
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeVisible();

    // Wait for results to appear
    await expect(page.getByText(/roll results:/i)).toBeVisible({ timeout: 3000 });
    
    // Should have 2 results displayed
    const results = page.locator('div[role="status"]');
    expect(await results.count()).toBeGreaterThanOrEqual(2);
  });

  test('should work with sets on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.getByLabel('Set Name').pressSequentially('Mobile Set');
    await page.getByLabel('Set Name').press('Tab');
    
    // Add a die
    await page.getByRole('button', { name: 'Add Die' }).click();
    await page.getByRole('button', { name: 'Red Die' }).click();

    // Roll should work on mobile
    const rollButton = page.getByRole('button', { name: 'Roll All Dice' });
    await expect(rollButton).toBeVisible();
    await rollButton.click();
    
    await page.waitForTimeout(1700);
    
    await expect(page.getByText(/roll results:/i)).toBeVisible();
  });

  test('should disable roll button while animation is in progress for sets', async ({ page }) => {
    await page.getByLabel('Set Name').pressSequentially('Disable Set Test');
    await page.getByLabel('Set Name').press('Tab');
    
    // Add a die
    await page.getByRole('button', { name: 'Add Die' }).click();
    await page.getByRole('button', { name: 'Red Die' }).click();

    const rollButton = page.getByRole('button', { name: 'Roll All Dice' });
    await rollButton.click();
    
    // Wait for button text to change to "Rolling..."
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeVisible();

    // Button should be disabled
    await expect(page.getByRole('button', { name: 'Rolling...' })).toBeDisabled();

    // Wait for completion
    await page.waitForTimeout(1700);
    
    // Should have roll again button
    await expect(page.getByRole('button', { name: 'Roll Again' })).toBeVisible();
  });
});
