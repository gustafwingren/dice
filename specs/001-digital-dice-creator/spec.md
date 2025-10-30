# Feature Specification: Digital Dice Creator

**Feature Branch**: `001-digital-dice-creator`  
**Created**: 2025-10-17  
**Status**: Draft  
**Input**: User description: "Build an application that can generate custom digital dice. In the app you can create from one to six dice in the same set. You can choose the colour of each die. You can choose to use numbers, colours or write letters or words on the different sides of the dice. Each die can have an unlimited number of sides, but at least two. When you have created the die you can save it, either as a single die or choose several dice to save as a set. When you save a set or a die you can name it whatever you want. When you have saved you die or set of dice you can share it with others by sending them a link to the page."

## Clarifications

### Session 2025-10-17

- Q: Data Persistence and User Identity - The spec mentions users can save dice and retrieve them "in future sessions" but doesn't specify whether users need accounts or if data is stored locally. → A: Local browser storage with optional account upgrade for cross-device sync
- Q: Share Link Data Storage - When users create shareable links, the dice configuration needs to be accessible to anyone with the link. How should shared dice data be stored? → A: Encode dice configuration in URL parameters/hash (e.g., base64 encoded JSON in URL fragment)
- Q: Maximum Die Sides Practical Limit - The spec states "unlimited number of sides" but also mentions handling 100+ sides as an edge case. What's a reasonable maximum to support for the initial release? → A: 101 sides maximum (to support 0-100 numbering)
- Q: Editing Saved Dice Behavior - When users load and edit a previously saved die (FR-013), should edits modify the original or create a new copy? → A: ~~Always create a new copy (non-destructive, original is immutable)~~ **UPDATED 2025-10-27**: Update existing die (better UX). Copy behavior preserved for future "import from friend" feature.
- Q: Die Face Content Character Limit - For text content on die faces (words/letters), what's a reasonable character limit per face to ensure readability? → A: 20 characters per face (short phrases)

### Session 2025-10-20

- Q: Color Content Display - When a die face has color as content, how should it be displayed? → A: Display as solid color fill on the face, not as text showing the color name

### Session 2025-10-22

- Q: Design System Color Palette Scope - How many colors should the design system include? → A: Moderate (5-7 colors) - Primary, secondary, success, error, warning, + grays with semantic names
- Q: 3D Dice Rendering Method - What technology should be used to implement realistic 3D dice effects? → A: CSS 3D transforms with shadows - perspective/rotate transforms + layered box-shadows for depth
- Q: Toast Notification Triggers and Behavior - How should toast notifications behave and when should they appear? → A: Auto-dismiss after 3 seconds, bottom-right position, stacking for multiple toasts. Primary triggers: save success, share link copied, delete confirmation, load success
- Q: Dark Mode MVP Scope - Should dark mode be included in the initial MVP release? → A: Post-MVP enhancement - Defer to future phase after initial release
- Q: Animation Performance Target Scope - What animations must meet 60fps performance target for MVP? → A: 60fps for micro-interactions only (hover, focus, button presses, page transitions). Dice roll animations (Phase 7) have separate performance validation.

### Session 2025-10-27

