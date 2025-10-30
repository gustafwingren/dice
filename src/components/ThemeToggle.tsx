'use client';

import { useTheme } from '@/hooks/useTheme';
import { SunIcon, MoonIcon } from '@/components/icons';

/**
 * ThemeToggle component for switching between light and dark modes
 * 
 * Features:
 * - Icon-based toggle (sun/moon)
 * - Persists preference to localStorage
 * - Accessible with proper aria labels
 */
export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md text-neutral-400"
        aria-label="Toggle theme"
        disabled
      >
        <span className="w-5 h-5 block" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        p-2 rounded-md transition-colors
        text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100
        dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
      "
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
