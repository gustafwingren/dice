# dice Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-01

## Active Technologies
- JavaScript/TypeScript with React 18+, Node.js 20+ + React 18, Next.js 14 (SSG), TailwindCSS 3, TypeScript 5 (001-digital-dice-creator)
- TypeScript 5 with strict mode, Node.js 20+ + React 18, Next.js 14 (App Router, static export), TailwindCSS 3, localforage (IndexedDB wrapper), LZ-String (URL compression), Zod (runtime validation) (001-digital-dice-creator)
- localStorage/IndexedDB via localforage (5-10MB quota, client-side only, no backend) (001-digital-dice-creator)
- TypeScript 5.9.3, JavaScript ES6+ + Next.js 15.5.6 (App Router, SSG), React 19.2.0, TailwindCSS 4.1.15, localforage 1.10.0 (002-bug-fixes-improvements)
- IndexedDB via localforage (client-side, no backend) (002-bug-fixes-improvements)

## Project Structure
```
src/
tests/
```

## Commands
npm test && npm run lint

## Code Style
JavaScript/TypeScript with React 18+, Node.js 20+: Follow standard conventions

## Design Patterns (002-bug-fixes-improvements)

### Form Validation Pattern
- Use touch-based validation: errors only appear after user interaction (blur)
- Implement `FormValidationState` with `touched` and `attempted` flags
- Provide `shouldShowError(field)` method to conditionally display errors
- Call `attemptSubmit()` on form submission to show all validation errors
- Add proper ARIA attributes: `aria-invalid`, `aria-describedby`, `role="alert"`

### Progressive Loading Pattern
- Initial render: 50 items
- Increment by 50 when "Show More" button clicked
- Use `slice(0, visibleCount)` to limit rendered items
- Conditionally render "Show More" button when `items.length > visibleCount`
- Add aria-labels showing remaining count for accessibility

### Mobile-First Responsive Design
- Use flexbox with `order` property for mobile reordering (<768px)
- Switch to CSS Grid for desktop layouts (≥768px)
- Mobile: vertical stack with logical reading order
- Desktop: multi-column grid with optimized layout
- Breakpoint: `md:` (768px) for mobile-to-desktop transition

### Accessibility Requirements
- All interactive elements: minimum 44×44px touch targets (use `min-h-11` or `min-h-[44px]`)
- Color contrast: WCAG AA 4.5:1 ratio minimum
- Keyboard navigation: full support with visible focus indicators
- Screen readers: proper ARIA labels, roles, and live regions
- No nested scrolling: use natural page scroll with progressive loading

## Recent Changes
- 002-bug-fixes-improvements: Added progressive loading, touch-based validation, mobile layout optimization, accessibility improvements
- 002-bug-fixes-improvements: Added TypeScript 5.9.3, JavaScript ES6+ + Next.js 15.5.6 (App Router, SSG), React 19.2.0, TailwindCSS 4.1.15, localforage 1.10.0
- 001-digital-dice-creator: Added TypeScript 5 with strict mode, Node.js 20+ + React 18, Next.js 14 (App Router, static export), TailwindCSS 3, localforage (IndexedDB wrapper), LZ-String (URL compression), Zod (runtime validation)
- 001-digital-dice-creator: Added JavaScript/TypeScript with React 18+, Node.js 20+ + React 18, Next.js 14 (SSG), TailwindCSS 3, TypeScript 5

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
