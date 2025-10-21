# Research: Digital Dice Creator

**Phase**: 0 - Outline & Research  
**Date**: 2025-10-21  
**Purpose**: Resolve technical unknowns and establish best practices

## Technology Stack Decisions

### 1. Next.js for SSG/Static Export

**Decision**: Use Next.js 14 with App Router and static export

**Rationale**:
- Required by Constitution Principle V (SSR/SSG)
- Static export enables deployment to Azure Static Web Apps without server
- App Router provides modern React patterns (Server Components, streaming)
- Built-in routing eliminates React Router dependency
- Excellent developer experience with Fast Refresh and TypeScript support
- Automatic code splitting and optimization

**Alternatives Considered**:
- **Gatsby**: Mature SSG tool but heavier, more complex build process, slower iteration
- **Vite + React**: Fast development but requires manual SSR/SSG setup, more configuration
- **Create React App**: Deprecated, no SSR/SSG support

**Implementation Notes**:
- Use `output: 'export'` in `next.config.js` for static HTML generation
- Pre-render all pages at build time (home, library, share template)
- Client-side hydration for interactive features (die editor, animations)

### 2. TailwindCSS for Styling

**Decision**: Use TailwindCSS 3 with JIT compiler

**Rationale**:
- Approved by Constitution Technical Standards
- Utility-first approach enables rapid mobile-first development
- Small bundle size with purging (only used classes included)
- Excellent responsive design utilities (`sm:`, `md:`, `lg:`)
- Built-in accessibility utilities (focus rings, screen reader classes)
- Strong TypeScript support with `tailwindcss-intellisense`

**Alternatives Considered**:
- **CSS Modules**: More verbose, manual responsive breakpoints
- **styled-components**: Runtime CSS-in-JS hurts performance, larger bundle
- **Vanilla CSS**: More maintenance, harder to enforce consistency

**Implementation Notes**:
- Configure mobile-first breakpoints: sm (640px), md (768px), lg (1024px)
- Use dark mode support via `dark:` variant for future enhancement
- Leverage arbitrary values for precise die face sizing

### 3. TypeScript for Type Safety

**Decision**: Use TypeScript 5 with strict mode

**Rationale**:
- Strongly recommended by Constitution Code Quality standards
- Catch errors at compile time (invalid die configurations, missing props)
- Excellent IDE support (autocomplete, refactoring)
- Self-documenting code via interfaces and types
- Required for PropTypes alternative

**Alternatives Considered**:
- **JavaScript + JSDoc**: Less robust type checking, no compile-time enforcement
- **PropTypes only**: Runtime-only validation, no IDE support

**Implementation Notes**:
- Enable strict mode, noImplicitAny, strictNullChecks
- Define interfaces for Die, Face, DiceSet in `src/types/index.ts`
- Use Zod for runtime validation of URL-decoded data

### 4. Local Storage Strategy

**Decision**: Use localStorage with IndexedDB fallback via localforage

**Rationale**:
- Meets FR-011 requirement for client-side persistence
- localStorage simple for small data (metadata, die list)
- IndexedDB better for larger data (101-sided dice with text)
- localforage provides unified API with automatic fallback
- No backend/database needed (reduces complexity)

**Alternatives Considered**:
- **localStorage only**: 5-10MB limit may be insufficient for power users
- **IndexedDB only**: More complex API, overkill for simple data
- **Backend storage**: Violates clarification (local-first with optional upgrade)

**Implementation Notes**:
- Use localforage for dice/set storage (handles large objects)
- Implement versioning for future schema changes
- Add size monitoring to warn users approaching limits

### 5. URL Encoding for Sharing

**Decision**: Use LZ-String compression + Base64 encoding in URL fragment

