/**
 * Type definitions for Digital Dice Creator
 * 
 * This file serves as the contract for all data structures in the application.
 * These types will be copied to src/types/index.ts during implementation.
 */

/**
 * Content type for a die face
 */
export type FaceContentType = 'number' | 'text' | 'color';

/**
 * A single face on a die
 */
export interface Face {
  /** Unique identifier for this face (1-indexed) */
  id: number;
  
  /** Type of content displayed on this face */
  contentType: FaceContentType;
  
  /** Display value for the face */
  value: string | number;
  
  /** Hex color code (only for contentType='color') */
  color?: string;
}

/**
 * A customizable die configuration
 */
export interface Die {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-defined name for the die */
  name: string;
  
  /** Number of sides (2-101) */
  sides: number;
  
  /** Background color of the die (hex) */
  backgroundColor: string;
  
  /** Text color for the die (hex) */
  textColor: string;
  
  /** Content type for all faces on this die */
  contentType: FaceContentType;
  
  /** Ordered array of faces (length must equal sides) */
  faces: Face[];
  
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}

/**
 * A set of dice that can be rolled together
 */
export interface DiceSet {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-defined name for the set */
  name: string;
  
  /** Array of die IDs in this set (1-6 dice) */
  diceIds: string[];
  
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  
  /** ISO 8601 timestamp of last modification */
  updatedAt: string;
}

/**
 * Share link configuration
 */
export interface ShareLink {
  /** Type of shared content */
  type: 'die' | 'set';
  
  /** Serialized die or dice set data */
  data: Die | DiceSet;
  
  /** Array of Die objects if type='set' */
  dice?: Die[];
  
  /** Version of encoding format */
  version: number;
}

/**
 * Result of a single die roll
 */
export interface DieRollResult {
  /** ID of the die that was rolled */
  dieId: string;
  
  /** The face that was rolled */
  face: Face;
  
  /** Random index (1-based) of rolled face */
  rolledIndex: number;
}

/**
 * Result of rolling a dice set
 */
export interface RollResult {
  /** ID of the dice set that was rolled */
  setId: string;
  
  /** Individual results for each die */
  results: DieRollResult[];
  
  /** ISO 8601 timestamp of the roll */
  timestamp: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  /** UI theme */
  theme: 'light' | 'dark';
  
  /** Animation speed */
  animationSpeed: 'slow' | 'normal' | 'fast';
  
  /** Enable sound effects */
  soundEnabled: boolean;
}

/**
 * Storage wrapper with versioning
 */
export interface StorageData<T> {
  /** Schema version */
  version: number;
  
  /** The actual data */
  data: T;
}

/**
 * Validation error types
 */
export type ValidationErrorCode =
  | 'INVALID_SIDES_RANGE'
  | 'INVALID_FACE_COUNT'
  | 'INVALID_TEXT_LENGTH'
  | 'INVALID_COLOR_FORMAT'
  | 'INVALID_SET_SIZE'
  | 'MIXED_CONTENT_TYPES'
  | 'INVALID_UUID'
  | 'INVALID_NAME_LENGTH'
  | 'EMPTY_CONTENT';

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    public code: ValidationErrorCode,
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Application-wide constants
 */
export const CONSTANTS = {
  /** Minimum number of sides per die */
  MIN_SIDES: 2,
  
  /** Maximum number of sides per die */
  MAX_SIDES: 101,
  
  /** Minimum dice in a set */
  MIN_DICE_PER_SET: 1,
  
  /** Maximum dice in a set */
  MAX_DICE_PER_SET: 6,
  
  /** Maximum character length for text faces */
  MAX_TEXT_LENGTH: 20,
  
  /** Maximum character length for die/set names */
  MAX_NAME_LENGTH: 50,
  
  /** Default die background color */
  DEFAULT_BG_COLOR: '#FFFFFF',
  
  /** Default die text color */
  DEFAULT_TEXT_COLOR: '#000000',
  
  /** Maximum URL length to warn user */
  MAX_SAFE_URL_LENGTH: 6000,
  
  /** Current storage schema version */
  CURRENT_SCHEMA_VERSION: 1
} as const;

/**
 * LocalStorage key structure
 */
export const STORAGE_KEYS = {
  /** Array of all saved dice */
  DICE_LIBRARY: 'diceCreator:dice',
  
  /** Array of all dice sets */
  DICE_SETS: 'diceCreator:sets',
  
  /** Schema version for migrations */
  SCHEMA_VERSION: 'diceCreator:schemaVersion',
  
  /** User preferences */
  PREFERENCES: 'diceCreator:preferences'
} as const;
