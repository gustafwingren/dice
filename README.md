# 🎲 Digital Dice Creator

A modern, accessible web application for creating and rolling custom digital dice with 2-101 sides. Built with Next.js, React, and TypeScript.

## Features

- **Custom Dice Creation**: Create dice with 2-101 sides
- **Multiple Content Types**: 
  - Number dice (auto-populated sequential numbers)
  - Text dice (custom text up to 20 characters per face)
  - Color dice (solid color faces from preset or custom hex colors)
- **Dice Sets**: Combine multiple dice into sets for complex rolls
- **Roll Animation**: GPU-accelerated 1.5-second roll animation with sound effects
- **Share via URL**: Share dice and sets through URL hash (no backend required)
- **Persistent Storage**: Dice saved to browser's IndexedDB (survives page reload)
- **Offline-First**: Works completely offline after initial load
- **Accessible**: WCAG 2.1 AA compliant with screen reader support
- **Mobile Responsive**: Optimized for 320px+ viewports

## Tech Stack

- **Framework**: Next.js 15+ (Static Site Generation)
- **UI Library**: React 19+
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: TailwindCSS 3+
- **Storage**: IndexedDB via localforage
- **Compression**: LZ-String for URL compression
- **Validation**: Zod for runtime validation
- **Testing**: Jest (unit), Playwright (E2E)

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

The application is deployed to **Azure Static Web Apps** with automated CI/CD via GitHub Actions.

### Deployment Workflow

1. **Create feature branch**: `git checkout -b feature/my-feature`
2. **Make changes and test locally**
3. **Push and create Pull Request** → Triggers preview deployment
4. **Preview environment**: Unique URL for testing (e.g., `https://dice-app-123.azurestaticapps.net`)
5. **Merge to main** → Deploys to production

### Production URL

- **Production**: [https://red-water-02e094403-1.westeurope.3.azurestaticapps.net](https://red-water-02e094403-1.westeurope.3.azurestaticapps.net)
- **PR Previews**: Automatic staging environments for each pull request

### CI/CD Pipeline

Every push runs:
- ✅ Type checking (`npm run type-check`)
- ✅ Linting (`npm run lint`)
- ✅ Unit tests with coverage (`npm run test:coverage`)
- ✅ E2E tests (`npm run test:e2e`)
- ✅ Production build (`npm run build`)
- ✅ Deployment to Azure Static Web Apps

See [`.github/workflows/azure-static-web-apps.yml`](.github/workflows/azure-static-web-apps.yml) for full pipeline configuration.

### Performance Budgets

Lighthouse CI enforces strict performance budgets:
- **Performance Score**: >90
- **Accessibility Score**: 100
- **Best Practices Score**: >90
- **First Contentful Paint**: <1.5s
- **Total Blocking Time**: <300ms
- **Total Bundle Size**: <1MB

See [`lighthouserc.js`](lighthouserc.js) for complete budget configuration.

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- storage.test.ts

# Watch mode
npm test -- --watch
```

All unit tests use Jest with React Testing Library. Statistical randomness validation uses chi-squared goodness-of-fit tests (p>0.05 over 1000+ rolls).

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- create-die.spec.ts

# Run in UI mode
npm run test:e2e:ui
```

E2E tests use Playwright and run across 5 browsers:
- Desktop: Chromium, Firefox, WebKit
- Mobile: Chrome (Android), Safari (iOS)

#### Browser Limitations

**Clipboard API (Share Feature)**

The Clipboard API used for the "Copy Link" feature has browser-specific limitations:

- ✅ **Chromium/Chrome**: Full support (desktop and mobile)
- ⚠️ **Firefox**: Requires user interaction and HTTPS in production
- ⚠️ **WebKit/Safari**: Requires user interaction and may fail in some contexts
- ❌ **Non-HTTPS contexts**: Clipboard API is not available (except localhost)

**Test Implications**:
- Some share-related E2E tests are skipped on Firefox/WebKit due to clipboard reliability issues
- All tests pass on Chromium (recommended for E2E test runs)
- In production (HTTPS), clipboard functionality works in all modern browsers with user interaction

**Storage Limits**:
- IndexedDB quota: ~5-10MB depending on browser and device
- Dice with 101 sides can consume ~2-5KB each
- Storage quota errors show user-friendly message: "Storage full - please delete old dice to continue"

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Die creator (home page)
│   ├── set/          # Dice set creator
│   ├── share/        # Share link viewer
│   └── library/      # Saved dice library
├── components/       # React components
│   ├── dice/         # Die/set editors, roll UI
│   └── ui/           # Reusable UI components
├── lib/              # Core logic
│   ├── storage.ts    # IndexedDB operations
│   ├── validation.ts # Input validation
│   ├── random.ts     # Cryptographic randomness
│   └── share-link.ts # URL compression/decompression
├── hooks/            # Custom React hooks
└── types/            # TypeScript type definitions

tests/
├── unit/             # Jest unit tests
├── integration/      # Integration tests
└── e2e/              # Playwright E2E tests
```

## Architecture

### Data Flow

1. **Creation**: User creates die → Validation → IndexedDB storage
2. **Rolling**: User clicks roll → Crypto random number → GPU animation → Result display
3. **Sharing**: Die data → Zod validation → LZ-String compression → URL hash
4. **Loading Share**: URL hash → Decompression → Validation → Render + optional save

### Storage Schema

```typescript
// Die structure
interface Die {
  id: string;                    // UUID
  name: string;                  // Max 50 characters
  sides: number;                 // 2-101
  backgroundColor: string;       // Hex color
  textColor: string;             // Hex color
  contentType: 'number' | 'text' | 'color';
  faces: Face[];                 // Array of face data
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
}

// Dice Set structure
interface DiceSet {
  id: string;                    // UUID
  name: string;                  // Max 50 characters
  diceIds: string[];            // References to Die IDs (1-10 dice)
  createdAt: string;            // ISO 8601
  updatedAt: string;            // ISO 8601
}
```

### Validation Rules

- **Die Name**: 0-50 characters (optional, defaults to "Untitled Die")
- **Sides**: 2-101 (enforced at UI and validation layers)
- **Text Faces**: 1-20 characters, no whitespace-only content, line breaks stripped
- **Color Faces**: Valid hex color (#RRGGBB format)
- **Number Faces**: Auto-populated 1 to N
- **Dice Set**: 1-10 dice per set

### Performance

- **Roll Animation**: GPU-accelerated CSS transforms (60 FPS target)
- **Large Dice (101 sides)**: Roll completes in <3 seconds
- **Face List**: Virtualized scrolling for 50+ faces (planned in T108)
- **Bundle Size**: 102 KB shared JS, routes <5 KB each

## Accessibility

- **WCAG 2.1 AA compliant**
- **Screen Reader Support**: All interactive elements properly labeled
- **Keyboard Navigation**: Full keyboard support for all features
- **aria-live Regions**: Roll status announced to screen readers
- **Color Contrast**: 4.5:1 minimum ratio for all text
- **Touch Targets**: Minimum 44x44px for mobile (SC-004)
- **Focus Indicators**: Visible focus rings on all interactive elements

## Browser Support

- **Chromium/Chrome**: 90+
- **Firefox**: 88+
- **Safari/WebKit**: 14+
- **Mobile Chrome**: Latest
- **Mobile Safari**: iOS 14+

## License

[Add license information]

## Contributing

[Add contributing guidelines]

## Acknowledgments

Built with Next.js, React, TailwindCSS, and modern web standards.
