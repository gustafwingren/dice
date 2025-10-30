import { Die, FaceContentType } from '@/types';
import { generateUUID } from './uuid';
import { getCurrentTimestamp } from './timestamp';
import { createDefaultFaces } from './face-factory';

/**
 * Creates a new Die instance with default configuration
 * 
 * @param sides - Number of sides (2-101), defaults to 6
 * @param contentType - Type of content for faces, defaults to 'number'
 * @returns A new Die object with appropriate defaults
 */
export function createEmptyDie(
  sides: number = 6,
  contentType: FaceContentType = 'number'
): Die {
  return {
    id: generateUUID(),
    name: '',
    sides,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    contentType,
    faces: createDefaultFaces(sides, contentType),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
  };
}

/**
 * Creates a new Die with a specific name
 * 
 * @param name - Die name
 * @param sides - Number of sides (2-101), defaults to 6
 * @param contentType - Type of content for faces, defaults to 'number'
 * @returns A new Die object with the specified name
 */
export function createDie(
  name: string,
  sides: number = 6,
  contentType: FaceContentType = 'number'
): Die {
  const die = createEmptyDie(sides, contentType);
  die.name = name;
  return die;
}

/**
 * Creates a copy of an existing die with a new ID and timestamps
 * 
 * @param die - Die to copy
 * @returns A new Die object with copied configuration
 */
export function copyDie(die: Die): Die {
  return {
    ...die,
    id: generateUUID(),
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp(),
    faces: die.faces.map(face => ({ ...face })),
  };
}
