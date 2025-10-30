# Implementation Plan: Bug Fixes and General Improvements

**Branch**: `002-bug-fixes-improvements` | **Date**: 2025-10-30 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-bug-fixes-improvements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix three critical UX bugs in the Digital Dice Creator application:
1. **Premature Validation Display**: Validation errors appear before users interact with forms (DieEditor, DiceSetEditor)
2. **Mobile Form Element Ordering**: Action buttons appear before face editor in DieEditor on mobile, disrupting natural top-to-bottom workflow
3. **Nested Scrolling Issues**: Users get trapped in nested scrollable areas (DiceLibrary)

**Technical Approach**: Implement form field touch tracking with onBlur validation, reorder DieEditor layout elements on mobile viewports using responsive CSS/flexbox, and eliminate nested scroll containers through layout redesign with progressive loading for large libraries.

## Technical Context

**Language/Version**: TypeScript 5.9.3, JavaScript ES6+  
**Primary Dependencies**: Next.js 15.5.6 (App Router, SSG), React 19.2.0, TailwindCSS 4.1.15, localforage 1.10.0  
**Storage**: IndexedDB via localforage (client-side, no backend)  
**Testing**: Jest 30.2.0 + React Testing Library 16.3.0 (unit/integration), Playwright 1.56.1 (E2E), jest-axe 10.0.0 (accessibility)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)  
**Project Type**: Web application (Next.js single-page app with static export)  
**Performance Goals**: <1s page load, 60fps animations, <1MB bundle, Lighthouse 90+  
**Constraints**: Client-side only (no backend), WCAG AA accessibility, mobile-first responsive  
**Scale/Scope**: Single-user client-side app, ~10-100 dice per user typical, up to 1000 dice edge case

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Mobile-First Responsive Design
✅ **PASS** - All three bugs directly improve mobile experience:
- Premature validation fix improves mobile form UX
- DieEditor button ordering optimizes mobile workflow (face editor before buttons)
- Nested scroll elimination critical for touch devices
- Mobile breakpoint defined at 768px (clarified)
- Touch targets verified at 44x44pt minimum

### II. Minimal Dependencies with React
✅ **PASS** - No new dependencies required:
- Uses existing React hooks for form state tracking
- Leverages existing TailwindCSS for responsive layouts and flexbox ordering
- No third-party form validation libraries needed

### III. Accessibility First (WCAG 2.1 AA)
✅ **PASS** - Improvements enhance accessibility:
- Better validation timing reduces screen reader confusion
- Touch target sizes maintained at 44x44pt
- Keyboard navigation unaffected by scroll changes
- Form field labels already properly associated (FR-015 verification)

### IV. Performance Budget
✅ **PASS** - Changes improve or maintain performance:
- Eliminating nested scroll containers reduces DOM complexity
- Progressive loading prevents long initial render for large libraries
- No performance regression expected from validation timing changes
- Sorting is O(n log n) - acceptable for typical scale (10-100 items)

### V. Progressive Enhancement with SSR
✅ **PASS** - Next.js static export maintained:
- Form validation is progressive enhancement (works without JS for basic HTML5 validation)
- Layout changes use CSS only (flexbox order or DOM restructure)
- No JS dependency for responsive scroll behavior

**Overall**: ✅ **ALL GATES PASS** - No violations. Feature aligns with all constitution principles.

---

### Re-evaluation After Phase 1 Design

**Date**: 2025-10-30  
**Status**: ✅ **ALL GATES STILL PASS**

**Design Validation**:

