# Phase 0: Research & Technical Decisions

**Feature**: Bug Fixes and General Improvements  
**Date**: 2025-10-30

## Overview

This document captures research findings and technical decisions for fixing three UX bugs: premature validation display, mobile form element ordering in DieEditor, and nested scrolling issues.

## Research Areas

### 1. Form Validation Timing Patterns

**Decision**: Implement "touched" field tracking with onBlur validation

**Rationale**:
- Industry standard pattern used by Formik, React Hook Form, and other major form libraries
- Balances helpfulness (shows errors before submission) with non-intrusiveness (doesn't show errors while typing)
- WCAG compliant - screen readers announce errors at natural pause points (blur events)
- Aligns with user mental model: "I'm done with this field" triggers validation check

**Alternatives Considered**:
1. **Real-time validation (onChange)**: Rejected - too aggressive, disrupts typing flow
2. **Submission-only validation**: Rejected - users don't get feedback until attempting submit, leading to frustration with multi-field errors
3. **Debounced onChange (wait 500ms)**: Rejected - adds complexity and feels laggy, arbitrary delay timing

**Implementation Approach**:
- Add `touched: Set<string>` to form state hooks (useDieState, useDiceSetState)
- Track field interaction via onFocus/onBlur handlers
- Display validation errors only when: `touched.has(fieldName) || formSubmitted`
- Clear errors immediately when field becomes valid (don't wait for blur)

**References**:
- React Hook Form validation modes: https://react-hook-form.com/api/useform
- Formik touched field pattern: https://formik.org/docs/api/formik#touched-field-string-boolean
- Nielsen Norman Group - Inline Validation in Web Forms: Best Practices

---

### 2. Responsive Layout Element Ordering (Mobile)

**Decision**: Use CSS flexbox `order` property to reorder DieEditor elements on mobile viewports

**Rationale**:
- DieEditor currently uses desktop-first grid where action buttons (left column) appear before face editor (middle column) in DOM order
- On mobile (<768px), grid collapses to single column preserving DOM order - buttons before faces
- Poor UX: users must scroll past non-functional buttons to reach face editor (can't save until faces are configured)
- Flexbox order property allows visual reordering without changing DOM structure (preserves tab order, screen reader flow)
- Zero JavaScript cost - CSS-only solution

**Alternatives Considered**:
1. **Restructure DOM to put faces first**: Rejected - breaks desktop 3-column layout, requires complex media query CSS
2. **Use CSS Grid `order` property**: Considered viable, but flexbox is simpler for single-axis reordering
3. **Conditional rendering with React**: Rejected - duplicates component code, adds unnecessary JS overhead

**Implementation Approach**:
```css
/* Mobile (<768px): Use flexbox with order */
@media (max-width: 767px) {
  .die-editor-container {
    display: flex;
    flex-direction: column;
  }
  
  .config-section { order: 1; }
  .face-editor-section { order: 2; }
  .action-buttons-section { order: 3; }
}

/* Desktop (≥768px): Use existing grid layout */
@media (min-width: 768px) {
  .die-editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

**Mobile Order**:
1. Configuration panel (die name, number of faces)
2. Face editor (add/edit face values)
3. Action buttons (Roll, Save, Share, Reset)

**Desktop Order** (unchanged):
- Left column: Config + Buttons
- Middle column: Face editor
- Right column: Roll result

**Accessibility Note**:
- Visual order changes with flexbox order, but DOM order remains unchanged
- Tab order follows DOM order (config → faces → buttons) which is correct
- Screen readers follow DOM order which matches desired task flow
- No ARIA changes needed

**References**:
- MDN: CSS Flexbox order property
- WCAG 2.1 - 1.3.2 Meaningful Sequence (visual vs DOM order)
- TailwindCSS responsive design patterns

---

### 3. Eliminating Nested Scroll Containers

**Decision**: Remove fixed-height containers with overflow:auto, implement progressive loading with "Show more" pattern

**Rationale**:
- Nested scrolling is a persistent UX anti-pattern causing scroll trapping on all devices
- Mobile touch gestures particularly affected - users cannot distinguish "scroll this div" vs "scroll the page"
- Accessibility benefit: screen readers navigate more naturally through flat page structure
- Progressive loading prevents performance issues with extremely long pages (>1000 items)

**Alternatives Considered**:
1. **Virtual scrolling with react-window**: Rejected - requires nested scroll container (defeats purpose), adds complexity and dependency
2. **CSS overscroll-behavior to prevent scroll chaining**: Rejected - only works on modern browsers, doesn't solve the fundamental UX issue, still causes confusion
3. **Infinite scroll / intersection observer**: Rejected - less predictable than explicit "Show more" button, problematic for screen readers

**Implementation Approach**:
- Remove `max-height` and `overflow-y: auto` from library containers
- Default display: First 50 items
- Progressive loading: "Show 50 more" button at bottom when >50 items exist
- Button appears only when needed, maintains position in document flow
- All items rendered (no virtualization) - acceptable for typical scale

**Layout Changes**:
```css
/* BEFORE (problematic) */
.dice-library {
  max-height: 600px;
  overflow-y: auto;
}

/* AFTER (fixed) */
.dice-library {
  /* Let content expand naturally */
  /* No height restrictions */
}
```

**Progressive Loading Logic**:
```typescript
const [visibleCount, setVisibleCount] = useState(50);
const showMore = () => setVisibleCount(prev => prev + 50);
const hasMore = items.length > visibleCount;
```

**References**:
- Nielsen Norman Group - Scrolling and Attention
- WCAG 2.1 - 2.1.1 Keyboard (nested scrolling breaks keyboard nav patterns)
- CSS Tricks - The Infinite Scroll Anti-Pattern

---

---

### 4. Mobile Breakpoint Definition

**Decision**: Use 768px as mobile/desktop breakpoint (TailwindCSS `md` breakpoint)

**Rationale**:
- Aligns with TailwindCSS default breakpoint system (`md:` prefix for ≥768px)
- Industry standard cutoff between tablets and desktops
- Covers majority of mobile devices: iPhones (≤430px), most Android phones (≤412px), small tablets (≤768px)
- Matches existing responsive patterns in codebase for consistency

**Breakpoint Strategy**:
- Mobile: 0-767px (single-column layout, simplified UI)
- Desktop: 768px+ (multi-column grid, enhanced features)

**Implementation**:
```css
/* Mobile-first approach (default is mobile) */
.die-editor-container {
  display: flex;
  flex-direction: column;
}

/* Desktop overrides at ≥768px */
@media (min-width: 768px) {
  .die-editor-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

**References**:
- TailwindCSS Responsive Design: https://tailwindcss.com/docs/responsive-design
- StatCounter Mobile vs Desktop Usage 2024
- Common device viewport sizes: https://screensiz.es/

---

### 5. Touch Target Size Validation

**Decision**: Maintain existing 44x44pt minimum touch targets per WCAG AA (no changes needed - verification only)

**Rationale**:
- Already implemented in current codebase via TailwindCSS button classes
- WCAG 2.1 Level AA requires minimum 44x44 CSS pixels
- Mobile card fixes do not affect touch target sizes
- Verification needed during testing phase

**Validation Approach**:
- Review existing button/link styles in affected components
- Run accessibility audit with jest-axe to catch regressions
- Manual testing on mobile devices (iOS Safari, Android Chrome)

**References**:
- WCAG 2.1 - 2.5.5 Target Size (Level AAA - 44x44px minimum)
- Apple Human Interface Guidelines - Touch Targets (44x44pt)
- Android Material Design - Touch Targets (48x48dp)

---

## Summary of Technical Decisions

| Area | Decision | Impact |
|------|----------|--------|
| Validation Timing | onBlur with touched tracking | Improves form UX, prevents premature errors |
| Mobile Layout Ordering | Flexbox order property for DieEditor | CSS-only reordering, zero JS cost, better mobile workflow |
| Nested Scroll | Eliminate containers + progressive loading | Removes scroll trapping, better mobile UX |
| Mobile Breakpoint | 768px single-column cutoff | Consistent with industry standards |
| Touch Targets | Verify existing 44x44pt minimum | No changes needed |

All decisions align with constitution principles and require no new dependencies.