- Q: Edit Behavior Implementation - Should clicking "Edit" on a saved die create a new copy or update the original? → A: Update the original (preserves ID, single die after save). Original FR-013 answer was theoretical; actual UX requires update behavior. Copy functionality still supported for future "import from friend" feature.
- Q: Dice Set Save Error - Getting "Referenced dice not found" error when saving edited sets. How to handle dice IDs when editing? → A: Track original dice IDs when loading for edit. When saving, map back to original IDs (not copied IDs). Gracefully filter out any deleted dice.
- Q: Roll Result Text Visibility - Should all text content be fully visible in roll results? → A: Yes, roll results MUST display complete text content without truncation, using responsive text sizing and wrapping if needed to ensure full readability.
- Q: Share Page Experience - What should users see when opening a shared die/set link? → A: Simplified view with die placeholder/preview, "Roll" button, and "Save a Copy" button. No full editor interface. Focus on trying the die and optionally saving it.
- Q: Die Preview Visibility - Should the die visualization preview be shown during creation/editing? → A: No, remove die visualization from creator/editor pages. Users see the die through roll results and in the share view, not during editing.
- Q: Randomness Quality Validation - What measurable criterion should validate the cryptographic random number generation quality? → A: Chi-squared test with p>0.05 threshold over 1000+ rolls per die type
- Q: Whitespace-Only Face Content - How should the system handle face inputs containing only whitespace or special characters? → A: Reject save and require all faces have content (strict validation)
- Q: Storage Quota Exceeded - What happens when localStorage quota is exceeded during save? → A: Display user-friendly error message "Storage full - please delete old dice to continue" with link to library
- Q: Screen Reader Roll Animation - How should roll animations be made accessible to screen reader users? → A: Use aria-live="polite" region that announces "Rolling..." then final result after animation
- Q: Special Characters in Face Content - Should emoji/unicode and line breaks be allowed in text face content? → A: Emoji/unicode allowed, line breaks stripped

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Single Custom Die (Priority: P1)

A user visits the application and creates a single custom die by choosing the number of sides (minimum 2), selecting a color, and adding content (numbers, colors, letters, or words) to each side. The user can immediately see a visual representation of their die.

**Why this priority**: This is the core value proposition - creating a custom die. Without this, the application has no purpose. It delivers immediate value as users can create and visualize a die in a single session.

**Independent Test**: Can be fully tested by creating a die with various configurations (2 sides, 6 sides, 20 sides), different content types (numbers vs. text), and different colors, then verifying the die renders correctly on screen.

**Acceptance Scenarios**:

1. **Given** the user is on the die creator page, **When** they select 6 sides and choose a blue color, **Then** a blue die template with 6 editable faces appears
2. **Given** a die with 6 faces is displayed, **When** the user enters numbers 1-6 on each face, **Then** each face displays the corresponding number clearly
3. **Given** a die with 4 faces is displayed, **When** the user enters custom words ("Yes", "No", "Maybe", "Later") on each face, **Then** each face displays the word with appropriate text sizing
4. **Given** a die with 6 faces is displayed, **When** the user selects "color" as the content type and chooses colors (red, blue, green, yellow, orange, purple) for each face, **Then** each face is filled with the selected solid color (not the text word for the color)
5. **Given** a die is being configured, **When** the user attempts to create a die with less than 2 sides, **Then** the system prevents creation and displays a validation message
6. **Given** the user has entered content on all faces, **When** they preview the die, **Then** the die is rendered as clear visual representation showing all faces

---

### User Story 2 - Save and Name Individual Die (Priority: P2)

A user creates a custom die and saves it with a custom name for future use or sharing. The die is persisted and can be retrieved later.

**Why this priority**: Saving enables reuse and sharing, but the core creation experience (P1) must work first. This adds persistence value and enables the sharing functionality.

**Independent Test**: Create a die, save it with a specific name (e.g., "Decision Maker"), refresh the page or return later, and verify the die can be retrieved with the same configuration.

**Acceptance Scenarios**:

1. **Given** the user has created a custom die, **When** they click "Save Die" and enter the name "Lucky Red", **Then** the die is saved with that name and confirmation is displayed
2. **Given** the user has saved a die named "Lucky Red", **When** they navigate to their saved dice list, **Then** "Lucky Red" appears with the name of the die
3. **Given** the user has saved multiple dice, **When** they select "Lucky Red" from the list, **Then** the die loads with all its original properties (color, sides, face content)
4. **Given** the user attempts to save a die, **When** they leave the name field empty, **Then** the system provides a default name (e.g., "Custom Die 1") or prompts for a name

---

### User Story 3 - Create and Save Dice Set (Priority: P3)

A user creates multiple dice (1-6 dice in a set), configures each one individually with different colors and face content, and saves them together as a named set.

**Why this priority**: Sets add more complex functionality building on individual die creation. This is valuable for games requiring multiple dice but is not essential for MVP.

