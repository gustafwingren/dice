'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Die, Face, FaceContentType, FormValidationState, createFormValidationState } from '@/types';
import { createEmptyDie } from '@/lib/die-factory';
import { createDefaultFaces, adjustFacesForSideChange } from '@/lib/face-factory';
import { getCurrentTimestamp } from '@/lib/timestamp';
import { validateDie } from '@/lib/validation';
import { MIN_SIDES, MAX_SIDES } from '@/lib/constants';

export interface UseDieStateReturn {
  die: Die;
  errors: string[];
  isValid: boolean;
  validationState: FormValidationState;
  
  // Die-level updates
  updateName: (name: string) => void;
  updateSides: (sides: number) => void;
  updateBackgroundColor: (color: string) => void;
  updateTextColor: (color: string) => void;
  updateContentType: (contentType: FaceContentType) => void;
  
  // Face-level updates
  updateFace: (faceId: number, updates: Partial<Face>) => void;
  
  // Validation methods
  markFieldTouched: (fieldName: string) => void;
  shouldShowError: (fieldName: string) => boolean;
  attemptSubmit: () => boolean;
  
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
  // Initialize die state and validation state
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
  const [validationState, setValidationState] = useState<FormValidationState>(
    () => createFormValidationState()
  );
  
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
  const validateAndUpdate = useCallback((updateFn: (prevDie: Die) => Die) => {
    setDie((prevDie) => {
      const newDie = updateFn(prevDie);
      try {
        validateDie(newDie);
        setErrors([]);
      } catch (error) {
        if (error instanceof Error) {
          setErrors([error.message]);
        }
      }
      return newDie;
    });
  }, []);

  const updateName = useCallback((name: string) => {
    validateAndUpdate((prevDie) => ({
      ...prevDie,
      name,
      updatedAt: getCurrentTimestamp(),
    }));
  }, [validateAndUpdate]);

  const updateSides = useCallback((sides: number) => {
    validateAndUpdate((prevDie) => {
      // Clamp sides to valid range
      const clampedSides = Math.max(MIN_SIDES, Math.min(MAX_SIDES, sides));
      
      // Preserve existing faces and adjust for new sides count
      const newFaces = adjustFacesForSideChange(prevDie.faces, clampedSides, prevDie.contentType);
      
      return {
        ...prevDie,
        sides: clampedSides,
        faces: newFaces,
        updatedAt: getCurrentTimestamp(),
      };
    });
  }, [validateAndUpdate]);

  const updateBackgroundColor = useCallback((backgroundColor: string) => {
    validateAndUpdate((prevDie) => ({
      ...prevDie,
      backgroundColor,
      updatedAt: getCurrentTimestamp(),
    }));
  }, [validateAndUpdate]);

  const updateTextColor = useCallback((textColor: string) => {
    validateAndUpdate((prevDie) => ({
      ...prevDie,
      textColor,
      updatedAt: getCurrentTimestamp(),
    }));
  }, [validateAndUpdate]);

  const updateContentType = useCallback((contentType: FaceContentType) => {
    validateAndUpdate((prevDie) => {
      // Regenerate all faces with new content type
      const newFaces = createDefaultFaces(prevDie.sides, contentType);
      
      return {
        ...prevDie,
        contentType,
        faces: newFaces,
        updatedAt: getCurrentTimestamp(),
      };
    });
  }, [validateAndUpdate]);

  const updateFace = useCallback((faceId: number, updates: Partial<Face>) => {
    validateAndUpdate((prevDie) => {
      const updatedFaces = prevDie.faces.map(face =>
        face.id === faceId ? { ...face, ...updates } : face
      );
      
      return {
        ...prevDie,
        faces: updatedFaces,
        updatedAt: getCurrentTimestamp(),
      };
    });
  }, [validateAndUpdate]);

  const reset = useCallback(() => {
    validateAndUpdate(() => createEmptyDie());
  }, [validateAndUpdate]);

  const loadDie = useCallback((newDie: Die) => {
    validateAndUpdate(() => newDie);
  }, [validateAndUpdate]);

  // T005: Mark a field as touched (called on blur)
  const markFieldTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set(prev.touchedFields).add(fieldName)
    }));
  }, []);

  // T006: Check if validation error should be shown for a field
  const shouldShowError = useCallback((fieldName: string): boolean => {
    return validationState.touchedFields.has(fieldName) || 
           validationState.submitAttempted;
  }, [validationState]);

  // T007: Attempt form submission and mark all fields as needing validation
  const attemptSubmit = useCallback((): boolean => {
    setValidationState(prev => ({ ...prev, submitAttempted: true }));
    try {
      validateDie(die);
      setErrors([]);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['Unknown validation error']);
      }
      return false;
    }
  }, [die, validateDie]);

  return {
    die,
    errors,
    isValid: errors.length === 0,
    validationState,
    updateName,
    updateSides,
    updateBackgroundColor,
    updateTextColor,
    updateContentType,
    updateFace,
    markFieldTouched,
    shouldShowError,
    attemptSubmit,
    reset,
    loadDie,
  };
}
