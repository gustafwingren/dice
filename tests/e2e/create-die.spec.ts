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

    // Verify face list header shows total count and initial visible count
    await expect(page.locator('text=Die Faces (101)')).toBeVisible();
    await expect(page.locator('text=Showing 50 of 101')).toBeVisible();

    // Verify only first 50 faces are initially rendered
    const firstFace = page.locator('input[id="face-1-number"]');
    await expect(firstFace).toBeVisible();
    await expect(firstFace).toHaveValue('1');

    const face50 = page.locator('input[id="face-50-number"]');
    await expect(face50).toBeVisible();
    await expect(face50).toHaveValue('50');

    // Face 51 should not be rendered yet
    const face51 = page.locator('input[id="face-51-number"]');
    await expect(face51).not.toBeVisible();

    // Verify "Show More Faces" button is present with correct remaining count
    const showMoreButton = page.getByRole('button', { name: /Show.*remaining/i });
    await expect(showMoreButton).toBeVisible();

    // Click "Show More Faces" to load next batch
    await showMoreButton.click();
    await page.waitForTimeout(300);

    // Verify now showing 100 of 101
    await expect(page.locator('text=Showing 100 of 101')).toBeVisible();

    // Verify face 100 is now visible
    const face100 = page.locator('input[id="face-100-number"]');
    await expect(face100).toBeVisible();
    await expect(face100).toHaveValue('100');

    // Face 101 should not be visible yet
    const face101 = page.locator('input[id="face-101-number"]');
    await expect(face101).not.toBeVisible();

    // Verify button now shows "1 remaining"
    const showMoreButton2 = page.getByRole('button', { name: 'Show 50 more faces (1 remaining)' });
    await expect(showMoreButton2).toBeVisible();

    // Click to load final face
    await showMoreButton2.click();
    await page.waitForTimeout(300);

    // Verify all 101 faces are now loaded
    await expect(page.locator('text=Die Faces (101)')).toBeVisible();
    await expect(face101).toBeVisible();
    await expect(face101).toHaveValue('101');

    // Verify "Show More Faces" button is no longer present
    await expect(page.getByRole('button', { name: /Show More Faces/i })).not.toBeVisible();

    // Verify UI is still responsive
    const saveButton = page.getByRole('button', { name: 'Save Die' });
    await expect(saveButton).toBeEnabled();

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Verify no significant performance degradation (still under 60s)
    expect(duration).toBeLessThan(60);

    console.log(`101-sided die created with progressive loading in ${duration.toFixed(2)} seconds`);
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

  // User Story 2 - Mobile Layout Order Tests

  test('T030: Element order on mobile viewport (<768px)', async ({ page }) => {
    // Set mobile viewport (below 768px breakpoint)
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    
    // Get all main sections by their distinctive content
    const configPanel = page.locator('text=Die Configuration').locator('..');
    const faceEditor = page.locator('text=Die Faces').locator('..');
    const actionButtons = page.locator('button:has-text("Save Die")').locator('..');
    
    // Verify all sections are visible
    await expect(configPanel).toBeVisible();
    await expect(faceEditor).toBeVisible();
    await expect(actionButtons).toBeVisible();
    
    // Get bounding boxes to verify vertical order
    const configBox = await configPanel.boundingBox();
    const faceBox = await faceEditor.boundingBox();
    const buttonBox = await actionButtons.boundingBox();
    
    // Verify top-to-bottom order: Config -> Face Editor -> Action Buttons
    expect(configBox, 'Config panel bounding box should not be null').not.toBeNull();
    expect(faceBox, 'Face editor bounding box should not be null').not.toBeNull();
    expect(buttonBox, 'Action buttons bounding box should not be null').not.toBeNull();

    // Configuration panel should be above face editor
    expect((configBox as NonNullable<typeof configBox>).y).toBeLessThan((faceBox as NonNullable<typeof faceBox>).y);

    // Face editor should be above action buttons
    expect((faceBox as NonNullable<typeof faceBox>).y).toBeLessThan((buttonBox as NonNullable<typeof buttonBox>).y);
  });

  test('T031: Grid layout on desktop viewport (≥768px)', async ({ page }) => {
    // Set desktop viewport (at or above 768px breakpoint)
    await page.setViewportSize({ width: 1024, height: 768 }); // Desktop
    
    const configPanel = page.locator('text=Die Configuration').locator('..');
    const faceEditor = page.locator('text=Die Faces').locator('..');
    const actionButtons = page.locator('button:has-text("Save Die")').locator('..');
    
    // Verify all sections are visible
    await expect(configPanel).toBeVisible();
    await expect(faceEditor).toBeVisible();
    await expect(actionButtons).toBeVisible();
    
    // Get bounding boxes to verify side-by-side layout
    const configBox = await configPanel.boundingBox();
    const faceBox = await faceEditor.boundingBox();
    const buttonBox = await actionButtons.boundingBox();
    
    expect(configBox).not.toBeNull();
    expect(faceBox).not.toBeNull();
    expect(buttonBox).not.toBeNull();
    
    if (configBox && faceBox && buttonBox) {
      // On desktop, config panel and action buttons should be in left column
      // Face editor should be in right column (different x position)
      // Action buttons should be below config panel in same column
      expect(buttonBox.y).toBeGreaterThan(configBox.y);
      
      // Face editor x position should be different from config (side by side)
      expect(Math.abs(faceBox.x - configBox.x)).toBeGreaterThan(100);
    }
  });

  test('T032: Touch targets meet 44x44px minimum', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Helper to check minimum touch target size
    async function expectMinTouchTarget(locator: ReturnType<typeof page.locator>, name: string) {
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      } else {
        throw new Error(`${name} button bounding box not found`);
      }
    }

    // Check interactive elements meet minimum touch target size
    await expectMinTouchTarget(page.locator('button:has-text("Save Die")'), 'Save Die');
    await expectMinTouchTarget(page.locator('button:has-text("Roll Die")'), 'Roll Die');
    await expectMinTouchTarget(page.locator('button:has-text("Share")'), 'Share');
    await expectMinTouchTarget(page.locator('button:has-text("Reset")'), 'Reset');

    // Check content type buttons
    await expectMinTouchTarget(page.locator('button:has-text("Number")').first(), 'Number');
    await expectMinTouchTarget(page.locator('button:has-text("Text")').first(), 'Text');
    await expectMinTouchTarget(page.locator('button:has-text("Color")').first(), 'Color');
  });

});
