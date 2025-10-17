<!--
  ============================================================================
  SYNC IMPACT REPORT
  ============================================================================
  Version Change: 1.0.0 → 1.1.0
  
  Modified Principles:
  - II. Minimal Dependencies → Expanded to explicitly permit React framework
  - V. Progressive Enhancement → Adjusted to acknowledge React's CSR model with
    server-side rendering (SSR) or static site generation (SSG) requirements
  
  Added Sections:
  - Technical Standards: React-specific guidance added
  
  Removed Sections:
  - None
  
  Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - Requirements alignment compatible
  ✅ tasks-template.md - Task organization reflects principles
  
  Follow-up TODOs:
  - None - all placeholders filled
  ============================================================================
-->

# Dice Constitution

## Core Principles

### I. Mobile-First Responsive Design

All features MUST be designed and implemented mobile-first, then progressively enhanced for larger
screens. This ensures optimal performance and usability on resource-constrained devices.

- Mobile viewport (320px-480px) is the primary design target
- Touch targets MUST be minimum 44x44px for accessibility
- Desktop enhancements are additive, never required for core functionality
- Responsive breakpoints MUST be tested: mobile (<768px), tablet (768px-1024px), desktop (>1024px)

**Rationale**: Mobile traffic dominates web usage. Mobile-first ensures the core experience works
everywhere and prevents desktop-centric assumptions that degrade mobile usability.

### II. Minimal Dependencies with React

The project uses React as its core framework while maintaining a minimal dependency philosophy
beyond this foundational choice. Dependencies MUST be minimized to reduce attack surface, improve
load times, and ensure long-term maintainability.

- React is the approved UI framework for component-based development
- Additional dependencies beyond React MUST be justified by solving a problem that cannot be
  reasonably solved with React's core capabilities or lightweight utilities
- Dependencies MUST be regularly audited for security vulnerabilities using tools like `npm audit`
- Bundle size impact MUST be documented and monitored for any new dependency
- Prefer React's built-in features over third-party libraries when feasible (e.g., Context API
  over Redux for simple state, React Router for routing)
- Tree-shaking and code-splitting MUST be utilized to minimize final bundle size

**Rationale**: React provides a robust component model that justifies its inclusion despite adding
dependencies. However, the React ecosystem's tendency toward over-engineering must be actively
resisted to maintain performance and maintainability goals.

### III. Accessibility First (WCAG 2.1 AA - NON-NEGOTIABLE)

All features MUST meet WCAG 2.1 Level AA standards as a minimum requirement. Accessibility is not
optional or a post-launch enhancement.

- Semantic HTML MUST be used (proper heading hierarchy, landmarks, form labels)
- Keyboard navigation MUST work for all interactive elements
- Color contrast ratios MUST meet WCAG AA standards (4.5:1 for text, 3:1 for UI components)
- Screen reader compatibility MUST be validated using NVDA, JAWS, or VoiceOver
- ARIA attributes MUST be used correctly when semantic HTML is insufficient

**Rationale**: Accessibility is a legal requirement in many jurisdictions and a moral imperative.
Building it in from the start is cheaper and more effective than retrofitting.

### IV. Performance Budget

The project MUST adhere to strict performance budgets to ensure fast load times on all devices and
network conditions.

- Initial page load MUST be under 2 seconds on 3G connections
- First Contentful Paint (FCP) MUST occur within 1.5 seconds
- Total page weight MUST be under 1MB (HTML, CSS, JS, fonts, critical images)
- Images MUST be optimized and use modern formats (WebP, AVIF) with fallbacks
- Lighthouse performance score MUST be 90+ on mobile

**Rationale**: Performance directly impacts user experience, SEO, and accessibility. Slow sites are
abandoned and penalized by search engines.

### V. Progressive Enhancement with Server-Side Rendering

Features MUST be built to deliver content efficiently with React while maintaining progressive
enhancement principles through server-side rendering (SSR) or static site generation (SSG).

- React applications MUST use Next.js, Gatsby, or equivalent SSR/SSG framework to deliver
  pre-rendered HTML for core content and navigation
- Initial page load MUST render meaningful content from HTML before JavaScript hydration
- Critical content MUST be accessible to search engines and users with JavaScript disabled or
  failing to load
- Loading states and skeleton screens MUST provide immediate feedback during client-side transitions
- CSS MUST provide functional layouts during and after JavaScript hydration

**Rationale**: Pure client-side React violates progressive enhancement and harms SEO and
accessibility. SSR/SSG provides the benefits of React's component model while ensuring content
availability and performance. This approach balances modern development practices with web
standards.

## Technical Standards

### Browser Support

- Modern browsers: Last 2 versions of Chrome, Firefox, Safari, Edge
- iOS Safari: Last 2 major versions
- Android Chrome: Last 2 major versions
- Graceful degradation for older browsers (functional but not pixel-perfect)

### Code Quality

- HTML MUST validate against W3C standards (validate SSR/SSG output)
- CSS MUST be organized using CSS Modules, styled-components, or Tailwind CSS for component
  scoping and maintainability
- JavaScript/TypeScript MUST use modern ES6+ features (TypeScript strongly recommended)
- React components MUST follow functional component patterns with hooks (no class components for
  new code)
- Code MUST be linted and formatted consistently using Prettier and ESLint with React plugins
- PropTypes or TypeScript interfaces MUST define component prop contracts

### Security

- Content Security Policy (CSP) headers MUST be implemented
- HTTPS MUST be enforced in production
- User input MUST be sanitized if dynamic content is introduced
- Subresource Integrity (SRI) MUST be used for any CDN-hosted resources

## Development Practices

### Testing

- Component testing MUST be performed using React Testing Library or equivalent
- Visual regression testing MUST be performed across all supported breakpoints
- Accessibility audits MUST be run using automated tools (axe-core, Lighthouse, jest-axe) and
  manual testing
- Cross-browser testing MUST be performed before production deployment
- Performance testing MUST validate adherence to performance budgets
- End-to-end testing SHOULD be performed for critical user journeys using Playwright or Cypress

### Documentation

- Component documentation MUST include usage examples and accessibility notes
- Performance optimizations MUST be documented to prevent accidental regressions
- Browser compatibility notes MUST be maintained for any workarounds

### Version Control

- Semantic versioning MUST be used: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes to public APIs or dependencies
- MINOR: New features or components added
- PATCH: Bug fixes, performance improvements, documentation updates

## Governance

This constitution is the authoritative source for all development decisions. It supersedes ad-hoc
practices and MUST be consulted before planning new features or making architectural decisions.

### Amendment Process

- Amendments MUST be proposed via pull request to `.specify/memory/constitution.md`
- Amendments MUST include rationale and impact analysis
- Breaking changes MUST include migration guidance for existing code
- Constitution version MUST be incremented according to semantic versioning rules

### Compliance

- All pull requests MUST verify compliance with constitution principles
- Code reviews MUST explicitly check for mobile-first design, accessibility, and performance budgets
- Any deviation from the constitution MUST be documented and justified in writing
- Regular audits (quarterly) MUST verify ongoing adherence to standards

### Authority

The `.specify/memory/constitution.md` file is the single source of truth for project governance.
Template files in `.specify/templates/` MUST align with constitution principles. When conflicts
arise, the constitution prevails.

**Version**: 1.1.0 | **Ratified**: 2025-10-17 | **Last Amended**: 2025-10-17
