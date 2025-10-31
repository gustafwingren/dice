# Tasks: Bug Fixes and General Improvements

**Feature Branch**: `002-bug-fixes-improvements`  
**Input**: Design documents from `/specs/002-bug-fixes-improvements/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-contracts.md

**Tests**: All implementations MUST be testable. Existing tests must be updated to reflect behavioral changes, and new tests should be added to verify bug fixes work correctly.

**Testing Philosophy**: 
- Every bug fix must have a test that would have caught the original bug
- Update existing tests when behavior changes
- Add new tests for new functionality (validation timing, progressive loading)
- Ensure each user story can be independently tested

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions that all three user stories depend on

- [X] T001 [P] Add FormValidationState interface to src/types/index.ts
- [X] T002 [P] Add createFormValidationState factory function to src/types/index.ts
- [X] T003 [P] Add ProgressiveLoadState interface to src/types/index.ts

**Checkpoint**: Type definitions available for all components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Hook updates that provide validation capabilities to all form components

**⚠️ CRITICAL**: These hooks must be complete before US1 or US2 components can be updated

- [X] T004 Add validationState state to useDieState hook in src/hooks/useDieState.ts
- [X] T005 Add markFieldTouched method to useDieState hook in src/hooks/useDieState.ts
- [X] T006 Add shouldShowError method to useDieState hook in src/hooks/useDieState.ts
- [X] T007 Add attemptSubmit method to useDieState hook in src/hooks/useDieState.ts
- [X] T008 [P] Add validationState state to useDiceSetState hook in src/hooks/useDiceSetState.ts
- [X] T009 [P] Add markFieldTouched method to useDiceSetState hook in src/hooks/useDiceSetState.ts
- [X] T010 [P] Add shouldShowError method to useDiceSetState hook in src/hooks/useDiceSetState.ts
- [X] T011 [P] Add attemptSubmit method to useDiceSetState hook in src/hooks/useDiceSetState.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Premature Validation Error Display (Priority: P1) 🎯 MVP

**Goal**: Prevent validation errors from appearing until users have interacted with form fields, creating a welcoming first-time experience

**Independent Test**: Open die creation form → verify no errors on load → focus field without typing → verify no error → type invalid value and blur → verify error appears → fix value → verify error clears

**Success Criteria** (from spec.md):
- SC-001: Zero validation error messages appear on form load before user interaction
- SC-002: Validation errors appear within 100ms of a field losing focus after user interaction
- SC-003: Users report 80% reduction in confusion about premature error messages

### Tests for User Story 1

**CRITICAL**: Update/add tests to verify validation timing behavior

- [X] T012 [P] [US1] Update existing DieEditor tests to verify no errors on initial render in tests/integration/die-persistence.test.tsx
- [X] T013 [P] [US1] Add test: errors appear after blur on invalid field in tests/integration/die-persistence.test.tsx
- [X] T014 [P] [US1] Add test: errors clear when field becomes valid in tests/integration/die-persistence.test.tsx
- [X] T015 [P] [US1] Add test: all errors shown on submit attempt in tests/integration/die-persistence.test.tsx
- [X] T016 [P] [US1] Update existing DiceSetEditor tests to verify no errors on initial render in tests/integration/dice-set.test.tsx
- [X] T017 [P] [US1] Add test: validation timing works in DiceSetEditor in tests/integration/dice-set.test.tsx
- [X] T018 [P] [US1] Add unit tests for useDieState validation methods in tests/unit/hooks/useDieState.test.ts
- [X] T019 [P] [US1] Add unit tests for useDiceSetState validation methods in tests/unit/hooks/useDiceSetState.test.ts

### Implementation for User Story 1

- [X] T020 [P] [US1] Add onBlur handlers to all input fields in DieEditor component (src/components/dice/DieEditor.tsx)
- [X] T021 [P] [US1] Update error display logic to use shouldShowError in DieEditor component (src/components/dice/DieEditor.tsx)
- [X] T022 [P] [US1] Add ARIA attributes (aria-invalid, aria-describedby) to inputs in DieEditor component (src/components/dice/DieEditor.tsx)
- [X] T023 [P] [US1] Update error message elements with role="alert" in DieEditor component (src/components/dice/DieEditor.tsx)
- [X] T024 [P] [US1] Update submit handler to call attemptSubmit in DieEditor component (src/components/dice/DieEditor.tsx)
- [X] T025 [P] [US1] Add onBlur handlers to all input fields in DiceSetEditor component (src/components/dice/DiceSetEditor.tsx)
- [X] T026 [P] [US1] Update error display logic to use shouldShowError in DiceSetEditor component (src/components/dice/DiceSetEditor.tsx)
- [X] T027 [P] [US1] Add ARIA attributes (aria-invalid, aria-describedby) to inputs in DiceSetEditor component (src/components/dice/DiceSetEditor.tsx)
- [X] T028 [P] [US1] Update error message elements with role="alert" in DiceSetEditor component (src/components/dice/DiceSetEditor.tsx)
- [X] T029 [P] [US1] Update submit handler to call attemptSubmit in DiceSetEditor component (src/components/dice/DiceSetEditor.tsx)

**Checkpoint**: Validation timing fixed - errors only appear after user interaction - all tests passing

---

## Phase 4: User Story 2 - Form Element Order on Mobile (Priority: P2)

**Goal**: Reorder DieEditor elements on mobile so face editor appears before action buttons, following natural top-to-bottom workflow

**Independent Test**: Open DieEditor on viewport <768px → verify configuration panel at top → verify face editor in middle → verify action buttons at bottom

**Success Criteria** (from spec.md):
- **SC-004**: Face editor appears before action buttons in mobile viewport (768px and below) 100% of the time
- **SC-005**: All mobile interactive elements meet or exceed 44x44px minimum size for accessibility
- **SC-006**: Mobile users can complete die editing workflow in natural top-to-bottom order without backtracking
- SC-009: Mobile users report 90% task completion rate for die creation

### Tests for User Story 2

**CRITICAL**: Add E2E tests to verify mobile layout order

- [X] T030 [P] [US2] Add E2E test: verify element order on mobile viewport (<768px) in tests/e2e/create.spec.ts
- [X] T031 [P] [US2] Add E2E test: verify grid layout on desktop viewport (≥768px) in tests/e2e/create.spec.ts
- [X] T032 [P] [US2] Add E2E test: verify touch targets meet 44x44px minimum in tests/e2e/create.spec.ts

### Implementation for User Story 2

- [X] T033 [US2] Add responsive CSS classes to DieEditor container in src/components/dice/DieEditor.tsx (flexbox with order property for mobile)
- [X] T034 [US2] Add order: 1 to configuration section in DieEditor for mobile viewports <768px (src/components/dice/DieEditor.tsx)
- [X] T035 [US2] Add order: 2 to face editor section in DieEditor for mobile viewports <768px (src/components/dice/DieEditor.tsx)
- [X] T036 [US2] Add order: 3 to action buttons section in DieEditor for mobile viewports <768px (src/components/dice/DieEditor.tsx)
- [X] T037 [US2] Verify desktop grid layout (≥768px) remains unchanged with buttons in left column (src/components/dice/DieEditor.tsx)
- [X] T038 [US2] Test element order in both portrait and landscape orientations on mobile devices

**Checkpoint**: Mobile layout optimized - face editor before buttons on mobile, grid layout on desktop - E2E tests passing

---

## Phase 5: User Story 3 - Nested Scrolling Usability (Priority: P1)

**Goal**: Eliminate nested scrollable containers in DiceLibrary, allowing natural page scrolling with progressive loading for large lists

**Independent Test**: Open library with 60+ dice → scroll page naturally → verify no nested scroll containers → verify "Show more" button appears after 50 items

**Success Criteria** (from spec.md):
- SC-007: Users can scroll the main page without encountering any nested scrollable areas that trap scroll gestures
- SC-008: Scroll interactions feel natural and responsive with zero user reports of "stuck scrolling"
- SC-010: User complaints about "stuck scrolling" reduce to zero after nested scroll improvements

### Tests for User Story 3

**CRITICAL**: Add tests to verify scroll behavior and progressive loading

- [ ] T039 [P] [US3] Add E2E test: verify no nested scroll containers in library in tests/e2e/library.spec.ts
- [ ] T040 [P] [US3] Add E2E test: verify "Show more" button appears after 50 items in tests/e2e/library.spec.ts
- [ ] T041 [P] [US3] Add E2E test: verify progressive loading increments by 50 in tests/e2e/library.spec.ts
- [ ] T042 [P] [US3] Add integration test: verify DiceLibrary renders without overflow styles in tests/integration/dice-library.test.tsx
- [ ] T043 [P] [US3] Add unit test: verify progressive load state management in tests/unit/components/DiceLibrary.test.tsx

### Implementation for User Story 3

- [ ] T044 [P] [US3] Remove max-height and overflow-y:auto CSS from DiceLibrary container (src/components/dice/DiceLibrary.tsx)
- [ ] T045 [P] [US3] Add visibleDiceCount state (initial: 50) to DiceLibrary component (src/components/dice/DiceLibrary.tsx)
- [ ] T046 [P] [US3] Add visibleSetsCount state (initial: 50) to DiceLibrary component (src/components/dice/DiceLibrary.tsx)
- [ ] T047 [US3] Implement slice logic to show first visibleDiceCount items in DiceLibrary (src/components/dice/DiceLibrary.tsx)
- [ ] T048 [US3] Implement slice logic to show first visibleSetsCount items in DiceLibrary (src/components/dice/DiceLibrary.tsx)
- [ ] T049 [P] [US3] Add "Show More Dice" button with onClick handler (increment by 50) in DiceLibrary (src/components/dice/DiceLibrary.tsx)
- [ ] T050 [P] [US3] Add "Show More Sets" button with onClick handler (increment by 50) in DiceLibrary (src/components/dice/DiceLibrary.tsx)
- [ ] T051 [P] [US3] Add aria-label to "Show more" buttons indicating remaining count (src/components/dice/DiceLibrary.tsx)
- [ ] T052 [US3] Conditionally render "Show more" buttons only when items.length > visibleCount (src/components/dice/DiceLibrary.tsx)
- [ ] T053 [US3] Verify responsive grid layout uses grid-cols-1 md:grid-cols-2 lg:grid-cols-3 classes (src/components/dice/DiceLibrary.tsx)

**Checkpoint**: Nested scrolling eliminated - natural page scroll with progressive loading - all tests passing

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and improvements affecting multiple stories

- [ ] T054 Run all unit tests: npm test -- tests/unit/
- [ ] T055 Run all integration tests: npm test -- tests/integration/
- [ ] T056 Run all E2E tests: npm run test:e2e
- [ ] T057 Verify all existing tests still pass (no regressions)
- [ ] T058 [P] Verify all touch targets meet 44x44px minimum in DieEditor (src/components/dice/DieEditor.tsx)
- [ ] T059 [P] Verify all touch targets meet 44x44px minimum in DiceSetEditor (src/components/dice/DiceSetEditor.tsx)
- [ ] T060 [P] Verify all touch targets meet 44x44px minimum in DiceLibrary (src/components/dice/DiceLibrary.tsx)
- [ ] T061 Manual testing: Validation timing across all forms (follow quickstart.md test scenarios)
- [ ] T062 Manual testing: Mobile responsive layout at 768px breakpoint (follow quickstart.md test scenarios)
- [ ] T063 Manual testing: Scroll behavior on mobile devices (follow quickstart.md test scenarios)
- [ ] T064 Run TypeScript type checking: npm run type-check
- [ ] T065 Run Lighthouse audit: verify Performance score 90+ and Accessibility score 90+
- [ ] T066 Verify WCAG 2.1 AA compliance using jest-axe or manual audit
- [ ] T067 Update .github/copilot-instructions.md if any new patterns emerged (optional)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion (types must exist) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US3 → US2 based on P1/P2 priorities)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 and US3
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1 and US2

**Note**: US1 and US3 are both P1 priority. Either can be implemented first, or both can proceed in parallel.

### Within Each User Story

- **US1**: All tasks are [P] - can be done in parallel since they modify different sections of the same components
- **US2**: Tasks must be sequential (order: 1 → 2 → 3) but can be tested together
- **US3**: Initial tasks (T028-T030) can run in parallel, then sequential implementation, then button tasks in parallel

### Parallel Opportunities

- **Phase 1**: All 3 type definition tasks can run in parallel
- **Phase 2**: useDieState tasks (T004-T007) and useDiceSetState tasks (T008-T011) can run in parallel
- **User Story 1**: All DieEditor tasks (T012-T016) and all DiceSetEditor tasks (T017-T021) can run in parallel
- **User Story 2**: Tasks are sequential within DieEditor but entire story independent from US1/US3
- **User Story 3**: Remove CSS + add state (T028-T030) in parallel, button additions (T033-T035) in parallel
- **Phase 6**: Touch target verification tasks (T038-T040) can run in parallel
- **Cross-story parallelism**: US1, US2, and US3 can all be worked on simultaneously by different developers once Phase 2 is complete

---

## Parallel Example: Foundational Phase (Phase 2)

```bash
# Launch both hook updates in parallel (different files):
Task: "Update useDieState hook (T004-T007) in src/hooks/useDieState.ts"
Task: "Update useDiceSetState hook (T008-T011) in src/hooks/useDiceSetState.ts"
```

## Parallel Example: User Story 1

```bash
# Launch both component updates in parallel:
Task: "Update DieEditor validation (T012-T016) in src/components/dice/DieEditor.tsx"
Task: "Update DiceSetEditor validation (T017-T021) in src/components/dice/DiceSetEditor.tsx"
```

## Parallel Example: All User Stories

```bash
# If team has 3 developers, all stories can proceed simultaneously after Phase 2:
Developer A: "Implement User Story 1 (T012-T021) - Validation timing"
Developer B: "Implement User Story 2 (T022-T027) - Mobile layout"
Developer C: "Implement User Story 3 (T028-T037) - Nested scrolling"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 - Both P1)

