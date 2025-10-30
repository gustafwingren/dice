/**
 * Unit tests for storage.ts
 * Tests storage operations with mocked localforage
 */

import { Die, DiceSet, StorageData } from '@/types';
import { createDie } from '@/lib/die-factory';
import { createDiceSet } from '@/lib/set-factory';

// Create a mutable reference for the mock store
// This allows us to replace the store instance in beforeEach
const mockStoreRef = { current: new Map<string, unknown>() };

// Mock localforage module
jest.mock('localforage', () => {
  return {
    __esModule: true,
    default: {
      createInstance: jest.fn(() => ({
        getItem: jest.fn((key: string) => {
          return Promise.resolve(mockStoreRef.current.get(key));
        }),
        setItem: jest.fn((key: string, value: unknown) => {
          mockStoreRef.current.set(key, value);
          return Promise.resolve(value);
        }),
        clear: jest.fn(() => {
          mockStoreRef.current.clear();
          return Promise.resolve();
        }),
      })),
    },
    createInstance: jest.fn(() => ({
      getItem: jest.fn((key: string) => {
        return Promise.resolve(mockStoreRef.current.get(key));
      }),
      setItem: jest.fn((key: string, value: unknown) => {
        mockStoreRef.current.set(key, value);
        return Promise.resolve(value);
      }),
      clear: jest.fn(() => {
        mockStoreRef.current.clear();
        return Promise.resolve();
      }),
    })),
  };
});

// Now import storage functions after mock is set up
import {
  saveDie,
  loadDice,
  loadDie,
  deleteDie,
  saveDiceSet,
  loadDiceSets,
  deleteDiceSet,
} from '@/lib/storage';

/**
 * Helper function to create a valid text die with populated face values
 */
function createTextDie(name: string, sides: number): Die {
  const die = createDie(name, sides, 'text');
  // Populate text values for all faces
  die.faces = die.faces.map((face, index) => ({
    ...face,
    value: `Option ${index + 1}`,
  }));
  return die;
}

