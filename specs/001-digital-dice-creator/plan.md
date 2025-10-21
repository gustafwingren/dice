# Implementation Plan: Digital Dice Creator

**Branch**: `001-digital-dice-creator` | **Date**: 2025-10-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-digital-dice-creator/spec.md`

**Last Updated**: 2025-10-27 (Post-clarification update - Integrated 5 new clarifications from spec.md)

## Summary

Build a responsive web application for creating, customizing, saving, and sharing digital dice with a polished visual design. Users can create 1-6 dice per set with 2-101 sides each, customize colors and face content (numbers, text up to 20 characters with emoji/unicode support and line breaks stripped, or solid colors), save to local storage, and share via URL-encoded links with simplified share page view. The application will be a mobile-first React SPA using TailwindCSS with a consistent design system, deployed to Azure Static Web Apps with GitHub Actions CI/CD. Roll animations are GPU-accelerated (1.5s) with aria-live regions for screen reader accessibility. Randomness validated via chi-squared test (p>0.05, 1000+ rolls). Dark mode and style guide are planned as post-MVP enhancements.

## Technical Context

**Language/Version**: JavaScript/TypeScript with React 19+, Node.js 20+  
**Primary Dependencies**: React (latest stable), Next.js 15+ (SSG), TailwindCSS (latest stable), TypeScript (latest stable), localforage (IndexedDB wrapper), LZ-String (URL compression), Zod (runtime validation)  
**Storage**: Browser localStorage/IndexedDB (client-side only, no backend)  
**Testing**: Jest, React Testing Library, Playwright (E2E), jest-axe (accessibility)  
**Version Strategy**: Use @latest for all dependencies to ensure access to newest features and security patches  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge - last 2 versions)  
**Project Type**: Web application (SSG/static export via Next.js)  
**Performance Goals**: <2s page load on 3G, <1.5s FCP, <60s die creation, Lighthouse 90+, 60fps micro-interactions, 1.5s GPU-accelerated roll animation  
**Constraints**: <1MB total bundle (~165KB core), WCAG 2.1 AA compliance, 320px-1920px responsive, polished visual design, aria-live regions for screen readers, storage quota error handling, whitespace-only face rejection, emoji/unicode support with line break stripping  
**Scale/Scope**: Single-user client-side app, no backend, URL encoding for sharing, professional UI/UX, cryptographic randomness with chi-squared validation (p>0.05, 1000+ rolls)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Mobile-First Responsive Design
- ✅ **COMPLIANT**: Mobile viewport (320px) is primary design target
- ✅ **COMPLIANT**: Touch targets minimum 44x44px per SC-009
- ✅ **COMPLIANT**: Responsive breakpoints tested per SC-005
- **Action**: Design mobile layouts first, enhance for tablet/desktop

### II. Minimal Dependencies with React
- ✅ **COMPLIANT**: React approved per constitution
- ✅ **COMPLIANT**: Next.js for SSG (required by Principle V)
- ✅ **COMPLIANT**: TailwindCSS approved per Technical Standards
- ✅ **COMPLIANT**: React Router via Next.js built-in routing
- ✅ **COMPLIANT**: No additional state management (use React Context/hooks)
- **Action**: Justify each dependency, document bundle impact

### III. Accessibility First (WCAG 2.1 AA - NON-NEGOTIABLE)
- ✅ **COMPLIANT**: Keyboard navigation required per SC-009
- ✅ **COMPLIANT**: Color contrast 4.5:1 per SC-010 (light mode for MVP)
- ✅ **COMPLIANT**: Screen reader support per SC-012 with aria-live="polite" regions for roll animations (clarification 2025-10-27)
- ✅ **COMPLIANT**: Semantic HTML required
- ✅ **COMPLIANT**: Visual design must not compromise accessibility
- **Action**: Implement ARIA labels, aria-live regions for roll results, test with axe-core and manual screen readers, validate contrast in light mode (dark mode deferred to Phase 9)

### IV. Performance Budget
- ✅ **COMPLIANT**: <2s page load on 3G per SC-006
- ✅ **COMPLIANT**: <1.5s FCP per constitution
- ✅ **COMPLIANT**: <1MB total weight per constitution
- ✅ **COMPLIANT**: Lighthouse 90+ per SC-006
- **Action**: Monitor bundle size, optimize images, implement code splitting

### V. Progressive Enhancement with Server-Side Rendering
- ✅ **COMPLIANT**: Next.js for SSG/pre-rendering
- ✅ **COMPLIANT**: Static export for Azure Static Web Apps
- ⚠️ **PARTIAL**: Core content accessible without JS (share links decode client-side)
- **Mitigation**: Use Next.js static generation for core pages, document JS requirement for dice editor

**GATE STATUS**: ✅ PASSED with mitigation documented

## Project Structure

### Documentation (this feature)

```
specs/001-digital-dice-creator/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── types.ts         # TypeScript interfaces/types for data model
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
dice/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml    # CI/CD pipeline
├── public/
│   ├── favicon.ico
│   └── staticwebapp.config.json         # Azure SWA config
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Home/creator page
│   │   ├── library/
│   │   │   └── page.tsx                 # Saved dice library
│   │   └── share/
│   │       └── [encoded]/
│   │           └── page.tsx             # Shared dice viewer
│   ├── components/
│   │   ├── dice/
│   │   │   ├── DieEditor.tsx            # Single die configuration
│   │   │   ├── DieVisualization.tsx     # Die display component
│   │   │   ├── FaceEditor.tsx           # Face content editor
│   │   │   └── DiceSetEditor.tsx        # Multi-die editor
│   │   ├── ui/
│   │   │   ├── ColorPicker.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Toast.tsx                # Notification component
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Navigation.tsx
│   ├── hooks/
│   │   ├── useDiceStorage.ts            # localStorage operations
│   │   ├── useURLEncoding.ts            # URL encode/decode
│   │   ├── useClipboard.ts              # Share link copying
│   │   └── useTheme.ts                  # Dark mode support
│   ├── lib/
│   │   ├── storage.ts                   # localStorage/IndexedDB wrapper
│   │   ├── encoding.ts                  # Base64/compression utils
│   │   ├── validation.ts                # Die/set validation
│   │   └── constants.ts                 # Max sides, char limits, etc.
│   ├── types/
│   │   └── index.ts                     # TypeScript definitions
│   └── styles/
│       ├── globals.css                  # TailwindCSS imports
│       └── design-tokens.css            # Design system variables
├── tests/
│   ├── unit/
│   │   ├── encoding.test.ts
│   │   ├── validation.test.ts
│   │   └── storage.test.ts
│   ├── integration/
│   │   ├── die-creation.test.tsx
│   │   └── dice-sharing.test.tsx
│   └── e2e/
│       ├── user-flows.spec.ts
│       └── accessibility.spec.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── .eslintrc.json
├── .prettierrc
└── README.md
```

**Structure Decision**: Web application structure using Next.js App Router with static export. No backend directory needed since all functionality is client-side. The `src/app/` directory uses Next.js 14 App Router conventions for routing, and `src/components/` follows atomic design principles (dice-specific, UI primitives, layout). Storage and encoding logic isolated in `src/lib/` for testability.

## Complexity Tracking

**Status**: ✅ No constitution violations - all gates passed with documented mitigation for SSR limitation.

### Clarifications Integrated (2025-10-27 Session)

**5 new clarifications from spec.md session integrated into this plan:**

1. **Randomness Quality Validation** (SC-016 updated):
   - Chi-squared test with p>0.05 threshold over 1000+ rolls per die type
   - Validates cryptographic random (crypto.getRandomValues) with rejection sampling
   - More rigorous than original "appears random over 100 rolls"

2. **Whitespace-Only Face Content** (FR-004 updated):
   - Strict validation: reject save if any face has only whitespace
   - Inline validation errors for empty/whitespace-only faces
   - Prevents blank faces that could confuse users

3. **Storage Quota Exceeded** (FR-011 updated):
   - User-friendly error message: "Storage full - please delete old dice to continue"
   - Includes navigation link to library for cleanup
   - Graceful degradation without silent failure

4. **Screen Reader Roll Animation** (FR-020, SC-012 updated):
   - aria-live="polite" region announces "Rolling..." then final result
   - Provides equivalent experience for screen reader users
   - Meets WCAG 2.1 AA accessibility standards

5. **Special Characters in Face Content** (FR-004 updated):
   - Emoji/unicode allowed (enables ❤️, ⭐, 🎲 on dice faces)
   - Line breaks automatically stripped (prevents layout breaks)
   - 20-character limit still enforced

### UX Improvements Required (Phase 9 - From User Testing 2025-10-27)

**3 critical UX issues identified from user testing and documented in updated spec (tasks.md Phase 9):**

1. **Roll Result Text Truncation** (Task T099, FR-020a):
   - Issue: Text content may be cut off in roll results
   - Fix: Responsive text sizing and word-wrap to ensure full visibility

2. **Unnecessary Die Preview in Editors** (Tasks T100-T101, FR-005 updated):
   - Issue: DieVisualization clutters creation/editing interface
   - Fix: Remove preview from DieEditor and DiceSetEditor (users see dice via roll results and share view)

3. **Complex Share Page** (Tasks T102-T103, FR-010 updated):
   - Issue: Full editor interface overwhelming for recipients
   - Fix: Simplified view with placeholder/preview + "Roll" button + "Save a Copy" button only

---

## Phase 0: Outline & Research

**Goal**: Resolve unknowns, choose technologies, document decisions  
**Outputs**: `research.md`  
**Status**: ✅ **COMPLETED** (2025-10-21)

### Completed Research

**Technology Stack Decisions**:
- ✅ Next.js (latest stable, 15+) with App Router and static export (satisfies SSG requirement)
- ✅ TailwindCSS (latest stable) with JIT compiler (mobile-first utilities, small bundle)
- ✅ TypeScript (latest stable) with strict mode (type safety, IDE support)
- ✅ localforage for storage (localStorage + IndexedDB fallback)
- ✅ LZ-String + Base64 for URL encoding (50% compression, no server needed)

**Best Practices Documented**:
- ✅ Atomic Design component architecture (atoms → molecules → organisms)
- ✅ WCAG 2.1 AA implementation checklist (keyboard nav, screen readers, contrast)
- ✅ Performance optimization strategies (code splitting, virtualization, CSS transforms)
- ✅ Azure Static Web Apps deployment configuration
- ✅ Design system principles (consistent spacing, typography, color usage)
- ✅ Animation best practices (60fps, GPU acceleration, reduced motion support)

**Risk Mitigation**:
- ✅ URL length limits: LZ-String compression + 6000 char warning
- ✅ localStorage quota: IndexedDB fallback via localforage
- ✅ Browser compatibility: Polyfills for last 2 versions

See: [`research.md`](./research.md) for complete details

---

## Phase 1: Design & Contracts

**Goal**: Define data models, APIs, project structure  
**Outputs**: `data-model.md`, `contracts/`, `quickstart.md`  
**Status**: ✅ **COMPLETED** (2025-10-21)

### Data Models Defined

**Core Entities** (see [`data-model.md`](./data-model.md)):
- ✅ `Face`: Single die face with id, contentType, value, optional color
- ✅ `Die`: Die configuration with 2-101 sides, faces array, metadata
- ✅ `DiceSet`: Collection of 1-6 die references with metadata
- ✅ `ShareLink`: URL-encoded snapshot with version and type
- ✅ `RollResult`: Ephemeral roll results with timestamp

**Validation Rules**:
- ✅ Die: 2-101 sides, valid UUID, 50 char name max, hex colors
- ✅ Face: 20 char text max, valid hex for colors, sequential IDs
- ✅ DiceSet: 1-6 dice, valid die references, 50 char name max

**Storage Schema**:
- ✅ LocalStorage keys defined (`diceCreator:dice`, `diceCreator:sets`)
- ✅ Versioning strategy for migrations
- ✅ IndexedDB structure via localforage

### Contracts Created

**Type Definitions** ([`contracts/types.ts`](./contracts/types.ts)):
- ✅ Complete TypeScript interfaces for all entities
- ✅ Constants for validation (MIN_SIDES, MAX_SIDES, etc.)
- ✅ Storage keys and error codes

**Validation Functions** ([`contracts/validation.ts`](./contracts/validation.ts)):
- ✅ Type guards: `isFace`, `isDie`, `isDiceSet`
- ✅ Validation functions: `validateFace`, `validateDie`, `validateDiceSet`
- ✅ Utility validators: `isValidHexColor`, `isValidUUID`
- ✅ Custom `ValidationError` class with error codes

### Quickstart Guide

**Developer Setup** ([`quickstart.md`](./quickstart.md)):
- ✅ Prerequisites (Node 20+, npm 10+)
- ✅ Installation steps
- ✅ Development workflow (npm scripts)
- ✅ Project structure overview
- ✅ Configuration files (next.config.js, tailwind.config.js, tsconfig.json)
- ✅ Troubleshooting guide
- ✅ Performance and accessibility checklists

### Agent Context Updated

- ✅ Executed `.specify/scripts/bash/update-agent-context.sh copilot`
- ✅ GitHub Copilot now aware of React + Next.js + TailwindCSS stack
- ✅ Auto-generated context in `.github/copilot-instructions.md`

---

## Phase 2: Task Breakdown

**Goal**: Generate atomic, prioritized implementation tasks  
**Command**: Run `/speckit.tasks` to generate `tasks.md`  
**Status**: ✅ **COMPLETED** (2025-10-21)

### Generated Tasks

**Total Tasks**: 88 tasks across 8 phases

**Task Organization** (see [`tasks.md`](./tasks.md)):
- ✅ Phase 1: Setup & Project Initialization (8 tasks)
- ✅ Phase 2: Foundation & Shared Infrastructure (12 tasks)
- ✅ Phase 3: User Story 1 (P1) - Create Single Custom Die (16 tasks)
- ✅ Phase 4: User Story 2 (P2) - Save and Load Dice (11 tasks)  
- ✅ Phase 5: User Story 3 (P3) - Create and Save Dice Sets (10 tasks)
- ✅ Phase 6: User Story 4 (P4) - Share Dice via URL (11 tasks)
- ✅ Phase 7: User Story 5 (P5) - Roll Dice Animation (9 tasks)
- ✅ Phase 8: Polish & Cross-Cutting Concerns (6 tasks)

**Independent Test Criteria**: Each user story includes specific, independently testable acceptance criteria

**Parallel Opportunities**: 
- After Foundation: US1, US4, US5 can be developed simultaneously
- After US1: US2, US4, US5 can be completed in parallel
- US3 requires US1+US2 complete

**MVP Recommendation**: Phase 1 + Phase 2 + Phase 3 (US1) = 30 tasks, 14-21 hours
- Delivers core value: create and visualize custom dice
- Fully testable and deployable standalone feature

**Enhanced MVP**: Add Phase 4 (US2) = 41 tasks, 22-30 hours
- Adds persistence for reusability
- Recommended minimum for production release

**Effort Estimates**:
- Full feature: 41-60 hours (5-8 days solo, 2-3 days team of 3)
- MVP only: 14-21 hours (2-3 days solo)

---

## Implementation Ready

All planning phases complete. Ready to begin implementation:

1. ✅ Constitution ratified (v1.1.0)
2. ✅ Feature specification finalized with clarifications
3. ✅ Technology stack researched and documented
4. ✅ Data models and contracts defined
5. ✅ Developer quickstart guide created
6. ✅ Agent context updated
7. ✅ Task breakdown generated with priorities

**Next Action**: Begin Phase 1 tasks (T001-T008) to initialize project structure.

