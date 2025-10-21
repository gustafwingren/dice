# Tasks: Digital Dice Creator

**Feature**: Digital Dice Creator  
**Branch**: `001-digital-dice-creator`  
**Generated**: 2025-10-21  
**Updated**: 2025-10-30  
**Total**: 122 tasks (ALL COMPLETE ✅)

## Task Summary

- **Phase 1 - Setup**: 8 tasks (complete ✅)
- **Phase 2 - Foundation**: 12 tasks (complete ✅)
- **Phase 3 - User Story 1 (P1)**: 16 tasks (complete ✅)
- **Phase 4 - User Story 2 (P2)**: 14 tasks (complete ✅)
- **Phase 5 - User Story 3 (P3)**: 13 tasks (complete ✅)
- **Phase 6 - User Story 4 (P4)**: 11 tasks (complete ✅)
- **Phase 7 - User Story 5 (P5)**: 9 tasks (complete ✅)
- **Phase 8 - Polish & Visual Design**: 19 tasks (complete ✅)
- **Phase 9 - UX Improvements & Test Fixes**: 17 tasks (complete ✅)
- **Phase 10 - Bugfixes**: 7 tasks (complete ✅ - active phase for ongoing bug reports)

## 🎉 PROJECT STATUS: PRODUCTION READY

All 122 tasks across 10 phases are complete. The Digital Dice Creator is ready for production deployment.

## Implementation Strategy

### MVP Scope (Recommended First Release)

**User Story 1 (P1)** - Create Single Custom Die:
- Delivers immediate value: users can create and visualize dice
- Independently testable and deployable
- Foundation for all other features
- Estimated effort: ~80% of Phase 1-3 tasks

**Independent Testing Per Story**:
- Each user story phase includes specific test criteria
- Stories can be developed and tested in parallel after Foundation
- No cross-story dependencies (except Foundation → All)

### Parallel Execution Opportunities

**After Phase 2 (Foundation)**, the following can be developed in parallel:
- US1 (Create Die) - Core editor components
- US2 (Save/Load) - Storage layer (depends on US1 data model)
- US4 (Sharing) - URL encoding (depends on US1 data model)
- US5 (Roll Animation) - Can prototype independently

**US3 (Sets)** depends on US1+US2 being complete (dice must exist to be grouped).

---

## Implementation Changes from Original Spec

**Date**: 2025-10-27

### Key Behavioral Changes

1. **Edit Behavior (Updated from FR-013)**:
   - **Original Spec**: "Always create a new copy (non-destructive, original is immutable)" - Loading a die for edit would create a new die with new ID
   - **Implemented**: Update existing die when editing from library (preserves original ID)
   - **Rationale**: Better UX - users expect to edit their saved dice, not create duplicates
   - **Copy Behavior**: Still supported for future "import from friend" feature (new die if ID not in storage)

2. **Library Navigation**:
   - **Added**: URL parameter navigation (/?id=DIE_ID for dice, /set?id=SET_ID for sets)
   - **Implementation**: Library page passes IDs via router.push with query parameters
   - **Benefit**: Enables deep linking and proper load-for-edit flow

3. **Dice Set ID Tracking**:
   - **Issue Fixed**: "Referenced dice not found" error when saving edited sets
   - **Solution**: Track original dice IDs (originalDiceIds Map) and use them when saving
   - **Implementation**: DiceSetEditor maintains copied die ID → original die ID mapping
   - **Graceful Degradation**: Sets with deleted dice load successfully (missing dice filtered out)

### Test Coverage Additions

- **T048b**: Integration test verifying die update behavior (same ID after save)
- **T056a**: Task for dice set save with original IDs fix
- **T056b**: Task for sync diceIds array with found dice (handle deleted dice)
- **T058b**: Integration test verifying dice set saves with original dice IDs

### Files Modified

- `src/app/page.tsx`: Removed copyDie(), load die directly with original ID
- `src/app/library/page.tsx`: Added handleLoadDie and handleLoadDiceSet with URL navigation
- `src/components/dice/DiceSetEditor.tsx`: Added originalDiceIds Map for ID tracking
- `tests/integration/die-load-edit.test.tsx`: Updated tests, added update behavior test
- `tests/integration/dice-set-load-edit.test.tsx`: Added test for original ID preservation

---

## Phase 1: Setup & Project Initialization

**Goal**: Initialize Next.js project with all required dependencies and configuration  
**Estimated Time**: 2-3 hours  
**Prerequisites**: Node.js 20+, npm 10+

### Tasks

