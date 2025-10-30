/**
 * Skeleton component for loading states
 * Provides animated placeholder UI while content loads
 */

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'button' | 'circle';
  count?: number;
}

export function Skeleton({ className = '', variant = 'text', count = 1 }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-neutral-200 dark:bg-neutral-700';
  
  const variantClasses = {
    text: 'h-4 rounded',
    card: 'h-48 rounded-xl',
    button: 'h-10 rounded-lg',
    circle: 'rounded-full',
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  ));

  return count === 1 ? items[0] : <div className="space-y-3">{items}</div>;
}

/**
 * Skeleton for dice library card
 */
export function DiceLibraryCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2" />
      </div>
      
      {/* Preview grid */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="w-full aspect-square" variant="circle" />
        ))}
      </div>
      
      {/* Footer */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <Skeleton className="w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for dice set card
 */
export function DiceSetCardSkeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 space-y-4">
      {/* Header with badge */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-12 h-5" /> {/* SET badge */}
          <Skeleton className="w-2/3 h-5" />
        </div>
        <Skeleton className="w-1/2" />
      </div>
      
      {/* Preview grid */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="w-full aspect-square" variant="circle" />
        ))}
      </div>
      
      {/* Footer */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
        <Skeleton className="w-1/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for die editor
 */
export function DieEditorSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Config panel */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 space-y-4">
        <Skeleton className="w-1/4 h-6" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton variant="button" />
          <Skeleton variant="button" />
        </div>
      </div>
      
      {/* Face list */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700 space-y-4">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton variant="card" />
      </div>
      
      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Skeleton variant="button" className="w-24" />
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  );
}
