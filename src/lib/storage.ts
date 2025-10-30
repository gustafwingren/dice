/**
 * Storage wrapper using localforage for IndexedDB with localStorage fallback
 * Handles saving, loading, and deleting dice and dice sets
 */

import localforage from 'localforage';
import { Die, DiceSet, StorageData, STORAGE_KEYS, CONSTANTS } from '@/types';
import { validateDie, validateDiceSet } from './validation';

// Lazy-initialize localforage only in browser (not during SSG build)
let diceStore: LocalForage | null = null;

function getDiceStore(): LocalForage {
  if (!diceStore) {
    // Only initialize in browser environment
    if (typeof window === 'undefined') {
      throw new Error('Storage can only be used in browser environment');
    }
    diceStore = localforage.createInstance({
      name: 'DiceCreator',
      storeName: 'dice_library',
      description: 'Storage for custom dice and dice sets',
    });
  }
  return diceStore;
}

/**
 * Get current schema version from storage
 */
async function getSchemaVersion(): Promise<number> {
  const store = getDiceStore();
  const version = await store.getItem<number>(STORAGE_KEYS.SCHEMA_VERSION);
  return version ?? CONSTANTS.CURRENT_SCHEMA_VERSION;
}

/**
 * Set schema version in storage
 */
async function setSchemaVersion(version: number): Promise<void> {
  const store = getDiceStore();
  await store.setItem(STORAGE_KEYS.SCHEMA_VERSION, version);
}

/**
 * Initialize storage with default values if empty
 */
async function initializeStorage(): Promise<void> {
  const version = await getSchemaVersion();
  
  if (version !== CONSTANTS.CURRENT_SCHEMA_VERSION) {
    // Future: Handle migrations here
    await setSchemaVersion(CONSTANTS.CURRENT_SCHEMA_VERSION);
  }
  
  const store = getDiceStore();
  
  // Initialize empty arrays if they don't exist
  const diceData = await store.getItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY);
  if (!diceData) {
    await store.setItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: [],
    });
  }
  
  const setsData = await store.getItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS);
  if (!setsData) {
    await store.setItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: [],
    });
  }
}

/**
 * Save a die to storage
 * Validates the die before saving and handles errors gracefully
 * 
 * @param die - The die to save
 * @throws {ValidationError} If die validation fails
 * @throws {Error} If storage quota exceeded or other storage error
 */
export async function saveDie(die: Die): Promise<void> {
  // Validate die before saving
  validateDie(die);
  
  try {
    await initializeStorage();
    const store = getDiceStore();
    
    // Load current dice library
    const storageData = await store.getItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY);
    const diceLibrary = storageData?.data ?? [];
    
    // Check if die already exists (by ID)
    const existingIndex = diceLibrary.findIndex(d => d.id === die.id);
    
    if (existingIndex >= 0) {
      // Update existing die
      diceLibrary[existingIndex] = die;
    } else {
      // Add new die
      diceLibrary.push(die);
    }
    
    // Save updated library
    await store.setItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: diceLibrary,
    });
  } catch (error) {
    // Check for quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage full - please delete old dice to continue');
    }
    throw error;
  }
}

/**
 * Load all saved dice from storage
 * 
 * @returns Array of all saved dice
 */
export async function loadDice(): Promise<Die[]> {
  try {
    await initializeStorage();
    const store = getDiceStore();
    const storageData = await store.getItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY);
    return storageData?.data ?? [];
  } catch (error) {
    console.error('Error loading dice:', error);
    return [];
  }
}

/**
 * Load a specific die by ID
 * 
 * @param id - Die UUID to load
 * @returns The die if found, undefined otherwise
 */
export async function loadDie(id: string): Promise<Die | undefined> {
  const dice = await loadDice();
  return dice.find(d => d.id === id);
}

/**
 * Delete a die from storage
 * Also removes the die from any sets that contain it
 * 
 * @param id - UUID of die to delete
 * @returns True if die was deleted, false if not found
 */