- [x] T001 Initialize Next.js project with TypeScript using create-next-app in project root (use latest stable versions: Next.js 15+, React 19+)
- [x] T002 [P] Install core dependencies using latest stable versions: react@latest, next@latest, typescript@latest, tailwindcss@latest, localforage@latest, lz-string@latest
- [x] T003 [P] Install dev dependencies using latest stable versions: jest@latest, @testing-library/react@latest, @testing-library/jest-dom@latest, playwright@latest, jest-axe@latest, @types/lz-string@latest
- [x] T004 Configure TypeScript with strict mode in tsconfig.json per quickstart.md specifications (use latest TypeScript compiler options)
- [x] T005 [P] Configure TailwindCSS with mobile-first breakpoints (sm:640px, md:768px, lg:1024px) in tailwind.config.ts (use latest Tailwind v4 if available, otherwise v3)
- [x] T006 [P] Configure Next.js for static export with output:'export' in next.config.js (verify compatibility with latest Next.js version)
- [x] T007 [P] Create project structure: src/app, src/components, src/hooks, src/lib, src/types, tests directories
- [x] T008 [P] Configure Jest and React Testing Library in jest.config.js with coverage thresholds

**Validation**: Run `npm run dev` and verify Next.js starts on port 3000 without errors.

---

## Phase 2: Foundation & Shared Infrastructure

**Goal**: Implement shared utilities, types, and infrastructure needed by all user stories  
**Estimated Time**: 4-6 hours  
**Prerequisites**: Phase 1 complete

### Tasks

- [x] T009 Copy type definitions from specs/001-digital-dice-creator/contracts/types.ts to src/types/index.ts
- [x] T010 Copy validation functions from specs/001-digital-dice-creator/contracts/validation.ts to src/lib/validation.ts
- [x] T011 [P] Create constants file in src/lib/constants.ts with MIN_SIDES, MAX_SIDES, MAX_TEXT_LENGTH, etc.
- [x] T012 [P] Implement UUID generation utility in src/lib/uuid.ts using crypto.randomUUID()
- [x] T013 [P] Implement timestamp utility in src/lib/timestamp.ts for ISO 8601 date strings
- [x] T014 [P] Create TailwindCSS global styles in src/app/globals.css with base reset and accessibility focus styles
- [x] T015 [P] Create root layout in src/app/layout.tsx with HTML lang, metadata, and TailwindCSS imports
- [x] T016 [P] Create shared Button component in src/components/ui/Button.tsx with accessibility (keyboard, focus, ARIA)
- [x] T017 [P] Create shared Input component in src/components/ui/Input.tsx with validation states and character counter
- [x] T018 [P] Create Header component in src/components/layout/Header.tsx with navigation and mobile-responsive design
- [x] T019 [P] Write unit tests for validation.ts in tests/unit/validation.test.ts (100% coverage target)
- [x] T020 [P] Write unit tests for uuid.ts and timestamp.ts in tests/unit/utils.test.ts

**Validation**: All unit tests pass with `npm test`. TypeScript compiles without errors.

**Test Criteria**: 
- Validation functions correctly reject invalid data (sides < 2, text > 20 chars, invalid hex colors)
- UUID generates valid v4 format
- Timestamps are valid ISO 8601 strings

---

## Phase 3: User Story 1 (P1) - Create Single Custom Die

**Goal**: Enable users to create a custom die with configurable sides, colors, and face content  
**Estimated Time**: 8-12 hours  
**Prerequisites**: Phase 2 complete

**Independent Test**: Create a 6-sided die with numbers 1-6, verify it displays correctly. Create a 4-sided die with text ("Yes", "No", "Maybe", "Later"), verify text displays. Create a 3-sided color die, verify colors display as solid fills.

### Tasks

- [x] T021 [US1] Create Face type definition and default face factory in src/lib/face-factory.ts
- [x] T022 [US1] Create Die type definition and empty die factory in src/lib/die-factory.ts with default values
- [x] T023 [US1] Implement useDieState hook in src/hooks/useDieState.ts for managing die configuration (sides, color, contentType)
- [x] T024 [US1] Create ColorPicker component in src/components/ui/ColorPicker.tsx with hex input and preset palette
- [x] T025 [P] [US1] Create FaceEditor component in src/components/dice/FaceEditor.tsx for editing single face content
- [x] T026 [P] [US1] Create FaceList component in src/components/dice/FaceList.tsx to display all faces with scroll for 100+ sides
- [x] T027 [US1] Create DieConfigPanel component in src/components/dice/DieConfigPanel.tsx for sides selector and color picker
- [x] T028 [US1] Create DieVisualization component in src/components/dice/DieVisualization.tsx for visual die preview
- [x] T029 [US1] Create DieEditor component in src/components/dice/DieEditor.tsx composing ConfigPanel, FaceList, and Visualization
- [x] T030 [US1] Create home page in src/app/page.tsx with DieEditor as main content
- [x] T031 [US1] Implement content type switcher (number/text/color) with auto-population for number type in DieEditor
- [x] T032 [US1] Add validation UI feedback for invalid inputs (sides < 2, text > 20 chars, empty die name)
- [x] T033 [US1] Implement color face rendering as solid fill (not text) in FaceEditor per FR-004a
- [x] T034 [P] [US1] Write unit tests for useDieState hook in tests/unit/hooks/useDieState.test.ts
- [x] T035 [P] [US1] Write component tests for FaceEditor in tests/unit/components/FaceEditor.test.tsx
- [x] T036 [US1] Write E2E test for die creation flow in tests/e2e/create-die.spec.ts (SC-001: <60s for basic 6-sided die, SC-008: validate 101-sided die performance)