**Independent Test**: Create 3 different dice with different colors and face content, save them as a set named "RPG Starter Set", then retrieve the set and verify all 3 dice are present with correct configurations.

**Acceptance Scenarios**:

1. **Given** the user is on the die creator page, **When** they click "Add Die to Set" (up to 6 times), **Then** multiple die editors appear allowing independent configuration of each die
2. **Given** the user has created 3 dice with different configurations, **When** they click "Save as Set" and name it "Game Night", **Then** all 3 dice are saved together under that set name
3. **Given** the user has created a set with 6 dice, **When** they attempt to add a 7th die, **Then** the system prevents adding more and displays a message indicating the 6-die limit
4. **Given** the user has saved a set named "Game Night", **When** they load that set, **Then** all dice in the set appear with their individual configurations intact

---

### User Story 4 - Share Die or Set via Link (Priority: P4)

A user saves a die or set and generates a shareable link that others can use to view or copy the dice configuration. Recipients can view the shared dice without needing an account.

**Why this priority**: Sharing is the social/collaborative feature but requires the save functionality (P2/P3) to work first. This extends the application's reach but isn't core to individual use.

**Independent Test**: Save a die named "Daily Decision", generate a share link, open the link in an incognito browser (or share with another person), and verify the die appears with the correct configuration and can be viewed or copied.

**Acceptance Scenarios**:

1. **Given** the user has saved a die named "Daily Decision", **When** they click "Share" and copy the generated link, **Then** a unique URL is created and copied to clipboard
2. **Given** another user receives the share link, **When** they open the link in their browser, **Then** they see a simplified share view with: die placeholder/preview, "Roll Die" button to try it, and "Save a Copy" button to add it to their collection
3. **Given** a recipient views a shared die on the share page, **When** they click "Roll Die", **Then** the die rolls and displays the result with full text visibility
4. **Given** a recipient wants to modify a shared die, **When** they click "Save a Copy", **Then** a new die is created in their local storage that they can edit
5. **Given** a user shares a set of 4 dice, **When** a recipient opens the share link, **Then** the share view displays all 4 dice placeholders with "Roll All Dice" and "Save a Copy" buttons

---

### User Story 5 - Roll Dice Animation (Priority: P5)

A user can click a "Roll" button on any saved die or set to see an animated roll that randomly selects and displays one face of each die in the set.

**Why this priority**: This adds interactive fun and practical utility but requires saved dice to exist first. It's enhancement functionality that makes the tool more engaging.

**Independent Test**: Load a saved die with 6 numbered faces, click "Roll" multiple times, and verify that different faces appear randomly with smooth animation and that all faces appear over multiple rolls (proving randomness).

**Acceptance Scenarios**:

1. **Given** the user has a saved 6-sided die displayed, **When** they click "Roll Die", **Then** an animation plays showing the die rolling and landing on one random face
2. **Given** the user has a set of 3 dice displayed, **When** they click "Roll Set", **Then** all 3 dice animate simultaneously and each lands on a random face
3. **Given** the user rolls a die multiple times, **When** viewing the results over 20+ rolls, **Then** the distribution appears reasonably random (each face appears at least once)
4. **Given** a die is currently rolling, **When** the user clicks "Roll" again, **Then** the current animation completes

---

### Edge Cases

