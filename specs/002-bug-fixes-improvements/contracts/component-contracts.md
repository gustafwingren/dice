# Component Contracts

**Feature**: Bug Fixes and General Improvements  
**Date**: 2025-10-30

## Overview

This document defines the interface contracts for components affected by the bug fixes. Since this is a client-side application with no backend API, contracts are TypeScript component props and hook signatures.

---

## Component Contracts

### DieEditor Component

**File**: `src/components/dice/DieEditor.tsx`

**Props Contract** (unchanged):
```typescript
interface DieEditorProps {
  initialDie?: Die;
  onSave: (die: Die) => void;
  onCancel: () => void;
}
```

**Internal State Contract** (MODIFIED):
```typescript
// Managed by useDieState hook
interface DieEditorState {
  die: Die;
  validationState: FormValidationState; // NEW
  // ... other existing state ...
}
```

**New Methods**:
```typescript
// Mark a field as touched (called on blur)
const handleFieldBlur = (fieldName: string) => void;

// Check if validation error should be shown
const shouldShowError = (fieldName: string) => boolean;
```

**Behavior Contract**:
- Validation errors MUST NOT appear on initial render
- Validation errors MUST appear after field blur if field is invalid
- Validation errors MUST appear on all fields after submit attempt
- Validation errors MUST clear immediately when field becomes valid

---

### DiceSetEditor Component

**File**: `src/components/dice/DiceSetEditor.tsx`

**Props Contract** (unchanged):
```typescript
interface DiceSetEditorProps {
  initialSet?: DiceSet;
  availableDice: Die[];
  onSave: (set: DiceSet) => void;
  onCancel: () => void;
}
```

**Internal State Contract** (MODIFIED):
```typescript
// Managed by useDiceSetState hook
interface DiceSetEditorState {
  diceSet: DiceSet;
  validationState: FormValidationState; // NEW
  // ... other existing state ...
}
```

**Behavior Contract**: Same as DieEditor

---

### DiceLibrary Component

**File**: `src/components/dice/DiceLibrary.tsx`

**Props Contract** (unchanged):
```typescript
interface DiceLibraryProps {
  onLoadDie?: (dieId: string) => void;
  onLoadDiceSet?: (setId: string) => void;
}
```

**Internal State Contract** (MODIFIED):
```typescript
interface DiceLibraryState {
  dice: Die[];
  sets: DiceSet[];
  visibleDiceCount: number;    // NEW - progressive loading
  visibleSetsCount: number;    // NEW - progressive loading
  // ... other existing state ...
}
```

**New Methods**:
```typescript
// Load more dice cards (progressive loading)
const showMoreDice = () => void;

// Load more set cards (progressive loading)
const showMoreSets = () => void;

// Sort items by recency
const sortByRecency = (items: Array<Die | DiceSet>) => Array<Die | DiceSet>;
```

**Behavior Contract**:
- Cards MUST be sorted by `updatedAt` DESC, then `createdAt` ASC
- Initial render MUST show first 50 dice and first 50 sets
- "Show more" buttons MUST appear when total items > visible count
- Container MUST NOT have fixed height or overflow scrolling
- Layout MUST use CSS Grid with responsive breakpoints (single column < 768px)

---

## Hook Contracts

### useDieState Hook

**File**: `src/hooks/useDieState.ts`

**Signature** (MODIFIED):
```typescript
interface UseDieStateReturn {
  die: Die;
  updateName: (name: string) => void;
  updateSides: (sides: number) => void;
  updateFace: (faceId: number, value: string | number) => void;
  // ... other existing methods ...
  
  // NEW: Validation state management
  validationState: FormValidationState;
  markFieldTouched: (fieldName: string) => void;
  shouldShowError: (fieldName: string) => boolean;
  attemptSubmit: () => boolean; // Returns true if valid, false if invalid
}

function useDieState(initialDie?: Die): UseDieStateReturn;
```

**Behavior Contract**:
- `markFieldTouched`: Adds field to touched set, triggers validation
- `shouldShowError`: Returns true if field touched OR submit attempted
- `attemptSubmit`: Sets submitAttempted=true, runs full validation, returns validity
- Validation runs automatically on field changes after touch

---

### useDiceSetState Hook

**File**: `src/hooks/useDiceSetState.ts`

**Signature** (MODIFIED):
```typescript
interface UseDiceSetStateReturn {
  diceSet: DiceSet;
  updateName: (name: string) => void;
  addDie: (dieId: string) => void;
  removeDie: (dieId: string) => void;
  // ... other existing methods ...
  
  // NEW: Validation state management (same as useDieState)
  validationState: FormValidationState;
  markFieldTouched: (fieldName: string) => void;
  shouldShowError: (fieldName: string) => boolean;
  attemptSubmit: () => boolean;
}

function useDiceSetState(initialSet?: DiceSet): UseDiceSetStateReturn;
```

