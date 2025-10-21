module.exports = {
  ci: {
    collect: {
      staticDistDir: './out',
      numberOfRuns: 3,
      url: [
        '/',
        '/library',
        '/set',
        '/share'
      ],
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Performance budgets (SC-006)
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }], // <1.5s FCP
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }], // <2s LCP
        'speed-index': ['error', { maxNumericValue: 2000 }], // <2s on 3G
        'total-blocking-time': ['error', { maxNumericValue: 300 }], // <300ms TBT
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // <0.1 CLS
        'interactive': ['error', { maxNumericValue: 3000 }], // <3s TTI
        
        // Performance score targets
        'categories:performance': ['error', { minScore: 0.9 }], // >90 (SC-006)
        'categories:accessibility': ['error', { minScore: 1.0 }], // 100 (SC-010)
        'categories:best-practices': ['error', { minScore: 0.9 }], // >90 (SC-006)
        'categories:seo': ['error', { minScore: 0.9 }], // >90
        
        // Accessibility requirements (SC-009, SC-012)
        'color-contrast': 'error', // WCAG AA 4.5:1 (SC-010)
        'document-title': 'error',
        'html-has-lang': 'error',
        'meta-viewport': 'error',
        'aria-valid-attr': 'error',
        'aria-valid-attr-value': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'tabindex': 'error',
        
        // Best practices
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'warn',
        'unused-javascript': 'warn',
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'error',
        'uses-long-cache-ttl': 'warn',
        
        // Bundle size budget (constitution: <1MB total)
        'total-byte-weight': ['error', { maxNumericValue: 1048576 }], // 1MB = 1024*1024 bytes
        'resource-summary:script:size': ['error', { maxNumericValue: 524288 }], // <512KB JS
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 102400 }], // <100KB CSS
        'resource-summary:document:size': ['error', { maxNumericValue: 51200 }], // <50KB HTML
        'resource-summary:font:size': ['warn', { maxNumericValue: 102400 }], // <100KB fonts
        'resource-summary:image:size': ['warn', { maxNumericValue: 204800 }], // <200KB images
        
        // Security
        'is-on-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'off', // We have CSP in staticwebapp.config.json
        
        // PWA (optional for future)
        'installable-manifest': 'off',
        'apple-touch-icon': 'off',
        'splash-screen': 'off',
        'themed-omnibox': 'off',
        'viewport': 'error',
        'service-worker': 'off'
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
