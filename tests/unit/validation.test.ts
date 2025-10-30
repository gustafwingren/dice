/**
 * Unit tests for validation functions
 */

import {
  isFaceContentType,
  isValidHexColor,
  isValidUUID,
  validateFaceContent,
  validateFace,
  validateDie,
  validateDiceSet
} from '@/lib/validation';
import { ValidationError, CONSTANTS } from '@/types';

describe('Validation Utilities', () => {
  describe('isFaceContentType', () => {
    it('should return true for valid content types', () => {
      expect(isFaceContentType('number')).toBe(true);
      expect(isFaceContentType('text')).toBe(true);
      expect(isFaceContentType('color')).toBe(true);
    });

    it('should return false for invalid content types', () => {
      expect(isFaceContentType('invalid')).toBe(false);
      expect(isFaceContentType(123)).toBe(false);
      expect(isFaceContentType(null)).toBe(false);
      expect(isFaceContentType(undefined)).toBe(false);
    });
  });

  describe('isValidHexColor', () => {
    it('should return true for valid hex colors', () => {
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#FF5733')).toBe(true);
      expect(isValidHexColor('#aabbcc')).toBe(true);
    });

    it('should return false for invalid hex colors', () => {
      expect(isValidHexColor('FFFFFF')).toBe(false);
      expect(isValidHexColor('#FFF')).toBe(false);
      expect(isValidHexColor('#GGGGGG')).toBe(false);
      expect(isValidHexColor('red')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(false); // Not v4
    });

    it('should return false for invalid UUIDs', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('validateFaceContent', () => {
    it('should return true for numbers', () => {
      expect(validateFaceContent(0)).toBe(true);
      expect(validateFaceContent(5)).toBe(true);
      expect(validateFaceContent(-10)).toBe(true);
      expect(validateFaceContent(999)).toBe(true);
    });

    it('should return true for non-empty strings', () => {
      expect(validateFaceContent('Hello')).toBe(true);
      expect(validateFaceContent('A')).toBe(true);
      expect(validateFaceContent('Test content')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validateFaceContent('')).toBe(false);
    });

    it('should return false for whitespace-only strings', () => {
      expect(validateFaceContent('   ')).toBe(false);
      expect(validateFaceContent('\t')).toBe(false);
      expect(validateFaceContent('\t\t  ')).toBe(false);
    });

    it('should return false for strings with only line breaks', () => {
      expect(validateFaceContent('\n')).toBe(false);
      expect(validateFaceContent('\n\n')).toBe(false);
      expect(validateFaceContent('\r\n')).toBe(false);
      expect(validateFaceContent('\r')).toBe(false);
    });

    it('should return false for mixed whitespace and line breaks', () => {
      expect(validateFaceContent('  \n  ')).toBe(false);
      expect(validateFaceContent('\t\n\r')).toBe(false);
      expect(validateFaceContent(' \n \r\n \t ')).toBe(false);
    });

    it('should return true for strings with content and whitespace', () => {
      expect(validateFaceContent('  Hello  ')).toBe(true);
      expect(validateFaceContent('\nTest\n')).toBe(true);
      expect(validateFaceContent(' A ')).toBe(true);
    });
  });

  describe('validateFace', () => {
    it('should accept valid number face', () => {
      const face = {
        id: 1,
        contentType: 'number' as const,
        value: 6
      };
      expect(() => validateFace(face)).not.toThrow();
    });

    it('should accept valid text face', () => {
      const face = {
        id: 1,
        contentType: 'text' as const,
        value: 'Hello'
      };
      expect(() => validateFace(face)).not.toThrow();
    });

    it('should accept valid color face', () => {
      const face = {
        id: 1,
        contentType: 'color' as const,
        value: 'Red',
        color: '#FF0000'
      };
      expect(() => validateFace(face)).not.toThrow();
    });

    it('should reject text longer than MAX_TEXT_LENGTH', () => {
      const face = {
        id: 1,
        contentType: 'text' as const,
        value: 'a'.repeat(CONSTANTS.MAX_TEXT_LENGTH + 1)
      };
      expect(() => validateFace(face)).toThrow(ValidationError);
    });

    it('should reject color face without hex color', () => {
      const face = {
        id: 1,
        contentType: 'color' as const,
        value: 'Red'
      };
      expect(() => validateFace(face)).toThrow(ValidationError);
    });

    it('should reject invalid face id', () => {
      const face = {
        id: 0,
        contentType: 'number' as const,
        value: 1
      };
      expect(() => validateFace(face)).toThrow(ValidationError);
    });
  });

  describe('validateDie', () => {
    const validDie = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Die',
      sides: 6,
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      contentType: 'number' as const,
      faces: Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        contentType: 'number' as const,
        value: i + 1
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should accept valid die', () => {
      expect(() => validateDie(validDie)).not.toThrow();
    });

    it('should reject die with sides < MIN_SIDES', () => {
      const die = { ...validDie, sides: 1, faces: [validDie.faces[0]] };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with sides > MAX_SIDES', () => {
      const die = { ...validDie, sides: 102 };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with invalid UUID', () => {
      const die = { ...validDie, id: 'not-a-uuid' };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with mismatched face count', () => {
      const die = { ...validDie, sides: 8 };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with invalid background color', () => {
      const die = { ...validDie, backgroundColor: 'invalid' };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with empty name', () => {
      const die = { ...validDie, name: '' };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });

    it('should reject die with name exceeding MAX_NAME_LENGTH', () => {
      const die = { ...validDie, name: 'a'.repeat(CONSTANTS.MAX_NAME_LENGTH + 1) };
      expect(() => validateDie(die)).toThrow(ValidationError);
    });
  });

  describe('validateDiceSet', () => {
    const validSet = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Set',
      diceIds: [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    it('should accept valid dice set', () => {
      expect(() => validateDiceSet(validSet)).not.toThrow();
    });

    it('should reject set with too many dice', () => {
      const set = {
        ...validSet,
        diceIds: Array(7).fill('550e8400-e29b-41d4-a716-446655440000')
      };
      expect(() => validateDiceSet(set)).toThrow(ValidationError);
    });

    it('should reject set with no dice', () => {
      const set = { ...validSet, diceIds: [] };
      expect(() => validateDiceSet(set)).toThrow(ValidationError);
    });

    it('should reject set with invalid UUID in diceIds', () => {
      const set = { ...validSet, diceIds: ['not-a-uuid'] };
      expect(() => validateDiceSet(set)).toThrow(ValidationError);
    });

    it('should reject set with empty name', () => {
      const set = { ...validSet, name: '' };
      expect(() => validateDiceSet(set)).toThrow(ValidationError);
    });
  });
});