1. **Mobile-First**: ✅ Confirmed
   - Responsive grid uses mobile-first Tailwind classes (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
   - Touch state tracking works on all devices
   - Progressive loading optimizes mobile performance

2. **Minimal Dependencies**: ✅ Confirmed
   - Zero new npm packages added
   - All implementations use React built-in hooks (useState, useCallback, useMemo)
   - No form library dependencies (Formik, React Hook Form, etc.)

3. **Accessibility**: ✅ Confirmed  
   - ARIA attributes properly linked (aria-invalid, aria-describedby, role="alert")
   - Touch targets unchanged (44x44pt maintained)
   - Keyboard navigation preserved
   - Screen reader compatibility improved (errors announced at natural blur points)

4. **Performance Budget**: ✅ Confirmed
   - Layout reordering has zero runtime cost (CSS flexbox order)
   - Progressive loading prevents long initial renders
   - useMemo prevents unnecessary re-sorts
   - No bundle size increase (only TypeScript types and React code)

5. **Progressive Enhancement**: ✅ Confirmed
   - HTML5 native validation works without JS
   - Static export unchanged (Next.js SSG)
   - Validation layer adds progressive enhancement on top of semantic HTML
   - CSS-only responsive layout (flexbox order property)

**Conclusion**: Design phase complete with full constitutional compliance. Ready for task breakdown phase.

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Deliverable**: `research.md`

**Key Decisions**:
1. Validation timing: onBlur with touched field tracking
2. Mobile layout: Flexbox order property for DieEditor button reordering
3. Scroll fix: Eliminate nested containers + progressive loading
4. Mobile breakpoint: 768px cutoff
5. Touch targets: Verify existing 44x44pt (no changes needed)

**Time**: Completed 2025-10-30

---

### Phase 1: Design & Contracts ✅ COMPLETE

**Deliverables**:
- `data-model.md` - Type definitions and state structures
- `contracts/component-contracts.md` - Component APIs and behavior contracts
- `quickstart.md` - Implementation guide
- `.github/copilot-instructions.md` - Updated agent context

**Key Artifacts**:
1. FormValidationState type - tracks touched fields and submit attempts
2. ProgressiveLoadState type - manages "show more" functionality
3. Component contracts for DieEditor, DiceSetEditor, DiceLibrary
4. Hook signatures for useDieState, useDiceSetState with validation methods

**Time**: Completed 2025-10-30

**Constitution Re-check**: ✅ All gates pass after design

---

### Phase 2: Task Breakdown ⏳ PENDING

**Next Command**: `/speckit.tasks`

**Expected Output**: `tasks.md` with actionable development tasks

**Estimated Tasks**: 15-20 tasks organized by:
- Type definitions (1-2 tasks)
- Hook updates (4-6 tasks)
- Component updates (6-8 tasks)
- Testing (4-6 tasks)
- Documentation (1-2 tasks)

---

## Implementation Readiness

✅ **Ready for Development**

**Prerequisites Complete**:
- [x] Research findings documented
- [x] Technical decisions made and justified
- [x] Data model defined
- [x] Component contracts specified
- [x] Implementation guide created
- [x] Agent context updated
- [x] Constitution compliance verified

**Next Steps**:
1. Run `/speckit.tasks` to generate task breakdown
2. Begin implementation following `quickstart.md`
3. Track progress in generated `tasks.md`

---

## Quick Reference

**Specification**: [spec.md](./spec.md)  
**Research**: [research.md](./research.md)  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/component-contracts.md](./contracts/component-contracts.md)  
**Quickstart**: [quickstart.md](./quickstart.md)

**Key Files to Modify**:
- `src/types/index.ts` - Add FormValidationState, ProgressiveLoadState
- `src/hooks/useDieState.ts` - Add validation tracking
- `src/hooks/useDiceSetState.ts` - Add validation tracking
- `src/components/dice/DieEditor.tsx` - Add onBlur handlers + mobile layout reordering
- `src/components/dice/DiceSetEditor.tsx` - Add onBlur handlers
- `src/components/dice/DiceLibrary.tsx` - Eliminate nested scroll + progressive loading

**Estimated Implementation Time**: 5-7 hours + 2-3 hours testing

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── app/                          # Next.js App Router pages
│   ├── create/page.tsx          # Die creation page (uses DieEditor)
│   ├── edit-set/page.tsx        # Set editing page (uses DiceSetEditor)
│   └── library/page.tsx         # Library page (uses DiceLibrary)
├── components/
│   ├── dice/
│   │   ├── DieEditor.tsx        # 🔧 FIX: Add validation touch tracking
│   │   ├── DiceSetEditor.tsx    # 🔧 FIX: Add validation touch tracking
│   │   ├── DiceLibrary.tsx      # 🔧 FIX: Sort order + eliminate nested scroll
│   │   ├── DiceLibraryCard.tsx  # ✓ Component using LibraryCard
│   │   └── DiceSetCard.tsx      # ✓ Component using LibraryCard
│   └── ui/
│       └── LibraryCard.tsx      # ✓ Base card component (no changes needed)
├── hooks/
│   ├── useDieState.ts           # 🔧 FIX: Add touched field tracking
│   └── useDiceSetState.ts       # 🔧 FIX: Add touched field tracking
├── lib/
│   ├── storage.ts               # ✓ Already handles timestamps
│   └── validation.ts            # ✓ Validation logic (no changes needed)
└── types/
    └── index.ts                 # 🔧 ADD: FormFieldState type definitions

tests/
├── unit/
│   ├── hooks/
│   │   ├── useDieState.test.ts    # 🔧 ADD: Touch tracking tests
│   │   └── useDiceSetState.test.ts # 🔧 ADD: Touch tracking tests
│   └── validation.test.ts          # ✓ Existing tests (no changes)
├── integration/
│   ├── die-persistence.test.tsx   # 🔧 UPDATE: Validation timing tests
│   └── dice-set.test.tsx          # 🔧 UPDATE: Validation timing tests
└── e2e/
    ├── create.spec.ts             # 🔧 UPDATE: Validation behavior tests
    └── library.spec.ts            # 🔧 ADD: Sort order + scroll tests
```

**Structure Decision**: Single Next.js web application with App Router. Component-based architecture with shared UI components and custom hooks for state management. Form components (DieEditor, DiceSetEditor) need validation timing fixes. Library component (DiceLibrary) needs sort order and scroll container elimination. State management hooks (useDieState, useDiceSetState) need touched field tracking.

## Complexity Tracking

*No violations - this section intentionally left blank as all Constitution Check gates passed.*