- What happens when a user enters text approaching the 20-character limit? System should provide character count feedback and prevent input beyond the limit.
- What happens when a user creates a die with many sides (e.g., 101 sides)? System MUST handle large numbers of sides with scrollable face list (virtualized for performance), batch editing options for sequential numbering, and maintain <60s creation time (SC-001) even at maximum 101 sides.
- What happens when a user tries to access a shared link for a die that has been deleted? System should display a friendly "Die not found" message.
- What happens when a user leaves face content blank on some faces? System should require all faces have non-empty content before allowing save, providing inline validation errors for any empty or whitespace-only faces.
- What happens when multiple users access the same shared link simultaneously? System should handle concurrent views without performance degradation.
- What happens when a user tries to save without configuring any faces? System should either require at least one face to have content or allow saving with blank template.
- What happens when browser storage quota (5-10MB) is exceeded? System MUST display error message "Storage full - please delete old dice to continue" with link to library, preventing save until user frees space.
- What happens when a user edits a dice set and one of the dice has been deleted from storage? System MUST gracefully filter out deleted dice from the set and save with remaining dice.
- What happens when running E2E tests in non-Chromium browsers (Firefox, WebKit)? Clipboard API tests MUST be skipped as the API is not supported in these browsers. Text/color dice face selector tests are currently skipped due to UI implementation differences (future enhancement to fix).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create between 1 and 6 individual dice in a single set
- **FR-004**: System MUST allow users to add content to each face of a die, supporting three content types: numbers, letters/words (maximum 20 characters per face, emoji/unicode allowed, line breaks automatically stripped), or solid colors. System MUST validate that all faces have non-empty content before allowing save (whitespace-only input is rejected).
- **FR-004a**: When color content type is selected for a face, the system MUST display the face as a solid color fill (not as text displaying the color name) face), or solid colors. System MUST validate that all faces have non-empty content before allowing save (whitespace-only input is rejected).
- **FR-004a**: When color content type is selected for a face, the system MUST display the face as a solid color fill (not as text displaying the color name) face), or solid colors
- **FR-004a**: When color content type is selected for a face, the system MUST display the face as a solid color fill (not as text displaying the color name)
- **FR-005**: System MUST NOT display die visualization preview during creation/editing (die preview removed from editor pages; users see dice through roll results and share view only)
- **FR-006**: System MUST allow users to save a single die with a custom name (users choose any name for saved dice)
- **FR-007**: System MUST allow users to save multiple dice together as a named set (users choose any name for saved sets)
- **FR-009**: System MUST generate a unique shareable URL for each saved die or set by encoding the complete dice configuration in the URL (using URL parameters or hash fragment with base64/compressed JSON)
- **FR-010**: System MUST display a simplified share view for shared dice/sets with: die placeholder/preview, "Roll" button, and "Save a Copy" button (no full editor interface)
- **FR-011**: System MUST persist saved dice and sets to browser local storage (localStorage/IndexedDB) so they can be retrieved in future sessions on the same device. System MUST handle storage quota exceeded errors by displaying user-friendly error message "Storage full - please delete old dice to continue" with navigation link to library.
- **FR-011a**: System SHOULD provide optional user account creation for cross-device synchronization of saved dice (Note: Deferred to post-MVP phase; not included in initial task breakdown)
- **FR-011a**: System SHOULD provide optional user account creation for cross-device synchronization of saved dice (Note: Deferred to post-MVP phase; not included in initial task breakdown)
- **FR-012**: System MUST display a list or gallery of all dice and sets saved by a user in their local browser storage
- **FR-013**: System MUST allow users to load previously saved dice or sets and make edits, which MUST update the existing die/set (preserves original ID). Copy behavior is still supported when importing shared dice that don't exist in user's storage.
- **FR-014**: System MUST validate that dice have at least 2 sides before allowing save
- **FR-015**: System MUST validate that at least one die exists in a set before allowing save
- **FR-016**: System MUST provide a way to copy share links to clipboard or display them for manual copying
- **FR-017**: System MUST handle text display on die faces by automatically sizing content to fit (maximum 20 characters per face enforced at input)
- **FR-018**: System MUST allow users to delete saved dice or sets
- **FR-020**: System MUST implement roll animation with spinning 3D cube effect (1.5 second duration) using GPU-accelerated CSS transforms, followed by bounce-in result display. Roll animations MUST be accessible via aria-live="polite" region announcing "Rolling..." followed by final result.
- **FR-020a**: System MUST display roll results with full text visibility, using responsive text sizing and wrapping to ensure complete content is readable without truncationay
- **FR-020a**: System MUST display roll results with full text visibility, using responsive text sizing and wrapping to ensure complete content is readable without truncation
- **FR-021**: System MUST swap "Roll Die"/"Roll All Dice" button with "Roll Again" button based on roll state to prevent duplicate buttons during result display
- **FR-022**: System MUST support URL-based navigation for loading dice/sets for edit using query parameters (/?id=DIE_ID for individual dice, /set?id=SET_ID for dice sets)
- **FR-023**: System MUST preserve original dice IDs when saving edited dice sets, and gracefully handle deleted dice by filtering them from the set
- **FR-024**: System MUST use cryptographically secure random number generation (crypto.getRandomValues) with rejection sampling to avoid modulo bias in die rolls

