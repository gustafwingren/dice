'use client';

import { DiceSet, Die } from '@/types';
import { LibraryCard } from '../ui/LibraryCard';

export interface DiceSetCardProps {
  /** The dice set to display */
  diceSet: DiceSet;
  
  /** Array of dice in this set */
  dice: Die[];
  
  /** Called when card is clicked to load */
  onClick: (diceSet: DiceSet) => void;
  
  /** Called when delete is requested */
  onDelete: (id: string) => void;
}

/**
 * DiceSetCard component - displays a dice set card with preview
 * 
 * Features:
 * - Shows set name and dice count
 * - Preview grid of dice in the set
 * - Click to load
 * - Delete button
 */
export function DiceSetCard({
  diceSet,
  dice,
  onClick,
  onDelete,
}: DiceSetCardProps) {
  const handleClick = () => {
    onClick(diceSet);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete dice set "${diceSet.name}"? This will not delete the individual dice.`)) {
      onDelete(diceSet.id);
    }
  };

  return (
    <LibraryCard
      title={diceSet.name}
      subtitle={`${dice.length} ${dice.length === 1 ? 'die' : 'dice'}`}
      createdAt={new Date(diceSet.createdAt)}
      onClick={handleClick}
      onDelete={handleDelete}
      ariaLabel={`Load dice set: ${diceSet.name}`}
      hoverBorderColor="accent"
    >
      {/* Dice preview grid */}
      <div className="p-5 flex-1">
        <div className="grid grid-cols-3 gap-3">
          {dice.slice(0, 6).map((die) => (
            <div
              key={die.id}
              className="aspect-square rounded border-2 flex items-center justify-center text-center p-2"
              style={{
                backgroundColor: die.backgroundColor,
                borderColor: die.textColor,
              }}
            >
              {die.contentType === 'color' ? (
                <div
                  className="w-full h-full rounded"
                  style={{ backgroundColor: die.faces[0]?.color || die.backgroundColor }}
                />
              ) : (
                <div
                  className="text-xs font-semibold truncate"
                  style={{ color: die.textColor }}
                >
                  {die.name}
                </div>
              )}
            </div>
          ))}
        </div>
        {dice.length > 6 && (
          <p className="text-xs mt-3 text-center text-neutral-600 dark:text-neutral-400">
            +{dice.length - 6} more {dice.length - 6 === 1 ? 'die' : 'dice'}
          </p>
        )}
      </div>
    </LibraryCard>
  );
}
