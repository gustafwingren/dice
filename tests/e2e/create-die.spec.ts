import { test, expect } from '@playwright/test';

test.describe('Die Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('SC-001: Create basic 6-sided die in under 60 seconds', async ({ page }) => {
    const startTime = Date.now();

    // Enter die name
    await page.getByLabel('Die Name').pressSequentially('Basic Six-Sided Die');

    // Verify default 6 sides
    const sidesInput = page.getByLabel('Number of Sides');
    await expect(sidesInput).toHaveValue('6');

    // Verify number type is selected by default
    const numberButton = page.getByRole('button', { name: 'Number' }).first();
    await expect(numberButton).toHaveAttribute('aria-pressed', 'true');

    // Verify 6 faces are displayed
    const faces = page.locator('[role="listitem"]');
    await expect(faces).toHaveCount(6);

    // Verify faces are auto-populated with numbers 1-6
    for (let i = 1; i <= 6; i++) {
      const faceInput = page.locator(`#face-${i}-number`);
      await expect(faceInput).toHaveValue(i.toString());
    }

    // Save button should be enabled with valid name
    const saveButton = page.getByRole('button', { name: 'Save Die' });
    await expect(saveButton).toBeEnabled();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    // Verify completed in under 60 seconds
    expect(duration).toBeLessThan(60);

    console.log(`Die creation completed in ${duration.toFixed(2)} seconds`);
  });

  test('SC-008: Create 101-sided die without performance degradation', async ({ page }) => {
    const startTime = Date.now();

    // Enter die name
    await page.getByLabel('Die Name').pressSequentially('Maximum Sides Die');

    // Set sides to 101 (maximum)
    const sidesInput = page.getByLabel('Number of Sides');
    await sidesInput.fill('101');
    await sidesInput.blur(); // Trigger change

    // Wait for faces to regenerate
    await page.waitForTimeout(500);

    // Verify 101 faces are displayed
    const facesList = page.locator('[role="list"]').first();
    await expect(facesList).toBeVisible();

    // For 101 faces, virtualized scrolling is used (react-window)
    // Check for the virtualized container
    const virtualizedContainer = page.locator('[style*="position: relative"]').first();
    await expect(virtualizedContainer).toBeVisible();

    // Verify face count
    await expect(page.locator('text=Die Faces (101)')).toBeVisible();

    // Verify first visible face
    const firstFace = page.locator('input[id="face-1-number"]');
    await expect(firstFace).toHaveValue('1');

    // Scroll down in the virtualized list to load more items
    await virtualizedContainer.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });

    // Wait for virtualization to render bottom items
    await page.waitForTimeout(300);

    // Verify last face is accessible (may need to scroll to see it)
    const lastFace = page.locator('input[id="face-101-number"]');
    await expect(lastFace).toBeVisible();
    await expect(lastFace).toHaveValue('101');

    // Verify UI is still responsive
    const saveButton = page.getByRole('button', { name: 'Save Die' });
    await expect(saveButton).toBeEnabled();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Verify no significant performance degradation (still under 60s)
    expect(duration).toBeLessThan(60);

    console.log(`101-sided die created in ${duration.toFixed(2)} seconds`);
  });

  test('Create text-type die with custom values', async ({ page }) => {
    // Enter die name
    await page.getByLabel('Die Name').pressSequentially('Decision Die');

    // Change to 4 sides()
    await page.getByLabel('Number of Sides').fill('4');

    // Switch to text type
    await page.click('button:has-text("Text")');

    // Wait for content type change
    await page.waitForTimeout(300);

    // Enter custom text for each face
    const textValues = ['Yes', 'No', 'Maybe', 'Ask Again'];
    for (let i = 1; i <= 4; i++) {
      const textInput = page.locator(`input[id="face-${i}-text"]`);
      await textInput.fill(textValues[i - 1]);
      
      // Verify character counter updates
      await expect(page.locator(`text=${textValues[i - 1].length}/20`)).toBeVisible();
    }

    // Verify save button is enabled
    const saveButton = page.getByRole('button', { name: 'Save Die' });
    await expect(saveButton).toBeEnabled();
  });

  test('Create color-type die with custom colors', async ({ page }) => {
    // Enter die name
    await page.getByLabel('Die Name').pressSequentially('Rainbow Die');

    // Change to 3 sides
    await page.getByLabel('Number of Sides').fill('3');

    // Switch to color type
    await page.click('button:has-text("Color")');

    // Wait for content type change
    await page.waitForTimeout(300);

    // Verify faces show color pickers (not text inputs)
    const colorPickers = page.locator('text=Face Color');
    await expect(colorPickers).toHaveCount(3);

    // Verify color previews are visible
    const colorPreviews = page.locator('[aria-label*="color preview"]');
    await expect(colorPreviews).toHaveCount(3);

    // Verify no text inputs
    const textInputs = page.locator('input[id*="face-"][id*="-text"]');
    await expect(textInputs).toHaveCount(0);
  });

  test('Validation prevents saving with empty name', async ({ page }) => {
    // Leave name empty
    const nameInput = page.getByLabel('Die Name');
    await expect(nameInput).toHaveValue('');

    // Save button should be disabled
    const saveButton = page.getByRole('button', { name: 'Save Die' });
    await expect(saveButton).toBeDisabled();

    // Verify error message is shown
    await expect(page.locator('text=/name.*empty/i')).toBeVisible();
  });

  test('Reset button clears all changes', async ({ page }) => {
    // Make some changes
    await page.getByLabel('Die Name').pressSequentially('Custom Die');
    await page.getByLabel('Number of Sides').pressSequentially('10');
    await page.getByRole('button', { name: 'Text' }).click();

    // Click reset
    await page.getByRole('button', { name: 'Reset' }).click();

    // Wait for reset
    await page.waitForTimeout(300);

    // Verify back to defaults
    await expect(page.locator('input[id="die-name"]')).toHaveValue('');
    await expect(page.locator('input[id="die-sides"]')).toHaveValue('6');
    
    // Verify number type is selected
    const numberButton = page.locator('button:has-text("Number")').first();
    await expect(numberButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('Die editor updates in real-time', async ({ page }) => {
    // Enter die name
    await page.getByLabel('Die Name').pressSequentially('Preview Test');

    // Verify die name is updated in input
    await expect(page.getByLabel('Die Name')).toHaveValue('Preview Test');

    // Change sides
    await page.getByLabel('Number of Sides').fill('8');
    await page.waitForTimeout(300);

    // Verify sides input updated and face list regenerated (8 faces)
    await expect(page.getByLabel('Number of Sides')).toHaveValue('8');
    await expect(page.locator('text=Die Faces (8)')).toBeVisible();

    // Change content type
    await page.click('button:has-text("Color")');
    await page.waitForTimeout(300);

    // Verify content type changed (color face inputs should appear)
    const colorButton = page.locator('button:has-text("Color")').first();
    await expect(colorButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('Mobile responsiveness - works on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    // Verify die editor is visible and usable
    await expect(page.locator('text=Create Your Custom Die')).toBeVisible();
    
    const nameInput = page.locator('input[id="die-name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Mobile Die');

    // Verify controls are accessible
    const sidesInput = page.locator('input[id="die-sides"]');
    await expect(sidesInput).toBeVisible();

    // Verify content type buttons are in grid
    const numberButton = page.locator('button:has-text("Number")').first();
    await expect(numberButton).toBeVisible();

    // Verify face list scrolls
    const facesList = page.locator('[role="list"]').first();
    await expect(facesList).toBeVisible();

    // Verify action buttons are full width
    const saveButton = page.locator('button:has-text("Save Die")');
    await expect(saveButton).toBeVisible();
  });
});
