'use client';

import { DiceLibrary } from '@/components/dice/DiceLibrary';
import { PageLayout } from '@/components/layout/PageLayout';
import { Die, DiceSet } from '@/types';
import { useRouter } from 'next/navigation';

/**
 * Library page - displays all saved dice and sets
 */
export default function LibraryPage() {
  const router = useRouter();
  
  const handleLoadDie = (die: Die) => {
    // Navigate to editor with the die ID as URL parameter
    // The home page will load the die and create a copy per FR-013
    router.push(`/?id=${die.id}`);
  };
  
  const handleLoadDiceSet = (diceSet: DiceSet) => {
    // Navigate to set editor with the set ID as URL parameter
    // The set page will load the set and create copies per FR-013
    router.push(`/set?id=${diceSet.id}`);
  };
  
  return (
    <PageLayout>
      <DiceLibrary onLoadDie={handleLoadDie} onLoadDiceSet={handleLoadDiceSet} />
    </PageLayout>
  );
}
