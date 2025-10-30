/**
 * React hook for managing dice set state
 * Provides state management for creating and editing dice sets with multiple dice
 */

import { useState, useCallback, useEffect } from 'react';
import { Die, DiceSet } from '@/types';
import { 
  createEmptyDiceSet, 
  addDieToSet, 
  removeDieFromSet,
  updateDiceSetName 
} from '@/lib/set-factory';
import { CONSTANTS } from '@/types';

export interface UseDiceSetStateReturn {
  diceSet: DiceSet;
  dice: Die[];
  errors: string[];
  isValid: boolean;
  
  // Dice set operations
  updateSetName: (name: string) => void;
  addDie: (die: Die) => void;
  removeDie: (dieId: string) => void;
  reorderDice: (fromIndex: number, toIndex: number) => void;
  
  // Utility actions
  reset: () => void;
  loadDiceSet: (diceSet: DiceSet, dice: Die[]) => void;
  canAddMoreDice: boolean;
}

/**
 * Hook for managing dice set state with validation
 * 
 * @param initialDiceSet - Optional initial dice set
 * @param initialDice - Optional array of initial dice
 * @returns Dice set state and update functions
 */
export function useDiceSetState(
  initialDiceSet?: DiceSet,
  initialDice?: Die[]
): UseDiceSetStateReturn {
  const [diceSet, setDiceSet] = useState<DiceSet>(() => 
    initialDiceSet || createEmptyDiceSet()
  );
  const [dice, setDice] = useState<Die[]>(() => initialDice || []);
  const [errors, setErrors] = useState<string[]>([]);

  // Update state when initial props change (for loading from library)
  useEffect(() => {
    if (initialDiceSet) {
      setDiceSet(initialDiceSet);
    }
    if (initialDice) {
      setDice(initialDice);
    }
  }, [initialDiceSet, initialDice]);

  // Validate dice set
  const validateDiceSet = useCallback((set: DiceSet, diceArray: Die[]): string[] => {
    const validationErrors: string[] = [];

    // Check dice count
    if (set.diceIds.length < CONSTANTS.MIN_DICE_PER_SET) {
      validationErrors.push(`Set must contain at least ${CONSTANTS.MIN_DICE_PER_SET} die`);
    }

    if (set.diceIds.length > CONSTANTS.MAX_DICE_PER_SET) {
      validationErrors.push(`Set cannot contain more than ${CONSTANTS.MAX_DICE_PER_SET} dice`);
    }

    // Check that all referenced dice exist
    const diceIds = new Set(diceArray.map(d => d.id));
    const missingDice = set.diceIds.filter(id => !diceIds.has(id));
    if (missingDice.length > 0) {
      validationErrors.push(`Set references ${missingDice.length} missing dice`);
    }

    // Check set name
    if (!set.name || set.name.trim().length === 0) {
      validationErrors.push('Set name cannot be empty');
    }

    if (set.name.length > CONSTANTS.MAX_NAME_LENGTH) {
      validationErrors.push(`Set name cannot exceed ${CONSTANTS.MAX_NAME_LENGTH} characters`);
    }

    return validationErrors;
  }, []);

  // Update errors whenever dice set or dice change
  const updateValidation = useCallback((newSet: DiceSet, newDice: Die[]) => {
    const validationErrors = validateDiceSet(newSet, newDice);
    setErrors(validationErrors);
  }, [validateDiceSet]);

  // Update set name
  const updateSetName = useCallback((name: string) => {
    const updatedSet = updateDiceSetName(diceSet, name);
    setDiceSet(updatedSet);
    updateValidation(updatedSet, dice);
  }, [diceSet, dice, updateValidation]);

  // Add die to set
  const addDie = useCallback((die: Die) => {
    try {
      const updatedSet = addDieToSet(diceSet, die.id);
      const updatedDice = [...dice, die];
      setDiceSet(updatedSet);
      setDice(updatedDice);
      updateValidation(updatedSet, updatedDice);
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => [...prev, error.message]);
      }
    }
  }, [diceSet, dice, updateValidation]);

  // Remove die from set
  const removeDie = useCallback((dieId: string) => {
    const updatedSet = removeDieFromSet(diceSet, dieId);
    const updatedDice = dice.filter(d => d.id !== dieId);
    setDiceSet(updatedSet);
    setDice(updatedDice);
    updateValidation(updatedSet, updatedDice);
  }, [diceSet, dice, updateValidation]);

  // Reorder dice in the set
  const reorderDice = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= dice.length || 
        toIndex < 0 || toIndex >= dice.length) {
      return;
    }

    const newDice = [...dice];
    const [movedDie] = newDice.splice(fromIndex, 1);
    newDice.splice(toIndex, 0, movedDie);

    const newDiceIds = newDice.map(d => d.id);
    const updatedSet = {
      ...diceSet,
      diceIds: newDiceIds,
    };

    setDice(newDice);
    setDiceSet(updatedSet);
    updateValidation(updatedSet, newDice);
  }, [dice, diceSet, updateValidation]);

  // Reset to empty state
  const reset = useCallback(() => {
    const emptySet = createEmptyDiceSet();
    setDiceSet(emptySet);
    setDice([]);
    setErrors([]);
  }, []);

  // Load existing dice set
  const loadDiceSet = useCallback((set: DiceSet, loadedDice: Die[]) => {
    setDiceSet(set);
    setDice(loadedDice);
    updateValidation(set, loadedDice);
  }, [updateValidation]);

  // Can add more dice?
  const canAddMoreDice = diceSet.diceIds.length < CONSTANTS.MAX_DICE_PER_SET;

  // Is valid?
  const isValid = errors.length === 0 && diceSet.diceIds.length >= CONSTANTS.MIN_DICE_PER_SET;

  return {
    diceSet,
    dice,
    errors,
    isValid,
    updateSetName,
    addDie,
    removeDie,
    reorderDice,
    reset,
    loadDiceSet,
    canAddMoreDice,
  };
}