### Visual Design Requirements

- **FR-025**: System MUST implement a consistent design system with a semantic color palette (5-7 colors: primary, secondary, success, error, warning, plus gray scale), defined typography scale, spacing system, and shadow/elevation guidelines
- **FR-026**: System MUST provide polished visual presentation of dice using CSS 3D transforms (perspective, rotateX/Y) with layered box-shadows for depth and realistic gradients
- **FR-027**: System MUST include micro-interactions for all interactive elements including hover states, focus animations, and button press effects
- **FR-028**: System MUST implement smooth transitions for micro-interactions (hover, focus, button presses, page transitions) targeting 60fps performance on desktop browsers. Dice roll animations (User Story 5) have separate performance requirements.
- **FR-029**: System MUST provide loading states and skeleton screens for asynchronous operations to maintain perceived performance
- **FR-030**: System MUST display helpful empty states with illustrations or messages when no dice exist in library
- **FR-031**: System MUST implement toast notifications positioned bottom-right with 3-second auto-dismiss for user action feedback (save success, share link copied, delete confirmation, load success), supporting stacking for multiple simultaneous toasts. Validation errors MUST use inline messages instead of toasts.
- **FR-032**: System SHOULD support dark mode with appropriate color contrast and theme persistence (Note: Post-MVP enhancement, deferred to Phase 9+)

### Key Entities

- **Die**: Represents a single die with properties including: number of sides (minimum 2, maximum 101), color, face content (array of text/numbers/colors for each face), name, creation timestamp, unique identifier
- **DiceSet** (also "Dice Set" in user-facing text): Represents a collection of 1-6 dice with properties including: name, array of Die objects, creation timestamp, unique identifier. Note: Technical references (code, types) use "DiceSet" (one word); user-facing documentation may use "Dice Set" (two words) for readability.
- **Face**: Represents one side of a die with properties including: content (text up to 20 characters, number, or color value where color is displayed as solid fill not text), content type (text/number/color), face position/index
- **Share Link**: Represents a URL containing encoded dice/set configuration in the URL fragment or parameters, enabling stateless public access without authentication or server-side storage

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a basic 6-sided numbered die from start to finish in under 60 seconds
- **SC-002**: Users can create and save a custom die with unique properties in under 2 minutes
- **SC-003**: Users can successfully share a die and have another person view it via link with 100% success rate
- **SC-004**: 90% of users successfully create at least one die on their first visit
- **SC-005**: The die creation interface works seamlessly on mobile devices (320px width) and desktop (1920px width)
- **SC-006**: Page load time for die creator is under 2 seconds on 3G connections
- **SC-007**: Share links remain functional and load the correct die configuration with 99.9% reliability
- **SC-008**: Users can create dice with up to 101 sides without performance degradation or UI issues
- **SC-009**: All interactive elements (buttons, color pickers, text inputs) are accessible via keyboard navigation
- **SC-010**: Color contrast between die faces and content meets WCAG AA standards (4.5:1 minimum) for light mode
- **SC-011**: 85% of users who create a die proceed to save it
- **SC-012**: Screen readers can successfully announce all die properties, configurations, and roll results via aria-live regions during animations
- **SC-013**: UI appears polished and professional with consistent visual design across all components and pages
- **SC-015**: Roll animation completes in 1.5 seconds with smooth GPU-accelerated transforms on both desktop and mobile (320px viewport tested)
- **SC-016**: Cryptographic random number generation passes chi-squared test (p>0.05) over 1000+ rolls per die type, demonstrating statistically uniform distribution indistinguishable from true randomnessed)
- **SC-016**: Over 100 die rolls, each face appears at least once, demonstrating true randomness from cryptographic random number generation

