# Feature Specification: Bug Fixes and General Improvements

**Feature Branch**: `002-bug-fixes-improvements`  
**Created**: 2025-10-30  
**Updated**: 2025-11-03
**Status**: Draft  
**Input**: User description: "One bug is that validation is visible even before an user has entered values in form. Another is have a better order of the cards in mobile. The third issue is that scrolling inside a scrolling element is hard for enduser."

**Additional Bug (2025-11-03)**: Face data loss when changing die sides count. When users customize face values and then change the number of sides (e.g., from 5 to 10), all customized face data is lost and faces are regenerated with default values. This is a critical data loss bug that needs to be fixed.

**Additional Bug (2025-11-03)**: Navigation to "Create Die" from edit view doesn't reset the form. When users are editing a die (URL: `/?id=123`) and click "Create Die" in the header to start fresh, the form retains the previously edited die's data instead of showing a blank die creation form. This confuses users who expect to create a new die from scratch.

**New Feature Request (2025-11-04)**: Duplicate Die and Die Set functionality. Users need an easy way to duplicate existing dice and die sets to create variations without starting from scratch. This should be available in three places: (1) "Duplicate" button in DieEditor when editing an existing die, (2) "Duplicate" button in DieSetEditor when editing an existing set, and (3) Duplicate icon button on library cards alongside the delete button.

## Clarifications

### Session 2025-10-30

- Q: Form Field Validation Trigger - When should validation errors appear after user interaction? → A: Show validation when field loses focus (onBlur) after being touched
- Q: Mobile Breakpoint Definition - What viewport width should trigger single-column mobile layout? → A: 768px and below (phones and small tablets)
- Q: Edge Case Resolution - Simultaneous Edits Timestamp Conflict - How should card ordering behave when multiple dice are edited in the same second? → A: Use millisecond precision timestamps; if equal, fall back to createdAt as secondary sort
- Q: Maximum Content Height Before Elimination of Nested Scroll - Should there be a limit to vertical expansion for large libraries? → A: Progressive loading after threshold (e.g., "Show 50 more" button to expand further)
- Q: Empty State Action on Mobile - What action should users be guided toward in empty state? → A: Message with prominent "Create Your First Die" call-to-action button

### Clarification Update 2025-10-30

**User Correction**: The mobile ordering issue is actually about **button placement within the DieEditor form**, not library card sorting. On mobile viewports, the action buttons (Roll, Save, Share, Reset) currently appear **before** the FaceEditor, but they should appear **after** so users complete face editing before seeing action buttons.

**Updated Understanding**:
- Bug #2 focuses on DieEditor component layout order on mobile
- Configuration panel → Face editor → Action buttons (correct order)
- Currently: Configuration panel → Action buttons → Face editor (problematic)
- Desktop layout uses multi-column grid (no changes needed)
- Library card sorting is NOT part of this bug fix

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Premature Validation Error Display (Priority: P1)

Users should not see validation error messages until they have interacted with form fields, preventing confusion and creating a more welcoming first-time experience when creating or editing dice.

**Why this priority**: Showing errors before users have had a chance to enter data creates a hostile user experience, making the application feel judgmental and difficult to use. This is a critical UX issue affecting all form interactions.

**Independent Test**: Can be fully tested by opening any form (die creation, face editing, set creation) and verifying no error messages appear until the user has typed into a field or attempted submission.

**Acceptance Scenarios**:

1. **Given** a user opens the die creation form, **When** the form first appears, **Then** no validation error messages are visible
2. **Given** a user opens an empty form field, **When** they focus on the field but haven't typed yet, **Then** no error message appears
3. **Given** a user types into a field and then clears it, **When** they leave the field, **Then** the validation error appears
4. **Given** a user attempts to submit a form with invalid data, **When** submission is prevented, **Then** all validation errors become visible
5. **Given** a user has previously triggered validation errors, **When** they correct the errors, **Then** the error messages disappear immediately

---

### User Story 2 - Form Element Order on Mobile (Priority: P2) ✅ **COMPLETED**

Users on mobile devices should see form elements in a logical task-oriented order, with action buttons (Save, Roll, Share) appearing after the face editor so users can complete data entry before seeing actions.

