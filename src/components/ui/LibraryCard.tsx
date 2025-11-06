/**
 * LibraryCard component - base card for library items (dice and sets)
 * Provides consistent styling and behavior for clickable library cards
 */

import { ReactNode } from 'react';
import { TrashIcon, DuplicateIcon, CalendarIcon } from '@/components/icons';

interface LibraryCardProps {
  /** Card title */
  title: string;
  /** Card subtitle/metadata */
  subtitle: string;
  /** Main content area */
  children: ReactNode;
  /** Created date */
  createdAt: Date;
  /** Called when card is clicked */
  onClick: () => void;
  /** Called when delete is requested */
  onDelete: () => void;
  /** Called when duplicate is requested (optional) */
  onDuplicate?: () => void;
  /** Aria label for the card */
  ariaLabel: string;
  /** Border color on hover */
  hoverBorderColor?: 'primary' | 'accent';
}

export function LibraryCard({
  title,
  subtitle,
  children,
  createdAt,
  onClick,
  onDelete,
  onDuplicate,
  ariaLabel,
  hoverBorderColor = 'primary'
}: LibraryCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDuplicate) {
      onDuplicate();
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the delete button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const hoverBorderColors = {
    primary: 'hover:border-primary-300 dark:hover:border-primary-600 focus-within:ring-primary-500',
    accent: 'hover:border-accent-400 dark:hover:border-accent-500 focus-within:ring-accent-500'
  };

  return (
    <div
      role="article"
      className={`
        bg-white dark:bg-neutral-800 rounded-xl shadow-md hover:shadow-xl dark:shadow-neutral-900 
        transition-all duration-300 cursor-pointer overflow-hidden 
        border border-neutral-100 dark:border-neutral-700 
        ${hoverBorderColors[hoverBorderColor]}
        hover:-translate-y-1 focus-within:ring-2 focus-within:ring-offset-2
        flex flex-col
      `.trim().replace(/\s+/g, ' ')}
      onClick={handleCardClick}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      {/* Header */}
      <div className="p-5 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {subtitle}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {onDuplicate && (
              <button
                onClick={handleDuplicate}
                className="p-2 min-w-11 min-h-11 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors flex items-center justify-center"
                aria-label={`Duplicate ${title}`}
                tabIndex={0}
              >
                <DuplicateIcon />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-2 min-w-11 min-h-11 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded transition-colors flex items-center justify-center"
              aria-label={`Delete ${title}`}
              tabIndex={0}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Content area */}
      {children}

      {/* Footer */}
      <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-700/50 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2 shrink-0">
        <CalendarIcon />
        Created {createdAt.toLocaleDateString()}
      </div>
    </div>
  );
}
