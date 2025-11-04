'use client';

import { Face } from '@/types';
import { FaceEditor } from './FaceEditor';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { MIN_SIDES, MAX_SIDES } from '@/lib/constants';

export interface FaceListProps {
  /** Array of faces to display */
  faces: Face[];
  
  /** Called when a face is updated */
  onUpdateFace: (faceId: number, updates: Partial<Face>) => void;
  
  /** Optional callback for batch updates */
  onBatchUpdate?: (updates: Array<{ faceId: number; updates: Partial<Face> }>) => void;
  
  /** Optional validation errors per face */
  errors?: Record<number, string>;
  
  /** Optional callback when user wants to change sides count via inline controls */
  onSidesChange?: (newSides: number) => void;
  
  /** Current number of sides (needed for boundary checks) */
  currentSides?: number;
}

// T045-T046: Progressive loading increment for large face lists
const INITIAL_VISIBLE_FACES = 50;

/**
 * FaceList component displays all faces with natural scrolling
 * 
 * Features:
 * - Natural page scrolling (no nested scroll containers)
 * - Batch editing for sequential numbering
 * - Individual face editing
 * - Validation error display per face
 * - Responsive grid layout
 */
export function FaceList({
  faces,
  onUpdateFace,
  onBatchUpdate,
  errors = {},
  onSidesChange,
  currentSides,
}: FaceListProps) {
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  
  // Calculate actual sides count from faces length or prop
  const sidesCount = currentSides ?? faces.length;
  const canAddFace = sidesCount < MAX_SIDES;
  const canRemoveFace = sidesCount > MIN_SIDES;
  
  // T045-T046: Progressive loading for large face lists (similar to DiceLibrary)
  const [visibleFaceCount, setVisibleFaceCount] = useState(INITIAL_VISIBLE_FACES);
  
  const handleShowMoreFaces = () => {
    setVisibleFaceCount(prev => prev + INITIAL_VISIBLE_FACES);
  };
  
  // Check if batch operations are available (text or number types with empty faces)
  const canUseBatchOperations = faces.length > 0 && 
    (faces[0].contentType === 'number' || faces[0].contentType === 'text');
  
  const hasEmptyFaces = faces.some(face => 
    face.contentType !== 'color' && (!face.value || face.value.toString().trim() === '')
  );

  // Batch operation: Auto-number all faces
  const handleAutoNumber = () => {
    if (!onBatchUpdate && !onUpdateFace) return;
    
    setIsApplyingBatch(true);
    
    const updates = faces.map((face, index) => ({
      faceId: face.id,
      updates: { value: (index + 1).toString() } as Partial<Face>,
    }));
    
    if (onBatchUpdate) {
      onBatchUpdate(updates);
    } else {
      // Fall back to individual updates
      updates.forEach(({ faceId, updates }) => onUpdateFace(faceId, updates));
    }
    
    setIsApplyingBatch(false);
  };
  
  // Batch operation: Clear all faces
  const handleClearAll = () => {
    if (!onBatchUpdate && !onUpdateFace) return;
    
    setIsApplyingBatch(true);
    
    const updates = faces.map(face => ({
      faceId: face.id,
      updates: { value: '' } as Partial<Face>,
    }));
    
    if (onBatchUpdate) {
      onBatchUpdate(updates);
    } else {
      // Fall back to individual updates
      updates.forEach(({ faceId, updates }) => onUpdateFace(faceId, updates));
    }
    
    setIsApplyingBatch(false);
  };

  if (faces.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
        <p>No faces to display. Configure your die to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Die Faces ({faces.length})
          {faces.length > INITIAL_VISIBLE_FACES && (
            <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 ml-2">
              (Showing {Math.min(visibleFaceCount, faces.length)} of {faces.length})
            </span>
          )}
        </h2>
        
        {canUseBatchOperations && faces.length > 5 && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoNumber}
              disabled={isApplyingBatch}
            >
              Auto-Number (1-{faces.length})
            </Button>
            {hasEmptyFaces && faces[0].contentType === 'text' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearAll}
                disabled={isApplyingBatch}
              >
                Clear All
              </Button>
            )}
          </div>
        )}
      </div>
      
      {canUseBatchOperations && faces.length > 5 && (
        <div className="text-sm text-neutral-600 dark:text-neutral-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-3">
          <p className="font-medium mb-1 dark:text-neutral-300">💡 Batch Editing Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><strong>Auto-Number:</strong> Fills all {faces.length} faces with sequential numbers (1, 2, 3...)</li>
            {faces[0].contentType === 'text' && (
              <li><strong>Clear All:</strong> Removes all face values to start fresh</li>
            )}
            {faces.length > INITIAL_VISIBLE_FACES && (
              <li><strong>Show More:</strong> Use the button below to load more faces as needed</li>
            )}
            <li>Great for large dice - saves time!</li>
          </ul>
        </div>
      )}
      
      {/* T044: No nested scrolling - natural page expansion */}
      {/* T047: Progressive loading for large face lists */}
      <div 
        className="space-y-4"
        role="list"
        aria-label="Die faces"
      >
        {faces.slice(0, visibleFaceCount).map((face, index) => (
          <div key={face.id} role="listitem">
            <FaceEditor
              face={face}
              faceNumber={index + 1}
              onUpdate={(updates) => onUpdateFace(face.id, updates)}
              error={errors[face.id]}
            />
          </div>
        ))}
      </div>
      
      {/* T049, T051, T052: Show More button for large face lists */}
      {faces.length > visibleFaceCount && (
        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleShowMoreFaces}
            variant="secondary"
            aria-label={`Show ${INITIAL_VISIBLE_FACES} more faces (${faces.length - visibleFaceCount} remaining)`}
          >
            Show More Faces ({faces.length - visibleFaceCount} remaining)
          </Button>
        </div>
      )}
      
      {/* Inline face management controls */}
      {onSidesChange && (
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              <p className="font-medium mb-1">Adjust Face Count</p>
              <p className="text-xs">
                {canAddFace && canRemoveFace
                  ? 'Add or remove faces without losing your work'
                  : !canAddFace
                  ? `Maximum ${MAX_SIDES} faces reached`
                  : `Minimum ${MIN_SIDES} faces required`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onSidesChange(sidesCount - 1)}
                variant="secondary"
                size="sm"
                disabled={!canRemoveFace}
                aria-label="Remove last face"
                title={canRemoveFace ? 'Remove the last face' : `Cannot have fewer than ${MIN_SIDES} faces`}
              >
                Remove Face
              </Button>
              <Button
                onClick={() => onSidesChange(sidesCount + 1)}
                variant="primary"
                size="sm"
                disabled={!canAddFace}
                aria-label="Add new face"
                title={canAddFace ? 'Add a new face with default value' : `Cannot exceed ${MAX_SIDES} faces`}
              >
                Add Face
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