**Status**: Implemented using flexbox with `contents` utility and order properties.

**Implementation**: The DieEditor uses a flex container with:
- Mobile (<768px): Left column wrapper uses `contents` to make config and buttons direct flex children, allowing order properties to work correctly
  - Order 1: DieConfigPanel
  - Order 2: FaceList  
  - Order 3: Action Buttons
- Desktop (≥768px): Left column wrapper becomes `flex flex-col` grouping config and buttons together
  - Left column: DieConfigPanel → Action Buttons
  - Right column: FaceList

**Why this priority**: Mobile users have limited screen space and follow a top-to-bottom reading pattern. Placing action buttons before the face editor forces users to scroll past buttons they can't use yet, creating a confusing and inefficient workflow.

**Independent Test**: Can be fully tested by opening the DieEditor on a mobile device (or narrow viewport <768px) and verifying the face editor appears before action buttons in the visual flow.

**Acceptance Scenarios**:

1. **Given** a user opens DieEditor on mobile viewport (<768px), **When** the page renders, **Then** the die configuration panel appears first at the top
2. **Given** a user scrolls down on mobile DieEditor, **When** they pass the configuration panel, **Then** the face editor appears next in the flow
3. **Given** a user continues scrolling on mobile DieEditor, **When** they pass the face editor, **Then** the action buttons (Roll, Save, Share, Reset) appear at the bottom
4. **Given** a user is editing faces on mobile, **When** they need to save, **Then** they can access action buttons by scrolling down (not up)
5. **Given** a user views DieEditor on desktop (≥768px), **When** the page renders, **Then** the layout uses a multi-column grid with face editor in the middle column

---

### User Story 3 - Nested Scrolling Usability (Priority: P1)

Users should be able to scroll smoothly through content without getting trapped in nested scrollable areas, creating a frustration-free browsing experience.

**Why this priority**: Nested scrolling (scrolling within scrolling) is one of the most frustrating UX issues on both desktop and mobile. Users get trapped trying to scroll the page when they're inside a scrollable element, breaking the natural flow.

**Independent Test**: Can be fully tested by scrolling through pages with embedded scrollable areas (like dice libraries or long face lists) and verifying users can easily scroll the main page without getting stuck.

**Acceptance Scenarios**:

1. **Given** a user views a page with a scrollable card list, **When** they scroll with mouse wheel or touch gesture, **Then** the main page scrolls naturally without any nested scroll containers
2. **Given** a user is viewing the dice library with many items, **When** the library extends beyond the viewport, **Then** the layout expands naturally and the main page scrolls without nested scrollable areas
3. **Given** a user views any page with long content lists, **When** they scroll, **Then** there are no separate scrollable containers that trap the scroll gesture
4. **Given** a user on mobile views a scrollable list, **When** they attempt to scroll, **Then** only the main page scrolls with no nested scrolling conflicts
5. **Given** a user views face editors with many faces, **When** the face list is long, **Then** the layout expands vertically allowing natural page scrolling without a nested scroll container

---

### User Story 4 - Face Data Preservation When Changing Sides (Priority: P0)

Users should not lose their customized face data when they increase or decrease the number of sides on a die they are editing, preserving their work and preventing frustrating data loss.

**Why this priority**: This is a critical data loss bug that destroys user work without warning. When users spend time customizing face values (e.g., creating a 5-sided die with custom text), changing the sides to 10 should add 5 new default faces while keeping the existing 5 faces intact. Currently, all faces are regenerated, losing all customizations. This violates user expectations and is a severe usability issue.

**Independent Test**: Can be fully tested by creating a die with N faces, customizing the face values, then changing the sides count to N+X or N-X, and verifying existing faces remain unchanged.

**Acceptance Scenarios**:

