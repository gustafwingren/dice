# Quickstart Guide: Bug Fixes Implementation

**Feature**: Bug Fixes and General Improvements  
**Branch**: `002-bug-fixes-improvements`  
**Date**: 2025-10-30

## Overview

This guide provides a quickstart for implementing the three bug fixes:
1. Fix premature validation errors in forms
2. Fix card ordering on mobile devices  
3. Fix nested scrolling issues in library

**Estimated Time**: 6-8 hours total implementation + testing

---

## Prerequisites

- Node.js 20+ installed
- Repository cloned and dependencies installed (`npm install`)
- Feature branch checked out: `git checkout 002-bug-fixes-improvements`
- Familiarity with React hooks and TypeScript

---

## Development Setup

```bash
# Start development server
npm run dev

# Run tests in watch mode (separate terminal)
npm run test:watch

# Run E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

---

## Implementation Phases

### Phase 1: Add Type Definitions (30 min)

**File**: `src/types/index.ts`

1. Add `FormValidationState` interface
2. Add `ProgressiveLoadState` interface  
3. Add helper factory functions

```typescript
// Add to src/types/index.ts
export interface FormValidationState {
  touchedFields: Set<string>;
  submitAttempted: boolean;
  errors: Map<string, string>;
}

export function createFormValidationState(): FormValidationState {
  return {
    touchedFields: new Set(),
    submitAttempted: false,
    errors: new Map()
  };
}

export interface ProgressiveLoadState {
  visibleCount: number;
  incrementSize: number;
  totalCount: number;
  // Note: hasMore is derived from visibleCount < totalCount
}
```

**Test**: `npm run type-check` should pass

---

### Phase 2: Update useDieState Hook (1-2 hours)

**File**: `src/hooks/useDieState.ts`

**Steps**:

1. Add validation state to hook:
```typescript
const [validationState, setValidationState] = useState<FormValidationState>(
  createFormValidationState()
);
```

2. Add touched field tracking:
```typescript
const markFieldTouched = useCallback((fieldName: string) => {
  setValidationState(prev => ({
    ...prev,
    touchedFields: new Set(prev.touchedFields).add(fieldName)
  }));
}, []);
```

3. Add error display logic:
```typescript
const shouldShowError = useCallback((fieldName: string): boolean => {
  return validationState.touchedFields.has(fieldName) || 
         validationState.submitAttempted;
}, [validationState]);
```

4. Add submit attempt tracking:
```typescript
const attemptSubmit = useCallback((): boolean => {
  setValidationState(prev => ({ ...prev, submitAttempted: true }));
  // Run validation
  try {
    validateDie(die);
    return true;
  } catch (error) {
    return false;
  }
}, [die]);
```

5. Return new methods in hook result

**Test**: Create test file `tests/unit/hooks/useDieState.test.ts` with validation timing tests

---

### Phase 3: Update useDiceSetState Hook (1 hour)

**File**: `src/hooks/useDiceSetState.ts`

**Steps**: Same pattern as useDieState (copy validation state logic)

**Test**: Create test file `tests/unit/hooks/useDiceSetState.test.ts`

---

### Phase 4: Update DieEditor Component (1-2 hours)

**File**: `src/components/dice/DieEditor.tsx`

**Steps**:

1. Get validation methods from useDieState:
```typescript
const {
  die,
  updateName,
  // ... other methods ...
  validationState,
  markFieldTouched,
  shouldShowError,
  attemptSubmit
} = useDieState(initialDie);
```

2. Add onBlur handlers to all inputs:
```typescript
<input
  value={die.name}
  onChange={(e) => updateName(e.target.value)}
  onBlur={() => markFieldTouched('name')}
  aria-invalid={shouldShowError('name') && /* has error */}
  aria-describedby={shouldShowError('name') ? 'name-error' : undefined}
/>
```

3. Conditionally show errors:
```typescript
{shouldShowError('name') && nameError && (
  <div id="name-error" role="alert" className="text-red-500">
    {nameError}
  </div>
)}
```

4. Update submit handler:
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (attemptSubmit()) {
    onSave(die);
  }
  // Errors now visible via shouldShowError
};
```

**Test**: Update `tests/integration/die-persistence.test.tsx` with validation timing tests

---

### Phase 5: Update DiceSetEditor Component (1 hour)

**File**: `src/components/dice/DiceSetEditor.tsx`

**Steps**: Same pattern as DieEditor

**Test**: Update `tests/integration/dice-set.test.tsx`

---

### Phase 6: Update DiceLibrary Component (2 hours)

**File**: `src/components/dice/DiceLibrary.tsx`

**Steps**:

1. Add progressive loading state:
```typescript
const [visibleDiceCount, setVisibleDiceCount] = useState(50);
const [visibleSetsCount, setVisibleSetsCount] = useState(50);
```

2. Sort items by recency:
```typescript
const sortedDice = useMemo(() => {
  return [...dice].sort((a, b) => {
    const timeDiff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}, [dice]);

const sortedSets = useMemo(() => {
  return [...sets].sort((a, b) => {
    const timeDiff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (timeDiff !== 0) return timeDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}, [sets]);
```

