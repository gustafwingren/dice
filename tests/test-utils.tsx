/**
 * Test utilities and wrappers for integration tests
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ToastProvider } from '@/components/ui/Toast';

/**
 * Custom render that wraps components with necessary providers
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override the render method
export { renderWithProviders as render };