1. Complete Phase 1: Setup (Type definitions)
2. Complete Phase 2: Foundational (Hook updates - CRITICAL)
3. Complete Phase 3: User Story 1 (Validation timing)
4. Complete Phase 5: User Story 3 (Nested scrolling)
5. **STOP and VALIDATE**: Test US1 and US3 independently
6. Deploy/demo if ready (US2 can follow later)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test validation timing independently → Deploy/Demo (MVP - P1 bug fixed!)
3. Add User Story 3 → Test scrolling independently → Deploy/Demo (Second P1 bug fixed!)
4. Add User Story 2 → Test mobile layout independently → Deploy/Demo (P2 enhancement complete!)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (or AI agents):

1. Team completes Setup + Foundational together (sequential - types then hooks)
2. Once Foundational is done:
   - Developer A: User Story 1 (T012-T021)
   - Developer B: User Story 2 (T022-T027)
   - Developer C: User Story 3 (T028-T037)
3. Stories complete and integrate independently
4. Team collaborates on Phase 6 (Polish)

### Solo Developer Strategy

1. Phase 1: Setup (30 minutes)
2. Phase 2: Foundational (2-3 hours)
3. Phase 3: User Story 1 (2-3 hours)
4. Phase 5: User Story 3 (2 hours)
5. Phase 4: User Story 2 (1 hour)
6. Phase 6: Polish (1 hour)

