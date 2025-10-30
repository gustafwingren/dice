'use client';

import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'diceCreator:theme';

/**
 * Custom hook for managing dark mode theme
 * 
 * Features:
 * - Persists theme preference to localStorage
 * - Applies theme class to document root
 * - Respects system preference as default
 * 
 * @returns Theme state and setter
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  // Note: We only set the state here; the effect below will handle applying the theme to the DOM
  useEffect(() => {
    // Guard check for SSR - only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Try to load from localStorage (user preference takes priority)
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored);
    } else {
      // Fall back to system preference only if no stored preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setThemeState(systemTheme);
    }
    
    // Mark as mounted after theme is determined
    setMounted(true);
  }, []);

  // Apply theme to document and save to localStorage
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newTheme);
      applyTheme(newTheme);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Apply theme whenever theme state changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  return {
    theme,
    setTheme,
    toggleTheme,
    mounted, // Use this to prevent hydration mismatch
  };
}

/**
 * Apply theme by adding/removing dark class on document root
 */
function applyTheme(theme: Theme) {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
