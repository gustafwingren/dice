import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { Die, DiceSet, Face } from '@/types';
import { validateDie, validateDiceSet } from './validation';

const MAX_URL_LENGTH = 6000;

/**
 * Encodes a die into a URL-safe compressed string
 */
export function encodeDie(die: Die): string {
  // Create minimal representation (exclude IDs and timestamps for smaller payload)
  const minimalDie = {
    name: die.name,
    sides: die.sides,
    backgroundColor: die.backgroundColor,
    textColor: die.textColor,
    contentType: die.contentType,
    faces: die.faces.map((face: Face) => ({
      contentType: face.contentType,
      value: face.value,
      ...(face.color && { color: face.color })
    }))
  };

  const json = JSON.stringify(minimalDie);
  return compressToEncodedURIComponent(json);
}

/**
 * Decodes a die from a URL-safe compressed string
 */
export function decodeDie(encoded: string): Die {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) {
      throw new Error('Failed to decompress data');
    }

    const parsed = JSON.parse(json);
    
    // Reconstruct full die with generated IDs and timestamps
    const die: Die = {
      id: crypto.randomUUID(),
      name: parsed.name || 'Shared Die',
      sides: parsed.sides,
      backgroundColor: parsed.backgroundColor,
      textColor: parsed.textColor,
      contentType: parsed.contentType,
      faces: parsed.faces.map((face: any, index: number) => ({
        id: index + 1,
        contentType: face.contentType,
        value: face.value,
        ...(face.color && { color: face.color })
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate the reconstructed die
    validateDie(die);

    return die;
  } catch (error) {
    throw new Error(`Failed to decode die: ${error instanceof Error ? error.message : 'Invalid or corrupted data'}`);
  }
}

/**
 * Encodes a dice set and its dice into a URL-safe compressed string
 */
export function encodeDiceSet(diceSet: DiceSet, dice: Die[]): string {
  // Create minimal representation
  const minimalSet = {
    name: diceSet.name,
    diceIds: diceSet.diceIds,
    dice: dice.map(die => ({
      name: die.name,
      sides: die.sides,
      backgroundColor: die.backgroundColor,
      textColor: die.textColor,
      contentType: die.contentType,
      faces: die.faces.map((face: Face) => ({
        contentType: face.contentType,
        value: face.value,
        ...(face.color && { color: face.color })
      }))
    }))
  };

  const json = JSON.stringify(minimalSet);
  return compressToEncodedURIComponent(json);
}

/**
 * Decodes a dice set from a URL-safe compressed string
 */
export function decodeDiceSet(encoded: string): { diceSet: DiceSet; dice: Die[] } {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) {
      throw new Error('Failed to decompress data');
    }

    const parsed = JSON.parse(json);
    
    // Reconstruct dice with generated IDs
    const dice: Die[] = parsed.dice.map((dieData: any) => ({
      id: crypto.randomUUID(),
      name: dieData.name || 'Shared Die',
      sides: dieData.sides,
      backgroundColor: dieData.backgroundColor,
      textColor: dieData.textColor,
      contentType: dieData.contentType,
      faces: dieData.faces.map((face: any, index: number) => ({
        id: index + 1,
        contentType: face.contentType,
        value: face.value,
        ...(face.color && { color: face.color })
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // Reconstruct dice set with new die IDs
    const diceSet: DiceSet = {
      id: crypto.randomUUID(),
      name: parsed.name || 'Shared Dice Set',
      diceIds: dice.map(die => die.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Validate all dice
    for (const die of dice) {
      validateDie(die);
    }

    // Validate the dice set
    validateDiceSet(diceSet);

    return { diceSet, dice };
  } catch (error) {
    throw new Error(`Failed to decode dice set: ${error instanceof Error ? error.message : 'Invalid or corrupted data'}`);
  }
}

/**
 * Checks if a URL with the encoded data would be too long
 */
export function isUrlTooLong(encoded: string, baseUrl: string = ''): boolean {
  const fullUrl = `${baseUrl}${encoded}`;
  return fullUrl.length > MAX_URL_LENGTH;
}
