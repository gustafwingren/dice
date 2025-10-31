import { test, expect } from '@playwright/test';

/**
 * E2E tests for sharing dice via URL
 * Tests the complete flow: create die → generate share link → open link → save copy
 * 
 * Success Criteria (SC-003, SC-007):
 * - 100% success rate for viewing shared dice
 * - Share links load correct configuration with 99.9% reliability
 * - URL encoding handles all content types (number/text/color)
 */

test.describe('Share Die Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at home page (die editor)
    await page.goto('/');
    await expect(page).toHaveURL('/');
  });

  test('should generate share link for a simple number die and open it', async ({ page, context }) => {
    // Create a simple 6-sided number die
    await page.getByLabel('Die Name').pressSequentially('Test Die');
    
    // Verify default is 6 sides
    const sidesInput = page.getByLabel(/number of sides/i);
    await expect(sidesInput).toHaveValue('6');
    
    // Click share button
    const shareButton = page.getByRole('button', { name: /share/i });
    await shareButton.click();
    
    // Wait for share modal to appear
    await expect(page.getByText(/share your die/i)).toBeVisible();
    
    // Get the share URL from the modal
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    await expect(shareUrlInput).toBeVisible();
    const shareUrl = await shareUrlInput.inputValue();
    
    // Verify URL format: should be /share#encodedData
    expect(shareUrl).toContain('/share#');
    expect(shareUrl.length).toBeGreaterThan(20); // Has encoded data
    expect(shareUrl.length).toBeLessThan(6000); // Within URL length limit
    
    // Close the share modal
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open share URL in a new page (simulates recipient)
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify die is loaded correctly
    await expect(newPage.getByText(/test die/i)).toBeVisible();
    await expect(newPage.getByText(/6 sides/i)).toBeVisible();
    await expect(newPage.getByText(/number/i)).toBeVisible();
    
    // Verify save button is present
    await expect(newPage.getByRole('button', { name: /save a copy/i })).toBeVisible();
    
    await newPage.close();
  });

  test('should share and save a text die', async ({ page, context }) => {
    // Create a 4-sided text die
    await page.getByLabel('Die Name').pressSequentially('Decision Die');
    
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.fill('4');
    
    // Change content type to Text
    await page.getByRole('button', { name: /text/i }).click();
    
    // Wait for face editors to update
    await page.waitForTimeout(500);
    
    // Fill in text values for faces
    const faceInputs = page.locator('input[placeholder="Enter text"]');
    await faceInputs.nth(0).pressSequentially('Yes');
    await faceInputs.nth(1).pressSequentially('No');
    await faceInputs.nth(2).pressSequentially('Maybe');
    await faceInputs.nth(3).pressSequentially('Later');
    
    // Generate share link
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open in new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify text content is preserved
    await expect(newPage.getByText(/decision die/i)).toBeVisible();
    await expect(newPage.getByText(/4 sides/i)).toBeVisible();
    await expect(newPage.getByText(/text/i)).toBeVisible();
    
    // Click save button
    await newPage.getByRole('button', { name: /save a copy/i }).click();

    // Wait for success message
    await expect(newPage.getByText(/saved! redirecting/i)).toBeVisible();
    
    // Should redirect to library
    await newPage.waitForURL('/library', { timeout: 3000 });
    
    // Verify die appears in library
    await expect(newPage.getByText('Decision Die" saved to your library')).toBeVisible();
    
    await newPage.close();
  });

  test('should share a color die', async ({ page, context }) => {
    // Create a 3-sided color die
    await page.getByLabel('Die Name').pressSequentially('Traffic Light');
    
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.fill('3');
    
    // Change content type to Color
    await page.getByRole('button', { name: /color/i }).click();
    
    // Wait for face editors to update
    await page.waitForTimeout(500);
    
    // Generate share link
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open in new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify color die loaded
    await expect(newPage.getByText(/traffic light/i)).toBeVisible();
    await expect(newPage.getByText(/3 sides/i)).toBeVisible();
    await expect(newPage.getByText(/color/i)).toBeVisible();
    
    await newPage.close();
  });

  test('should handle large dice (101 sides)', async ({ page, context }) => {
    // Create a 101-sided die
    await page.getByLabel('Die Name').pressSequentially('D101');
    
    const sidesInput = page.getByLabel(/number of sides/i);
    await sidesInput.pressSequentially('101');
    
    // Generate share link
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    
    // Check URL length warning if it exceeds 6000 chars
    if (shareUrl.length > 6000) {
      await expect(page.getByText(/url is very long/i)).toBeVisible();
    }
    
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open in new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify large die loaded correctly
    await expect(newPage.getByText(/d101/i)).toBeVisible();
    await expect(newPage.getByText(/101 sides/i)).toBeVisible();
    
    await newPage.close();
  });

  test('should show error for invalid/corrupt share URL', async ({ page }) => {
    // Navigate to share page with invalid encoded data
    await page.goto('/share#INVALID_DATA_12345');
    
    // Should show error message
    await expect(page.getByText(/unable to load/i)).toBeVisible();
    await expect(page.getByText(/failed to decode/i)).toBeVisible();
    
    // Should have button to create own die
    await expect(page.getByRole('button', { name: /create your own die/i })).toBeVisible();
  });

  test('should handle empty share URL (no hash)', async ({ page }) => {
    // Navigate to share page without encoded data
    await page.goto('/share');
    
    // Should show error message
    await expect(page.getByText(/unable to load/i)).toBeVisible();
    await expect(page.getByText(/no share data provided/i)).toBeVisible();
  });

  test('should share dice set with multiple dice', async ({ page, context }) => {
    // First create and save two dice
    await page.goto('/');
    
    // Create first die
    await page.getByLabel('Die Name').pressSequentially('Red Die');
    await page.getByRole('button', { name: 'Save Die', exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Wait for save to complete
    await page.waitForTimeout(500);
    
    // Reset for second die
    await page.getByRole('button', { name: 'Reset' }).click();
    
    // Create second die
    await page.getByLabel('Die Name').pressSequentially('Blue Die');
    await page.getByRole('button', { name: 'Save Die', exact: true }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    
    await page.waitForTimeout(500);
    
    // Go to dice set editor
    await page.goto('/set');
    
    // Wait for page to load
    await expect(page.getByLabel('Set Name')).toBeVisible();
    
    // Name the set
    await page.getByLabel('Set Name').pressSequentially('');
    await page.getByLabel('Set Name').pressSequentially('RPG Set');
    await page.getByLabel('Set Name').press('Tab');

    // Add dice to set
    // Click Add Die button to open modal
    await page.getByRole('button', { name: /add die/i }).click();
    
    // Select Red Die from modal
    await page.getByRole('button', { name: /red die/i }).click();
    
    // Add second die
    await page.getByRole('button', { name: /add die/i }).click();
    await page.getByRole('button', { name: /blue die/i }).click();
    
    // Generate share link for set
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open in new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify dice set loaded
    await expect(newPage.getByText(/rpg set/i)).toBeVisible();
    await expect(newPage.getByText(/dice in this set.*2/i)).toBeVisible();
    
    // Verify both dice are displayed (use heading to avoid strict mode violation)
    await expect(newPage.getByText(/red die/i)).toBeVisible();
    await expect(newPage.getByText(/blue die/i)).toBeVisible();
    
    await newPage.close();
  });

  test('should copy share URL to clipboard', async ({ page, context, browserName }) => {
    // Skip test for browsers that don't support clipboard permissions
    test.skip(browserName !== 'chromium', 'Clipboard API permissions only supported in Chromium');
    
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Create a die
    await page.getByLabel('Die Name').pressSequentially('Clipboard Test');
    
    // Generate share link
    await page.getByRole('button', { name: /share/i }).click();
    
    // Click copy button
    const copyButton = page.getByRole('button', { name: /copy/i });
    await copyButton.click();
    
    // Verify clipboard contains the URL
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('/share#');
    expect(clipboardText).toContain('http');
  });
});

test.describe('Share URL Reliability (SC-007: 99.9% reliability)', () => {
  test('should handle share URLs consistently across multiple loads', async ({ page }) => {
    // Create and share a die
    await page.goto('/');
    await page.getByLabel('Die Name').pressSequentially('Reliability Test');
    
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    await page.getByRole('button', { name: /close/i }).click();
    
    // Load the same share URL multiple times to test reliability
    for (let i = 0; i < 5; i++) {
      await page.goto(shareUrl);
      
      // Verify die loads correctly every time
      await expect(page.getByText(/reliability test/i)).toBeVisible();
      await expect(page.getByText(/6 sides/i)).toBeVisible();
      
      // Small delay between loads
      await page.waitForTimeout(200);
    }
  });

  test('should handle special characters in die names', async ({ page, context }) => {
    // Create die with special characters
    await page.goto('/');
    await page.getByLabel('Die Name').pressSequentially('Test "Die" with \'quotes\' & symbols!@#');
    
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open share URL
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Verify special characters are preserved (use heading to avoid strict mode violation)
    await expect(newPage.getByRole('heading', { name: /test "die" with 'quotes' & symbols/i })).toBeVisible();
    
    await newPage.close();
  });
});

test.describe('Mobile Responsiveness (SC-005)', () => {
  test('should work on mobile viewport (320px)', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 320, height: 568 });
    
    // Create and share a die
    await page.goto('/');
    await page.getByLabel('Die Name').pressSequentially('Mobile Test');
    
    await page.getByRole('button', { name: /share/i }).click();
    const shareUrlInput = page.locator('input[readonly][value*="/share"]');
    const shareUrl = await shareUrlInput.inputValue();
    await page.getByRole('button', { name: /close/i }).click();
    
    // Open in new page with mobile viewport
    const newPage = await context.newPage();
    await newPage.setViewportSize({ width: 320, height: 568 });
    await newPage.goto(shareUrl);
    
    // Verify content is visible and accessible on mobile
    await expect(newPage.getByText(/mobile test/i)).toBeVisible();
    await expect(newPage.getByRole('button', { name: /save a copy/i })).toBeVisible();
    
    await newPage.close();
  });
});