**Behavior Contract**: Same as useDieState

---

## Type Contracts

### FormValidationState

**File**: `src/types/index.ts`

```typescript
export interface FormValidationState {
  /** Set of field names that user has interacted with */
  touchedFields: Set<string>;
  
  /** Whether form submission has been attempted */
  submitAttempted: boolean;
  
  /** Current validation errors by field name */
  errors: Map<string, string>;
}

/**
 * Initial state factory
 */
export function createFormValidationState(): FormValidationState {
  return {
    touchedFields: new Set(),
    submitAttempted: false,
    errors: new Map()
  };
}
```

---

### ProgressiveLoadState

**File**: `src/types/index.ts`

```typescript
export interface ProgressiveLoadState {
  /** Number of items currently visible */
  visibleCount: number;
  
  /** Increment size when user clicks "Show more" */
  incrementSize: number;
  
  /** Total items available */
  totalCount: number;
}

/**
 * Helper to create initial load state
 * Note: hasMore is derived from visibleCount < totalCount, not stored
 */
export function createProgressiveLoadState(
  totalCount: number,
  initialVisible: number = 50,
  incrementSize: number = 50
): ProgressiveLoadState {
  return {
    visibleCount: Math.min(initialVisible, totalCount),
    incrementSize,
    totalCount
  };
}
```

---

## Event Handlers

### Form Field Handlers

```typescript
// Input element props
interface FormFieldProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void; // NEW - triggers touched
  name: string; // Required for field identification
  'aria-invalid'?: boolean; // Set when shouldShowError() is true
  'aria-describedby'?: string; // Links to error message ID
}
```

### Progressive Load Handlers

```typescript
// "Show more" button props
interface ShowMoreButtonProps {
  onClick: () => void;
  'aria-label': string; // e.g., "Show 50 more dice"
  disabled?: boolean; // When no more items
}
```

---

## CSS Contracts

### Mobile Breakpoint

```css
/* Single column layout (mobile) */
@media (max-width: 767px) {
  .dice-library-grid {
    grid-template-columns: 1fr;
  }
}

/* Two column layout (tablet) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dice-library-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Three column layout (desktop) */
@media (min-width: 1024px) {
  .dice-library-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### No Nested Scroll

```css
/* MUST NOT use these patterns */
.forbidden-nested-scroll {
  max-height: /* any value */;
  overflow-y: auto; /* or scroll */
}

/* MUST use natural flow */
.correct-layout {
  /* No height restrictions */
  /* Let content expand naturally */
}
```

---

## Accessibility Contracts

### ARIA Requirements

**Form Validation**:
```html
<input
  aria-invalid={shouldShowError(fieldName)}
  aria-describedby={shouldShowError(fieldName) ? `${fieldName}-error` : undefined}
/>
{shouldShowError(fieldName) && (
  <div id={`${fieldName}-error`} role="alert">
    {errorMessage}
  </div>
)}
```

**Progressive Loading**:
```html
<button
  aria-label="Show 50 more dice"
  aria-live="polite"
>
  Show More
</button>
```

### Touch Targets

All interactive elements MUST meet 44x44pt minimum size (existing requirement, verification only).

---

## Testing Contracts

### Unit Test Requirements

**Validation Timing**:
- Test: No errors shown on initial render
- Test: No errors shown on focus without input
- Test: Errors shown on blur after invalid input
- Test: Errors shown on submit attempt
- Test: Errors cleared when field becomes valid

**Sort Order**:
- Test: Items sorted by updatedAt DESC
- Test: Items with same updatedAt sorted by createdAt ASC
- Test: Sort stable across multiple renders

**Progressive Loading**:
- Test: Initial render shows 50 items
- Test: "Show more" reveals next 50 items
- Test: Button hidden when all items visible

### Integration Test Requirements

**Form Validation Flow**:
- Test: Complete form submission with validation
- Test: Field-by-field validation during entry
- Test: Error correction and re-validation

**Library Interaction**:
- Test: Create dice, verify appears first in library
- Test: Edit dice, verify moves to top of library
- Test: Scroll through library without nested scroll issues (manual test)

### E2E Test Requirements

**Accessibility**:
- Test: Keyboard navigation through forms
- Test: Screen reader announces validation errors
- Test: Touch targets meet minimum size on mobile

**Mobile Responsiveness**:
- Test: Single column layout at 767px and below
- Test: Multi-column layout at 768px and above
- Test: Card ordering consistent across breakpoints

---

## Contract Versioning

These contracts apply to bug fix feature `002-bug-fixes-improvements`.

**Breaking Changes**: None - all changes are behavioral improvements to existing components.

**Backward Compatibility**: ✅ Full - existing component usage patterns remain valid.

**Migration Required**: ❌ No - changes are internal to component implementations.
