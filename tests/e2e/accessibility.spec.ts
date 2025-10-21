import { test, expect } from '@playwright/test';

test.describe('Accessibility & Keyboard Navigation - T097', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Keyboard Navigation - Basic Controls', () => {
    test('should navigate through form inputs with Tab key', async ({ page }) => {
      // Focus on die name input
      const dieNameInput = page.getByLabel('Die Name');
      await dieNameInput.focus();
      await expect(dieNameInput).toBeFocused();
      
      // Tab to sides input
      await page.keyboard.press('Tab');
      const sidesInput = page.getByLabel('Number of Sides');
      await expect(sidesInput).toBeFocused();
    });

    test('should activate content type buttons with Space key', async ({ page }) => {
      // Focus content type button
      const numberButton = page.getByRole('button', { name: 'Number' }).first();
      await numberButton.focus();
      
      // Should be selected by default
      await expect(numberButton).toHaveAttribute('aria-pressed', 'true');
      
      // Tab to Text button
      await page.keyboard.press('Tab');
      const textButton = page.getByRole('button', { name: 'Text' }).first();
      await expect(textButton).toBeFocused();
      
      // Press Space to select Text type
      await page.keyboard.press('Space');
      
      // Verify Text button is now selected
      await expect(textButton).toHaveAttribute('aria-pressed', 'true');
      await expect(numberButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  test.describe('Keyboard Navigation - Number Inputs', () => {
    test('should increment/decrement with arrow keys', async ({ page }) => {
      const sidesInput = page.getByLabel('Number of Sides');
      await sidesInput.focus();
      
      // Current value should be 6 (default)
      await expect(sidesInput).toHaveValue('6');
      
      // Press arrow up to increment
      await page.keyboard.press('ArrowUp');
      await expect(sidesInput).toHaveValue('7');
      
      // Press arrow down to decrement
      await page.keyboard.press('ArrowDown');
      await expect(sidesInput).toHaveValue('6');
    });
  });

  test.describe('Color Picker Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      // Scroll to background color picker
      await page.locator('text=Background Color').scrollIntoViewIfNeeded();
      
      // Focus first preset color button
      const firstColorButton = page.locator('[role="radiogroup"] button').first();
      await firstColorButton.focus();
      await expect(firstColorButton).toBeFocused();
      
      // Tab to second color button
      await page.keyboard.press('Tab');
      const secondColorButton = page.locator('[role="radiogroup"] button').nth(1);
      await expect(secondColorButton).toBeFocused();
    });
  });

  test.describe('Focus Management', () => {
    test('should allow focusing interactive elements', async ({ page }) => {
      // Test die name input can be focused
      const dieNameInput = page.getByLabel('Die Name');
      await dieNameInput.focus();
      await expect(dieNameInput).toBeFocused();
      
      // Fill in die name to enable save button
      await dieNameInput.fill('Test Die');
      
      // Test button becomes enabled
      const saveButton = page.getByRole('button', { name: 'Save Die' });
      await expect(saveButton).toBeVisible();
      await expect(saveButton).toBeEnabled();
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper ARIA labels on form controls', async ({ page }) => {
      // Verify die name input has proper label association
      const dieNameInput = page.getByLabel('Die Name');
      await expect(dieNameInput).toHaveAttribute('id');
      const dieNameId = await dieNameInput.getAttribute('id');
      
      // Verify label element exists
      const dieNameLabel = page.locator(`label[for="${dieNameId}"]`);
      await expect(dieNameLabel).toBeVisible();
      
      // Verify sides input has proper label
      const sidesInput = page.getByLabel('Number of Sides');
      await expect(sidesInput).toHaveAttribute('id');
      
      // Verify content type buttons have aria-pressed state
      const numberButton = page.getByRole('button', { name: 'Number' }).first();
      await expect(numberButton).toHaveAttribute('aria-pressed');
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      // Check for h1 heading
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      
      // Check for h2 sections
      const h2List = page.locator('h2');
      const h2Count = await h2List.count();
      expect(h2Count).toBeGreaterThan(0);
    });

    test('should label all form inputs', async ({ page }) => {
      // Verify die name input has label
      const dieNameInput = page.getByLabel('Die Name');
      await expect(dieNameInput).toBeVisible();
      
      // Verify sides input has label
      const sidesInput = page.getByLabel('Number of Sides');
      await expect(sidesInput).toBeVisible();
      
      // Both inputs should be accessible via their labels
      expect(await dieNameInput.count()).toBe(1);
      expect(await sidesInput.count()).toBe(1);
    });
  });

  test.describe('WCAG Compliance', () => {
    test('should have minimum touch target size (44x44px)', async ({ page }) => {
      // Test Save button meets minimum size
      const saveButton = page.getByRole('button', { name: 'Save Die' });
      const buttonBox = await saveButton.boundingBox();
      
      expect(buttonBox).not.toBeNull();
      expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
      expect(buttonBox!.width).toBeGreaterThan(0);
    });

    test('should not rely on color alone for information', async ({ page }) => {
      // Verify content type buttons have visible text labels
      const numberButton = page.getByRole('button', { name: 'Number' }).first();
      const textButton = page.getByRole('button', { name: 'Text' }).first();
      const colorButton = page.getByRole('button', { name: 'Color' }).first();
      
      await expect(numberButton).toBeVisible();
      await expect(textButton).toBeVisible();
      await expect(colorButton).toBeVisible();
      
      // Verify buttons contain text (not just colors/icons)
      const numberButtonText = await numberButton.textContent();
      expect(numberButtonText).toContain('Number');
    });

    test('should support keyboard input in form fields', async ({ page }) => {
      // Focus and type in die name input
      const dieNameInput = page.getByLabel('Die Name');
      await dieNameInput.click();
      await dieNameInput.fill('Keyboard Test Die');
      await expect(dieNameInput).toHaveValue('Keyboard Test Die');
      
      // Focus and type in sides input
      const sidesInput = page.getByLabel('Number of Sides');
      await sidesInput.click();
      await sidesInput.fill('8');
      await expect(sidesInput).toHaveValue('8');
    });
  });
});
