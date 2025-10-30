/**
 * Factory functions for creating DiceSet instances
 */

import { DiceSet } from '@/types';
import { generateUUID } from './uuid';
import { getCurrentTimestamp } from './timestamp';
import { CONSTANTS } from '@/types';

/**
 * Creates a new DiceSet with a given name and dice IDs
 * 
 * @param name - Name for the dice set
 * @param diceIds - Array of die UUIDs (1-6 dice)
 * @returns A new DiceSet object
 * @throws Error if diceIds length is invalid
 */
export function createDiceSet(name: string, diceIds: string[]): DiceSet {
  if (diceIds.length < CONSTANTS.MIN_DICE_PER_SET || diceIds.length > CONSTANTS.MAX_DICE_PER_SET) {
    throw new Error(`Dice set must contain ${CONSTANTS.MIN_DICE_PER_SET}-${CONSTANTS.MAX_DICE_PER_SET} dice`);
  }

  return {
    id: generateUUID(),
    name: name || 'Untitled Set',
    diceIds: [...diceIds], // Create a copy to avoid mutations
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Creates a new empty DiceSet with a default name
 * 
 * @param name - Optional name for the set
 * @returns A new DiceSet object with no dice
 */
export function createEmptyDiceSet(name: string = 'New Dice Set'): DiceSet {
  return {
    id: generateUUID(),
    name,
    diceIds: [],
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Creates a copy of an existing dice set with a new ID and timestamps
 * 
 * @param diceSet - DiceSet to copy
 * @returns A new DiceSet object with copied configuration
 */
export function copyDiceSet(diceSet: DiceSet): DiceSet {
  return {
    ...diceSet,
    id: generateUUID(),
    name: `${diceSet.name} (Copy)`,
    diceIds: [...diceSet.diceIds],
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Updates a dice set with new dice IDs
 * 
 * @param diceSet - Existing dice set
 * @param diceIds - New array of die UUIDs
 * @returns Updated DiceSet object
 * @throws Error if diceIds length is invalid
 */
export function updateDiceSetDice(diceSet: DiceSet, diceIds: string[]): DiceSet {
  if (diceIds.length < CONSTANTS.MIN_DICE_PER_SET || diceIds.length > CONSTANTS.MAX_DICE_PER_SET) {
    throw new Error(`Dice set must contain ${CONSTANTS.MIN_DICE_PER_SET}-${CONSTANTS.MAX_DICE_PER_SET} dice`);
  }

  return {
    ...diceSet,
    diceIds: [...diceIds],
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Updates a dice set's name
 * 
 * @param diceSet - Existing dice set
 * @param name - New name
 * @returns Updated DiceSet object
 */
export function updateDiceSetName(diceSet: DiceSet, name: string): DiceSet {
  return {
    ...diceSet,
    name: name || diceSet.name,
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Adds a die to an existing dice set
 * 
 * @param diceSet - Existing dice set
 * @param dieId - UUID of die to add
 * @returns Updated DiceSet object
 * @throws Error if set already has maximum dice
 */
export function addDieToSet(diceSet: DiceSet, dieId: string): DiceSet {
  if (diceSet.diceIds.length >= CONSTANTS.MAX_DICE_PER_SET) {
    throw new Error(`Cannot add more than ${CONSTANTS.MAX_DICE_PER_SET} dice to a set`);
  }

  // Check if die is already in the set
  if (diceSet.diceIds.includes(dieId)) {
    return diceSet;
  }

  return {
    ...diceSet,
    diceIds: [...diceSet.diceIds, dieId],
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Removes a die from an existing dice set
 * 
 * @param diceSet - Existing dice set
 * @param dieId - UUID of die to remove
 * @returns Updated DiceSet object
 */
export function removeDieFromSet(diceSet: DiceSet, dieId: string): DiceSet {
  return {
    ...diceSet,
    diceIds: diceSet.diceIds.filter(id => id !== dieId),
    updatedAt: getCurrentTimestamp(),
  };
}
