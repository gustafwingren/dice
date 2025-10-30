'use client';

import { Face } from '@/types';
import { FaceEditor } from './FaceEditor';
import { List } from 'react-window';
import { Button } from '../ui/Button';
import { useState } from 'react';

export interface FaceListProps {
  /** Array of faces to display */
  faces: Face[];
  
  /** Called when a face is updated */
  onUpdateFace: (faceId: number, updates: Partial<Face>) => void;
  
  /** Optional callback for batch updates */
  onBatchUpdate?: (updates: Array<{ faceId: number; updates: Partial<Face> }>) => void;
  
  /** Optional validation errors per face */
  errors?: Record<number, string>;
}

/**
 * FaceList component displays all faces with scroll support for 100+ sides
 * 
 * Features:
 * - Virtualized scrolling for performance with many faces (50+)
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
}: FaceListProps) {
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  
  // Use virtualized scrolling for 50+ faces to improve performance
  const useVirtualization = faces.length >= 50;
  
  // Average height for rows
  // Color faces are taller (~300px) due to color picker
  // Text/number faces are shorter (~120px)
  const averageRowHeight = faces.some(f => f.contentType === 'color') ? 250 : 120;
  
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

  // Row renderer for virtualized list
  const RowComponent = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const face = faces[index];
    return (
      <div style={style} className="pr-2 pb-4">
        <FaceEditor
          face={face}
          faceNumber={index + 1}
          onUpdate={(updates) => onUpdateFace(face.id, updates)}
          error={errors[face.id]}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Die Faces ({faces.length})
          {useVirtualization && (
            <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400 ml-2">
              (Virtualized for performance)
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
            <li><strong>Auto-Number:</strong> Fills all faces with sequential numbers (1, 2, 3...)</li>
            {faces[0].contentType === 'text' && (
              <li><strong>Clear All:</strong> Removes all face values to start fresh</li>
            )}
            <li>Great for large dice ({faces.length} faces) - saves time!</li>
          </ul>
        </div>
      )}
      
      {useVirtualization ? (
        // Virtualized list for large dice (50+ faces)
        <div role="list" aria-label="Die faces">
          <List
            defaultHeight={600}
            rowComponent={RowComponent}
            rowCount={faces.length}
            rowHeight={averageRowHeight}
            rowProps={{} as any}
            className="scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800"
          />
        </div>
      ) : (
        // Regular list for smaller dice (< 50 faces)
        <div 
          className="
            max-h-[600px] overflow-y-auto 
            space-y-4 pr-2
            scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-neutral-100 dark:scrollbar-track-neutral-800
          "
          role="list"
          aria-label="Die faces"
        >
          {faces.map((face, index) => (
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
      )}
    </div>
  );
}