1. **Given** a user creates a 5-sided die with custom face values, **When** they increase sides to 10, **Then** the first 5 faces retain their custom values and faces 6-10 are added with default values
2. **Given** a user creates a 10-sided die with custom face values, **When** they decrease sides to 5, **Then** the first 5 faces retain their custom values and faces 6-10 are removed
3. **Given** a user creates a die with number content type and custom values, **When** they change the number of sides, **Then** existing faces preserve their custom number values
4. **Given** a user creates a die with text content type and custom values, **When** they change the number of sides, **Then** existing faces preserve their custom text values
5. **Given** a user creates a die with color content type and custom colors, **When** they change the number of sides, **Then** existing faces preserve their custom color values
6. **Given** a user increases sides count multiple times, **When** they have customized some faces, **Then** only the newly added faces have default values, all previous faces remain unchanged

---

### User Story 5 - Inline Face Management Controls (Priority: P2)

Users should be able to add or remove faces directly from the face editor area without scrolling back to the configuration panel, providing a streamlined workflow when iterating on die design.

**Why this priority**: When users are editing faces and realize they need more or fewer sides, they currently must scroll back up to the configuration panel to adjust the sides count. This breaks their workflow and requires context switching. Adding inline "Add Face" and "Remove Face" buttons at the bottom of the face list keeps users in their editing context while respecting all existing constraints.

**Independent Test**: Can be fully tested by rendering FaceList with different sides counts and verifying buttons work correctly, are disabled at boundaries (MIN_SIDES, MAX_SIDES), and preserve existing face data.

**Acceptance Scenarios**:

1. **Given** a user is editing a die with 6 faces, **When** they click "Add Face" at the bottom of the face list, **Then** a new face (face 7) is added with default values and existing faces remain unchanged
2. **Given** a user is editing a die with 6 faces, **When** they click "Remove Face" at the bottom of the face list, **Then** the last face (face 6) is removed and the first 5 faces remain unchanged
3. **Given** a user is editing a die with MAX_SIDES (101) faces, **When** they view the face list, **Then** the "Add Face" button is disabled with a clear indicator
4. **Given** a user is editing a die with MIN_SIDES (2) faces, **When** they view the face list, **Then** the "Remove Face" button is disabled with a clear indicator
5. **Given** a user clicks "Add Face" multiple times, **When** each face is added, **Then** the sides count in the configuration panel updates accordingly
6. **Given** a user has customized faces and clicks "Remove Face", **When** the last face is removed, **Then** all remaining faces preserve their custom values

---

### User Story 6 - Form Reset on Create Die Navigation (Priority: P1)

Users should see a blank die creation form when they click "Create Die" in the navigation, even if they were previously editing a die, ensuring a fresh start for creating new dice.

**Why this priority**: When users are editing a die and click "Create Die" in the header navigation, they expect to start creating a new die from scratch. Currently, the form retains the previous die's data because the route change doesn't trigger a proper state reset. This creates confusion and forces users to manually reset or reload the page.

**Independent Test**: Can be fully tested by navigating to edit a die (`/?id=123`), customizing some values, then clicking "Create Die" in the header, and verifying a blank form appears.

**Acceptance Scenarios**:

1. **Given** a user is editing a die with custom values at `/?id=123`, **When** they click "Create Die" in the header, **Then** the form resets to a blank 6-sided die with default values
2. **Given** a user has unsaved changes to a die, **When** they click "Create Die", **Then** the form resets without prompting (unsaved changes are intentionally discarded for navigation)
3. **Given** a user creates a new die from a reset form, **When** they save it, **Then** a new die with a unique ID is created (not overwriting the previously edited die)
4. **Given** a user is on the create page without an ID (`/`), **When** they click "Create Die", **Then** the form remains as-is or resets to blank (same behavior as initial load)
5. **Given** a user navigates from library to edit (`/?id=123`) then back to create (`/`), **When** the transitions occur, **Then** the form properly reflects the correct die state at each step

---

### User Story 7 - Duplicate Die and Die Set (Priority: P2) ✅ COMPLETE

**Status**: Implemented and tested (2025-11-04)
- Implementation: DuplicateIcon, useDiceStorage.duplicateDie/duplicateDiceSet, LibraryCard buttons, Editor buttons
- Tests: tests/integration/duplicate-functionality.test.tsx (5 tests covering all scenarios)
- All 302 tests passing

Users should be able to quickly duplicate existing dice and die sets to create variations without starting from scratch, saving time when creating similar items with small modifications.