3. Slice visible items:
```typescript
const visibleDice = sortedDice.slice(0, visibleDiceCount);
const visibleSets = sortedSets.slice(0, visibleSetsCount);
```

4. Add "Show more" buttons (hasMore derived from visibleCount < totalCount):
```typescript
{visibleDiceCount < sortedDice.length && (
  <button
    onClick={() => setVisibleDiceCount(prev => prev + 50)}
    aria-label={`Show 50 more dice (${sortedDice.length - visibleDiceCount} remaining)`}
    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
  >
    Show More Dice
  </button>
)}
```

5. Remove nested scroll containers:
```diff
- <div className="max-h-[600px] overflow-y-auto">
+ <div>
    {/* Dice grid */}
  </div>
```

**Test**: Create `tests/e2e/library.spec.ts` for sort order and scroll tests

---

### Phase 7: Mobile Responsiveness (30 min)

**File**: `src/components/dice/DiceLibrary.tsx` (CSS/Tailwind classes)

**Steps**:

1. Update grid layout classes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {visibleDice.map(die => (
    <DiceLibraryCard key={die.id} die={die} />
  ))}
</div>
```

2. Verify breakpoints:
- < 768px: single column
- 768px - 1023px: two columns
- >= 1024px: three columns

**Test**: Manual testing with browser dev tools responsive mode

---

## Testing Checklist

### Unit Tests

```bash
# Run all tests
npm test

# Specific test files
npm test -- useDieState.test
npm test -- useDiceSetState.test
```

**Expected**:
- ✅ All existing tests pass
- ✅ New validation timing tests pass
- ✅ Sort order tests pass

### Integration Tests

```bash
npm test -- die-persistence.test
npm test -- dice-set.test
```

**Expected**:
- ✅ Validation errors not shown on initial render
- ✅ Validation errors shown after blur on invalid fields
- ✅ Validation errors shown on submit attempt

### E2E Tests

```bash
npm run test:e2e
```

**Expected**:
- ✅ Form validation flows work end-to-end
- ✅ Library sorting correct
- ✅ Mobile responsive layouts work
- ✅ No nested scroll containers

### Manual Testing

**Validation**:
1. Open create die page
2. Verify no errors on load
3. Click into name field, don't type, blur → no error
4. Type something, clear it, blur → error appears
5. Fix the error → error disappears

**Mobile Cards**:
1. Resize browser to < 768px
2. Verify single column layout
3. Create new die, return to library
4. Verify new die appears first

**Scrolling**:
1. Create 60+ dice
2. Open library
3. Scroll page → should scroll normally
4. No "trapped" feeling in library section
5. "Show more" button appears after 50 items

---

## Troubleshooting

### Validation errors still showing on load

**Issue**: touchedFields not initialized correctly  
**Fix**: Verify `createFormValidationState()` returns empty Set

### Cards not sorting correctly

**Issue**: Timestamps missing milliseconds  
**Fix**: Verify `toISOString()` used for timestamp generation (includes ms)

### Nested scroll still present

**Issue**: CSS class not removed  
**Fix**: Search for `overflow-y`, `overflow-x`, `max-h-` classes and remove

### Tests failing

**Issue**: Component API changed  
**Fix**: Update test mocks to include new hook methods

---

## Performance Validation

Run these checks after implementation:

```bash
# Bundle size
npm run build
# Check out/static/chunks size < 1MB

# Lighthouse
npm run build && npm start
# Open Chrome DevTools → Lighthouse → Run audit
# Verify Performance score 90+

# Type checking
npm run type-check
# Should have zero errors
```

---

## Completion Checklist

Before marking complete:

- [ ] All TypeScript interfaces added
- [ ] useDieState hook updated and tested
- [ ] useDiceSetState hook updated and tested
- [ ] DieEditor component updated and tested
- [ ] DiceSetEditor component updated and tested
- [ ] DiceLibrary component updated and tested
- [ ] Mobile responsive layout verified
- [ ] All unit tests passing (226/226)
- [ ] All E2E tests passing (80/80)
- [ ] Lighthouse score 90+
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Accessibility verified (WCAG AA)

---

## Resources

**Documentation**:
- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technical decisions
- [data-model.md](./data-model.md) - Data structures
- [contracts/component-contracts.md](./contracts/component-contracts.md) - Component APIs

**Related Files**:
- Types: `src/types/index.ts`
- Hooks: `src/hooks/useDieState.ts`, `src/hooks/useDiceSetState.ts`
- Components: `src/components/dice/DieEditor.tsx`, `src/components/dice/DiceSetEditor.tsx`, `src/components/dice/DiceLibrary.tsx`
- Tests: `tests/unit/hooks/`, `tests/integration/`, `tests/e2e/`

**External References**:
- React Hook Form validation patterns
- WCAG 2.1 AA guidelines
- TailwindCSS responsive breakpoints
