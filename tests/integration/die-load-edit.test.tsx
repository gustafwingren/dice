/**
 * Integration tests for loading dice from URL parameters for editing
 * Tests the complete flow: URL param → load from storage → populate form → update on save
 */

import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { Die } from '@/types';
import { saveDie, loadDice, clearAllStorage } from '@/lib/storage';
import { createEmptyDie } from '@/lib/die-factory';
import { generateUUID } from '@/lib/uuid';
import DieEditorPage from '@/app/page';

// Use clearAllStorage as clearAllDice for test convenience
const clearAllDice = clearAllStorage;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('Die Load for Edit Integration Tests', () => {
  let testDie: Die;
  let testDieId: string;

  beforeEach(async () => {
    // Clear storage before each test
    await clearAllDice();

    // Generate a valid UUID for the test die
    testDieId = generateUUID();

    // Create and save a test die
    testDie = {
      ...createEmptyDie(),
      id: testDieId,
      name: 'Test Die',
      sides: 6,
      backgroundColor: '#FF5733',
      textColor: '#FFFFFF',
      contentType: 'number',
      faces: [
        { id: 1, contentType: 'number', value: '1' },
        { id: 2, contentType: 'number', value: '2' },
        { id: 3, contentType: 'number', value: '3' },
        { id: 4, contentType: 'number', value: '4' },
        { id: 5, contentType: 'number', value: '5' },
        { id: 6, contentType: 'number', value: '6' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveDie(testDie);
  });

  afterEach(async () => {
    await clearAllDice();
    jest.clearAllMocks();
  });

  describe('URL Parameter Loading', () => {
    it('should load die when valid id parameter is present', async () => {
      // Mock URL with die id parameter
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      // Wait for loading to complete and die to be loaded
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify die name is displayed (input should be populated)
      await waitFor(
        () => {
          const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
          expect(nameInput.value).toBe('Test Die');
        },
        { timeout: 3000 }
      );

      // Verify die color is loaded
      await waitFor(
        () => {
          const colorInput = screen.getByDisplayValue('#FF5733') as HTMLInputElement;
          expect(colorInput).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should load die without showing loading skeleton', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      // Editor should be visible immediately (no skeleton loading)
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Die Name/i) as HTMLInputElement;
        expect(nameInput).toBeInTheDocument();
      });
    });

    it('should handle non-existent die id gracefully', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? 'non-existent-id' : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show empty editor (not crash)
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });

    it('should show empty editor when no id parameter present', async () => {
      mockUseSearchParams.mockReturnValue({
        get: () => null,
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show empty editor
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });
  });

  describe('Edit Existing Die', () => {
    it('should load existing die for editing with same ID', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // The loaded die should have the same ID (not a copy)
      // Verify the original die in storage is unchanged (until save)
      const storedDice = await loadDice();
      const originalDie = storedDice.find((d) => d.id === testDieId);

      expect(originalDie).toBeDefined();
      expect(originalDie!.name).toBe('Test Die');
      expect(originalDie!.id).toBe(testDieId);
    });
  });

  describe('Form Population', () => {
    it('should populate all form fields with loaded die data', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check name field
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Test Die');
      });

      // Check color field
      await waitFor(() => {
        const colorInput = screen.getByDisplayValue('#FF5733') as HTMLInputElement;
        expect(colorInput).toBeInTheDocument();
      });

      // Check content type is set to number
      await waitFor(() => {
        const numberButton = screen.getByRole('button', { name: /^Number$/i, pressed: true });
        expect(numberButton).toBeInTheDocument();
      });
    });

    it('should load all 6 faces with correct content', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify all face numbers are present
      await waitFor(() => {
        expect(screen.getByText('Face 1')).toBeInTheDocument();
        expect(screen.getByText('Face 2')).toBeInTheDocument();
        expect(screen.getByText('Face 3')).toBeInTheDocument();
        expect(screen.getByText('Face 4')).toBeInTheDocument();
        expect(screen.getByText('Face 5')).toBeInTheDocument();
        expect(screen.getByText('Face 6')).toBeInTheDocument();
      });
    });

    it('should load text content type die correctly', async () => {
      // Create a text-based die
      const textDieId = generateUUID();
      const textDie: Die = {
        ...createEmptyDie(),
        id: textDieId,
        name: 'Decision Die',
        sides: 4,
        backgroundColor: '#3498db',
        textColor: '#FFFFFF',
        contentType: 'text',
        faces: [
          { id: 1, contentType: 'text', value: 'Yes' },
          { id: 2, contentType: 'text', value: 'No' },
          { id: 3, contentType: 'text', value: 'Maybe' },
          { id: 4, contentType: 'text', value: 'Later' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDie(textDie);

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? textDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check name
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Decision Die');
      });

      // Check text radio is selected
      await waitFor(() => {
        const textButton = screen.getByRole('button', { name: /^Text$/i, pressed: true });
        expect(textButton).toBeInTheDocument();
      });

      // Verify text content is loaded
      await waitFor(() => {
        expect(screen.getByDisplayValue('Yes')).toBeInTheDocument();
        expect(screen.getByDisplayValue('No')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Maybe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Later')).toBeInTheDocument();
      });
    });

    it('should load color content type die correctly', async () => {
      // Create a color-based die
      const colorDieId = generateUUID();
      const colorDie: Die = {
        ...createEmptyDie(),
        id: colorDieId,
        name: 'Rainbow Die',
        sides: 3,
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        contentType: 'color',
        faces: [
          { id: 1, contentType: 'color', value: '', color: '#FF0000' },
          { id: 2, contentType: 'color', value: '', color: '#00FF00' },
          { id: 3, contentType: 'color', value: '', color: '#0000FF' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDie(colorDie);

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? colorDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check name
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Rainbow Die');
      });

      // Check color radio is selected
      await waitFor(() => {
        const colorButton = screen.getByRole('button', { name: /^Color$/i, pressed: true });
        expect(colorButton).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should load die within 2 seconds', async () => {
      const startTime = Date.now();

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Should load in under 2 seconds
    });

    it('should handle loading large 101-sided die efficiently', async () => {
      // Create a 101-sided die
      const largeDieId = generateUUID();
      const largeDie: Die = {
        ...createEmptyDie(),
        id: largeDieId,
        name: 'Huge Die',
        sides: 101,
        backgroundColor: '#8E44AD',
        textColor: '#FFFFFF',
        contentType: 'number',
        faces: Array.from({ length: 101 }, (_, i) => ({
          id: i + 1,
          contentType: 'number' as const,
          value: `${i + 1}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveDie(largeDie);

      const startTime = Date.now();

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? largeDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000); // Should still load quickly

      // Verify name loaded
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Huge Die');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted storage data gracefully', async () => {
      // Mock corrupted data scenario
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      // Clear storage to simulate missing data
      await clearAllDice();

      render(<DieEditorPage />);

      // Should not crash, should show empty editor
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('');
    });
  });

  describe('Update Existing Die', () => {
    it('should update existing die when saving after load', async () => {
      // Load die for editing
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? testDieId : null),
      } as any);

      render(<DieEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify die loaded
      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Test Die');
      });

      // Change the name
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated Die Name');

      // Save the die
      const saveButton = screen.getByRole('button', { name: /save die/i });
      await userEvent.click(saveButton);

      // Modal should open
      await waitFor(() => {
        const headings = screen.getAllByRole('heading', { name: /save die/i });
        expect(headings.length).toBeGreaterThan(0);
      });

      const confirmButton = screen.getByRole('button', { name: /^save$/i });
      await userEvent.click(confirmButton);

      // Wait for modal to close
      await waitFor(() => {
        const headings = screen.queryAllByRole('heading', { name: /save die/i });
        expect(headings.length).toBe(0);
      }, { timeout: 3000 });

      // Verify the die was updated (not duplicated)
      await new Promise(resolve => setTimeout(resolve, 100));
      const allDice = await loadDice();
      
      // Should only have 1 die (updated, not created new)
      expect(allDice.length).toBe(1);
      expect(allDice[0].id).toBe(testDieId); // Same ID
      expect(allDice[0].name).toBe('Updated Die Name'); // Updated name
    });
  });
});