**Why this priority**: When users want to create variations of existing dice or sets (e.g., a red version of a blue die, or a modified copy of a set), they currently must manually recreate everything from scratch. A duplicate feature allows users to leverage existing work, significantly improving productivity for common workflows.

**Independent Test**: Can be fully tested by creating a die/set, using the duplicate feature from various locations (editor, library), and verifying a new copy is created with a unique ID and modified name.

**Acceptance Scenarios**:

1. **Given** a user is editing an existing die in DieEditor, **When** they click the "Duplicate" button, **Then** a new die is created with all the same properties (sides, colors, faces, content type) but with a new unique ID and the name appended with " (Copy)"
2. **Given** a user is editing an existing die set in DieSetEditor, **When** they click the "Duplicate" button, **Then** a new set is created with all the same dice and properties but with a new unique ID and the name appended with " (Copy)"
3. **Given** a user views their dice library, **When** they click the duplicate icon button on a die card, **Then** the die is duplicated immediately and appears in the library with " (Copy)" appended to its name
4. **Given** a user views their sets library, **When** they click the duplicate icon button on a set card, **Then** the set is duplicated immediately and appears in the library with " (Copy)" appended to its name
5. **Given** a user duplicates a die or set, **When** the duplication completes, **Then** a success toast notification appears confirming the duplication
6. **Given** a user duplicates a die from the library, **When** the duplicate is created, **Then** the new die's timestamp is set to the current time (not copied from original)
7. **Given** a user duplicates a die with a very long name, **When** " (Copy)" is appended, **Then** the total name length is truncated to MAX_NAME_LENGTH if necessary

---

### Edge Cases

- **Rapid form submission**: Form submit handler should be debounced or disabled after first submission attempt to prevent race conditions. Validation state persists between attempts.
- **Browser autofill**: Autofill triggers change/input events, marking fields as touched per FR-007. Validation runs on subsequent blur as normal.
- **Long die names on mobile**: Text should wrap or truncate with ellipsis. Layout remains single-column per FR-009. Card width constrained by viewport.
- **Browser back/forward navigation**: Validation state is not persisted across navigation. Forms reset to initial state (no errors shown).
- **Nested scrolling on different input devices**: After fix (FR-015), no nested scroll containers exist, so behavior is identical across touchpad/mouse/touch - all scroll the main page.
- **Window resize during scrolling**: Layout responds to breakpoint changes (768px) per FR-013. Progressive loading state persists (visible count unchanged).
- **Portrait/landscape orientation changes**: Responsive layout adapts per FR-013. Element order maintained on mobile (<768px). Tested in T038.
- **Validation persistence across navigation**: Not persisted. Treated as deferred to implementation - forms reset on route change.
- **Changing sides to same value**: No changes occur. Faces remain identical. No re-rendering or validation triggered.
- **Changing sides while content type is being changed**: Updates are independent. If both change simultaneously, faces are regenerated based on new content type (per existing FR-027 behavior). Face preservation only applies when sides change in isolation.
- **Decreasing sides below current face count**: Faces array is truncated to new length. Removed faces are permanently deleted and cannot be recovered by increasing sides again.
- **Rapidly changing sides multiple times**: Each change preserves existing faces up to the new count. Final state depends on last sides value set.

## Requirements *(mandatory)*

### Functional Requirements

#### Form Validation Timing
- **FR-001**: System MUST NOT display validation error messages when a form first loads or appears
- **FR-002**: System MUST NOT display validation errors when a user focuses on an empty field without typing
- **FR-003**: System MUST display validation errors when a field loses focus (onBlur event) after a user has interacted with it (typed, pasted, or cleared content)
- **FR-004**: System MUST display all validation errors when a user attempts to submit an invalid form
- **FR-005**: System MUST immediately hide validation errors when the user corrects the invalid input and the field loses focus
- **FR-006**: System MUST track which fields have been "touched" (interacted with) to determine when to show validation on blur
- **FR-007**: System MUST handle browser autofill as a form of interaction that triggers validation on subsequent blur (triggered by change or input events from autofill, followed by blur event)

