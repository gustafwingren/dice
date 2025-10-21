'use client';

import { Die } from '@/types';

export interface DieVisualizationProps {
  /** Die to visualize */
  die: Die;
}

/**
 * DieVisualization component shows a visual preview of the die
 * 
 * Features:
 * - 3D-style die preview
 * - Shows current face configuration
 * - Responsive sizing
 * - Accessible alternative text
 */
export function DieVisualization({ die }: DieVisualizationProps) {
  // Calculate grid size for face preview (up to 6x6 grid for 101 sides)
  const gridSize = Math.min(6, Math.ceil(Math.sqrt(die.faces.length)));
  const facesToShow = die.faces.slice(0, gridSize * gridSize);

  return (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg dark:shadow-neutral-900 border border-neutral-100 dark:border-neutral-700 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">🎲</span>
        Die Preview
      </h2>
      
      <div className="space-y-4">
        {/* Die information with enhanced styling */}
        <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1.5 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600">
          <p className="flex justify-between">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Sides:</span> 
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">{die.sides}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">Type:</span> 
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">{die.contentType}</span>
          </p>
          {die.name && (
            <p className="flex justify-between">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Name:</span> 
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate ml-2">{die.name}</span>
            </p>
          )}
        </div>

        {/* Face grid preview with 3D effects */}
        <div 
          className="w-full aspect-square max-w-md mx-auto bg-linear-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 rounded-xl p-4 border-2 border-neutral-200 dark:border-neutral-600 shadow-inner"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 50%)',
          }}
          aria-label={`Preview of ${die.sides}-sided die`}
        >
          <div 
            className={`grid gap-2 h-full`}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              perspective: '1000px',
            }}
          >
            {facesToShow.map((face, index) => (
              <div
                key={face.id}
                className="rounded-lg border-2 border-neutral-300 dark:border-neutral-500 flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer relative"
                style={{
                  backgroundColor: face.contentType === 'color' 
                    ? face.color 
                    : die.backgroundColor,
                  color: die.textColor,
                  transform: 'translateZ(0)',
                  boxShadow: `
                    0 2px 4px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255,255,255,0.2),
                    inset 0 -1px 0 rgba(0,0,0,0.1)
                  `,
                }}
                title={`Face ${index + 1}: ${face.value || face.color || 'empty'}`}
              >
                {/* Shine effect overlay */}
                <div 
                  className="absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-black/10 pointer-events-none"
                  aria-hidden="true"
                />
                {face.contentType !== 'color' && (
                  <span className="text-xs sm:text-sm font-bold truncate px-1 relative z-10 drop-shadow-sm">
                    {face.value || index + 1}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {die.faces.length > facesToShow.length && (
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-2 border border-primary-200 dark:border-primary-800">
            <span aria-hidden="true">ℹ️</span>
            <p>
              Showing first {facesToShow.length} of {die.faces.length} faces
            </p>
          </div>
        )}

        {/* Legend for color type with enhanced styling */}
        {die.contentType === 'color' && (
          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 border border-primary-200 dark:border-primary-800">
            <p className="font-semibold text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-1">
              <span aria-hidden="true">🎨</span>
              Color Die
            </p>
            <p className="text-primary-600 dark:text-primary-400">
              Each face shows a solid color (no text)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
