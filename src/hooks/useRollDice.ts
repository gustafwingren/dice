import { useState, useCallback } from 'react';
import { Die, Face } from '@/types';
import { rollDie, rollDiceSet } from '@/lib/random';

export type RollState = 'idle' | 'rolling' | 'complete';

export interface UseRollDiceResult {
  /** Current animation state */
  rollState: RollState;
  
  /** Result of the last roll (single face for die, array for set) */
  rollResult: Face | Face[] | null;
  
  /** Roll a single die */
  roll: (die: Die) => void;
  
  /** Roll multiple dice from a set */
  rollSet: (dice: Die[]) => void;
  
  /** Reset to idle state */
  reset: () => void;
  
  /** Whether a roll is currently in progress */
  isRolling: boolean;
}

/**
 * Hook for managing dice roll state and animation timing
 * Handles the roll animation lifecycle:
 * 1. idle -> rolling (animation starts)
 * 2. rolling -> complete (animation ends, result shown)
 * 3. complete -> idle (user can roll again)
 */
export function useRollDice(): UseRollDiceResult {
  const [rollState, setRollState] = useState<RollState>('idle');
  const [rollResult, setRollResult] = useState<Face | Face[] | null>(null);
  
  const roll = useCallback((die: Die) => {
    if (rollState === 'rolling') {
      return; // Prevent double-rolling
    }
    
    setRollState('rolling');
    
    // Roll immediately to determine result
    const result = rollDie(die);
    
    // Show animation for 1.5 seconds before revealing result
    setTimeout(() => {
      setRollResult(result);
      setRollState('complete');
    }, 1500);
  }, [rollState]);
  
  const rollSet = useCallback((dice: Die[]) => {
    if (rollState === 'rolling') {
      return; // Prevent double-rolling
    }
    
    setRollState('rolling');
    
    // Roll immediately to determine results
    const results = rollDiceSet(dice);
    
    // Show animation for 1.5 seconds before revealing results
    setTimeout(() => {
      setRollResult(results);
      setRollState('complete');
    }, 1500);
  }, [rollState]);
  
  const reset = useCallback(() => {
    setRollState('idle');
    setRollResult(null);
  }, []);
  
  return {
    rollState,
    rollResult,
    roll,
    rollSet,
    reset,
    isRolling: rollState === 'rolling',
  };
}
