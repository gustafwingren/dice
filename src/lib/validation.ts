/**
 * Validation functions for Digital Dice Creator
 */

import {
  Face,
  FaceContentType,
  Die,
  DiceSet,
  ValidationError,
  CONSTANTS
} from '@/types';

/**
 * Type guard for FaceContentType
 */
export function isFaceContentType(value: unknown): value is FaceContentType {
  return value === 'number' || value === 'text' || value === 'color';
}

/**
 * Validate hex color format
 */
export function isValidHexColor(value: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(value);
}

/**
 * Validate UUID v4 format
 */
export function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Type guard for Face
 */
export function isFace(value: unknown): value is Face {
  if (typeof value !== 'object' || value === null) return false;
  const f = value as Partial<Face>;
  
  return (
    typeof f.id === 'number' &&
    f.id >= 1 &&
    isFaceContentType(f.contentType) &&
    (typeof f.value === 'string' || typeof f.value === 'number') &&
    (f.contentType !== 'color' || (typeof f.color === 'string' && isValidHexColor(f.color)))
  );
}

/**
 * Validate face content - checks for empty or whitespace-only content
 * 
 * This function validates that face content is not empty or whitespace-only.
 * Numbers are always valid. For strings, the function strips line breaks and
 * checks that there is at least one non-whitespace character remaining.
 * 
 * @param value - The face content to validate (string or number)
 * @returns true if the content is valid (non-empty for strings, always true for numbers)
 * 
 * @example
 * validateFaceContent(5) // true
 * validateFaceContent("Hello") // true
 * validateFaceContent("   ") // false (whitespace only)
 * validateFaceContent("") // false (empty)
 * validateFaceContent("\n\n") // false (only line breaks)
 */
export function validateFaceContent(value: string | number): boolean {
  if (typeof value === 'number') return true;
  
  // Check if string is empty or contains only whitespace
  // trim() handles all Unicode whitespace characters
  return value.trim().length > 0;
}

/**
 * Validate a Face object
 * @throws ValidationError if invalid
 */
export function validateFace(face: unknown): asserts face is Face {
  if (typeof face !== 'object' || face === null) {
    throw new ValidationError('INVALID_FACE_COUNT', 'Face must be an object');
  }
  
  const f = face as Partial<Face>;
  
  if (typeof f.id !== 'number' || f.id < 1) {
    throw new ValidationError('INVALID_FACE_COUNT', 'Face id must be a positive integer', 'id');
  }
  
  if (!isFaceContentType(f.contentType)) {
    throw new ValidationError('MIXED_CONTENT_TYPES', 'Invalid content type', 'contentType');
  }
  
  if (typeof f.value !== 'string' && typeof f.value !== 'number') {
    throw new ValidationError('INVALID_TEXT_LENGTH', 'Face value must be string or number', 'value');
  }
  
  // Extract color check for better readability
  const isColorFace = f.contentType === 'color';
  
  // Whitespace validation - reject empty or whitespace-only content
  // Skip for color faces as they store content in the color property
  if (!isColorFace && !validateFaceContent(f.value)) {
    throw new ValidationError(
      'EMPTY_CONTENT',
      'Face content cannot be empty or whitespace only',
      'value'
    );
  }
  
  // Text validation
  if (f.contentType === 'text' && typeof f.value === 'string') {
    if (f.value.length > CONSTANTS.MAX_TEXT_LENGTH) {
      throw new ValidationError(
        'INVALID_TEXT_LENGTH',
        `Text cannot exceed ${CONSTANTS.MAX_TEXT_LENGTH} characters`,
        'value'
      );
    }
  }
  
  // Color validation
  if (isColorFace) {
    if (typeof f.color !== 'string' || !isValidHexColor(f.color)) {
      throw new ValidationError(
        'INVALID_COLOR_FORMAT',
        'Color must be a valid hex color (#RRGGBB)',
        'color'
      );
    }
  }
}

/**
 * Type guard for Die
 */
