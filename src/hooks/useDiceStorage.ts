/**
 * React hook for managing dice storage operations
 * Provides state management and error handling for save/load/delete operations
 */

import { useState, useEffect, useCallback } from 'react';
import { Die, DiceSet } from '@/types';
import {
  saveDie as saveDieToStorage,
  loadDice as loadDiceFromStorage,
  deleteDie as deleteDieFromStorage,
  saveDiceSet as saveDiceSetToStorage,
  loadDiceSets as loadDiceSetsFromStorage,
  deleteDiceSet as deleteDiceSetFromStorage,
} from '@/lib/storage';
import { generateUUID } from '@/lib/uuid';
import { MAX_NAME_LENGTH } from '@/lib/constants';
import { getCurrentTimestamp } from '@/lib/timestamp';

interface UseDiceStorageReturn {
  // Dice state
  dice: Die[];
  diceSets: DiceSet[];
  isLoading: boolean;
  error: string | null;
  
  // Dice operations
  saveDie: (die: Die) => Promise<void>;
  deleteDie: (id: string) => Promise<boolean>;
  loadDie: (id: string) => Die | undefined;
  duplicateDie: (id: string) => Promise<Die | null>;
  
  // Dice set operations
  saveDiceSet: (diceSet: DiceSet) => Promise<void>;
  deleteDiceSet: (id: string) => Promise<boolean>;
  loadDiceSet: (id: string) => DiceSet | undefined;
  duplicateDiceSet: (id: string) => Promise<DiceSet | null>;
  
  // Utility operations
  refreshLibrary: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing dice storage with state management
 * Automatically loads dice and sets on mount
 * Provides error handling and loading states
 * 
 * @returns Storage operations and state
 */
export function useDiceStorage(): UseDiceStorageReturn {
  const [dice, setDice] = useState<Die[]>([]);
  const [diceSets, setDiceSets] = useState<DiceSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Load all dice and sets from storage
   */
  const refreshLibrary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [loadedDice, loadedSets] = await Promise.all([
        loadDiceFromStorage(),
        loadDiceSetsFromStorage(),
      ]);
      
      setDice(loadedDice);
      setDiceSets(loadedSets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load library';
      setError(errorMessage);
      console.error('Error loading library:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Load library on mount
   */
  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);
  
  /**
   * Save a die to storage and update state
   */
  const saveDie = useCallback(async (die: Die) => {
    setError(null);
    
    try {
      await saveDieToStorage(die);
      
      // Update local state
      setDice(prevDice => {
        const existingIndex = prevDice.findIndex(d => d.id === die.id);
        if (existingIndex >= 0) {
          // Update existing
          const newDice = [...prevDice];
          newDice[existingIndex] = die;
          return newDice;
        } else {
          // Add new
          return [...prevDice, die];
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save die';
      setError(errorMessage);
      throw err; // Re-throw so caller can handle
    }
  }, []);
  
  /**
   * Delete a die from storage and update state
   */
  const deleteDie = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      const deleted = await deleteDieFromStorage(id);
      
      if (deleted) {
        // Update local state - remove die
        setDice(prevDice => prevDice.filter(d => d.id !== id));
        
        // Update sets to remove deleted die references
        setDiceSets(prevSets => 
          prevSets
            .map(set => ({
              ...set,
              diceIds: set.diceIds.filter(dieId => dieId !== id),
            }))
            .filter(set => set.diceIds.length > 0) // Remove empty sets
        );
      }
      
      return deleted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete die';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  /**
   * Load a specific die from current state (no storage call)
   */
  const loadDie = useCallback((id: string): Die | undefined => {
    return dice.find(d => d.id === id);
  }, [dice]);
  
  /**
   * Duplicate a die - creates a copy with new ID and " (Copy)" suffix
   */
  const duplicateDie = useCallback(async (id: string): Promise<Die | null> => {
    setError(null);
    
    try {
      const originalDie = dice.find(d => d.id === id);
      if (!originalDie) {
        setError('Die not found');
        return null;
      }
      
      const now = getCurrentTimestamp();
      const copySuffix = ' (Copy)';
      const maxBaseLength = MAX_NAME_LENGTH - copySuffix.length;
      const baseName = originalDie.name.slice(0, maxBaseLength);
      const newName = baseName + copySuffix;
      
      // Create duplicate with new ID and updated metadata
      const duplicatedDie: Die = {
        ...originalDie,
        id: generateUUID(),
        name: newName,
        createdAt: now,
        updatedAt: now,
      };
      
      await saveDie(duplicatedDie);
      return duplicatedDie;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate die';
      setError(errorMessage);
      throw err;
    }
  }, [dice, saveDie]);
  
  /**
   * Save a dice set to storage and update state
   */
  const saveDiceSet = useCallback(async (diceSet: DiceSet) => {
    setError(null);
    
    try {
      await saveDiceSetToStorage(diceSet);
      
      // Update local state
      setDiceSets(prevSets => {
        const existingIndex = prevSets.findIndex(s => s.id === diceSet.id);
        if (existingIndex >= 0) {
          // Update existing
          const newSets = [...prevSets];
          newSets[existingIndex] = diceSet;
          return newSets;
        } else {
          // Add new
          return [...prevSets, diceSet];
        }
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save dice set';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  /**
   * Delete a dice set from storage and update state
   */
  const deleteDiceSet = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    
    try {
      const deleted = await deleteDiceSetFromStorage(id);
      
      if (deleted) {
        // Update local state
        setDiceSets(prevSets => prevSets.filter(s => s.id !== id));
      }
      
      return deleted;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dice set';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  /**
   * Load a specific dice set from current state (no storage call)
   */
  const loadDiceSet = useCallback((id: string): DiceSet | undefined => {
    return diceSets.find(s => s.id === id);
  }, [diceSets]);
  
  /**
   * Duplicate a dice set - creates a copy with new ID and " (Copy)" suffix
   */
  const duplicateDiceSet = useCallback(async (id: string): Promise<DiceSet | null> => {
    setError(null);
    
    try {
      const originalSet = diceSets.find(s => s.id === id);
      if (!originalSet) {
        setError('Dice set not found');
        return null;
      }
      
      const now = getCurrentTimestamp();
      const copySuffix = ' (Copy)';
      const maxBaseLength = MAX_NAME_LENGTH - copySuffix.length;
      const baseName = originalSet.name.slice(0, maxBaseLength);
      const newName = baseName + copySuffix;
      
      // Create duplicate with new ID and updated metadata
      const duplicatedSet: DiceSet = {
        ...originalSet,
        id: generateUUID(),
        name: newName,
        createdAt: now,
        updatedAt: now,
      };
      
      await saveDiceSet(duplicatedSet);
      return duplicatedSet;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate dice set';
      setError(errorMessage);
      throw err;
    }
  }, [diceSets, saveDiceSet]);
  
  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    dice,
    diceSets,
    isLoading,
    error,
    saveDie,
    deleteDie,
    loadDie,
    duplicateDie,
    saveDiceSet,
    deleteDiceSet,
    loadDiceSet,
    duplicateDiceSet,
    refreshLibrary,
    clearError,
  };
}
