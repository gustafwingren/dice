# Quickstart Guide: Digital Dice Creator

**Last Updated**: 2025-10-21  
**Target Audience**: Developers setting up the project for the first time

## Prerequisites

- **Node.js**: 20.x LTS or higher
- **npm**: 10.x or higher
- **Git**: For version control
- **VS Code**: Recommended IDE (optional)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd dice

# Install dependencies
npm install
```

### 2. Verify Installation

```bash
# Check Node.js version
node --version  # Should be v20.x or higher

# Check npm version
npm --version   # Should be 10.x or higher

# Verify dependencies installed
ls node_modules # Should see next, react, tailwindcss, etc.
```

## Development Workflow

### Start Development Server

```bash
# Start Next.js development server
npm run dev

# Server starts at http://localhost:3000
# Hot reload enabled - changes update automatically
```

**Expected Output**:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in XXXms
```

### Project Structure

```
dice/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Home page (die creator)
│   │   ├── library/         # Saved dice library
│   │   │   └── page.tsx
│   │   ├── share/           # Share link handler
│   │   │   └── page.tsx
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── dice/            # Die-specific components
│   │   │   ├── DieEditor.tsx
│   │   │   ├── DieVisualization.tsx
│   │   │   ├── FaceEditor.tsx
│   │   │   └── RollAnimation.tsx
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ColorPicker.tsx
│   │   │   └── Modal.tsx
│   │   └── layout/          # Layout components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useDiceStorage.ts
│   │   ├── useShareLink.ts
│   │   ├── useClipboard.ts
│   │   └── useRollDice.ts
│   ├── lib/                 # Utilities
│   │   ├── storage.ts       # LocalStorage/IndexedDB wrapper
│   │   ├── encoding.ts      # URL encoding/decoding
│   │   ├── validation.ts    # Data validation
│   │   └── random.ts        # Cryptographic random
│   └── types/               # TypeScript types
│       └── index.ts         # Type definitions
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── e2e/                 # End-to-end tests (Playwright)
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # TailwindCSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Key Commands

### Development

```bash
# Start dev server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch

# Check test coverage
npm run test:coverage
```

### Building

```bash
# Build for production (static export)
npm run build

# Output: /out directory with static HTML/CSS/JS

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Run accessibility checks
npm run test:a11y

# Run Lighthouse CI
npm run lighthouse

# Analyze bundle size
npm run analyze
```

## Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for Azure Static Web Apps
  reactStrictMode: true,
  images: {
    unoptimized: true  // Required for static export
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
    },
  },
  plugins: [],
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

## First-Time Developer Tasks

### 1. Create Your First Die

After starting the dev server:

1. Navigate to http://localhost:3000
2. Click "Create New Die"
3. Set sides to 6
4. Choose content type "Number"
5. Faces auto-populate 1-6
6. Click "Save Die"
7. See die appear in library

### 2. Test Sharing

1. Create a die (see above)
2. Click "Share" button
3. Copy the generated URL
4. Open URL in incognito window
5. Verify die loads correctly

### 3. Run Tests

```bash
# Verify everything works
npm test

# Should see all tests pass
```

## Troubleshooting

### Port 3000 Already in Use

```bash
# Option 1: Use different port
PORT=3001 npm run dev

# Option 2: Kill process on port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### TypeScript Errors After Pull

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Restart dev server
npm run dev
```

### Tests Failing Locally

```bash
# Clear Jest cache
npm run test:clear-cache

# Run tests with verbose output
npm run test -- --verbose
```

### Build Fails on CI

```bash
# Run production build locally
npm run build

# Check for type errors
npm run type-check

# Check for lint errors
npm run lint
```

## Environment Variables

Create `.env.local` for local development:

```bash
# Optional: Analytics (if added later)
# NEXT_PUBLIC_ANALYTICS_ID=your-id

# Optional: Feature flags
# NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

**Note**: No environment variables required for MVP.

## Browser DevTools

### Chrome/Edge DevTools

**LocalStorage Inspection**:
1. Open DevTools (F12)
2. Application tab → Local Storage
3. Expand `http://localhost:3000`
4. See `diceCreator:dice` and `diceCreator:sets`

**Performance Monitoring**:
1. DevTools → Performance tab
2. Record page load
3. Verify <2s load time
4. Check for layout shifts

**Accessibility Checks**:
1. DevTools → Lighthouse tab
2. Select "Accessibility"
3. Run audit
4. Fix any issues < 90 score

### React DevTools

Install: [React Developer Tools](https://react.dev/learn/react-developer-tools)

**Component Inspection**:
1. Open React DevTools
2. Select component
3. View props and state
4. Test hook values

## Git Workflow

### Feature Branch

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, commit frequently
git add .
git commit -m "feat: add die editor component"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation only
style: formatting, missing semicolons
refactor: code change that neither fixes bug nor adds feature
test: adding missing tests
chore: changes to build process
```

## Azure Deployment

### Prerequisites

1. Azure account
2. GitHub repository
3. Azure Static Web Apps resource created

### Deploy via GitHub Actions

**Automatic** (on push to main):
```bash
# Merge your PR to main
# GitHub Actions automatically builds and deploys
```

**Manual**:
```bash
# Build locally
npm run build

# Deploy via Azure CLI
az staticwebapp deploy \
  --name your-app-name \
  --resource-group your-rg \
  --app-location "." \
  --output-location "out"
```

### Verify Deployment

1. Navigate to Azure portal
2. Open Static Web App
3. Click "Browse"
4. Test all functionality

## Performance Checklist

Before merging to main:

- [ ] Bundle size < 1MB (`npm run analyze`)
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] No console errors in production build
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No lint errors (`npm run lint`)

## Accessibility Checklist

Before merging to main:

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible (2px outline)
- [ ] Color contrast > 4.5:1 for text
- [ ] ARIA labels on icon buttons
- [ ] Screen reader tested (NVDA/VoiceOver)
- [ ] Touch targets min 44x44px

## Need Help?

- **Documentation**: See `/specs/001-digital-dice-creator/` directory
- **Data Models**: `data-model.md`
- **Type Contracts**: `contracts/types.ts`
- **Implementation Plan**: `plan.md`
- **Research**: `research.md`

## Next Steps

After successful setup:

1. Read the implementation plan: `specs/001-digital-dice-creator/plan.md`
2. Review data models: `specs/001-digital-dice-creator/data-model.md`
3. Check the task list: Run `/speckit.tasks` to generate tasks
4. Pick a task from Phase: Foundation
5. Create a feature branch
6. Start coding!

Happy coding! 🎲