**Validation**: 
- User can create 2-sided die minimum, 101-sided die maximum
- All 3 content types (number/text/color) work correctly
- Color faces display as solid fills, not text
- Input validation prevents invalid data entry
- E2E test passes: 6-sided die created in <60 seconds
- E2E test passes: 101-sided die created without performance degradation (still <60s, no UI lag)

**Test Criteria (SC-001, SC-004)**:
- 90% of first-time users successfully create a die
- Die creation takes <60 seconds for standard 6-sided die
- Interface works on 320px mobile and 1920px desktop (SC-005)

---

## Phase 4: User Story 2 (P2) - Save and Load Dice

**Goal**: Persist dice to local storage and retrieve them in future sessions  
**Estimated Time**: 6-8 hours  
**Prerequisites**: Phase 3 (US1) complete

**Independent Test**: Create a die named "Lucky Red", save it, refresh the page, verify it appears in the library with correct configuration. Load the die and verify all properties match.

### Tasks

- [x] T037 [US2] Implement storage wrapper in src/lib/storage.ts using localforage with versioned schema
- [x] T038 [US2] Implement saveDie function in src/lib/storage.ts with validation and error handling
- [x] T039 [US2] Implement loadDice function in src/lib/storage.ts to retrieve all saved dice
- [x] T040 [US2] Implement deleteDie function in src/lib/storage.ts with confirmation (satisfies FR-018: delete saved dice/sets)
- [x] T041 [US2] Create useDiceStorage hook in src/hooks/useDiceStorage.ts wrapping storage operations
- [x] T042 [US2] Add "Save Die" button to DieEditor with name input modal
- [x] T043 [US2] Create DiceLibrary component in src/components/dice/DiceLibrary.tsx to display saved dice grid
- [x] T044 [US2] Create DiceLibraryCard component in src/components/dice/DiceLibraryCard.tsx showing die preview and name
- [x] T045 [US2] Create library page in src/app/library/page.tsx with DiceLibrary component
- [x] T046 [US2] Implement load die functionality: clicking card loads die into editor for updating (preserves original ID)
- [x] T046a [US2] Update library page to pass die ID via URL parameter (/?id=DIE_ID) for load-for-edit flow
- [x] T046b [US2] Update library page to pass dice set ID via URL parameter (/set?id=SET_ID) for load-for-edit flow
- [x] T047 [P] [US2] Write unit tests for storage.ts in tests/unit/storage.test.ts with localStorage mocks
- [x] T048 [US2] Write integration test for save-load flow in tests/integration/die-persistence.test.tsx
- [x] T048a [US2] Write integration tests for die load-for-edit flow in tests/integration/die-load-edit.test.tsx (verifies URL parameter loading, form population, update on save)
- [x] T048b [US2] Add integration test verifying die update behavior (same ID, updates existing die instead of creating duplicate)

**Validation**:
- Dice persist across browser sessions
- Loading a die from library preserves its ID and updates on save (not creating duplicates)
- Storage handles errors gracefully (quota exceeded, corrupt data)
- Library displays all saved dice with previews
- **Load-for-edit: Clicking die in library populates editor with all die data**
- **Update behavior: Saving an edited die updates the original (same ID, single die in storage)**

**Test Criteria (SC-011)**:
- 85% of users who create a die proceed to save it
- Saved dice retrievable with 100% accuracy
- Editing and saving updates existing die without creating duplicates

---

## Phase 5: User Story 3 (P3) - Create and Save Dice Sets

**Goal**: Enable users to create sets of 1-6 dice and save them together  
**Estimated Time**: 5-7 hours  
**Prerequisites**: Phase 4 (US2) complete

**Independent Test**: Create 3 different dice with unique colors and content, save them as "RPG Starter Set", reload page, verify all 3 dice load together with correct configurations.

### Tasks