**Total**: 8-10 hours per quickstart.md estimate

---

## Task Summary

**Total Tasks**: 67 tasks

**By Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 8 tasks
- Phase 3 (User Story 1): 18 tasks (8 tests + 10 implementation)
- Phase 4 (User Story 2): 9 tasks (3 tests + 6 implementation)
- Phase 5 (User Story 3): 15 tasks (5 tests + 10 implementation)
- Phase 6 (Polish): 14 tasks (4 test runs + 10 validation)

**By User Story**:
- User Story 1 (Validation): 18 tasks (8 tests + 10 implementation)
- User Story 2 (Mobile Layout): 9 tasks (3 tests + 6 implementation)
- User Story 3 (Nested Scroll): 15 tasks (5 tests + 10 implementation)
- Shared/Infrastructure: 25 tasks

**Test Tasks**: 20 test tasks (8 for US1, 3 for US2, 5 for US3, 4 test runs)
**Implementation Tasks**: 47 tasks

**Parallelizable Tasks**: 38 tasks marked with [P]

**Independent Test Criteria**:
- US1: Open forms → no errors on load → interact with fields → errors appear after blur → fix errors → errors clear
- US2: Resize to <768px → face editor before buttons → resize to ≥768px → grid layout with buttons left
- US3: Scroll library with many items → natural page scroll → no nested containers → "Show more" appears after 50 items

**Suggested MVP Scope**: 
- Phase 1 (Setup) + Phase 2 (Foundational) + Phase 3 (User Story 1) + Phase 5 (User Story 3)
- This delivers both P1 priority bugs fixed (validation timing + nested scrolling)
- User Story 2 (mobile layout) can follow as P2 enhancement

---

## Notes

- [P] tasks = different files or different sections, no merge conflicts
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- **Testing is mandatory**: Update existing tests and add new tests for all bug fixes
- **Test-first recommended**: Write/update tests before implementation when possible
- Run tests frequently during development to catch regressions early
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently and run tests
- US1 and US3 are both P1 - implement together for maximum impact
- US2 is P2 - can be deferred if needed
- Follow quickstart.md for detailed implementation guidance per task
- Refer to contracts/component-contracts.md for exact method signatures
- Refer to data-model.md for type definitions and state management patterns
- **All checkpoints require passing tests** - don't proceed if tests are failing