describe('storage', () => {
  beforeEach(() => {
    // Create a fresh Map instance for each test to prevent interference
    mockStoreRef.current = new Map<string, unknown>();
    jest.clearAllMocks();
    
    // Initialize empty storage
    mockStoreRef.current.set('diceCreator:dice', {
      version: 1,
      data: [],
    } as StorageData<Die[]>);
    
    mockStoreRef.current.set('diceCreator:sets', {
      version: 1,
      data: [],
    } as StorageData<DiceSet[]>);
    
    mockStoreRef.current.set('diceCreator:schemaVersion', 1);
  });
  
  describe('saveDie', () => {
    it('should save a new die to storage', async () => {
      const die = createDie('Test Die', 6, 'number');
      
      await saveDie(die);
      
      const storageData = mockStoreRef.current.get('diceCreator:dice') as StorageData<Die[]>;
      expect(storageData.data).toHaveLength(1);
      expect(storageData.data[0].id).toBe(die.id);
      expect(storageData.data[0].name).toBe('Test Die');
    });
    
    it('should update an existing die', async () => {
      const die = createDie('Original Name', 6, 'number');
      await saveDie(die);
      
      const updatedDie = { ...die, name: 'Updated Name' };
      await saveDie(updatedDie);
      
      const storageData = mockStoreRef.current.get('diceCreator:dice') as StorageData<Die[]>;
      expect(storageData.data).toHaveLength(1);
      expect(storageData.data[0].name).toBe('Updated Name');
    });
    
    it('should throw validation error for invalid die', async () => {
      const invalidDie = { ...createDie('Test', 6, 'number'), sides: 1 };
      
      await expect(saveDie(invalidDie)).rejects.toThrow();
    });
  });
  
  describe('loadDice', () => {
    it('should return empty array when no dice saved', async () => {
      const dice = await loadDice();
      
      expect(dice).toEqual([]);
    });
    
    it('should return all saved dice', async () => {
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createTextDie('Die 2', 4);
      
      await saveDie(die1);
      await saveDie(die2);
      
      const dice = await loadDice();
      
      expect(dice).toHaveLength(2);
      expect(dice[0].name).toBe('Die 1');
      expect(dice[1].name).toBe('Die 2');
    });
  });
  
  describe('loadDie', () => {
    it('should return specific die by id', async () => {
      const die = createDie('Test Die', 6, 'number');
      await saveDie(die);
      
      const loaded = await loadDie(die.id);
      
      expect(loaded).toBeDefined();
      expect(loaded?.id).toBe(die.id);
      expect(loaded?.name).toBe('Test Die');
    });
    
    it('should return undefined for non-existent id', async () => {
      const loaded = await loadDie('non-existent-id');
      
      expect(loaded).toBeUndefined();
    });
  });
  
  describe('deleteDie', () => {
    it('should delete die from storage', async () => {
      const die = createDie('Test Die', 6, 'number');
      await saveDie(die);
      
      const deleted = await deleteDie(die.id);
      
      expect(deleted).toBe(true);
      
      const dice = await loadDice();
      expect(dice).toHaveLength(0);
    });
    
    it('should return false when deleting non-existent die', async () => {
      const deleted = await deleteDie('non-existent-id');
      
      expect(deleted).toBe(false);
    });
    
    it('should remove die from sets when deleted (cascading)', async () => {
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createTextDie('Die 2', 4);
      await saveDie(die1);
      await saveDie(die2);
      
      const diceSet = createDiceSet('Test Set', [die1.id, die2.id]);
      await saveDiceSet(diceSet);
      
      await deleteDie(die1.id);
      
      const sets = await loadDiceSets();
      expect(sets).toHaveLength(1);
      expect(sets[0].diceIds).toEqual([die2.id]);
    });
    
    it('should remove empty sets after cascading delete', async () => {
      const die = createDie('Die 1', 6, 'number');
      await saveDie(die);
      
      const diceSet = createDiceSet('Test Set', [die.id]);
      await saveDiceSet(diceSet);
      
      await deleteDie(die.id);
      
      const sets = await loadDiceSets();
      expect(sets).toHaveLength(0);
    });
  });
  
  describe('saveDiceSet', () => {
    it('should save a new dice set', async () => {
      const die1 = createDie('Die 1', 6, 'number');
      const die2 = createTextDie('Die 2', 4);
      await saveDie(die1);
      await saveDie(die2);
      
      const diceSet = createDiceSet('Test Set', [die1.id, die2.id]);
      
      await saveDiceSet(diceSet);
      
      const storageData = mockStoreRef.current.get('diceCreator:sets') as StorageData<DiceSet[]>;
      expect(storageData.data).toHaveLength(1);
      expect(storageData.data[0].id).toBe(diceSet.id);
    });
    
    it('should throw error if referenced dice do not exist', async () => {
      const die = createDie('Die 1', 6, 'number');
      const diceSet = createDiceSet('Test Set', [die.id]);
      
      await expect(saveDiceSet(diceSet)).rejects.toThrow('Referenced dice not found');
    });
    
    it('should enforce min/max dice per set', async () => {
      // Manually create invalid dice set to test validation
      // (factory won't allow empty array)
      const diceSet: DiceSet = {
        id: '12345678-1234-4234-8234-123456789012', // Valid UUID v4
        name: 'Empty Set',
        diceIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await expect(saveDiceSet(diceSet)).rejects.toThrow();
    });
  });
  
  describe('loadDiceSets', () => {
    it('should return empty array when no sets saved', async () => {
      const sets = await loadDiceSets();
      
      expect(sets).toEqual([]);
    });
    
    it('should return all saved sets', async () => {
      const die = createDie('Die 1', 6, 'number');
      await saveDie(die);
      
      const set1 = createDiceSet('Set 1', [die.id]);
      const set2 = createDiceSet('Set 2', [die.id]);
      
      await saveDiceSet(set1);
      await saveDiceSet(set2);
      
      const sets = await loadDiceSets();
      
      expect(sets).toHaveLength(2);
      expect(sets[0].name).toBe('Set 1');
      expect(sets[1].name).toBe('Set 2');
    });
  });
  
  describe('deleteDiceSet', () => {
    it('should delete set from storage', async () => {
      const die = createDie('Die 1', 6, 'number');
      await saveDie(die);
      
      const diceSet = createDiceSet('Test Set', [die.id]);
      
      await saveDiceSet(diceSet);
      
      const deleted = await deleteDiceSet(diceSet.id);
      
      expect(deleted).toBe(true);
      
      const sets = await loadDiceSets();
      expect(sets).toHaveLength(0);
    });
    
    it('should return false when deleting non-existent set', async () => {
      const deleted = await deleteDiceSet('non-existent-id');
      
      expect(deleted).toBe(false);
    });
    
    it('should not delete referenced dice when deleting set', async () => {
      const die = createDie('Die 1', 6, 'number');
      await saveDie(die);
      
      const diceSet = createDiceSet('Test Set', [die.id]);
      
      await saveDiceSet(diceSet);
      await deleteDiceSet(diceSet.id);
      
      const dice = await loadDice();
      expect(dice).toHaveLength(1);
    });
  });
});
