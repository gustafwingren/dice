'use client';

import { useDiceStorage } from '@/hooks/useDiceStorage';
import { DiceLibraryCard } from './DiceLibraryCard';
import { DiceSetCard } from './DiceSetCard';
import { Die, DiceSet } from '@/types';
import { useRouter } from 'next/navigation';
import { DiceLibraryCardSkeleton, DiceSetCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, DiceIllustration } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { WarningIcon } from '@/components/icons';
import { PageHeader } from '@/components/layout/PageHeader';

export interface DiceLibraryProps {
  /** Called when a die is selected to load */
  onLoadDie?: (die: Die) => void;
  
  /** Called when a dice set is selected to load */
  onLoadDiceSet?: (diceSet: DiceSet) => void;
}

/**
 * DiceLibrary component - displays all saved dice in a grid
 * 
 * Features:
 * - Grid layout of dice cards
 * - Loading state
 * - Empty state
 * - Error handling
 * - Delete functionality
 */
export function DiceLibrary({ onLoadDie, onLoadDiceSet }: DiceLibraryProps) {
  const router = useRouter();
  const { dice, diceSets, isLoading, error, deleteDie, deleteDiceSet } = useDiceStorage();
  const { showToast } = useToast();
  
  const handleLoadDie = (die: Die) => {
    if (onLoadDie) {
      onLoadDie(die);
    } else {
      // Navigate to home page with die ID to load
      router.push(`/?id=${die.id}`);
    }
  };
  
  const handleDeleteDie = async (id: string) => {
    try {
      const dieToDelete = dice.find(d => d.id === id);
      await deleteDie(id);
      showToast(
        dieToDelete ? `Die "${dieToDelete.name}" deleted` : 'Die deleted',
        'success'
      );
    } catch (error) {
      console.error('Failed to delete die:', error);
      showToast('Failed to delete die. Please try again.', 'error');
    }
  };

  const handleLoadDiceSet = (diceSet: DiceSet) => {
    if (onLoadDiceSet) {
      onLoadDiceSet(diceSet);
    } else {
      // Navigate to set editor page with set ID
      router.push(`/set?id=${diceSet.id}`);
    }
  };

  const handleDeleteDiceSet = async (id: string) => {
    try {
      const setToDelete = diceSets.find(s => s.id === id);
      await deleteDiceSet(id);
      showToast(
        setToDelete ? `Dice set "${setToDelete.name}" deleted` : 'Dice set deleted',
        'success'
      );
    } catch (error) {
      console.error('Failed to delete dice set:', error);
      showToast('Failed to delete dice set. Please try again.', 'error');
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <span>🎲</span> Dice Sets
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }, (_, i) => (
              <DiceSetCardSkeleton key={i} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <span>🎯</span> Individual Dice
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <DiceLibraryCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="text-danger-600 mb-4">
            <WarningIcon className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-neutral-900 dark:text-neutral-100 font-semibold mb-2">Failed to load library</p>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (dice.length === 0 && diceSets.length === 0) {
    return (
      <EmptyState
        title="No dice or sets yet"
        description="Create your first custom die or dice set to get started! Customize colors, faces, and roll them anytime."
        icon={<DiceIllustration className="w-32 h-32 text-primary-300 dark:text-primary-700" />}
        actionLabel="Create Your First Die"
        onAction={() => router.push('/')}
        secondaryActionLabel="Create a Dice Set"
        onSecondaryAction={() => router.push('/set')}
      />
    );
  }
  
  // Dice grid
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Your Dice Library"
        subtitle={`${dice.length} ${dice.length === 1 ? 'die' : 'dice'}, ${diceSets.length} ${diceSets.length === 1 ? 'set' : 'sets'} saved`}
      />
      
      {/* Dice Sets Section */}
      {diceSets.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🎲</span>
            Dice Sets
            <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">({diceSets.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {diceSets.map((diceSet) => {
              // Get the Die objects for this set
              const setDice = diceSet.diceIds
                .map((id) => dice.find((d) => d.id === id))
                .filter((d): d is Die => d !== undefined);
              
              return (
                <DiceSetCard
                  key={diceSet.id}
                  diceSet={diceSet}
                  dice={setDice}
                  onClick={() => handleLoadDiceSet(diceSet)}
                  onDelete={handleDeleteDiceSet}
                />
              );
            })}
          </div>
        </section>
      )}
      
      {/* Individual Dice Section */}
      {dice.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">🎯</span>
            Individual Dice
            <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">({dice.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dice.map((die) => (
              <DiceLibraryCard
                key={die.id}
                die={die}
                onClick={handleLoadDie}
                onDelete={handleDeleteDie}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
