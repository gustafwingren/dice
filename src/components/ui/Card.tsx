/**
 * Card component - reusable card/panel with consistent styling
 * Provides white/dark background, rounded corners, shadow, and padding
 */

import { ReactNode } from 'react';

interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Padding size: 'none' | 'sm' | 'md' | 'lg' (default: 'md') */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Whether to show border (default: true) */
  border?: boolean;
  /** Whether to show shadow (default: true) */
  shadow?: boolean;
}

export function Card({ 
  children, 
  className = '',
  padding = 'md',
  border = true,
  shadow = true
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div 
      className={`
        bg-white dark:bg-neutral-800 rounded-xl
        ${paddingClasses[padding]}
        ${border ? 'border border-neutral-200 dark:border-neutral-700' : ''}
        ${shadow ? 'shadow-lg' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  /** Header content */
  children: ReactNode;
  /** Background color style */
  variant?: 'primary' | 'accent' | 'success' | 'danger';
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardHeader - gradient header section for cards
 */
export function CardHeader({ children, variant = 'primary', className = '' }: CardHeaderProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 text-white',
    accent: 'bg-gradient-to-r from-accent-600 to-accent-700 dark:from-accent-700 dark:to-accent-800 text-white',
    success: 'bg-gradient-to-r from-success-600 to-success-700 dark:from-success-700 dark:to-success-800 text-white',
    danger: 'bg-gradient-to-r from-danger-600 to-danger-700 dark:from-danger-700 dark:to-danger-800 text-white'
  };

  return (
    <div className={`${variantClasses[variant]} px-8 py-6 ${className}`}>
      {children}
    </div>
  );
}
