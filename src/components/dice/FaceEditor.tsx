'use client';

import { Face } from '@/types';
import { Input } from '../ui/Input';
import { ColorPicker } from '../ui/ColorPicker';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import { validateFaceContent } from '@/lib/validation';

export interface FaceEditorProps {
  /** Face being edited */
  face: Face;
  
  /** Called when face is updated */
  onUpdate: (updates: Partial<Face>) => void;
  
  /** Face number for display (1-indexed) */
  faceNumber: number;
  
  /** Optional error message */
  error?: string;
}

/**
 * FaceEditor component for editing a single die face
 * 
 * Handles three content types:
 * - number: Numeric input
 * - text: Text input with character limit
 * - color: Color picker (solid fill, no text)
 */
export function FaceEditor({
  face,
  onUpdate,
  faceNumber,
  error,
}: FaceEditorProps) {
  // Check for whitespace-only content (skip for color faces)
  const hasWhitespaceError = face.contentType !== 'color' && !validateFaceContent(face.value);
  const displayError = hasWhitespaceError 
    ? 'Face content cannot be empty or whitespace only'
    : error;
  
  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          Face {faceNumber}
        </h3>
        {displayError && (
          <span className="text-xs text-danger-600 dark:text-danger-400" role="alert">
            {displayError}
          </span>
        )}
      </div>

      {/* Number content type */}
      {face.contentType === 'number' && (
        <Input
          id={`face-${face.id}-number`}
          label="Number Value"
          type="number"
          value={face.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter number"
          error={displayError}
        />
      )}

      {/* Text content type */}
      {face.contentType === 'text' && (
        <Input
          id={`face-${face.id}-text`}
          label="Text Value"
          value={face.value.toString()}
          onChange={(e) => onUpdate({ value: e.target.value })}
          placeholder="Enter text"
          maxLength={MAX_TEXT_LENGTH}
          showCharacterCount
          error={displayError}
        />
      )}

      {/* Color content type - render as solid fill */}
      {face.contentType === 'color' && (
        <div className="space-y-3">
          <ColorPicker
            id={`face-${face.id}-color`}
            label="Face Color"
            value={face.color || '#FFFFFF'}
            onChange={(color) => onUpdate({ color, value: '' })}
            error={displayError}
          />
          
          {/* Visual preview of the color face */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Face Preview
            </label>
            <div
              className="w-full h-24 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 shadow-sm"
              style={{ backgroundColor: face.color || '#FFFFFF' }}
              aria-label={`Face ${faceNumber} color preview: ${face.color || '#FFFFFF'}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