- [x] T049 [US3] Create DiceSet type and factory in src/lib/set-factory.ts
- [x] T050 [US3] Implement useDiceSetState hook in src/hooks/useDiceSetState.ts for managing multiple dice
- [x] T051 [US3] Extend storage.ts with saveDiceSet and loadDiceSets functions
- [x] T052 [US3] Create DiceSetEditor component in src/components/dice/DiceSetEditor.tsx for editing multiple dice
- [x] T053 [US3] Add "Add Die to Set" button with 6-die limit validation (FR-001)
- [x] T054 [US3] Create DiceSetCard component in src/components/dice/DiceSetCard.tsx showing set preview with all dice
- [x] T055 [US3] Extend DiceLibrary to display both individual dice and sets with visual distinction (FR-019)
- [x] T056 [US3] Implement load set functionality: clicking set card loads all dice into multi-die editor for updating
- [x] T056a [US3] Fix dice set save with original dice IDs: track copied die ID to original ID mapping
- [x] T056b [US3] Update dice set editor to sync diceIds array with found dice when loading (handle deleted dice)
- [x] T057 [P] [US3] Write unit tests for set-factory.ts and useDiceSetState hook
- [x] T058 [US3] Write integration test for set creation and loading in tests/integration/dice-set.test.tsx
- [x] T058a [US3] Write integration tests for dice set load-for-edit flow in tests/integration/dice-set-load-edit.test.tsx (verifies URL parameter loading, set population with all dice, handle deleted dice)
- [x] T058b [US3] Add integration test verifying dice set saves with original dice IDs (not copied IDs)

**Validation**:
- Users can create 1-6 dice per set (enforced)
- Sets persist with all dice configurations intact
- Library distinguishes individual dice from sets (FR-019)
- Loading a set displays all dice correctly
- **Load-for-edit: Clicking set in library populates editor with set name and all dice**
- **Update behavior: Saving edited set updates original with correct dice references**
- **Graceful handling: Sets with deleted dice load successfully (missing dice filtered out)**

**Test Criteria**:
- Set with 6 dice saves and loads without errors
- All dice in set maintain individual configurations
- Cannot add more than 6 dice to a set
- Editing and saving set uses original dice IDs (no "Referenced dice not found" errors)
- Sets gracefully handle references to deleted dice

---

## Phase 6: User Story 4 (P4) - Share Dice via URL

**Goal**: Generate shareable URLs that encode dice configuration for stateless sharing  
**Estimated Time**: 6-8 hours  
**Prerequisites**: Phase 3 (US1) complete (US2 optional, US3 optional)

**Independent Test**: Save a die named "Daily Decision", generate share link, open link in incognito window, verify die appears with correct configuration and can be saved as a copy.

### Tasks

- [x] T059 [US4] Implement encoding utilities in src/lib/encoding.ts with LZ-String compression and Base64
- [x] T060 [US4] Implement decodeDie function in src/lib/encoding.ts with validation and error handling
- [x] T061 [US4] Implement decodeSet function in src/lib/encoding.ts for dice sets
- [x] T062 [US4] Create useShareLink hook in src/hooks/useShareLink.ts for generating and parsing share URLs
- [x] T063 [US4] Create useClipboard hook in src/hooks/useClipboard.ts for copying to clipboard
- [x] T064 [US4] Add "Share" button to DieEditor and DiceSetEditor with URL generation
- [x] T065 [US4] Create ShareModal component in src/components/dice/ShareModal.tsx displaying shareable URL
- [x] T066 [US4] Create share page in src/app/share/[encoded]/page.tsx that decodes URL parameter
- [x] T067 [US4] Implement "Save Copy" button on share page for recipients to save shared die
- [x] T068 [P] [US4] Write unit tests for encoding.ts in tests/unit/encoding.test.ts with various die configurations
- [x] T069 [US4] Write E2E test for sharing flow in tests/e2e/share-die.spec.ts (SC-003: 100% success rate)

**Validation**:
- Generated URLs contain complete die configuration in fragment
- Share links work without authentication (FR-010)
- URLs under 6000 chars for most configurations (warning if exceeded)
- Malformed/corrupt URLs show friendly error message
- Recipients can save copies (not edit originals)

**Test Criteria (SC-003, SC-007)**:
- 100% success rate for viewing shared dice
- Share links load correct configuration with 99.9% reliability
- URL encoding handles all content types (number/text/color)

---

## Phase 7: User Story 5 (P5) - Roll Dice Animation

**Goal**: Add roll animation that randomly selects and displays die faces  
**Estimated Time**: 4-6 hours  
**Prerequisites**: Phase 3 (US1) complete

**Independent Test**: Load a 6-sided die, click "Roll" 20+ times, verify different faces appear randomly and all faces appear at least once over multiple rolls.

### Tasks

- [x] T070 [US5] Implement cryptographic random in src/lib/random.ts using crypto.getRandomValues() with rejection sampling algorithm to avoid modulo bias
- [x] T071 [US5] Create rollDie function in src/lib/random.ts returning random face from die
- [x] T072 [US5] Create rollDiceSet function in src/lib/random.ts returning array of random faces (takes dice array only, no diceSet parameter needed)
- [x] T073 [US5] Create useRollDice hook in src/hooks/useRollDice.ts managing 3-state lifecycle (idle → rolling → complete) with 1.5s animation timing
- [x] T074 [US5] Create RollAnimation component in src/components/dice/RollAnimation.tsx with spinning 3D cube using GPU-accelerated CSS transforms (spinCube keyframes with 3D rotation)
- [x] T075 [US5] Create RollResult component in src/components/dice/RollResult.tsx displaying rolled face(s) with bounce-in animation (handles both single Face and Face[] for sets)
- [x] T076 [US5] Add "Roll Die" button to DieEditor (hidden when rollState='complete') and "Roll All Dice" button to DiceSetEditor, both disabled during rolling
- [x] T077 [US5] Implement button state management: hide main roll button when showing results, show "Roll Again" button only when rollState='complete' to prevent duplicate buttons
- [x] T078 [P] [US5] Write unit tests for random.ts in tests/unit/random.test.ts verifying distribution, edge cases (2 sides, 101 sides), and all content types (number, text, color)
- [x] T079 [US5] Write E2E tests for roll animation in tests/e2e/roll-dice.spec.ts covering: basic roll, multiple rolls proving randomness, button disable during animation, mobile viewport (320px), and large die (101 sides)

