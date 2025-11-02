# Feature Specification: Bug Fixes and General Improvements

**Feature Branch**: `002-bug-fixes-improvements`  
**Created**: 2025-10-30  
**Status**: Draft  
**Input**: User description: "One bug is that validation is visible even before an user has entered values in form. Another is have a better order of the cards in mobile. The third issue is that scrolling inside a scrolling element is hard for enduser."

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

### User Story 2 - Form Element Order on Mobile (Priority: P2)

Users on mobile devices should see form elements in a logical task-oriented order, with action buttons (Save, Roll, Share) appearing after the face editor so users can complete data entry before seeing actions.

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

### Edge Cases

- **Rapid form submission**: Form submit handler should be debounced or disabled after first submission attempt to prevent race conditions. Validation state persists between attempts.
- **Browser autofill**: Autofill triggers change/input events, marking fields as touched per FR-007. Validation runs on subsequent blur as normal.
- **Long die names on mobile**: Text should wrap or truncate with ellipsis. Layout remains single-column per FR-009. Card width constrained by viewport.
- **Browser back/forward navigation**: Validation state is not persisted across navigation. Forms reset to initial state (no errors shown).
- **Nested scrolling on different input devices**: After fix (FR-015), no nested scroll containers exist, so behavior is identical across touchpad/mouse/touch - all scroll the main page.
- **Window resize during scrolling**: Layout responds to breakpoint changes (768px) per FR-013. Progressive loading state persists (visible count unchanged).
- **Portrait/landscape orientation changes**: Responsive layout adapts per FR-013. Element order maintained on mobile (<768px). Tested in T038.
- **Validation persistence across navigation**: Not persisted. Treated as deferred to implementation - forms reset on route change.

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

