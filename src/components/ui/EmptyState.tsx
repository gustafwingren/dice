/**
 * EmptyState component - helpful empty state with illustrations
 * Displays when no content is available with call-to-action
 */

import React from 'react';
import { Button } from './Button';

// Re-export illustrations for convenience
export { DiceIllustration, SetIllustration, EditIllustration } from '@/components/illustrations';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        {/* Icon */}
        {icon && (
          <div className="flex justify-center mb-6">
            {icon}
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8">
          {description}
        </p>
        
        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actionLabel && onAction && (
              <Button
                onClick={onAction}
                variant="primary"
                className="px-6 py-3 text-base font-semibold"
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button
                onClick={onSecondaryAction}
                variant="secondary"
                className="px-6 py-3 text-base font-semibold"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
