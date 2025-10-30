# E2E Tests for Digital Dice Creator

End-to-end tests using Playwright to verify the complete sharing flow and user experience.

## Running E2E Tests

### Prerequisites
- Node.js 20+ installed
- Dependencies installed: `npm install`

### Install Playwright Browsers (First Time)
```bash
npx playwright install
```

### Run Tests

**Headless mode (CI/default):**
```bash
npm run test:e2e
```

**Headed mode (see browser):**
```bash
npm run test:e2e:headed
```

**UI mode (interactive):**
```bash
npm run test:e2e:ui
```

**Specific browser:**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Specific test file:**
```bash
npx playwright test share-die.spec.ts
```

### Debug Tests
```bash
npx playwright test --debug
```

### View Test Report
After running tests:
```bash
npx playwright show-report
```

## Test Coverage

### Create Die Flow (tests/e2e/create-die.spec.ts)
Tests for User Story 1 (P1) - Create Single Custom Die

**Success Criteria Verified:**
- **SC-001**: Die creation completes in under 60 seconds for basic 6-sided die
- **SC-008**: 101-sided die created without performance degradation
- **SC-004**: 90% of first-time users successfully create a die (validated through intuitive UI)
- **SC-005**: Interface works on 320px mobile screens

**Test Scenarios:**
1. **Basic 6-sided die**: Create default die in under 60 seconds
2. **101-sided die**: Test maximum sides without performance issues
3. **Text dice**: Create 4-sided die with custom text values ("Yes", "No", "Maybe", "Ask Again")
4. **Color dice**: Create 3-sided die with color faces
5. **Validation**: Prevent saving with empty name (error message shown)
6. **Reset functionality**: Clear all changes and return to defaults
7. **Real-time preview**: Verify preview updates as configuration changes
8. **Mobile responsiveness**: Test on 375px viewport (iPhone SE)

**Validation Checks:**
- Default 6 sides pre-populated with numbers 1-6
- Content type switcher (Number/Text/Color) works
- Face list scrolls for large dice (101 sides)
- Character counter for text faces (20 char max)
- Color pickers display for color faces
- Save button disabled with invalid input
- Preview updates in real-time
- Mobile layout is fully accessible

### Share Die Flow (tests/e2e/share-die.spec.ts)
Tests for User Story 4 (P4) - Share Dice via URL

**Success Criteria Verified:**
- **SC-003**: 100% success rate for viewing shared dice
- **SC-007**: 99.9% reliability for share links loading correct configuration
- **SC-005**: Mobile responsiveness (320px viewport)

**Test Scenarios:**
1. **Basic sharing flow**: Create die → Generate share link → Open link → Verify die loaded
2. **Number dice**: Share 6-sided number die, verify all faces
3. **Text dice**: Share 4-sided text die with custom values ("Yes", "No", "Maybe", "Later")
4. **Color dice**: Share 3-sided color die, verify colored faces render
5. **Large dice**: Share 101-sided die, verify URL length and preview
6. **Invalid URLs**: Test error handling for corrupt/invalid share URLs
7. **Empty URLs**: Test error handling when no encoded data provided
8. **Dice sets**: Share set with multiple dice, verify all dice load
9. **Clipboard**: Test copy-to-clipboard functionality
10. **Reliability**: Load same URL multiple times, verify consistency
11. **Special characters**: Test die names with quotes, symbols, etc.
12. **Mobile viewport**: Test sharing on 320px mobile screen

**Validation Checks:**
- URLs use hash fragments (`/share#encodedData`)
- URL length stays under 6000 characters
- Malformed URLs show friendly error messages
- Recipients can save copies to their library
- Share links work without authentication
- All content types (number/text/color) encode/decode correctly

## Configuration

Configuration is in `playwright.config.ts`:
- **Test directory**: `tests/e2e/`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel execution**: Tests run in parallel for speed
- **Auto-start server**: Dev server starts automatically before tests

## CI/CD Integration

The tests are configured for CI environments:
- Retries: 2 attempts on failure (CI only)
- Workers: 1 (CI) vs unlimited (local)
- Screenshots: Captured on failure
- Traces: Captured on first retry

## Troubleshooting

**"Error: page.goto: net::ERR_CONNECTION_REFUSED"**
- The dev server isn't running
- Run manually: `npm run dev` in another terminal
- Or let Playwright start it automatically (default)

**Tests timeout**
- Increase timeout in test with `test.setTimeout(60000)`
- Or in config: `timeout: 60000`

**Port already in use**
- Kill process on port 3000: `lsof -ti:3000 | xargs kill`
- Or change port in `playwright.config.ts`

**Flaky tests**
- Add explicit waits: `await page.waitForSelector(...)`
- Use `waitForTimeout` sparingly
- Prefer `waitFor` conditions over fixed delays

## Best Practices

1. **Use accessibility selectors**: Prefer `getByRole`, `getByLabel`, `getByText`
2. **Wait for navigation**: Use `waitForURL` after clicks that navigate
3. **Check visibility**: Use `toBeVisible()` not just `toBeInTheDocument()`
4. **Test user flows**: Test complete scenarios, not individual actions
5. **Clean up**: Close pages/contexts when done to free resources

## Next Steps

Additional E2E tests to add:
- Roll dice animation flow (Phase 7)
- Create and save dice sets flow
- Library management (delete, edit)
- Accessibility (keyboard navigation)
- Performance (page load times)