#### Mobile Form Layout
- **FR-008**: System MUST display DieEditor elements in task-oriented order on mobile viewports (768px and below): configuration panel, then face editor, then action buttons
- **FR-009**: System MUST use single-column vertical layout for DieEditor on viewports 768px wide and below
- **FR-010**: System MUST ensure all interactive elements meet minimum accessibility size requirements (44x44px touch targets)
- **FR-011**: System MUST position face editor visually before action buttons in mobile layout to follow natural top-to-bottom workflow
- **FR-012**: System MUST apply responsive spacing between form sections that works on small screens
- **FR-013**: System MUST maintain logical element order in both portrait and landscape orientations on mobile devices (up to 768px wide)
- **FR-014**: System MUST use multi-column grid layout on desktop (768px and above) with face editor in center column and action buttons in left column

#### Scrolling Behavior
- **FR-015**: System MUST eliminate all nested scrollable containers in favor of natural page scrolling
- **FR-016**: System MUST allow content areas to expand vertically to accommodate all items without internal scrolling, using progressive loading ("Show more" controls) when item count exceeds reasonable page length thresholds
- **FR-017**: System MUST ensure all lists and card grids flow naturally with the page scroll
- **FR-018**: System MUST redesign layouts to avoid fixed-height containers with overflow scrolling
- **FR-019**: System MUST ensure scroll gestures on all devices always control the main page scroll
- **FR-020**: System MUST maintain visual hierarchy and grouping while eliminating nested scroll areas
- **FR-021**: System MUST implement progressive loading controls (e.g., "Show 50 more" button) for libraries exceeding initial display threshold of 50 items to prevent excessively long pages

#### Face Data Preservation
- **FR-022**: System MUST preserve existing face data when the number of sides is increased (e.g., from 5 to 10 sides)
- **FR-023**: System MUST preserve existing face data when the number of sides is decreased (e.g., from 10 to 5 sides), retaining only the first N faces
- **FR-024**: System MUST add new faces with default values (based on content type) when sides count is increased
- **FR-025**: System MUST preserve custom face values, colors, and other properties when sides count changes
- **FR-026**: System MUST maintain face IDs and ordering when preserving faces during sides count changes
- **FR-027**: System MUST regenerate all faces only when content type is changed (existing behavior, not modified by this fix)
- **FR-028**: System MUST apply face preservation logic for all content types (number, text, color)

#### Inline Face Management
- **FR-029**: System MUST provide "Add Face" button at the bottom of the face list that increases sides count by 1
- **FR-030**: System MUST provide "Remove Face" button at the bottom of the face list that decreases sides count by 1
- **FR-031**: System MUST disable "Add Face" button when sides count equals MAX_SIDES (101)
- **FR-032**: System MUST disable "Remove Face" button when sides count equals MIN_SIDES (2)
- **FR-033**: System MUST update the sides count in the configuration panel when inline face management buttons are used
- **FR-034**: System MUST preserve existing face data when using inline face management buttons (same behavior as changing sides in config panel)
- **FR-035**: System MUST show clear visual feedback (button state, tooltip, or label) when buttons are disabled at boundaries

