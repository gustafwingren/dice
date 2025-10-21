'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Die, Face, FaceContentType } from '@/types';
import { createEmptyDie } from '@/lib/die-factory';
import { createDefaultFaces } from '@/lib/face-factory';
import { getCurrentTimestamp } from '@/lib/timestamp';
import { validateDie } from '@/lib/validation';
import { MIN_SIDES, MAX_SIDES } from '@/lib/constants';

export interface UseDieStateReturn {
  die: Die;
  errors: string[];
  isValid: boolean;
  
  // Die-level updates
  updateName: (name: string) => void;
  updateSides: (sides: number) => void;
  updateBackgroundColor: (color: string) => void;
  updateTextColor: (color: string) => void;
  updateContentType: (contentType: FaceContentType) => void;
  
  // Face-level updates
  updateFace: (faceId: number, updates: Partial<Face>) => void;
  
  // Utility actions
  reset: () => void;
  loadDie: (die: Die) => void;
}

/**
 * Hook for managing die state with validation
 * 
 * @param initialDie - Optional initial die configuration
 * @returns Die state and update functions
 */
export function useDieState(initialDie?: Die): UseDieStateReturn {
  const [die, setDie] = useState<Die>(() => initialDie || createEmptyDie());
  const [errors, setErrors] = useState<string[]>(() => {
    // Validate initial die state
    const dieToValidate = initialDie || createEmptyDie();
    try {
      validateDie(dieToValidate);
      return [];
    } catch (error) {
      if (error instanceof Error) {
        return [error.message];
      }
      return [];
    }
  });
  
  // Track if we've loaded the initial die to prevent infinite loops
  const hasLoadedInitial = useRef(false);
  
  // Update die when initialDie prop changes (for loading from library)
  useEffect(() => {
    if (initialDie && !hasLoadedInitial.current) {
      hasLoadedInitial.current = true;
      setDie(initialDie);
      // Validate the initial die
      try {
        validateDie(initialDie);
        setErrors([]);
      } catch (error) {
        if (error instanceof Error) {
          setErrors([error.message]);
        }
      }
    }
  }, [initialDie]);

  // Validate and update errors whenever die changes
  const validateAndUpdate = useCallback((newDie: Die) => {
    try {
      validateDie(newDie);
      setErrors([]);
      setDie(newDie);
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      }
      setDie(newDie); // Still update die to show what user is working with
    }
  }, []);

  const updateName = useCallback((name: string) => {
    validateAndUpdate({
      ...die,
      name,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const updateSides = useCallback((sides: number) => {
    // Clamp sides to valid range
    const clampedSides = Math.max(MIN_SIDES, Math.min(MAX_SIDES, sides));
    
    // Regenerate faces if sides changed
    const newFaces = createDefaultFaces(clampedSides, die.contentType);
    
    validateAndUpdate({
      ...die,
      sides: clampedSides,
      faces: newFaces,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const updateBackgroundColor = useCallback((backgroundColor: string) => {
    validateAndUpdate({
      ...die,
      backgroundColor,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const updateTextColor = useCallback((textColor: string) => {
    validateAndUpdate({
      ...die,
      textColor,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const updateContentType = useCallback((contentType: FaceContentType) => {
    // Regenerate all faces with new content type
    const newFaces = createDefaultFaces(die.sides, contentType);
    
    validateAndUpdate({
      ...die,
      contentType,
      faces: newFaces,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const updateFace = useCallback((faceId: number, updates: Partial<Face>) => {
    const updatedFaces = die.faces.map(face =>
      face.id === faceId ? { ...face, ...updates } : face
    );
    
    validateAndUpdate({
      ...die,
      faces: updatedFaces,
      updatedAt: getCurrentTimestamp(),
    });
  }, [die, validateAndUpdate]);

  const reset = useCallback(() => {
    validateAndUpdate(createEmptyDie());
  }, [validateAndUpdate]);

  const loadDie = useCallback((newDie: Die) => {
    validateAndUpdate(newDie);
  }, [validateAndUpdate]);

  return {
    die,
    errors,
    isValid: errors.length === 0,
    updateName,
    updateSides,
    updateBackgroundColor,
    updateTextColor,
    updateContentType,
    updateFace,
    reset,
    loadDie,
  };
}
