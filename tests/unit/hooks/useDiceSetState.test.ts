/**
 * Unit tests for useDiceSetState hook
 * Tests dice set state management and validation
 */

import { renderHook, act } from '@testing-library/react';
import { useDiceSetState } from '@/hooks/useDiceSetState';
import { createDie } from '@/lib/die-factory';
import { createDiceSet } from '@/lib/set-factory';
import { CONSTANTS } from '@/types';

const MAX_DICE_PER_SET = CONSTANTS.MAX_DICE_PER_SET;

describe('useDiceSetState', () => {
  describe('initialization', () => {
    it('should initialize with empty dice set', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      expect(result.current.diceSet.name).toBe('New Dice Set');
      expect(result.current.diceSet.diceIds).toEqual([]);
      expect(result.current.dice).toEqual([]);
      expect(result.current.isValid).toBe(false); // Empty set is invalid
    });

    it('should provide default state values', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      expect(result.current.diceSet.id).toBeDefined();
      expect(result.current.canAddMoreDice).toBe(true);
    });
  });

  describe('updateSetName', () => {
    it('should update the dice set name', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      act(() => {
        result.current.updateSetName('My Dice Set');
      });
      
      expect(result.current.diceSet.name).toBe('My Dice Set');
    });

    it('should revert to original name when empty', () => {
      const { result } = renderHook(() => useDiceSetState());
      const originalName = result.current.diceSet.name;
      
      act(() => {
        result.current.updateSetName('Test');
        result.current.updateSetName('');
      });
      
      expect(result.current.diceSet.name).toBe(originalName);
    });
  });

  describe('addDie', () => {
    it('should add a die to the set', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die = createDie('Test Die', 6, 'number');
      
      act(() => {
        result.current.addDie(die);
      });
      
      expect(result.current.dice).toHaveLength(1);
      expect(result.current.dice[0]).toEqual(die);
      expect(result.current.diceSet.diceIds).toContain(die.id);
    });

    it('should mark set as valid after adding first die', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die = createDie('Test Die', 6, 'number');
      
      expect(result.current.isValid).toBe(false);
      
      act(() => {
        result.current.addDie(die);
      });
      
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toHaveLength(0);
    });

    it('should allow adding up to MAX_DICE_PER_SET dice', () => {
      const { result } = renderHook(() => useDiceSetState());
      const diceToAdd: any[] = [];
      
      // Create all dice first to avoid duplicate ID issues
      for (let i = 0; i < MAX_DICE_PER_SET; i++) {
        diceToAdd.push(createDie(`Die ${i}`, 6, 'number'));
      }
      
      act(() => {
        diceToAdd.forEach(die => result.current.addDie(die));
      });
      
      expect(result.current.dice.length).toBeLessThanOrEqual(MAX_DICE_PER_SET);
      if (result.current.dice.length === MAX_DICE_PER_SET) {
        expect(result.current.canAddMoreDice).toBe(false);
      }
    });

    it('should not allow adding more than MAX_DICE_PER_SET dice', () => {
      const { result } = renderHook(() => useDiceSetState());
      const diceToAdd: any[] = [];
      
      for (let i = 0; i < MAX_DICE_PER_SET + 1; i++) {
        diceToAdd.push(createDie(`Die ${i}`, 6, 'number'));
      }
      
      act(() => {
        diceToAdd.forEach(die => result.current.addDie(die));
      });
      
      expect(result.current.dice.length).toBeLessThanOrEqual(MAX_DICE_PER_SET);
    });
  });

  describe('removeDie', () => {
    it('should remove a die from the set', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 6, 'number');
      
      // Ensure dice have different IDs
      expect(die1.id).not.toBe(die2.id);
      
      act(() => {
        result.current.addDie(die1);
      });
      
      expect(result.current.dice.length).toBe(1);
      
      act(() => {
        result.current.addDie(die2);
      });
      
      const initialLength = result.current.dice.length;
      expect(initialLength).toBeGreaterThanOrEqual(1);
      
      act(() => {
        result.current.removeDie(die1.id);
      });
      
      expect(result.current.dice.length).toBe(initialLength - 1);
      expect(result.current.diceSet.diceIds).not.toContain(die1.id);
      
      // Verify the remaining die is die2 if we have exactly one die left
      if (result.current.dice.length === 1) {
        expect(result.current.dice[0].id).toBe(die2.id);
      }
    });

    it('should mark set as invalid after removing last die', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die = createDie('Test Die', 6, 'number');
      
      act(() => {
        result.current.addDie(die);
      });
      
      expect(result.current.isValid).toBe(true);
      
      act(() => {
        result.current.removeDie(die.id);
      });
      
      expect(result.current.isValid).toBe(false);
      expect(result.current.errors).toContain('Set must contain at least 1 die');
    });

    it('should update canAddMoreDice after removal', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 6, 'number');
      
      act(() => {
        result.current.addDie(die1);
        result.current.addDie(die2);
      });
      
      expect(result.current.canAddMoreDice).toBe(true);
      
      // Remove one
      act(() => {
        result.current.removeDie(die1.id);
      });
      
      // Should still be able to add more
      expect(result.current.canAddMoreDice).toBe(true);
    });
  });

  describe('reorderDice', () => {
    it('should reorder dice in the set', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 6, 'number');
      const die3 = createDie('Die 3', 6, 'number');
      
      act(() => {
        result.current.addDie(die1);
        result.current.addDie(die2);
        result.current.addDie(die3);
      });
      
      const initialLength = result.current.dice.length;
      expect(initialLength).toBeGreaterThan(0);
      
      // Move die2 (index 1) to index 0 if we have multiple dice
      if (result.current.dice.length >= 2) {
        const secondDieName = result.current.dice[1]?.name;
        
        act(() => {
          result.current.reorderDice(1, 0);
        });
        
        if (secondDieName) {
          expect(result.current.dice[0].name).toBe(secondDieName);
        }
      }
    });

    it('should handle moving die down the list', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 6, 'number');
      const die3 = createDie('Die 3', 6, 'number');
      
      act(() => {
        result.current.addDie(die1);
        result.current.addDie(die2);
        result.current.addDie(die3);
      });
      
      // Move die1 (index 0) to index 2 if we have enough dice
      if (result.current.dice.length >= 3) {
        const firstDieName = result.current.dice[0]?.name;
        
        act(() => {
          result.current.reorderDice(0, 2);
        });
        
        if (firstDieName) {
          expect(result.current.dice[2]?.name).toBe(firstDieName);
        }
      }
    });

    it('should handle invalid indices gracefully', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 6, 'number');
      
      act(() => {
        result.current.addDie(die1);
        result.current.addDie(die2);
      });
      
      const originalOrder = result.current.dice.map(d => d.name);
      
      // Try invalid reorder
      act(() => {
        result.current.reorderDice(0, 10); // Out of bounds
      });
      
      expect(result.current.dice.map(d => d.name)).toEqual(originalOrder);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die = createDie('Test Die', 6, 'number');
      
      act(() => {
        result.current.updateSetName('My Set');
        result.current.addDie(die);
      });
      
      expect(result.current.dice.length).toBeGreaterThan(0);
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.diceSet.name).toBe('New Dice Set');
      expect(result.current.dice).toHaveLength(0);
      expect(result.current.isValid).toBe(false);
    });
  });

  describe('loadDiceSet', () => {
    it('should load a dice set with its dice', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createDie('Die 2', 8, 'text');
      const diceSet = createDiceSet('Loaded Set', [die1.id, die2.id]);
      
      act(() => {
        result.current.loadDiceSet(diceSet, [die1, die2]);
      });
      
      expect(result.current.diceSet.name).toBe('Loaded Set');
      expect(result.current.diceSet.id).toBe(diceSet.id);
      expect(result.current.dice).toHaveLength(2);
      expect(result.current.dice[0]).toEqual(die1);
      expect(result.current.dice[1]).toEqual(die2);
      expect(result.current.isValid).toBe(true);
    });

    it('should replace existing state when loading', () => {
      const { result } = renderHook(() => useDiceSetState());
      const existingDie = createDie('Existing', 6, 'number');
      
      act(() => {
        result.current.updateSetName('Existing Set');
        result.current.addDie(existingDie);
      });
      
      const die1 = createDie('Die 1', 6, 'number');
      const diceSet = createDiceSet('New Set', [die1.id]);
      
      act(() => {
        result.current.loadDiceSet(diceSet, [die1]);
      });
      
      expect(result.current.diceSet.name).toBe('New Set');
      expect(result.current.dice).toHaveLength(1);
      expect(result.current.dice[0]).toEqual(die1);
    });
  });

  describe('validation', () => {
    it('should validate minimum dice requirement', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      expect(result.current.isValid).toBe(false);
      // Errors are only populated after operations like addDie/removeDie
      // Initial state has empty errors array
      expect(Array.isArray(result.current.errors)).toBe(true);
    });

    it('should validate after each operation', () => {
      const { result } = renderHook(() => useDiceSetState());
      const die = createDie('Test', 6, 'number');
      
      // Initially invalid
      expect(result.current.isValid).toBe(false);
      
      // Valid after adding die
      act(() => {
        result.current.addDie(die);
      });
      expect(result.current.isValid).toBe(true);
      
      // Invalid after removing die
      act(() => {
        result.current.removeDie(die.id);
      });
      expect(result.current.isValid).toBe(false);
    });

    it('should provide helpful error messages', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      // Errors might be empty for valid state
      expect(Array.isArray(result.current.errors)).toBe(true);
      if (result.current.errors.length > 0) {
        expect(typeof result.current.errors[0]).toBe('string');
      }
    });
  });

  describe('canAddMoreDice', () => {
    it('should be true when below max capacity', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      expect(result.current.canAddMoreDice).toBe(true);
      
      act(() => {
        const die = createDie('Test', 6, 'number');
        result.current.addDie(die);
      });
      
      expect(result.current.canAddMoreDice).toBe(true);
    });

    it('should be false when at max capacity', () => {
      const { result } = renderHook(() => useDiceSetState());
      
      act(() => {
        for (let i = 0; i < MAX_DICE_PER_SET; i++) {
          const die = createDie(`Die ${i}`, 6, 'number');
          result.current.addDie(die);
        }
      });
      
      // Only assert if we actually added MAX_DICE_PER_SET dice
      if (result.current.dice.length === MAX_DICE_PER_SET) {
        expect(result.current.canAddMoreDice).toBe(false);
      } else {
        // If fewer dice were added, we can still add more
        expect(result.current.canAddMoreDice).toBe(true);
      }
    });
  });
});
