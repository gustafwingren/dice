/**
 * PageLayout component - consistent page wrapper for all pages
 * Provides standard background, min-height, and optional header
 */

import { ReactNode } from 'react';
import { Header } from './Header';

interface PageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Whether to include the header (default: true) */
  includeHeader?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function PageLayout({ 
  children, 
  includeHeader = true,
  className = ''
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 ${className}`}>
      {includeHeader && <Header />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
