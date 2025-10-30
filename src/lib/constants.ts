/**
 * Application-wide constants
 */

export const MIN_SIDES = 2;
export const MAX_SIDES = 101;
export const MIN_DICE_PER_SET = 1;
export const MAX_DICE_PER_SET = 6;
export const MAX_TEXT_LENGTH = 20;
export const MAX_NAME_LENGTH = 50;
export const DEFAULT_BG_COLOR = '#FFFFFF';
export const DEFAULT_TEXT_COLOR = '#000000';
export const MAX_SAFE_URL_LENGTH = 6000;
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * LocalStorage keys
 */
export const STORAGE_KEYS = {
  DICE_LIBRARY: 'diceCreator:dice',
  DICE_SETS: 'diceCreator:sets',
  SCHEMA_VERSION: 'diceCreator:schemaVersion',
  PREFERENCES: 'diceCreator:preferences'
} as const;