**Validation**:
- Roll produces truly random results (crypto.getRandomValues with rejection sampling)
- Animation performs smoothly on mobile and desktop (GPU-accelerated, 1.5s duration)
- All faces appear over multiple rolls (17 unit tests + 8 E2E scenarios verify randomness)
- Cannot trigger roll while animation in progress (button disabled, isRolling flag)
- Button state management prevents duplicate "Roll" buttons (strict mode compliance)
- Works with all content types: number, text, color dice

**Test Criteria**:
- Roll animation works on 320px mobile screens (SC-005) ✅
- Over 100 rolls, distribution is reasonably uniform ✅
- Animation completes in 1.5 seconds ✅
- 40/50 E2E tests passing (10 skipped: text/color dice face selector tests across 5 browsers)

---

## Phase 9: UX Improvements & Test Fixes

**Goal**: Fix UX issues from user testing, implement clarification requirements, and address known test limitations  
**Estimated Time**: 8-10 hours  
**Prerequisites**: Phase 7 complete (critical UX fixes can be done immediately)

**Critical UX Issues** (T099-T103):
1. Roll result text truncation (needs responsive text sizing)
2. Unnecessary die preview in editors (clutters interface, removed per FR-005)
3. Share page too complex (needs simplified "try and copy" experience per FR-010)

### Tasks

- [x] T099 [P] Fix roll result text visibility in src/components/dice/RollResult.tsx: implement responsive text sizing with wrapping, ensure full content visible without truncation (FR-020a)
- [x] T100 [P] Remove die visualization from DieEditor: hide/remove DieVisualization component rendering in right column of src/components/dice/DieEditor.tsx (FR-005)
- [x] T101 [P] Remove dice set visualization from DiceSetEditor: hide/remove visualization rendering in src/components/dice/DiceSetEditor.tsx (FR-005)
- [x] T102 [US4] Redesign share page in src/app/share/page.tsx: simplified view with die placeholder/preview, "Roll" button, and "Save a Copy" button only (no editor) (FR-010)
- [x] T103 [P] [US4] Update share page styling to focus on interaction: prominent roll button, clear visual hierarchy, minimal chrome
- [x] T104 [P] Fix text dice E2E test selectors in tests/e2e/roll-dice.spec.ts to work with button-based content type selector (currently skipped)
- [x] T105 [P] Fix color dice E2E test selectors in tests/e2e/roll-dice.spec.ts to work with button-based content type selector (currently skipped)
- [x] T106 [P] Add proper wait/retry logic for face input appearance after content type change (500ms observed delay)
- [x] T107 Document browser-specific test limitations in README.md (clipboard API requires Chromium)
- [x] T108 Add virtualized scrolling for 101-sided dice face list using react-window or similar (performance enhancement from edge cases)
- [x] T109 Add batch editing UI for sequential numbering of faces (QoL feature from edge cases)
- [x] T110 [P] Implement dark mode support per FR-032 with theme toggle and localStorage persistence
- [x] T111 [P] Add chi-squared test to tests/unit/random.test.ts: verify p>0.05 over 1000+ rolls for 2-sided, 6-sided, and 101-sided dice (SC-016)
- [x] T112 [P] Add whitespace validation to src/lib/validation.ts: reject whitespace-only face content, update validateFaceContent() function (FR-004)
- [x] T113 [P] Add whitespace validation UI in src/components/dice/FaceEditor.tsx: show inline error "Face content cannot be empty or whitespace only" (FR-004)
- [x] T114 [P] Add storage quota error handling in src/lib/storage.ts: catch QuotaExceededError, display "Storage full - please delete old dice to continue" with library link (FR-011)
- [x] T115 [P] Add aria-live region to src/components/dice/RollAnimation.tsx: implement aria-live="polite" region announcing "Rolling..." then final result text (FR-020, SC-012)

