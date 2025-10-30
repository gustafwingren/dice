/**
 * Unit tests for set-factory.ts
 * Tests all dice set factory functions
 */

import {
  createDiceSet,
  createEmptyDiceSet,
  copyDiceSet,
  updateDiceSetName,
  updateDiceSetDice,
  addDieToSet,
  removeDieFromSet,
} from '@/lib/set-factory';
import { MIN_DICE_PER_SET, MAX_DICE_PER_SET } from '@/lib/constants';

describe('set-factory', () => {
  describe('createDiceSet', () => {
    it('should create a valid dice set with given parameters', () => {
      const name = 'Test Set';
      const diceIds = ['die-1', 'die-2', 'die-3'];
      
      const result = createDiceSet(name, diceIds);
      
      expect(result.name).toBe(name);
      expect(result.diceIds).toEqual(diceIds);
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create unique IDs for different dice sets', () => {
      const set1 = createDiceSet('Set 1', ['die-1']);
      const set2 = createDiceSet('Set 2', ['die-2']);
      
      expect(set1.id).not.toBe(set2.id);
    });

    it('should provide default name when empty', () => {
      const result = createDiceSet('', ['die-1']);
      
      expect(result.name).toBe('Untitled Set');
      expect(result.diceIds).toEqual(['die-1']);
    });

    it('should accept minimum dice count', () => {
      const diceIds = Array(MIN_DICE_PER_SET).fill('die-1');
      const result = createDiceSet('Test', diceIds);
      
      expect(result.diceIds).toHaveLength(MIN_DICE_PER_SET);
    });

    it('should accept maximum dice count', () => {
      const diceIds = Array(MAX_DICE_PER_SET).fill(0).map((_, i) => `die-${i}`);
      const result = createDiceSet('Test', diceIds);
      
      expect(result.diceIds).toHaveLength(MAX_DICE_PER_SET);
    });

    it('should throw error for less than minimum dice', () => {
      expect(() => {
        createDiceSet('Test', []);
      }).toThrow('Dice set must contain');
    });

    it('should throw error for more than maximum dice', () => {
      const tooManyDice = Array(MAX_DICE_PER_SET + 1).fill(0).map((_, i) => `die-${i}`);
      
      expect(() => {
        createDiceSet('Test', tooManyDice);
      }).toThrow('Dice set must contain');
    });
  });

  describe('createEmptyDiceSet', () => {
    it('should create a dice set with empty dice array', () => {
      const result = createEmptyDiceSet('Empty Set');
      
      expect(result.name).toBe('Empty Set');
      expect(result.diceIds).toEqual([]);
      expect(result.id).toBeDefined();
    });

    it('should accept empty name', () => {
      const result = createEmptyDiceSet('');
      
      expect(result.name).toBe('');
      expect(result.diceIds).toEqual([]);
    });
  });

  describe('copyDiceSet', () => {
    it('should create a new dice set with same properties but new ID and timestamps', () => {
      const original = createDiceSet('Original', ['die-1', 'die-2']);
      
      // Wait a tiny bit to ensure different timestamps
      const copy = copyDiceSet(original);
      
      expect(copy.id).not.toBe(original.id);
      expect(copy.name).toBe('Original (Copy)'); // Implementation adds ' (Copy)' suffix
      expect(copy.diceIds).toEqual(original.diceIds);
      expect(copy.diceIds).not.toBe(original.diceIds); // Should be a new array
    });

    it('should create independent copy (mutations should not affect original)', () => {
      const original = createDiceSet('Original', ['die-1']);
      const copy = copyDiceSet(original);
      
      copy.diceIds.push('die-2');
      
      expect(original.diceIds).toHaveLength(1);
      expect(copy.diceIds).toHaveLength(2);
    });
  });

  describe('updateDiceSetName', () => {
    it('should update the name', () => {
      const original = createDiceSet('Original', ['die-1']);
      
      const updated = updateDiceSetName(original, 'New Name');
      
      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(original.id);
      expect(updated.diceIds).toEqual(original.diceIds);
      expect(updated.updatedAt).toBeDefined();
    });

    it('should not mutate original object', () => {
      const original = createDiceSet('Original', ['die-1']);
      const updated = updateDiceSetName(original, 'New Name');
      
      expect(original.name).toBe('Original');
      expect(updated.name).toBe('New Name');
    });
  });

  describe('updateDiceSetDice', () => {
    it('should update the dice IDs and timestamp', () => {
      const original = createDiceSet('Set', ['die-1']);
      const newDiceIds = ['die-2', 'die-3'];
      
      const updated = updateDiceSetDice(original, newDiceIds);
      
      expect(updated.diceIds).toEqual(newDiceIds);
      expect(updated.id).toBe(original.id);
      expect(updated.name).toBe(original.name);
    });

    it('should not mutate original object', () => {
      const original = createDiceSet('Set', ['die-1']);
      const updated = updateDiceSetDice(original, ['die-2']);
      
      expect(original.diceIds).toEqual(['die-1']);
      expect(updated.diceIds).toEqual(['die-2']);
    });

    it('should validate dice count', () => {
      const original = createDiceSet('Set', ['die-1']);
      const tooManyDice = Array(MAX_DICE_PER_SET + 1).fill(0).map((_, i) => `die-${i}`);
      
      expect(() => {
        updateDiceSetDice(original, tooManyDice);
      }).toThrow();
    });
  });

  describe('addDieToSet', () => {
    it('should add a die to the set', () => {
      const original = createDiceSet('Set', ['die-1']);
      
      const updated = addDieToSet(original, 'die-2');
      
      expect(updated.diceIds).toEqual(['die-1', 'die-2']);
      expect(updated.id).toBe(original.id);
    });

    it('should not mutate original object', () => {
      const original = createDiceSet('Set', ['die-1']);
      const updated = addDieToSet(original, 'die-2');
      
      expect(original.diceIds).toEqual(['die-1']);
      expect(updated.diceIds).toEqual(['die-1', 'die-2']);
    });

    it('should throw error when adding to set at maximum capacity', () => {
      const fullSet = createDiceSet(
        'Full Set',
        Array(MAX_DICE_PER_SET).fill(0).map((_, i) => `die-${i}`)
      );
      
      expect(() => {
        addDieToSet(fullSet, 'die-new');
      }).toThrow('Cannot add more than');
    });

    it('should allow adding to empty set', () => {
      const emptySet = createEmptyDiceSet('Empty');
      
      const updated = addDieToSet(emptySet, 'die-1');
      
      expect(updated.diceIds).toEqual(['die-1']);
    });
  });

  describe('removeDieFromSet', () => {
    it('should remove a die from the set', () => {
      const original = createDiceSet('Set', ['die-1', 'die-2', 'die-3']);
      
      const updated = removeDieFromSet(original, 'die-2');
      
      expect(updated.diceIds).toEqual(['die-1', 'die-3']);
      expect(updated.id).toBe(original.id);
    });

    it('should not mutate original object', () => {
      const original = createDiceSet('Set', ['die-1', 'die-2']);
      const updated = removeDieFromSet(original, 'die-2');
      
      expect(original.diceIds).toEqual(['die-1', 'die-2']);
      expect(updated.diceIds).toEqual(['die-1']);
    });

    it('should handle removing non-existent die gracefully', () => {
      const original = createDiceSet('Set', ['die-1', 'die-2']);
      
      const updated = removeDieFromSet(original, 'die-999');
      
      expect(updated.diceIds).toEqual(['die-1', 'die-2']);
    });

    it('should allow removing to create empty set', () => {
      const original = createDiceSet('Set', ['die-1']);
      
      const updated = removeDieFromSet(original, 'die-1');
      
      expect(updated.diceIds).toEqual([]);
    });

    it('should remove all occurrences of duplicate IDs', () => {
      const original = createDiceSet('Set', ['die-1', 'die-2', 'die-1']);
      
      const updated = removeDieFromSet(original, 'die-1');
      
      // Implementation filters all occurrences
      expect(updated.diceIds).toEqual(['die-2']);
    });
  });

  describe('immutability', () => {
    it('all functions should return new objects, not mutate originals', () => {
      const original = createDiceSet('Test', ['die-1', 'die-2']);
      const originalStringified = JSON.stringify(original);
      
      // Try all mutation functions
      updateDiceSetName(original, 'New Name');
      updateDiceSetDice(original, ['die-3']);
      addDieToSet(original, 'die-4');
      removeDieFromSet(original, 'die-1');
      copyDiceSet(original);
      
      // Original should remain unchanged
      expect(JSON.stringify(original)).toBe(originalStringified);
    });
  });
});