export function isDie(value: unknown): value is Die {
  if (typeof value !== 'object' || value === null) return false;
  const d = value as Partial<Die>;
  
  return (
    typeof d.id === 'string' &&
    isValidUUID(d.id) &&
    typeof d.name === 'string' &&
    d.name.length <= CONSTANTS.MAX_NAME_LENGTH &&
    typeof d.sides === 'number' &&
    d.sides >= CONSTANTS.MIN_SIDES &&
    d.sides <= CONSTANTS.MAX_SIDES &&
    isValidHexColor(d.backgroundColor ?? '') &&
    isValidHexColor(d.textColor ?? '') &&
    isFaceContentType(d.contentType) &&
    Array.isArray(d.faces) &&
    d.faces.length === d.sides &&
    d.faces.every(isFace) &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string'
  );
}

/**
 * Validate a Die object
 * @throws ValidationError if invalid
 */
export function validateDie(die: unknown): asserts die is Die {
  if (typeof die !== 'object' || die === null) {
    throw new ValidationError('INVALID_SIDES_RANGE', 'Die must be an object');
  }
  
  const d = die as Partial<Die>;
  
  // ID validation
  if (typeof d.id !== 'string' || !isValidUUID(d.id)) {
    throw new ValidationError('INVALID_UUID', 'Die id must be a valid UUID v4', 'id');
  }
  
  // Name validation
  if (typeof d.name !== 'string') {
    throw new ValidationError('INVALID_NAME_LENGTH', 'Die name must be a string', 'name');
  }
  if (d.name.length === 0) {
    throw new ValidationError('INVALID_NAME_LENGTH', 'Die name cannot be empty', 'name');
  }
  if (d.name.length > CONSTANTS.MAX_NAME_LENGTH) {
    throw new ValidationError(
      'INVALID_NAME_LENGTH',
      `Die name cannot exceed ${CONSTANTS.MAX_NAME_LENGTH} characters`,
      'name'
    );
  }
  
  // Sides validation
  if (typeof d.sides !== 'number') {
    throw new ValidationError('INVALID_SIDES_RANGE', 'Sides must be a number', 'sides');
  }
  if (d.sides < CONSTANTS.MIN_SIDES || d.sides > CONSTANTS.MAX_SIDES) {
    throw new ValidationError(
      'INVALID_SIDES_RANGE',
      `Sides must be between ${CONSTANTS.MIN_SIDES} and ${CONSTANTS.MAX_SIDES}`,
      'sides'
    );
  }
  
  // Color validation
  if (typeof d.backgroundColor !== 'string' || !isValidHexColor(d.backgroundColor)) {
    throw new ValidationError(
      'INVALID_COLOR_FORMAT',
      'Background color must be valid hex (#RRGGBB)',
      'backgroundColor'
    );
  }
  if (typeof d.textColor !== 'string' || !isValidHexColor(d.textColor)) {
    throw new ValidationError(
      'INVALID_COLOR_FORMAT',
      'Text color must be valid hex (#RRGGBB)',
      'textColor'
    );
  }
  
  // Content type validation
  if (!isFaceContentType(d.contentType)) {
    throw new ValidationError('MIXED_CONTENT_TYPES', 'Invalid content type', 'contentType');
  }
  
  // Faces validation
  if (!Array.isArray(d.faces)) {
    throw new ValidationError('INVALID_FACE_COUNT', 'Faces must be an array', 'faces');
  }
  if (d.faces.length !== d.sides) {
    throw new ValidationError(
      'INVALID_FACE_COUNT',
      `Die must have exactly ${d.sides} faces`,
      'faces'
    );
  }
  
  // Validate each face
  d.faces.forEach((face, index) => {
    try {
      validateFace(face);
      
      // Check face ID matches index
      if (face.id !== index + 1) {
        throw new ValidationError(
          'INVALID_FACE_COUNT',
          `Face at index ${index} must have id ${index + 1}`,
          'faces'
        );
      }
      
      // Check content type matches die
      if (face.contentType !== d.contentType) {
        throw new ValidationError(
          'MIXED_CONTENT_TYPES',
          'All faces must have same content type as die',
          'faces'
        );
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(
          error.code,
          `Face ${index + 1}: ${error.message}`,
          `faces[${index}].${error.field}`
        );
      }
      throw error;
    }
  });
  
  // Timestamp validation
  if (typeof d.createdAt !== 'string') {
    throw new ValidationError('INVALID_SIDES_RANGE', 'createdAt must be a string', 'createdAt');
  }
  if (typeof d.updatedAt !== 'string') {
    throw new ValidationError('INVALID_SIDES_RANGE', 'updatedAt must be a string', 'updatedAt');
  }
  
  // Try parsing timestamps
  try {
    new Date(d.createdAt).toISOString();
  } catch {
    throw new ValidationError('INVALID_SIDES_RANGE', 'createdAt must be valid ISO 8601', 'createdAt');
  }
  try {
    new Date(d.updatedAt).toISOString();
  } catch {
    throw new ValidationError('INVALID_SIDES_RANGE', 'updatedAt must be valid ISO 8601', 'updatedAt');
  }
}