#### Form Reset on Navigation
- **FR-036**: System MUST reset the die editor form to a blank default die when navigating from an edit view (`/?id=xyz`) to the create view (`/`)
- **FR-037**: System MUST detect URL parameter changes (presence or absence of `id` parameter) and trigger appropriate form state updates
- **FR-038**: System MUST clear any loaded die data when the `id` URL parameter is removed
- **FR-039**: System MUST reset validation state when form is reset via navigation
- **FR-040**: System MUST allow users to navigate between create and edit views without page reload (client-side routing)
- **FR-041**: System MUST create a new unique ID when saving a die after form reset (not reuse the previously edited die's ID)

#### Die and Set Duplication
- **FR-042**: System MUST provide a "Duplicate" button in DieEditor when editing an existing die (button not shown when creating a new die)
- **FR-043**: System MUST provide a "Duplicate" button in DieSetEditor when editing an existing set (button not shown when creating a new set)
- **FR-044**: System MUST provide a duplicate icon button on die library cards alongside the delete button
- **FR-045**: System MUST provide a duplicate icon button on set library cards alongside the delete button
- **FR-046**: System MUST create a complete copy of the die/set with all properties preserved (faces, colors, sides, content type, dice in set, etc.)
- **FR-047**: System MUST generate a new unique ID for the duplicated die/set (never reuse the original ID)
- **FR-048**: System MUST append " (Copy)" to the duplicated die/set's name
- **FR-049**: System MUST set the duplicated die/set's createdAt and updatedAt timestamps to the current time
- **FR-050**: System MUST truncate the name to MAX_NAME_LENGTH if appending " (Copy)" would exceed the limit
- **FR-051**: System MUST show a success toast notification after successful duplication
- **FR-052**: System MUST save the duplicated die/set to storage immediately (IndexedDB via localforage)
- **FR-053**: System MUST update the library display to show the new duplicate without requiring a page refresh

### Key Entities

- **FormValidationState**: Tracks interaction state for form fields and manages when validation messages should be displayed based on user interaction (includes touchedFields Set, submitAttempted boolean, errors Map)
- **ResponsiveLayout**: Defines responsive breakpoints and element ordering for mobile vs desktop layouts
- **LayoutContainer**: Defines content areas that expand naturally with page flow without internal scrolling

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero validation error messages appear on form load before user interaction
- **SC-002**: Validation errors appear within 100ms of a field losing focus after user interaction
- **SC-003**: Users report 80% reduction in confusion about premature error messages (based on usability testing - post-launch validation)
- **SC-004**: Face editor appears before action buttons in mobile viewport (768px and below) 100% of the time
- **SC-005**: All mobile interactive elements meet or exceed 44x44px minimum size for accessibility
- **SC-006**: Mobile users can complete die editing workflow in natural top-to-bottom order without backtracking to find controls
- **SC-007**: Users can scroll the main page without encountering any nested scrollable areas that trap scroll gestures
- **SC-008**: Scroll interactions feel natural and responsive with zero user reports of "stuck scrolling" or scroll conflicts
- **SC-009**: Mobile users report 90% task completion rate for die creation without confusion about element order (post-launch validation via user testing)
- **SC-010**: User complaints about "stuck scrolling" or "can't scroll past a section" reduce to zero after nested scroll improvements
- **SC-011**: When sides count increases, 100% of existing face data is preserved with correct values, colors, and properties
- **SC-012**: When sides count decreases, the first N faces (where N = new sides count) are preserved with 100% data integrity
- **SC-013**: New faces added when increasing sides have appropriate default values based on content type (numbers for 'number', empty for 'text', default colors for 'color')
- **SC-014**: Zero data loss incidents reported when users change sides count during die editing
- **SC-015**: Face preservation works correctly across all three content types (number, text, color) with 100% accuracy
- **SC-016**: Inline face management buttons (Add/Remove) are visible and accessible at the bottom of face list 100% of the time
- **SC-017**: Buttons are correctly disabled when at MIN_SIDES (2) or MAX_SIDES (101) boundaries with clear visual feedback
- **SC-018**: Clicking "Add Face" adds exactly one face with correct default values and preserves all existing faces
- **SC-019**: Clicking "Remove Face" removes exactly one face (the last one) and preserves all remaining faces
- **SC-020**: Sides count in configuration panel updates immediately (within 100ms) when inline buttons are used
- **SC-021**: Navigating from edit view to create view (`/?id=123` → `/`) resets form to blank die 100% of the time
- **SC-022**: Form reset completes within 200ms of navigation, providing immediate visual feedback
- **SC-023**: Saved dice after form reset have unique IDs, never overwriting previously edited dice
- **SC-024**: Zero reports of "stuck" form data when navigating between create and edit views
- **SC-025**: Duplicate button is visible and functional in DieEditor and DieSetEditor when editing existing items 100% of the time
- **SC-026**: Duplicate icon buttons are visible on all library cards alongside delete buttons with consistent styling
- **SC-027**: Duplicated items have unique IDs, correct timestamps, and proper " (Copy)" naming 100% of the time
- **SC-028**: Duplication completes within 500ms and shows success feedback immediately
- **SC-029**: Users report 95% satisfaction with duplicate workflow efficiency (post-launch validation)
