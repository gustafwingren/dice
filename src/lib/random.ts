import { Die, Face } from '@/types';

/**
 * Cryptographically secure random number generator
 * Uses Web Crypto API for true randomness (not Math.random)
 */

/**
 * Generate a cryptographically secure random integer between min (inclusive) and max (inclusive)
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export function getSecureRandomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error('min must be less than or equal to max');
  }
  
  const range = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxValue = Math.pow(256, bytesNeeded);
  const threshold = maxValue - (maxValue % range);
  
  // Use rejection sampling to avoid modulo bias
  let randomValue: number;
  const randomBytes = new Uint8Array(bytesNeeded);
  
  do {
    crypto.getRandomValues(randomBytes);
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = (randomValue << 8) + randomBytes[i];
    }
  } while (randomValue >= threshold);
  
  return min + (randomValue % range);
}

/**
 * Roll a single die and return a random face
 * @param die The die to roll
 * @returns A random face from the die
 */
export function rollDie(die: Die): Face {
  if (!die.faces || die.faces.length === 0) {
    throw new Error('Die has no faces');
  }
  
  const randomIndex = getSecureRandomInt(0, die.faces.length - 1);
  return die.faces[randomIndex];
}

/**
 * Roll multiple dice from a dice set and return an array of random faces
 * @param dice Array of Die objects to roll
 * @returns Array of random faces, one per die
 */
export function rollDiceSet(dice: Die[]): Face[] {
  if (!dice || dice.length === 0) {
    throw new Error('No dice to roll');
  }
  
  return dice.map(die => rollDie(die));
}
