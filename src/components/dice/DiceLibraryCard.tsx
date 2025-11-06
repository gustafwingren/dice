'use client';

import { Die } from '@/types';
import { LibraryCard } from '../ui/LibraryCard';

export interface DiceLibraryCardProps {
  /** The die to display */
  die: Die;
  
  /** Called when card is clicked */
  onClick?: (die: Die) => void;
  
  /** Called when delete is requested */
  onDelete?: (id: string) => void;
  
  /** Called when duplicate is requested */
  onDuplicate?: (id: string) => void;
}

/**
 * DiceLibraryCard component - displays a die preview card in the library
 * 
 * Features:
 * - Die name and metadata
 * - Preview of first few faces
 * - Delete action
 * - Click to load
 */
export function DiceLibraryCard({
  die,
  onClick,
  onDelete,
  onDuplicate,
}: DiceLibraryCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(die);
    }
  };
  
  const handleDelete = () => {
    if (onDelete && confirm(`Delete "${die.name || 'Untitled Die'}"?`)) {
      onDelete(die.id);
    }
  };
  
  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(die.id);
    }
  };
  
  // Show first 6 faces as preview
  const previewFaces = die.faces.slice(0, 6);
  
  return (
    <LibraryCard
      title={die.name || 'Untitled Die'}
      subtitle={`${die.sides} sides • ${die.contentType}`}
      createdAt={new Date(die.createdAt)}
      onClick={handleCardClick}
      onDelete={handleDelete}
      onDuplicate={onDuplicate ? handleDuplicate : undefined}
      ariaLabel={`Load die ${die.name || 'Untitled Die'}`}
      hoverBorderColor="primary"
    >
      {/* Die preview */}
      <div className="p-5 flex-1 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="grid grid-cols-3 gap-3">
          {previewFaces.map((face) => (
            <div
              key={face.id}
              className="aspect-square rounded border-2 flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: face.contentType === 'color' ? face.color : die.backgroundColor,
                borderColor: die.textColor,
                color: face.contentType === 'color' ? 'transparent' : die.textColor,
              }}
            >
              {face.contentType !== 'color' && (
                <span className="truncate px-1">{face.value}</span>
              )}
            </div>
          ))}
        </div>
        {die.sides > 6 && (
          <p className="text-xs mt-2 text-center text-neutral-600 dark:text-neutral-400">
            +{die.sides - 6} more faces
          </p>
        )}
      </div>
    </LibraryCard>
  );
}