**Validation**:
- Roll results display complete text without truncation (all text content fully visible)
- Die/set editors show no visualization preview (removed from UI)
- Share page provides simplified "try and copy" experience (no editor interface)
- All 145 E2E tests passing (0 skipped)
- Text and color dice creation flows work in all browsers
- Face list performs smoothly even with 101 faces
- Batch numbering reduces creation time for large dice
- Dark mode meets WCAG contrast requirements
- Chi-squared test passes for all die types (p>0.05 threshold)
- Whitespace-only face content is rejected with inline error messages
- Storage quota exceeded error displays user-friendly message with library link
- Roll animations announce results via aria-live regions for screen readers
- Line breaks are stripped from text face content automatically

---

## Phase 10: Bugfixes

**Goal**: Address bugs discovered during testing and production use  
**Estimated Time**: Variable (depends on bug complexity)  
**Prerequisites**: None (can be done anytime)

**Note**: This is an ongoing phase where new bugs can be appended as they are discovered. Each bug fix should follow the standard checklist format.

### Tasks

- [x] T116 [P] Fix dark mode toggle not reverting to light mode in src/hooks/useTheme.ts: add useEffect to apply theme whenever theme state changes (resolves localStorage update without visual change)
- [x] T117 [P] Fix dark mode prioritizing system preference over user toggle: (1) remove redundant applyTheme() calls from initialization useEffect in src/hooks/useTheme.ts, (2) configure Tailwind CSS v4 to use class-based dark mode with @custom-variant in src/app/globals.css instead of media query-based dark mode
- [x] T118 [P] Fix dice set roll results not showing die background colors in src/components/dice/RollResult.tsx, src/components/dice/DiceSetEditor.tsx, and src/app/share/page.tsx: add dice array prop to RollResult component to properly map each face to its parent die for correct styling
- [x] T119 [P] Complete dark mode styling across all components: add dark: variants for backgrounds (dark:bg-neutral-800), text (dark:text-neutral-100), borders (dark:border-neutral-700), and shadows (dark:shadow-neutral-900) in DiceLibrary, DiceLibraryCard, DiceSetCard, Modal, DieConfigPanel, FaceList, share page components
- [x] T120 [P] Complete remaining dark mode gaps: add dark: variants to DieEditor (3 containers + help text), DiceSetEditor (main container + buttons + messages + info panel), DieVisualization (preview area), ShareContent (input field), all page backgrounds (page.tsx, set/page.tsx, library/page.tsx), share page success messages, and loading states
- [x] T121 [P] Add dark mode to share page and UI components: (1) add ThemeToggle to share page header (loading, error, die view, dice set view), (2) add dark: variants to Button component (all variants: primary, secondary, danger), (3) add dark: variants to Input component (label, field, borders, error/helper text), (4) add dark: variants to ColorPicker component (label, preset buttons, preview text/border), (5) update share page text colors (loading text, back links)
- [x] T122 [P] Add dark mode to remaining text in FaceEditor, FaceList, and DiceSetEditor: (1) FaceEditor - heading, error text, border, color preview label/border, (2) FaceList - empty state text, scrollbar styling, (3) DiceSetEditor - loading text, main heading, dice list item text (name/details), save modal text, add die modal text (empty state, die selection buttons)
- [x] T123 [P] Fix skeleton component loading states in page components: (1) Remove isLoading state from src/app/page.tsx HomeContent that was preventing die data from loading in tests, (2) Remove storageLoading check from src/components/dice/DiceSetEditor.tsx that was showing skeleton screens in tests, (3) Replace DieEditorSkeleton with LoadingSpinner in Suspense fallbacks for both page.tsx and set/page.tsx
- [x] T124 [P] Fix ColorPicker component to sync with external value changes: Add useEffect in src/components/ui/ColorPicker.tsx to update internal customHex state when value prop changes (fixes die color not displaying when loading from storage)
- [x] T125 [P] Remove SET badge from DiceSetCard component: Badge is redundant since DiceLibrary already separates items into "🎲 Dice Sets" and "🎯 Individual Dice" sections with clear headings (visual distinction achieved via section separation per FR-019)

**Validation**:
- Dark mode toggle switches between light and dark correctly
- localStorage persists theme selection and takes priority over system preference
- User's explicit theme choice (via toggle) is respected even when system preference differs
- Tailwind dark: variants apply based on .dark class, not @media (prefers-color-scheme: dark)
- Theme class is applied/removed from document.documentElement
- No hydration mismatches or console errors
- Dice set roll results display each die's background color correctly on Edit Set page
- Dice set roll results display each die's background color correctly on Share page
- Roll result faces maintain proper styling from their parent dice
- All major components have comprehensive dark mode support with proper contrast
- Backgrounds use dark:bg-neutral-800/900, text uses dark:text-neutral-100/400
- Borders and shadows adapt to dark mode (dark:border-neutral-700, dark:shadow-neutral-900)
- Interactive elements maintain visibility and usability in dark mode
- All page backgrounds (/, /library, /set, /share) adapt to dark mode
- All container backgrounds, buttons, input fields, and messages have dark: variants
- Loading states, error messages, and success messages are visible in dark mode
- No remaining bg-white, bg-neutral-50, or colored backgrounds without dark: variants
- Share page has ThemeToggle in header for all view states (loading, error, content)
- Button component supports dark mode for all variants (primary, secondary, danger)
- Input component has dark mode for labels, fields, borders, and error/helper text
- ColorPicker component has dark mode for labels, preset buttons, and preview section
- FaceEditor has dark mode for headings, borders, error text, and color preview elements
- FaceList has dark mode for empty state text and scrollbar styling
- DiceSetEditor has dark mode for all text elements (headings, descriptions, modal content)
- Skeleton loading states removed from page components (no longer blocking content display in tests)
- Die data loads correctly from URL parameters in both production and test environments
- ColorPicker updates internal state when value prop changes (fixes async die loading)
- SET badge removed from dice set cards (visual distinction via section headings instead)
- All 206 unit tests passing ✅

