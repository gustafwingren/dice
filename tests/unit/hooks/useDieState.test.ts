/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useDieState } from '@/hooks/useDieState';
import { createEmptyDie } from '@/lib/die-factory';

describe('useDieState', () => {
  describe('initialization', () => {
    it('should initialize with empty die by default', () => {
      const { result } = renderHook(() => useDieState());
      
      expect(result.current.die).toBeDefined();
      expect(result.current.die.sides).toBe(6);
      expect(result.current.die.contentType).toBe('number');
      expect(result.current.die.faces).toHaveLength(6);
    });

    it('should initialize with provided die', () => {
      const initialDie = createEmptyDie(4, 'text');
      const { result } = renderHook(() => useDieState(initialDie));
      
      expect(result.current.die.sides).toBe(4);
      expect(result.current.die.contentType).toBe('text');
      expect(result.current.die.faces).toHaveLength(4);
    });
  });

  describe('updateName', () => {
    it('should update die name', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateName('My Die');
      });
      
      expect(result.current.die.name).toBe('My Die');
    });

    it('should update timestamp when name changes', () => {
      const { result } = renderHook(() => useDieState());
      const originalTimestamp = result.current.die.updatedAt;
      
      // Wait a bit to ensure timestamp changes
      setTimeout(() => {
        act(() => {
          result.current.updateName('New Name');
        });
        
        expect(result.current.die.updatedAt).not.toBe(originalTimestamp);
      }, 10);
    });
  });

  describe('updateSides', () => {
    it('should update number of sides', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateSides(10);
      });
      
      expect(result.current.die.sides).toBe(10);
      expect(result.current.die.faces).toHaveLength(10);
    });

    it('should clamp sides to minimum', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateSides(1);
      });
      
      expect(result.current.die.sides).toBe(2); // MIN_SIDES
    });

    it('should clamp sides to maximum', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateSides(200);
      });
      
      expect(result.current.die.sides).toBe(101); // MAX_SIDES
    });

    it('should regenerate faces when sides change', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateFace(1, { value: 'custom' });
      });
      
      act(() => {
        result.current.updateSides(4);
      });
      
      // Faces should be regenerated, losing custom value
      expect(result.current.die.faces[0].value).toBe('1');
    });
  });

  describe('updateBackgroundColor', () => {
    it('should update background color', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateBackgroundColor('#FF0000');
      });
      
      expect(result.current.die.backgroundColor).toBe('#FF0000');
    });
  });

  describe('updateTextColor', () => {
    it('should update text color', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateTextColor('#0000FF');
      });
      
      expect(result.current.die.textColor).toBe('#0000FF');
    });
  });

  describe('updateContentType', () => {
    it('should update content type from number to text', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateContentType('text');
      });
      
      expect(result.current.die.contentType).toBe('text');
      expect(result.current.die.faces[0].contentType).toBe('text');
    });

    it('should update content type from number to color', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateContentType('color');
      });
      
      expect(result.current.die.contentType).toBe('color');
      expect(result.current.die.faces[0].contentType).toBe('color');
      expect(result.current.die.faces[0].color).toBeDefined();
    });

    it('should regenerate all faces when content type changes', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateFace(1, { value: 'custom' });
      });
      
      act(() => {
        result.current.updateContentType('text');
      });
      
      // Faces should be regenerated
      expect(result.current.die.faces[0].value).toBe('');
    });
  });

  describe('updateFace', () => {
    it('should update specific face value', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateFace(1, { value: 'A' });
      });
      
      expect(result.current.die.faces.find(f => f.id === 1)?.value).toBe('A');
    });

    it('should update specific face color', () => {
      const { result } = renderHook(() => useDieState(createEmptyDie(6, 'color')));
      
      act(() => {
        result.current.updateFace(1, { color: '#00FF00' });
      });
      
      expect(result.current.die.faces.find(f => f.id === 1)?.color).toBe('#00FF00');
    });

    it('should only update the specified face', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateFace(1, { value: 'A' });
      });
      
      expect(result.current.die.faces.find(f => f.id === 2)?.value).toBe('2');
    });
  });

  describe('reset', () => {
    it('should reset die to default state', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateName('Custom Die');
        result.current.updateSides(10);
        result.current.updateBackgroundColor('#FF0000');
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.die.name).toBe('');
      expect(result.current.die.sides).toBe(6);
      expect(result.current.die.backgroundColor).toBe('#FFFFFF');
    });
  });

  describe('loadDie', () => {
    it('should load provided die', () => {
      const { result } = renderHook(() => useDieState());
      const newDie = createEmptyDie(8, 'text');
      newDie.name = 'Loaded Die';
      
      act(() => {
        result.current.loadDie(newDie);
      });
      
      expect(result.current.die.name).toBe('Loaded Die');
      expect(result.current.die.sides).toBe(8);
      expect(result.current.die.contentType).toBe('text');
    });
  });

  describe('validation', () => {
    it('should have errors for default die with empty name', () => {
      const { result } = renderHook(() => useDieState());
      
      // Default die has empty name which is invalid
      expect(result.current.isValid).toBe(false);
      expect(result.current.errors.length).toBeGreaterThan(0);
      expect(result.current.errors[0]).toContain('name');
    });

    it('should be valid when name is provided', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateName('Valid Die');
      });
      
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toHaveLength(0);
    });
  });

  describe('validation state management (T018)', () => {
    it('should initialize with empty touched fields and no submit attempt', () => {
      const { result } = renderHook(() => useDieState());
      
      expect(result.current.validationState.touchedFields.size).toBe(0);
      expect(result.current.validationState.submitAttempted).toBe(false);
    });

    it('should mark field as touched when markFieldTouched is called', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.markFieldTouched('name');
      });
      
      expect(result.current.validationState.touchedFields.has('name')).toBe(true);
      expect(result.current.validationState.touchedFields.size).toBe(1);
    });

    it('should mark multiple fields as touched independently', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.markFieldTouched('name');
        result.current.markFieldTouched('sides');
      });
      
      expect(result.current.validationState.touchedFields.has('name')).toBe(true);
      expect(result.current.validationState.touchedFields.has('sides')).toBe(true);
      expect(result.current.validationState.touchedFields.size).toBe(2);
    });

    it('should not show error for untouched field even if invalid', () => {
      const { result } = renderHook(() => useDieState());
      
      // Default die has invalid name but field is not touched
      expect(result.current.isValid).toBe(false);
      expect(result.current.shouldShowError('name')).toBe(false);
    });

    it('should show error for touched field if invalid', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.markFieldTouched('name');
      });
      
      // Name is still empty and invalid, but now touched
      expect(result.current.shouldShowError('name')).toBe(true);
    });

    it('should show errors on all fields after submit attempt', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.attemptSubmit();
      });
      
      expect(result.current.validationState.submitAttempted).toBe(true);
      expect(result.current.shouldShowError('name')).toBe(true);
      expect(result.current.shouldShowError('anyField')).toBe(true);
    });

    it('should return false from attemptSubmit when die is invalid', () => {
      const { result } = renderHook(() => useDieState());
      
      let submitResult: boolean = true;
      act(() => {
        submitResult = result.current.attemptSubmit();
      });
      
      expect(submitResult).toBe(false);
      expect(result.current.isValid).toBe(false);
    });

    it('should return true from attemptSubmit when die is valid', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.updateName('Valid Die');
      });
      
      let submitResult: boolean = false;
      act(() => {
        submitResult = result.current.attemptSubmit();
      });
      
      expect(submitResult).toBe(true);
      expect(result.current.isValid).toBe(true);
    });

    it('should persist touched state across updates', () => {
      const { result } = renderHook(() => useDieState());
      
      act(() => {
        result.current.markFieldTouched('name');
      });
      
      act(() => {
        result.current.updateSides(8);
      });
      
      // Touched state should persist after die update
      expect(result.current.validationState.touchedFields.has('name')).toBe(true);
    });
  });
});
