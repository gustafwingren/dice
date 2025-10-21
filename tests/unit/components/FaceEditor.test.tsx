/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FaceEditor } from '@/components/dice/FaceEditor';
import { Face } from '@/types';

describe('FaceEditor', () => {
  const mockUpdate = jest.fn();

  beforeEach(() => {
    mockUpdate.mockClear();
  });

  describe('number content type', () => {
    const numberFace: Face = {
      id: 1,
      contentType: 'number',
      value: '1',
    };

    it('should render number input', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByLabelText(/number value/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    it('should call onUpdate when number changes', async () => {
      const user = userEvent.setup();
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      const input = screen.getByLabelText(/number value/i);
      await user.clear(input);
      await user.type(input, '42');

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should display face number', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={5}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/face 5/i)).toBeInTheDocument();
    });
  });

  describe('text content type', () => {
    const textFace: Face = {
      id: 2,
      contentType: 'text',
      value: 'Yes',
    };

    it('should render text input', () => {
      render(
        <FaceEditor
          face={textFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByLabelText(/text value/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();
    });

    it('should show character counter', () => {
      render(
        <FaceEditor
          face={textFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/3\/20/)).toBeInTheDocument();
    });

    it('should call onUpdate when text changes', async () => {
      const user = userEvent.setup();
      render(
        <FaceEditor
          face={textFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      const input = screen.getByLabelText(/text value/i);
      await user.clear(input);
      await user.type(input, 'No');

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('color content type', () => {
    const colorFace: Face = {
      id: 3,
      contentType: 'color',
      value: '',
      color: '#FF6B6B',
    };

    it('should render color picker', () => {
      render(
        <FaceEditor
          face={colorFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/face color/i)).toBeInTheDocument();
    });

    it('should show color preview', () => {
      render(
        <FaceEditor
          face={colorFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/face preview/i)).toBeInTheDocument();
      const preview = screen.getByLabelText(/face 1 color preview/i);
      expect(preview).toHaveStyle({ backgroundColor: '#FF6B6B' });
    });

    it('should not show text input for color type', () => {
      render(
        <FaceEditor
          face={colorFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.queryByLabelText(/text value/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/number value/i)).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    const numberFace: Face = {
      id: 1,
      contentType: 'number',
      value: '1',
    };

    it('should display error message when provided', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
          error="Value is required"
        />
      );

      const errorMessages = screen.getAllByText(/value is required/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    it('should apply error styling when error is present', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
          error="Invalid value"
        />
      );

      const errorElements = screen.getAllByText(/invalid value/i);
      expect(errorElements[0]).toHaveClass('text-danger-600');
    });
  });

  describe('accessibility', () => {
    const numberFace: Face = {
      id: 1,
      contentType: 'number',
      value: '1',
    };

    it('should have proper labels for inputs', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
        />
      );

      const input = screen.getByLabelText(/number value/i);
      expect(input).toHaveAttribute('id');
    });

    it('should mark errors with role="alert"', () => {
      render(
        <FaceEditor
          face={numberFace}
          faceNumber={1}
          onUpdate={mockUpdate}
          error="Error message"
        />
      );

      const errorElements = screen.getAllByRole('alert');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });
});
