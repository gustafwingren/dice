# Phase 1: Data Model

**Feature**: Bug Fixes and General Improvements  
**Date**: 2025-10-30

## Overview

This document defines the data structures and state management patterns for the three bug fixes. Since this is a bug fix feature rather than new functionality, most entities already exist. This document focuses on new state tracking requirements.

## New/Modified Entities

### FormFieldState (NEW)

**Purpose**: Track which form fields have been interacted with to determine when validation errors should be displayed.

**Location**: `src/types/index.ts`

**Definition**:
```typescript
/**
 * Tracks interaction state for a single form field
 */
export interface FormFieldState {
  /** Field identifier (e.g., 'name', 'sides', 'face-1') */
  fieldName: string;
  
  /** Whether user has focused the field */
  touched: boolean;
  
  /** Whether user has modified the field value */
  dirty: boolean;
  
  /** Timestamp of last interaction (for debugging) */
  lastInteraction?: number;
}

/**
 * Form-level validation state
 */
export interface FormValidationState {
  /** Set of field names that have been touched */
  touchedFields: Set<string>;
  
  /** Whether form submission has been attempted */
  submitAttempted: boolean;
  
  /** Current validation errors by field name */
  errors: Map<string, string>;
}
```

**Validation Rules**:
- `touchedFields` starts empty, populated on blur events
- `submitAttempted` starts false, set true on form submit attempt
- Errors shown only when: `touchedFields.has(fieldName) || submitAttempted`

**State Transitions**:
```
Initial State: { touchedFields: Set([]), submitAttempted: false }
  ↓
User focuses field: (no state change)
  ↓
User types/modifies: (no state change)
  ↓
User blurs field: touchedFields.add(fieldName)
  ↓
Validation runs: errors.set(fieldName, message) IF invalid
  ↓
User submits form: submitAttempted = true (shows all errors)
```

---

### ResponsiveLayout (NEW CONCEPT)

**Purpose**: Defines visual ordering of DieEditor elements on different viewport sizes to optimize mobile workflow.

**Location**: Implemented via CSS in `src/components/dice/DieEditor.tsx` styles

**Layout Strategy**:

**Mobile (<768px)**: Single column with flexbox order
```css
.die-editor-container {
  display: flex;
  flex-direction: column;
}

.config-section { order: 1; }      /* Die name, number of faces */
.face-editor-section { order: 2; } /* FaceList component */
.action-buttons-section { order: 3; } /* Roll, Save, Share, Reset */
```

**Desktop (≥768px)**: Multi-column grid (unchanged)
```css
.die-editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

/* Left column: Config + Buttons */
/* Middle column: Face Editor */
/* Right column: Roll Result */
```

**Visual Order**:
- Mobile: Config → Faces → Buttons (natural top-to-bottom workflow)
- Desktop: 3 columns side-by-side (Buttons/Config | Faces | Result)

**DOM Order** (unchanged for accessibility):
1. Configuration panel
2. Face editor
3. Action buttons
4. Roll result panel

**Accessibility Notes**:
- Tab order follows DOM order (config → faces → buttons)
- Screen readers follow DOM order
- Visual reordering via CSS flexbox order property only
- No ARIA changes needed (semantic HTML structure preserved)

---

### LayoutContainer (EXISTING CONCEPT)

**Purpose**: Conceptual entity representing layout areas that expand naturally without nested scrolling. Not a TypeScript interface, but a design pattern.

**Pattern**:
- Replace fixed-height containers (`max-height` + `overflow-y: auto`) with natural flow containers
- Implement progressive loading when item count exceeds display threshold
- Use CSS `display: grid` or `display: flex` with `flex-wrap` for responsive card layouts

**Progressive Loading State**:
```typescript
/**
 * State for managing progressive loading in large lists
 */
export interface ProgressiveLoadState {
  /** Number of items currently visible */
  visibleCount: number;
  
  /** Increment size when user clicks "Show more" */
  incrementSize: number;
  
  /** Total items available */
  totalCount: number;
}

// Example usage
const [visibleCount, setVisibleCount] = useState(50);
const incrementSize = 50;
// hasMore is derived: visibleCount < totalCount
const hasMore = visibleCount < items.length;
const showMore = () => setVisibleCount(prev => Math.min(prev + incrementSize, items.length));
```

---

## Existing Entities (No Changes)

### Die, Face, DiceSet
**Status**: No modifications required. Timestamp fields already exist with correct ISO 8601 format.

### ValidationError
**Status**: No modifications required. Error structure supports field-specific errors.

### StorageKeys
**Status**: No modifications required. Storage layer handles timestamps correctly.

---

## State Management Updates

### useDieState Hook (MODIFIED)

**Current**: Manages die creation/editing state
**Addition**: Add touched field tracking

```typescript
interface DieState {
  die: Die;
  // ... existing fields ...
  
  // NEW: Validation state
  validationState: FormValidationState;
}

// NEW: Helper functions
const markFieldTouched = (fieldName: string) => {
  setValidationState(prev => ({
    ...prev,
    touchedFields: new Set(prev.touchedFields).add(fieldName)
  }));
};

const shouldShowError = (fieldName: string): boolean => {
  return validationState.touchedFields.has(fieldName) || validationState.submitAttempted;
};
```

### useDiceSetState Hook (MODIFIED)

**Current**: Manages dice set creation/editing state
**Addition**: Add touched field tracking (same pattern as useDieState)

```typescript
interface DiceSetState {
  diceSet: DiceSet;
  // ... existing fields ...
  
  // NEW: Validation state
  validationState: FormValidationState;
}
```

---

## Data Flow Diagrams

### Validation State Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ├─ Focus field ────────────────► (no state change)
         │
         ├─ Type/modify ────────────────► (no state change)
         │
         ├─ Blur field ──┐
         │               │
         │               ▼
         │    ┌──────────────────────┐
         │    │ Mark field touched   │
         │    │ touchedFields.add()  │
         │    └──────────┬───────────┘
         │               │
         │               ▼
         │    ┌──────────────────────┐
         │    │ Run validation       │
         │    │ Check field rules    │
         │    └──────────┬───────────┘
         │               │
         │               ├─ Valid ─────────► Clear error
         │               │
         │               └─ Invalid ──────► Set error (if touched)
         │
         └─ Submit form ─┐
                         │
                         ▼
              ┌─────────────────────┐
              │ submitAttempted=true│
              │ Show all errors     │
              └─────────────────────┘
```

---

## Validation Rules Summary

### Form Field Validation
- Field-level validation runs on every blur after touch
- Form-level validation runs on submit attempt
- Errors displayed only when field is touched OR submit attempted
- Errors cleared immediately when field becomes valid (no wait for blur)

### Progressive Loading
- Default visible count: 50 items
- Increment size: 50 items per "Show more" click
- Maximum: all available items (no artificial limit)
- Button appears only when `totalItems > visibleCount`

---

## Migration Notes

**Database/Storage**: No migration required - IndexedDB storage already uses ISO 8601 timestamps with millisecond precision via `new Date().toISOString()`.

**State Migration**: No existing state to migrate - new validation state starts fresh on component mount.

**Backward Compatibility**: All changes are additive. Existing dice/sets load and sort correctly with no code changes to storage layer.