**Rationale**:
- Meets FR-009 requirement for stateless sharing
- No server-side storage needed (aligns with static site architecture)
- URL fragment (#) doesn't send data to server (privacy)
- LZ-String achieves ~50% compression for text-heavy dice
- Works with 6 dice × 101 sides × 20 chars = manageable URL length

**Alternatives Considered**:
- **Uncompressed JSON**: URLs too long (>2000 chars) for complex dice
- **Server-side storage**: Requires backend, violates architecture decision
- **Gzip compression**: Not available in browser, requires backend

**Implementation Notes**:
- Compress JSON with LZ-String before Base64 encoding
- Test URL length limits (2000 chars safe, 8000 chars max for modern browsers)
- Add error handling for malformed/corrupted URLs

## Best Practices

### React Component Architecture

**Pattern**: Atomic Design with functional components and hooks

**Structure**:
- **Atoms**: Button, Input, ColorSwatch (pure UI, no business logic)
- **Molecules**: ColorPicker, FaceEditor (composed atoms)
- **Organisms**: DieEditor, DiceSetEditor (complex composed components)
- **Pages**: App Router pages (route-level components)

**State Management**:
- React Context for global state (saved dice library)
- useState for local component state (current die being edited)
- No Redux/Zustand needed (minimal global state)

**Best Practices**:
- Use React.memo for expensive die visualizations
- Implement code splitting with dynamic imports for heavy components
- Leverage Suspense boundaries for loading states

### Accessibility Implementation

**WCAG 2.1 AA Requirements**:

1. **Keyboard Navigation**:
   - Tab order follows visual flow (top to bottom, left to right)
   - Focus indicators visible (2px outline, high contrast)
   - Escape key closes modals/color pickers
   - Enter/Space activates buttons

2. **Screen Reader Support**:
   - ARIA labels for icon buttons ("Add die", "Delete die")
   - Live regions for dice roll results
   - Semantic HTML (nav, main, aside)
   - Alt text for die visualizations

3. **Color Contrast**:
   - Text: 4.5:1 minimum (use Tailwind `text-neutral-900` on `bg-white`)
   - UI components: 3:1 minimum (buttons, inputs)
   - Test with axe DevTools during development

4. **Touch Targets**:
   - Minimum 44x44px (Tailwind `min-w-11 min-h-11`)
   - Adequate spacing between interactive elements (gap-2 minimum)

### Performance Optimization

**Bundle Size**:
- Next.js automatic code splitting per route
- Dynamic imports for heavy components (DiceSetEditor, RollAnimation)
- Tree-shake Tailwind CSS (only used utilities)
- Target: <500KB initial bundle, <1MB total with all routes

**Runtime Performance**:
- Virtualize face list for 100+ sided dice (react-window)
- Debounce text input to reduce re-renders
- Use CSS transforms for roll animations (GPU-accelerated)
- Lazy load dice library (only render visible items)

**Monitoring**:
- Lighthouse CI in GitHub Actions (fail build if <90)
- Bundle size tracking with next-bundle-analyzer
- Performance.mark() for dice creation timing

## Azure Static Web Apps Configuration

### Deployment Architecture

**Decision**: Use Azure Static Web Apps with GitHub Actions

**Configuration**:
```json
// staticwebapp.config.json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff"
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

**GitHub Actions Workflow**:
```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run Lighthouse CI
        run: npm run lighthouse
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Azure SWA
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          output_location: 'out'
```

### Environment Setup

**Development**:
- Node.js 20+ (LTS)
- npm 10+
- Next.js dev server: `npm run dev` (port 3000)

**Build**:
- Next.js static export: `npm run build` → `out/` directory
- Lighthouse CI validation before deployment
- Bundle analysis report

**Deployment**:
- Automatic on push to main branch
- PR preview deployments for testing
- Custom domain configuration in Azure portal

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Coverage Targets**:
- Utility functions: 100% (encoding, validation, storage)
- React components: 80% (focus on logic, not styling)
- Hooks: 90% (critical for state management)

**Test Examples**:
```typescript
// encoding.test.ts
test('encodes and decodes die configuration', () => {
  const die = { sides: 6, color: '#ff0000', faces: ['1','2','3','4','5','6'] }
  const encoded = encodeDie(die)
  const decoded = decodeDie(encoded)
  expect(decoded).toEqual(die)
})

// validation.test.ts
test('rejects die with less than 2 sides', () => {
  expect(() => validateDie({ sides: 1 })).toThrow('Minimum 2 sides')
})
```

### Integration Tests

**User Flow Tests**:
- Create die → Save → Load from library → Verify state
- Create set → Share → Open link → Verify shared state
- Create die → Edit → Verify immutability (new copy created)

### E2E Tests (Playwright)

**Critical Paths**:
- P1: Create 6-sided die in under 60 seconds (SC-001)
- P2: Save and retrieve die
- P4: Share link and open in new session
- P5: Roll animation works on mobile and desktop

### Accessibility Tests

**Automated** (jest-axe, axe-core):
- Run on every component
- Check WCAG AA violations
- Fail CI on critical issues

**Manual**:
- Keyboard navigation through entire app
- Screen reader testing (NVDA, VoiceOver)
- Color contrast verification

## Risk Mitigation

### URL Length Limits

**Risk**: Large dice configurations exceed URL limits

**Mitigation**:
- LZ-String compression reduces size by ~50%
- Warn user if URL >6000 chars (approaching limits)
- Future: Offer optional backend storage for very large configurations

### localStorage Quota

**Risk**: Users hit 5-10MB localStorage limit

**Mitigation**:
- Use IndexedDB via localforage (larger quota)
- Display storage usage indicator
- Allow export/import of dice library as JSON file

### Browser Compatibility

**Risk**: Older browsers lack features (IndexedDB, URL fragment)

**Mitigation**:
- Polyfills for IndexedDB (localforage handles this)
- Graceful degradation messaging for unsupported browsers
- Target last 2 versions per constitution (covers 95%+ users)

## Open Questions for Phase 1

1. **Die Visualization**: 2D representation or 3D (CSS transform)? → Research CSS-only 3D cube
2. **Animation Library**: CSS-only or Framer Motion? → Test performance of CSS keyframes
3. **Color Picker**: Build custom or use react-colorful? → Evaluate bundle size impact