/**
 * Type guard for DiceSet
 */
export function isDiceSet(value: unknown): value is DiceSet {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Partial<DiceSet>;
  
  return (
    typeof s.id === 'string' &&
    isValidUUID(s.id) &&
    typeof s.name === 'string' &&
    s.name.length <= CONSTANTS.MAX_NAME_LENGTH &&
    Array.isArray(s.diceIds) &&
    s.diceIds.length >= CONSTANTS.MIN_DICE_PER_SET &&
    s.diceIds.length <= CONSTANTS.MAX_DICE_PER_SET &&
    s.diceIds.every(id => typeof id === 'string' && isValidUUID(id)) &&
    typeof s.createdAt === 'string' &&
    typeof s.updatedAt === 'string'
  );
}

/**
 * Validate a DiceSet object
 * @throws ValidationError if invalid
 */
export function validateDiceSet(set: unknown): asserts set is DiceSet {
  if (typeof set !== 'object' || set === null) {
    throw new ValidationError('INVALID_SET_SIZE', 'Dice set must be an object');
  }
  
  const s = set as Partial<DiceSet>;
  
  // ID validation
  if (typeof s.id !== 'string' || !isValidUUID(s.id)) {
    throw new ValidationError('INVALID_UUID', 'Set id must be a valid UUID v4', 'id');
  }
  
  // Name validation
  if (typeof s.name !== 'string') {
    throw new ValidationError('INVALID_NAME_LENGTH', 'Set name must be a string', 'name');
  }
  if (s.name.length === 0) {
    throw new ValidationError('INVALID_NAME_LENGTH', 'Set name cannot be empty', 'name');
  }
  if (s.name.length > CONSTANTS.MAX_NAME_LENGTH) {
    throw new ValidationError(
      'INVALID_NAME_LENGTH',
      `Set name cannot exceed ${CONSTANTS.MAX_NAME_LENGTH} characters`,
      'name'
    );
  }
  
  // Dice IDs validation
  if (!Array.isArray(s.diceIds)) {
    throw new ValidationError('INVALID_SET_SIZE', 'diceIds must be an array', 'diceIds');
  }
  if (s.diceIds.length < CONSTANTS.MIN_DICE_PER_SET || s.diceIds.length > CONSTANTS.MAX_DICE_PER_SET) {
    throw new ValidationError(
      'INVALID_SET_SIZE',
      `Set must contain ${CONSTANTS.MIN_DICE_PER_SET}-${CONSTANTS.MAX_DICE_PER_SET} dice`,
      'diceIds'
    );
  }
  
  s.diceIds.forEach((id, index) => {
    if (typeof id !== 'string' || !isValidUUID(id)) {
      throw new ValidationError(
        'INVALID_UUID',
        `Die ID at index ${index} must be a valid UUID`,
        `diceIds[${index}]`
      );
    }
  });
  
  // Timestamp validation
  if (typeof s.createdAt !== 'string') {
    throw new ValidationError('INVALID_SET_SIZE', 'createdAt must be a string', 'createdAt');
  }
  if (typeof s.updatedAt !== 'string') {
    throw new ValidationError('INVALID_SET_SIZE', 'updatedAt must be a string', 'updatedAt');
  }
  
  // Try parsing timestamps
  try {
    new Date(s.createdAt).toISOString();
  } catch {
    throw new ValidationError('INVALID_SET_SIZE', 'createdAt must be valid ISO 8601', 'createdAt');
  }
  try {
    new Date(s.updatedAt).toISOString();
  } catch {
    throw new ValidationError('INVALID_SET_SIZE', 'updatedAt must be valid ISO 8601', 'updatedAt');
  }
}
