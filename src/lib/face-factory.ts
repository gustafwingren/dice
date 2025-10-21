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