---

## Known Limitations (As of 2025-10-28)

### Test Skips

**E2E Tests** (3 skipped total):
- **Clipboard Tests** (3 skipped): `tests/e2e/share-die.spec.ts` - "Copy share URL to clipboard" test skipped in Firefox and WebKit (Clipboard API not supported)

**Current Test Status**:
- Unit Tests: 206/206 passing ✅
- E2E Tests: 87/90 passing (3 skipped)
- Build: Production build successful ✅

### Recent Bug Fixes (Phase 10)

**Skeleton Component Loading Issues** (T123):
- Fixed page components showing loading skeletons indefinitely in tests
- Removed blocking `isLoading` states from page.tsx and DiceSetEditor
- Replaced DieEditorSkeleton with LoadingSpinner in Suspense fallbacks

**ColorPicker State Sync** (T124):
- Added useEffect to sync internal state when value prop changes
- Fixes die colors not displaying when loading from storage asynchronously

**Visual Design Cleanup** (T125):
- Removed redundant SET badge from DiceSetCard
- Visual distinction achieved via section separation ("🎲 Dice Sets" vs "🎯 Individual Dice")

### Future Enhancements

**Performance Optimizations** (implemented in Phase 9):
- ✅ Virtualized scrolling for 101-sided dice (react-window with 50+ threshold)
- ✅ Batch editing options for sequential numbering (Auto-Number and Clear All buttons)

**Browser Support**:
- Clipboard API requires Chromium (Chrome, Edge, Opera)
- Firefox/WebKit users must manually copy share links

---

## Phase 8: Polish & Cross-Cutting Concerns

**Goal**: Add final touches for production readiness including visual design polish  
**Estimated Time**: 10-15 hours  
**Prerequisites**: All user stories complete

### Tasks

#### Visual Design & UI Polish (T080-T089)

- [x] T080 [P] Create design system in src/styles/design-tokens.css with color palette, typography scale, spacing system, and shadows
- [x] T081 [P] Design dice visualization improvements: 3D effects, shadows, gradients, and realistic die appearance
- [x] T082 [P] Add micro-interactions: hover states, focus animations, button press effects, smooth transitions
- [x] T083 [P] Implement card-based layouts for dice library with consistent spacing and visual hierarchy
- [x] T084 [P] Add loading states and skeleton screens for async operations
- [x] T085 [P] Create empty states with helpful illustrations/messages for library and face lists
- [x] T086 [P] Polish form inputs: floating labels, better focus states, input animations
- [x] T087 [P] Add success/error toast notifications in src/components/ui/Toast.tsx for user feedback
- [x] T088 [P] Implement dark mode support with theme toggle in src/hooks/useTheme.ts
- [x] T0881 Breakout components into smaller easier components that is easy to maintain in the future

#### Infrastructure & Deployment (T090-T095)

- [x] T090 Configure Azure Static Web Apps in public/staticwebapp.config.json with routing and security headers
- [x] T091 Create GitHub Actions workflow in .github/workflows/azure-static-web-apps.yml for CI/CD
- [x] T092 [P] Add Lighthouse CI configuration in lighthouserc.js with performance budgets (SC-006)
- [x] T093 [P] Optimize bundle size: code splitting, dynamic imports for heavy components, tree-shaking verification
- [x] T094 [P] Add error boundaries in src/components/ErrorBoundary.tsx for graceful error handling
- [x] T095 [P] Create README.md with project overview, setup instructions, and deployment guide

#### Accessibility & Testing (T096-T098)

- [x] T096 Implement accessibility audit with jest-axe in tests/unit/accessibility.test.ts for all components
- [x] T097 Create E2E accessibility test in tests/e2e/accessibility.spec.ts with keyboard navigation
- [x] T098 Final E2E test suite run covering all user stories end-to-end with visual regression testing