export async function deleteDie(id: string): Promise<boolean> {
  try {
    await initializeStorage();
    const store = getDiceStore();
    
    // Load current dice library
    const storageData = await store.getItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY);
    const diceLibrary = storageData?.data ?? [];
    
    // Find and remove die
    const filteredDice = diceLibrary.filter(d => d.id !== id);
    
    // If no dice were removed, die doesn't exist
    if (filteredDice.length === diceLibrary.length) {
      return false;
    }
    
    // Save updated library
    await store.setItem<StorageData<Die[]>>(STORAGE_KEYS.DICE_LIBRARY, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: filteredDice,
    });
    
    // Remove die from any sets (cascading delete)
    const setsData = await store.getItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS);
    const diceSets = setsData?.data ?? [];
    
    const updatedSets = diceSets
      .map(set => ({
        ...set,
        diceIds: set.diceIds.filter(dieId => dieId !== id),
      }))
      .filter(set => set.diceIds.length > 0); // Remove empty sets
    
    await store.setItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: updatedSets,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting die:', error);
    throw error;
  }
}

/**
 * Save a dice set to storage
 * Validates that all referenced dice exist
 * 
 * @param diceSet - The dice set to save
 * @throws {Error} If referenced dice don't exist or validation fails
 */
export async function saveDiceSet(diceSet: DiceSet): Promise<void> {
  // Validate dice set before saving
  validateDiceSet(diceSet);
  
  try {
    // Verify all referenced dice exist
    const diceLibrary = await loadDice();
    const existingDiceIds = new Set(diceLibrary.map(d => d.id));
    
    const missingDice = diceSet.diceIds.filter(id => !existingDiceIds.has(id));
    if (missingDice.length > 0) {
      throw new Error(`Referenced dice not found: ${missingDice.join(', ')}`);
    }
    
    await initializeStorage();
    const store = getDiceStore();
    
    // Load current dice sets
    const storageData = await store.getItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS);
    const diceSets = storageData?.data ?? [];
    
    // Check if set already exists (by ID)
    const existingIndex = diceSets.findIndex(s => s.id === diceSet.id);
    
    if (existingIndex >= 0) {
      // Update existing set
      diceSets[existingIndex] = diceSet;
    } else {
      // Add new set
      diceSets.push(diceSet);
    }
    
    // Save updated sets
    await store.setItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: diceSets,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error('Storage full - please delete old dice to continue');
    }
    throw error;
  }
}

/**
 * Load all saved dice sets from storage
 * 
 * @returns Array of all saved dice sets
 */
export async function loadDiceSets(): Promise<DiceSet[]> {
  try {
    await initializeStorage();
    const store = getDiceStore();
    const storageData = await store.getItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS);
    return storageData?.data ?? [];
  } catch (error) {
    console.error('Error loading dice sets:', error);
    return [];
  }
}

/**
 * Load a specific dice set by ID
 * 
 * @param id - Dice set UUID to load
 * @returns The dice set if found, undefined otherwise
 */
export async function loadDiceSet(id: string): Promise<DiceSet | undefined> {
  const sets = await loadDiceSets();
  return sets.find(s => s.id === id);
}

/**
 * Delete a dice set from storage
 * Does not delete the individual dice in the set
 * 
 * @param id - UUID of dice set to delete
 * @returns True if set was deleted, false if not found
 */
export async function deleteDiceSet(id: string): Promise<boolean> {
  try {
    await initializeStorage();
    const store = getDiceStore();
    
    const storageData = await store.getItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS);
    const diceSets = storageData?.data ?? [];
    
    // Find and remove set
    const filteredSets = diceSets.filter(s => s.id !== id);
    
    // If no sets were removed, set doesn't exist
    if (filteredSets.length === diceSets.length) {
      return false;
    }
    
    // Save updated sets
    await store.setItem<StorageData<DiceSet[]>>(STORAGE_KEYS.DICE_SETS, {
      version: CONSTANTS.CURRENT_SCHEMA_VERSION,
      data: filteredSets,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting dice set:', error);
    throw error;
  }
}

/**
 * Clear all storage (useful for testing/debugging)
 * 
 * @warning This will delete all saved dice and sets!
 */
export async function clearAllStorage(): Promise<void> {
  const store = getDiceStore();
  await store.clear();
  await initializeStorage();
}

/**
 * Clear all dice from storage (alias for testing convenience)
 * 
 * @warning This will delete all saved dice and sets!
 */
export async function clearAllDice(): Promise<void> {
  await clearAllStorage();
}
