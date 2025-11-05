import { Face, FaceContentType } from '@/types';

/**
 * Creates a default Face instance with the specified content type and index
 * 
 * @param index - Face number (1-based for display, e.g., face 1 of 6)
 * @param contentType - Type of content (number, text, or color)
 * @returns A new Face object with appropriate defaults
 */
export function createDefaultFace(
  index: number,
  contentType: FaceContentType = 'number'
): Face {
  const face: Face = {
    id: index,
    contentType,
    value: '',
  };

  // Auto-populate based on content type
  switch (contentType) {
    case 'number':
      face.value = index.toString();
      break;
    case 'text':
      face.value = '';
      break;
    case 'color':
      face.value = '';
      face.color = getDefaultColor(index);
      break;
  }

  return face;
}

/**
 * Creates an array of default faces for a die
 * 
 * @param sides - Number of sides (2-101)
 * @param contentType - Type of content for all faces
 * @returns Array of Face objects
 */
export function createDefaultFaces(
  sides: number,
  contentType: FaceContentType = 'number'
): Face[] {
  return Array.from({ length: sides }, (_, i) => 
    createDefaultFace(i + 1, contentType)
  );
}

/**
 * Adjusts faces array when the number of sides changes, preserving existing face data
 * 
 * When increasing sides: Keeps all existing faces and adds new faces with default values
 * When decreasing sides: Keeps only the first N faces (where N = new sides count)
 * 
 * @param existingFaces - Current array of faces
 * @param newSides - New number of sides
 * @param contentType - Content type for any new faces that need to be created
 * @returns Array of Face objects with preserved data where possible
 */
export function adjustFacesForSideChange(
  existingFaces: Face[],
  newSides: number,
  contentType: FaceContentType
): Face[] {
  const currentSides = existingFaces.length;
  
  // If decreasing sides, truncate the array
  if (newSides < currentSides) {
    return existingFaces.slice(0, newSides);
  }
  
  // If increasing sides, add new faces with default values
  if (newSides > currentSides) {
    const newFaces = Array.from(
      { length: newSides - currentSides },
      (_, i) => createDefaultFace(currentSides + i + 1, contentType)
    );
    return [...existingFaces, ...newFaces];
  }
  
  // Same number of sides, return the original array (no unnecessary copy)
  return existingFaces;
}

/**
 * Gets a default color from a preset palette based on index
 * Cycles through colors if more faces than palette colors
 * 
 * @param index - Face index (1-based)
 * @returns Hex color string
 */
function getDefaultColor(index: number): string {
  const defaultColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E2', // Sky Blue
    '#F8B739', // Gold
    '#52D273', // Green
    '#FF85A1', // Pink
    '#95E1D3', // Aqua
  ];

  return defaultColors[(index - 1) % defaultColors.length];
}
