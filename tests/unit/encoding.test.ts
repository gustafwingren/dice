import { encodeDie, decodeDie, encodeDiceSet, decodeDiceSet, isUrlTooLong } from '@/lib/encoding';
import { Die, DiceSet } from '@/types';

describe('encoding', () => {
  describe('encodeDie and decodeDie', () => {
    it('should encode and decode a basic die with number faces', () => {
      const die: Die = {
        id: 'test-id-1',
        name: 'Test Die',
        sides: 6,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number',
        faces: [
          { id: 1, contentType: 'number', value: '1' },
          { id: 2, contentType: 'number', value: '2' },
          { id: 3, contentType: 'number', value: '3' },
          { id: 4, contentType: 'number', value: '4' },
          { id: 5, contentType: 'number', value: '5' },
          { id: 6, contentType: 'number', value: '6' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');

      const decoded = decodeDie(encoded);
      expect(decoded.name).toBe(die.name);
      expect(decoded.sides).toBe(die.sides);
      expect(decoded.backgroundColor).toBe(die.backgroundColor);
      expect(decoded.textColor).toBe(die.textColor);
      expect(decoded.contentType).toBe(die.contentType);
      expect(decoded.faces).toHaveLength(6);
      expect(decoded.faces[0].value).toBe('1');
      expect(decoded.faces[5].value).toBe('6');
    });

    it('should encode and decode a die with text faces', () => {
      const die: Die = {
        id: 'test-id-2',
        name: 'Text Die',
        sides: 4,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        contentType: 'text',
        faces: [
          { id: 1, contentType: 'text', value: 'Yes' },
          { id: 2, contentType: 'text', value: 'No' },
          { id: 3, contentType: 'text', value: 'Maybe' },
          { id: 4, contentType: 'text', value: 'Later' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      const decoded = decodeDie(encoded);

      expect(decoded.name).toBe(die.name);
      expect(decoded.sides).toBe(4);
      expect(decoded.contentType).toBe('text');
      expect(decoded.faces[0].value).toBe('Yes');
      expect(decoded.faces[1].value).toBe('No');
      expect(decoded.faces[2].value).toBe('Maybe');
      expect(decoded.faces[3].value).toBe('Later');
    });

    it('should encode and decode a die with color faces including color property', () => {
      const die: Die = {
        id: 'test-id-3',
        name: 'Color Die',
        sides: 4,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'color',
        faces: [
          { id: 1, contentType: 'color', value: 'Red', color: '#FF0000' },
          { id: 2, contentType: 'color', value: 'Green', color: '#00FF00' },
          { id: 3, contentType: 'color', value: 'Blue', color: '#0000FF' },
          { id: 4, contentType: 'color', value: 'Yellow', color: '#FFFF00' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      const decoded = decodeDie(encoded);

      expect(decoded.name).toBe(die.name);
      expect(decoded.sides).toBe(4);
      expect(decoded.contentType).toBe('color');
      expect(decoded.faces[0].value).toBe('Red');
      expect(decoded.faces[0].color).toBe('#FF0000');
      expect(decoded.faces[1].value).toBe('Green');
      expect(decoded.faces[1].color).toBe('#00FF00');
      expect(decoded.faces[2].value).toBe('Blue');
      expect(decoded.faces[2].color).toBe('#0000FF');
      expect(decoded.faces[3].value).toBe('Yellow');
      expect(decoded.faces[3].color).toBe('#FFFF00');
    });

    it('should handle dies with many sides', () => {
      const faces = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        contentType: 'number' as const,
        value: (i + 1).toString(),
      }));

      const die: Die = {
        id: 'test-id-4',
        name: 'D100',
        sides: 100,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number',
        faces,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      const decoded = decodeDie(encoded);

      expect(decoded.sides).toBe(100);
      expect(decoded.faces).toHaveLength(100);
      expect(decoded.faces[0].value).toBe('1');
      expect(decoded.faces[99].value).toBe('100');
    });

    it('should generate new IDs and timestamps for decoded dice', () => {
      const die: Die = {
        id: 'original-id',
        name: 'Original',
        sides: 2,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number',
        faces: [
          { id: 1, contentType: 'number', value: '1' },
          { id: 2, contentType: 'number', value: '2' },
        ],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      const decoded = decodeDie(encoded);

      expect(decoded.id).not.toBe(die.id);
      expect(decoded.createdAt).not.toBe(die.createdAt);
      expect(decoded.updatedAt).not.toBe(die.updatedAt);
    });

    it('should throw error for invalid encoded data', () => {
      expect(() => decodeDie('invalid-data')).toThrow();
      expect(() => decodeDie('')).toThrow();
      expect(() => decodeDie('!@#$%^&*()')).toThrow();
    });

    it('should produce compressed output smaller than JSON', () => {
      const die: Die = {
        id: 'test-id',
        name: 'Test Die with a reasonably long name',
        sides: 20,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'text',
        faces: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          contentType: 'text' as const,
          value: `Face ${i + 1}`,
        })),
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDie(die);
      const jsonString = JSON.stringify(die);

      // Encoded should be significantly smaller than raw JSON
      expect(encoded.length).toBeLessThan(jsonString.length);
    });
  });

  describe('encodeDiceSet and decodeDiceSet', () => {
    it('should encode and decode a dice set with multiple dice', () => {
      const dice: Die[] = [
        {
          id: 'die-1',
          name: 'D6',
          sides: 6,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          contentType: 'number',
          faces: Array.from({ length: 6 }, (_, i) => ({
            id: i + 1,
            contentType: 'number' as const,
            value: (i + 1).toString(),
          })),
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'die-2',
          name: 'D4',
          sides: 4,
          backgroundColor: '#FF0000',
          textColor: '#FFFFFF',
          contentType: 'number',
          faces: Array.from({ length: 4 }, (_, i) => ({
            id: i + 1,
            contentType: 'number' as const,
            value: (i + 1).toString(),
          })),
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const diceSet: DiceSet = {
        id: 'set-1',
        name: 'Test Set',
        diceIds: ['die-1', 'die-2'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDiceSet(diceSet, dice);
      expect(encoded).toBeTruthy();

      const decoded = decodeDiceSet(encoded);
      expect(decoded.diceSet.name).toBe(diceSet.name);
      expect(decoded.dice).toHaveLength(2);
      expect(decoded.dice[0].name).toBe('D6');
      expect(decoded.dice[1].name).toBe('D4');
    });

    it('should encode and decode a set with color dice including color properties', () => {
      const dice: Die[] = [
        {
          id: 'die-1',
          name: 'Color Die',
          sides: 3,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          contentType: 'color',
          faces: [
            { id: 1, contentType: 'color', value: 'Red', color: '#FF0000' },
            { id: 2, contentType: 'color', value: 'Green', color: '#00FF00' },
            { id: 3, contentType: 'color', value: 'Blue', color: '#0000FF' },
          ],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const diceSet: DiceSet = {
        id: 'set-1',
        name: 'Color Set',
        diceIds: ['die-1'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDiceSet(diceSet, dice);
      const decoded = decodeDiceSet(encoded);

      expect(decoded.dice[0].faces[0].color).toBe('#FF0000');
      expect(decoded.dice[0].faces[1].color).toBe('#00FF00');
      expect(decoded.dice[0].faces[2].color).toBe('#0000FF');
    });

    it('should generate new IDs for decoded dice and set', () => {
      const dice: Die[] = [
        {
          id: 'original-die-id',
          name: 'Die',
          sides: 2,
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          contentType: 'number',
          faces: [
            { id: 1, contentType: 'number', value: '1' },
            { id: 2, contentType: 'number', value: '2' },
          ],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      const diceSet: DiceSet = {
        id: 'original-set-id',
        name: 'Set',
        diceIds: ['original-die-id'],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const encoded = encodeDiceSet(diceSet, dice);
      const decoded = decodeDiceSet(encoded);

      expect(decoded.diceSet.id).not.toBe(diceSet.id);
      expect(decoded.dice[0].id).not.toBe(dice[0].id);
      expect(decoded.diceSet.diceIds[0]).toBe(decoded.dice[0].id);
    });

    it('should throw error for invalid encoded set data', () => {
      expect(() => decodeDiceSet('invalid-data')).toThrow();
      expect(() => decodeDiceSet('')).toThrow();
    });
  });

  describe('isUrlTooLong', () => {
    it('should return false for short URLs', () => {
      const shortEncoded = 'short';
      expect(isUrlTooLong(shortEncoded)).toBe(false);
    });

    it('should return true for very long URLs', () => {
      const longEncoded = 'x'.repeat(7000);
      expect(isUrlTooLong(longEncoded)).toBe(true);
    });

    it('should account for base URL in length calculation', () => {
      const encoded = 'test';
      const longBaseUrl = 'https://example.com/' + 'x'.repeat(6000);
      expect(isUrlTooLong(encoded, longBaseUrl)).toBe(true);
    });

    it('should return false when exactly at limit', () => {
      const encoded = 'x'.repeat(6000);
      expect(isUrlTooLong(encoded, '')).toBe(false);
    });

    it('should return true when over limit by 1', () => {
      const encoded = 'x'.repeat(6001);
      expect(isUrlTooLong(encoded, '')).toBe(true);
    });
  });
});
