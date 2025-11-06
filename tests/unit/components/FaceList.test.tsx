/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FaceList } from '@/components/dice/FaceList';
import { Face } from '@/types';
import { MIN_SIDES, MAX_SIDES } from '@/lib/constants';

describe('FaceList - Inline Face Management', () => {
  const createMockFaces = (count: number, contentType: 'number' | 'text' | 'color' = 'number'): Face[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      contentType,
      value: contentType === 'number' ? (i + 1).toString() : '',
      ...(contentType === 'color' ? { color: '#FF0000' } : {}),
    }));
  };

  const mockOnUpdateFace = jest.fn();
  const mockOnSidesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Visibility', () => {
    it('should show Add/Remove buttons when onSidesChange is provided', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      expect(screen.getByRole('button', { name: /add new face/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove last face/i })).toBeInTheDocument();
    });

    it('should not show Add/Remove buttons when onSidesChange is not provided', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
        />
      );

      expect(screen.queryByRole('button', { name: /add new face/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /remove last face/i })).not.toBeInTheDocument();
    });
  });

  describe('Add Face Button', () => {
    it('should call onSidesChange with incremented value when Add Face is clicked', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      fireEvent.click(addButton);

      expect(mockOnSidesChange).toHaveBeenCalledWith(7);
      expect(mockOnSidesChange).toHaveBeenCalledTimes(1);
    });

    it('should be enabled when sides < MAX_SIDES', () => {
      const faces = createMockFaces(50);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={50}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      expect(addButton).not.toBeDisabled();
    });

    it('should be disabled when sides = MAX_SIDES', () => {
      const faces = createMockFaces(MAX_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MAX_SIDES}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      expect(addButton).toBeDisabled();
    });

    it('should not call onSidesChange when disabled and clicked', () => {
      const faces = createMockFaces(MAX_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MAX_SIDES}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      fireEvent.click(addButton);

      expect(mockOnSidesChange).not.toHaveBeenCalled();
    });

    it('should show helpful title when enabled', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      expect(addButton).toHaveAttribute('title', 'Add a new face with default value');
    });

    it('should show maximum reached message when disabled', () => {
      const faces = createMockFaces(MAX_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MAX_SIDES}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      expect(addButton).toHaveAttribute('title', `Cannot exceed ${MAX_SIDES} faces`);
    });
  });

  describe('Remove Face Button', () => {
    it('should call onSidesChange with decremented value when Remove Face is clicked', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      fireEvent.click(removeButton);

      expect(mockOnSidesChange).toHaveBeenCalledWith(5);
      expect(mockOnSidesChange).toHaveBeenCalledTimes(1);
    });

    it('should be enabled when sides > MIN_SIDES', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      expect(removeButton).not.toBeDisabled();
    });

    it('should be disabled when sides = MIN_SIDES', () => {
      const faces = createMockFaces(MIN_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MIN_SIDES}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      expect(removeButton).toBeDisabled();
    });

    it('should not call onSidesChange when disabled and clicked', () => {
      const faces = createMockFaces(MIN_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MIN_SIDES}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      fireEvent.click(removeButton);

      expect(mockOnSidesChange).not.toHaveBeenCalled();
    });

    it('should show helpful title when enabled', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      expect(removeButton).toHaveAttribute('title', 'Remove the last face');
    });

    it('should show minimum required message when disabled', () => {
      const faces = createMockFaces(MIN_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MIN_SIDES}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      expect(removeButton).toHaveAttribute('title', `Cannot have fewer than ${MIN_SIDES} faces`);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle rapid clicks on Add Face button (with parent updating currentSides)', () => {
      let currentSides = 6;
      const faces = createMockFaces(currentSides);

      const { rerender } = render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={currentSides}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });

      // Simulate parent updating currentSides after each click
      for (let i = 0; i < 3; i++) {
        fireEvent.click(addButton);
        currentSides += 1;
        rerender(
          <FaceList
            faces={createMockFaces(currentSides)}
            onUpdateFace={mockOnUpdateFace}
            onSidesChange={mockOnSidesChange}
            currentSides={currentSides}
          />
        );
      }

      expect(mockOnSidesChange).toHaveBeenCalledTimes(3);
      expect(mockOnSidesChange).toHaveBeenNthCalledWith(1, 7);
      expect(mockOnSidesChange).toHaveBeenNthCalledWith(2, 8);
      expect(mockOnSidesChange).toHaveBeenNthCalledWith(3, 9);
    });

    it('should handle rapid clicks on Remove Face button', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      
      fireEvent.click(removeButton);
      fireEvent.click(removeButton);

      expect(mockOnSidesChange).toHaveBeenCalledTimes(2);
      expect(mockOnSidesChange).toHaveBeenNthCalledWith(1, 5);
      expect(mockOnSidesChange).toHaveBeenNthCalledWith(2, 5);
    });

    it('should use faces.length when currentSides is not provided', () => {
      const faces = createMockFaces(8);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      fireEvent.click(addButton);

      expect(mockOnSidesChange).toHaveBeenCalledWith(9);
    });
  });

  describe('User Feedback Messages', () => {
    it('should show "add or remove" message when both buttons are enabled', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      expect(screen.getByText(/add or remove faces without losing your work/i)).toBeInTheDocument();
    });

    it('should show maximum reached message when at MAX_SIDES', () => {
      const faces = createMockFaces(MAX_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MAX_SIDES}
        />
      );

      expect(screen.getByText(new RegExp(`maximum ${MAX_SIDES} faces reached`, 'i'))).toBeInTheDocument();
    });

    it('should show minimum required message when at MIN_SIDES', () => {
      const faces = createMockFaces(MIN_SIDES);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={MIN_SIDES}
        />
      );

      expect(screen.getByText(new RegExp(`minimum ${MIN_SIDES} faces required`, 'i'))).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for Add Face button', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const addButton = screen.getByRole('button', { name: /add new face/i });
      expect(addButton).toHaveAttribute('aria-label', 'Add new face');
    });

    it('should have proper ARIA labels for Remove Face button', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const removeButton = screen.getByRole('button', { name: /remove last face/i });
      expect(removeButton).toHaveAttribute('aria-label', 'Remove last face');
    });

    it('should maintain proper button order (Remove before Add)', () => {
      const faces = createMockFaces(6);
      render(
        <FaceList
          faces={faces}
          onUpdateFace={mockOnUpdateFace}
          onSidesChange={mockOnSidesChange}
          currentSides={6}
        />
      );

      const buttons = screen.getAllByRole('button');
      const controlButtons = buttons.filter(btn => 
        btn.textContent?.includes('Remove Face') || btn.textContent?.includes('Add Face')
      );

      expect(controlButtons[0]).toHaveTextContent('Remove Face');
      expect(controlButtons[1]).toHaveTextContent('Add Face');
    });
  });
});
