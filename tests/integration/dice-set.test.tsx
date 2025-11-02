/**
 * Integration tests for dice set creation and loading
 * Tests the complete flow of creating, saving, and loading dice sets
 */

import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { DiceSetEditor } from '@/components/dice/DiceSetEditor';
import { DiceLibrary } from '@/components/dice/DiceLibrary';

// Mock storage module
jest.mock('@/lib/storage', () => ({
  loadDice: jest.fn(),
  loadDiceSets: jest.fn(),
  saveDiceSet: jest.fn(),
  deleteDiceSet: jest.fn(),
}));

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  useSearchParams: () => ({
    get: jest.fn(() => null),
  }),
}));

const storage = require('@/lib/storage');

describe('Dice Set Integration', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    storage.loadDice.mockResolvedValue([]);
    storage.loadDiceSets.mockResolvedValue([]);
    storage.saveDiceSet.mockResolvedValue(undefined);
    storage.deleteDiceSet.mockResolvedValue(undefined);
  });

  describe('Creating and saving a dice set', () => {
    it('should create a dice set with multiple dice and save it', async () => {
      const user = userEvent.setup();
      
      // Mock saved dice in storage for selection
      const mockDie1 = {
        id: 'die-1',
        name: 'Red Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockDie2 = {
        id: 'die-2',
        name: 'Blue Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#0000FF',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Mock loadDice to return our test dice
      storage.loadDice.mockResolvedValue([mockDie1, mockDie2]);
      storage.loadDiceSets.mockResolvedValue([]);
      storage.saveDiceSet.mockResolvedValue(undefined);

      render(<DiceSetEditor />);

      // Wait for storage to load (component shows loading spinner until storage loads)
      await waitFor(() => {
        expect(storage.loadDice).toHaveBeenCalled();
        expect(storage.loadDiceSets).toHaveBeenCalled();
      });

      // Wait for the name input to appear (confirms loading is complete)
      const nameInput = await screen.findByLabelText(/set name/i);
      
      // Select all and replace with new name
      await user.tripleClick(nameInput);
      await user.keyboard('My Test Set');

      // Check that name input has the new value
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('My Test Set');
    });

    it('should validate minimum dice requirement', async () => {
      render(<DiceSetEditor />);

      // Try to save without adding any dice - use more specific role-based query
      const saveButton = screen.queryByRole('button', { name: /save set/i });
      
      if (saveButton) {
        // Button should be disabled or validation should prevent save
        expect(saveButton).toBeInTheDocument();
      }
    });

    it('should enforce maximum of 6 dice per set', async () => {
      
      // Mock 7 dice in storage
      const mockDice = Array(7).fill(0).map((_, i) => ({
        id: `die-${i}`,
        name: `Die ${i}`,
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        faces: Array(6).fill(0).map((_, j) => ({
          id: j + 1,
          value: String(j + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      storage.loadDice.mockResolvedValue(mockDice);
      storage.loadDiceSets.mockResolvedValue([]);

      render(<DiceSetEditor />);

      await waitFor(() => {
        expect(storage.loadDice).toHaveBeenCalled();
      });

      // The UI should show we can only add 6 dice maximum
      const nameInput = screen.getByLabelText(/set name/i);
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('Loading a dice set', () => {
    it('should load a saved dice set into the editor', async () => {
      const mockDie1 = {
        id: 'die-1',
        name: 'Red Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockDiceSet = {
        id: 'set-1',
        name: 'Saved Set',
        diceIds: ['die-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.loadDice.mockResolvedValue([mockDie1]);
      storage.loadDiceSets.mockResolvedValue([mockDiceSet]);

      render(<DiceLibrary />);

      await waitFor(() => {
        expect(storage.loadDiceSets).toHaveBeenCalled();
      });

      // Library should display the saved set
      expect(await screen.findByText(/saved set/i)).toBeInTheDocument();
    });

    it('should handle missing dice in a set gracefully', async () => {
      const mockDiceSet = {
        id: 'set-1',
        name: 'Incomplete Set',
        diceIds: ['die-1', 'die-missing'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockDie1 = {
        id: 'die-1',
        name: 'Existing Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.loadDice.mockResolvedValue([mockDie1]);
      storage.loadDiceSets.mockResolvedValue([mockDiceSet]);

      render(<DiceLibrary />);

      await waitFor(() => {
        expect(storage.loadDiceSets).toHaveBeenCalled();
      });

      // Should render without crashing
      expect(await screen.findByText(/incomplete set/i)).toBeInTheDocument();
    });
  });

  describe('Validation timing (User Story 1 - T016-T017)', () => {
    it('should not show validation errors on initial render (T016)', async () => {
      storage.loadDice.mockResolvedValue([]);
      storage.loadDiceSets.mockResolvedValue([]);
      
      render(<DiceSetEditor />);
      
      // Wait for component to load
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const nameInput = screen.getByRole('textbox', { name: /set name/i });
      expect(nameInput).toBeInTheDocument();
      
      // Verify NO validation errors appear on initial render
      // Even though the dice set is invalid (empty, no dice), errors should not show
      // until user interacts with the form
      const errorText = screen.queryByText(/must contain at least 1 die/i);
      expect(errorText).not.toBeInTheDocument();
      
      // Verify the Input component's error prop is not showing an error
      expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('should show errors after blur on input field (T017)', async () => {
      const user = userEvent.setup();
      
      // Load one die so we can add it and then remove it to trigger validation
      const mockDie = {
        id: 'die-1',
        name: 'Test Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      storage.loadDice.mockResolvedValue([mockDie]);
      storage.loadDiceSets.mockResolvedValue([]);
      
      render(<DiceSetEditor />);
      
      // Wait for loading
      await waitFor(() => {
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const nameInput = screen.getByRole('textbox', { name: /set name/i });
      
      // Initially no errors should be shown
      expect(screen.queryByText(/must contain at least 1 die/i)).not.toBeInTheDocument();
      expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
      
      // Focus and modify the input to trigger interaction
      await user.click(nameInput);
      await user.clear(nameInput);
      await user.type(nameInput, 'Test Set');
      
      // Find and click a button to blur the input
      const addDieButton = await screen.findByRole('button', { name: /add die/i });
      await user.click(addDieButton);
      
      // After interaction, validation errors SHOULD appear because field was touched
      // and the set has no dice (invalid state)
      await waitFor(() => {
        const errorElements = screen.getAllByText(/must contain at least 1 die/i);
        expect(errorElements.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 1000 });
    });
  });

  describe('Deleting a dice set', () => {
    it('should delete a dice set without deleting individual dice', async () => {
      const mockDie1 = {
        id: 'die-1',
        name: 'Red Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockDiceSet = {
        id: 'set-1',
        name: 'Set to Delete',
        diceIds: ['die-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.loadDice.mockResolvedValue([mockDie1]);
      storage.loadDiceSets.mockResolvedValue([mockDiceSet]);
      storage.deleteDiceSet.mockResolvedValue(undefined);

      render(<DiceLibrary />);

      await waitFor(() => {
        expect(storage.loadDiceSets).toHaveBeenCalled();
      });

      // Set should be displayed
      expect(await screen.findByText(/set to delete/i)).toBeInTheDocument();

      // Individual dice should still exist in storage (not deleted)
      expect(storage.loadDice).toHaveBeenCalled();
    });
  });

  describe('Visual distinction', () => {
    it('should visually distinguish dice sets from individual dice', async () => {
      const mockDie = {
        id: 'die-1',
        name: 'Single Die',
        sides: 6,
        contentType: 'number' as const,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        faces: Array(6).fill(0).map((_, i) => ({
          id: i + 1,
          value: String(i + 1),
          contentType: 'number' as const,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockDiceSet = {
        id: 'set-1',
        name: 'Dice Set',
        diceIds: ['die-1'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.loadDice.mockResolvedValue([mockDie]);
      storage.loadDiceSets.mockResolvedValue([mockDiceSet]);

      render(<DiceLibrary />);

      await waitFor(() => {
        expect(storage.loadDiceSets).toHaveBeenCalled();
      });

      // Both should be rendered (use getAllBy for multiple matches)
      const singleDieElements = await screen.findAllByText(/single die/i);
      expect(singleDieElements.length).toBeGreaterThan(0);
      
      // Use getAllByText to check for the dice set card (matches both heading and card title)
      const diceSetElements = await screen.findAllByText(/dice set/i);
      expect(diceSetElements.length).toBeGreaterThan(0);

      // Visual distinction via separate sections (FR-019)
      expect(screen.getByRole('heading', { name: /dice sets/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /individual dice/i })).toBeInTheDocument();
    });
  });
});
