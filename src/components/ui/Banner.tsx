/**
 * Banner component - colored banner for alerts, success messages, etc.
 * Provides consistent styling for informational banners
 */

import { ReactNode } from 'react';

interface BannerProps {
  /** Banner content */
  children: ReactNode;
  /** Banner variant */
  variant?: 'success' | 'info' | 'warning' | 'danger';
  /** Additional CSS classes */
  className?: string;
}

export function Banner({ children, variant = 'info', className = '' }: BannerProps) {
  const variantClasses = {
    success: 'bg-success-50 dark:bg-success-900/20 border-success-500 dark:border-success-700 text-success-800 dark:text-success-200',
    info: 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-700 text-primary-800 dark:text-primary-200',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-500 dark:border-warning-700 text-warning-800 dark:text-warning-200',
    danger: 'bg-danger-50 dark:bg-danger-900/20 border-danger-500 dark:border-danger-700 text-danger-800 dark:text-danger-200'
  };

  return (
    <div 
      className={`
        border-2 rounded-xl p-4
        ${variantClasses[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="alert"
    >
      {children}
    </div>
  );
}