**Validation**:
- Visual design is polished and professional-looking
- Design system is consistent across all components
- Animations are smooth (60fps) and enhance UX
- Dark mode works correctly with proper contrast
- Lighthouse scores: Performance >90, Accessibility 100, Best Practices >90 (SC-006, SC-010)
- Bundle size <1MB total (constitution requirement)
- All accessibility tests pass (SC-009, SC-012)
- CI/CD pipeline deploys to Azure successfully
- All E2E tests pass on mobile (320px) and desktop (1920px)
- Visual regression tests confirm UI consistency

**Test Criteria (SC-005, SC-006, SC-009, SC-010)**:
- Page load <2s on 3G connections
- Keyboard navigation works for all interactive elements
- Color contrast meets WCAG AA (4.5:1 minimum) in both light and dark modes
- Screen readers announce all die properties correctly
- UI looks polished and professional across all devices

---

## Dependencies & Execution Order

### Critical Path (Sequential)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundation)
    ↓
Phase 3 (US1: Create Die) ← MVP MINIMUM
    ↓
[Optional] Phase 4 (US2: Save/Load) ← Recommended for MVP
    ↓
[Optional] Phase 5 (US3: Sets) ← Depends on US2
```

### Parallel Opportunities (After Foundation)

**Can develop simultaneously after Phase 2**:
- US1 (Create Die) - T021-T036
- US4 (Sharing) - T059-T069 (requires US1 data model but not US1 UI)
- US5 (Roll Animation) - T070-T079 (requires US1 data model but not US1 UI)

**After US1 complete**:
- US2 (Save/Load) - T037-T048
- US4 (Sharing) - T059-T069 (can complete after US1)
- US5 (Roll) - T070-T079 (can complete after US1)

**After US2 complete**:
- US3 (Sets) - T049-T058 (requires saved dice to create sets)

### MVP Recommendation

**Minimum Viable Product** = Phase 1 + Phase 2 + Phase 3 (US1)
- Delivers core value: create and visualize custom dice
- Fully testable and deployable
- ~30 tasks, estimated 16-22 hours

**Enhanced MVP** = MVP + Phase 4 (US2)
- Adds persistence and reusability
- Enables sharing in later iteration
- ~41 tasks, estimated 22-30 hours

---

## Task Execution Notes

### Checklist Format Legend

- `- [ ]` = Not started (checkbox)
- `[TXX]` = Task ID (sequential)
- `[P]` = Parallelizable (can be done simultaneously with other [P] tasks)
- `[USX]` = User Story number (for tracking)
- Task description always includes file path for clarity

### Parallel Execution Guidelines

**[P] Tasks** can be executed simultaneously if:
- They work on different files
- They have no dependencies on incomplete tasks
- Tests can run for each in isolation

**Example parallel batch** (Phase 2):
```bash
# Developer A
T011: Create constants.ts
T014: Create globals.css
T016: Create Button.tsx

# Developer B  
T012: Create uuid.ts
T015: Create layout.tsx
T017: Create Input.tsx

# Developer C
T018: Create Header.tsx
T019: Write validation tests
```

### Independent Testing Per Story

Each user story phase includes **Independent Test** criteria that can be validated without other stories:

- **US1**: Create various dice configurations, verify display
- **US2**: Save and reload dice, verify persistence
- **US3**: Create set of 3 dice, reload, verify all intact
- **US4**: Generate share link, open in incognito, verify decode
- **US5**: Roll die 20+ times, verify randomness

This enables incremental delivery and testing without waiting for full feature completion.

---

## Success Metrics Mapping

Tasks mapped to Success Criteria from spec.md:

- **SC-001** (60s die creation): T036 E2E test
- **SC-003** (100% share success): T069 E2E test  
- **SC-004** (90% first-visit success): T036 E2E test
- **SC-005** (Mobile/desktop responsive): T030, T079, T083
- **SC-006** (<2s load on 3G, Lighthouse 90+): T084, T088
- **SC-007** (99.9% share reliability): T068, T069
- **SC-009** (Keyboard navigation): T083
- **SC-010** (4.5:1 contrast): T082, T084
- **SC-011** (85% save rate): T048 integration test
- **SC-012** (Screen reader support): T082, T083

---

## Total Effort Estimate

- **Phase 1**: 2-3 hours ✅ Complete
- **Phase 2**: 4-6 hours ✅ Complete
- **Phase 3 (US1)**: 8-12 hours ✅ Complete
- **Phase 4 (US2)**: 6-8 hours ✅ Complete
- **Phase 5 (US3)**: 5-7 hours ✅ Complete
- **Phase 6 (US4)**: 6-8 hours ✅ Complete
- **Phase 7 (US5)**: 4-6 hours ✅ Complete
- **Phase 8**: 10-15 hours (5/19 tasks complete)
- **Phase 9**: 8-10 hours ✅ Complete
- **Phase 10**: Variable (ongoing bugfix phase) - 10 tasks completed ✅

**Total**: 57-85 hours (Phases 1-7, 9, 10 complete, ~70 hours invested)

**MVP Only** (Phases 1-3): 14-21 hours (2-3 days solo)
