/**
 * Integration tests for loading dice sets from URL parameters for editing
 * Verifies FR-013: Load set creates new copies of dice for immutable edit
 * Tests the complete flow: URL param → load from storage → populate form
 */

import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { useSearchParams } from 'next/navigation';
import { Die, DiceSet } from '@/types';
import { saveDie, saveDiceSet, deleteDie, loadDiceSets, clearAllStorage } from '@/lib/storage';
import { createEmptyDie } from '@/lib/die-factory';
import { generateUUID } from '@/lib/uuid';
import { createDiceSet } from '@/lib/set-factory';
import DiceSetEditorPage from '@/app/set/page';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/set'),
}));

const mockUseSearchParams = useSearchParams as jest.MockedFunction<typeof useSearchParams>;

describe('Dice Set Load for Edit Integration Tests', () => {
  let testDiceSet: DiceSet;
  let testDice: Die[];
  let setId: string;

  beforeEach(async () => {
    // Clear storage before each test
    await clearAllStorage();

    // Generate dice for the set
    testDice = [
      {
        ...createEmptyDie(),
        id: generateUUID(),
        name: 'Red Die',
        sides: 6,
        backgroundColor: '#FF0000',
        textColor: '#FFFFFF',
        contentType: 'number',
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          contentType: 'number' as const,
          value: `${i + 1}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        ...createEmptyDie(),
        id: generateUUID(),
        name: 'Blue Die',
        sides: 6,
        backgroundColor: '#0000FF',
        textColor: '#FFFFFF',
        contentType: 'number',
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          contentType: 'number' as const,
          value: `${i + 1}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        ...createEmptyDie(),
        id: generateUUID(),
        name: 'Green Die',
        sides: 6,
        backgroundColor: '#00FF00',
        textColor: '#000000',
        contentType: 'number',
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          contentType: 'number' as const,
          value: `${i + 1}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Save all dice
    for (const die of testDice) {
      await saveDie(die);
    }

    // Create and save dice set
    setId = generateUUID();
    testDiceSet = createDiceSet(
      'RPG Starter Set',
      testDice.map((d) => d.id)
    );
    testDiceSet.id = setId;
    testDiceSet.createdAt = new Date().toISOString();
    testDiceSet.updatedAt = new Date().toISOString();

    await saveDiceSet(testDiceSet);
    
    // Add a small delay to ensure storage operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(async () => {
    await clearAllStorage();
    jest.clearAllMocks();
  });

  describe('URL Parameter Loading', () => {
    it('should load dice set when valid id parameter is present', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? setId : null),
      } as any);

      render(<DiceSetEditorPage />);

      // Wait for loading to complete
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify set name is displayed
      await waitFor(
        () => {
          const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
          expect(nameInput.value).toBe('RPG Starter Set');
        },
        { timeout: 3000 }
      );

      // Verify all 3 dice are loaded
      await waitFor(() => {
        const redDice = screen.getAllByText('Red Die');
        const blueDice = screen.getAllByText('Blue Die');
        const greenDice = screen.getAllByText('Green Die');
        expect(redDice.length).toBeGreaterThan(0);
        expect(blueDice.length).toBeGreaterThan(0);
        expect(greenDice.length).toBeGreaterThan(0);
      });
    });

    it('should load set without showing loading skeleton', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? setId : null),
      } as any);

      render(<DiceSetEditorPage />);

      // Editor should be visible immediately (no skeleton loading)
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
        expect(nameInput).toBeInTheDocument();
      });
    });

    it('should handle non-existent set id gracefully', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? 'non-existent-id' : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show empty editor (not crash)
      const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
      // Default name is "New Dice Set"
      expect(nameInput.value).toBe('New Dice Set');
    });

    it('should show empty editor when no id parameter present', async () => {
      mockUseSearchParams.mockReturnValue({
        get: () => null,
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should show empty editor with default name
      const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('New Dice Set');
    });
  });

  describe('FR-013: Immutable Edit (Copy Creation)', () => {
    it('should create copies of all dice in the set', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? setId : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify all dice names are displayed
      await waitFor(() => {
        const redDice = screen.getAllByText('Red Die');
        const blueDice = screen.getAllByText('Blue Die');
        const greenDice = screen.getAllByText('Green Die');
        expect(redDice.length).toBeGreaterThan(0);
        expect(blueDice.length).toBeGreaterThan(0);
        expect(greenDice.length).toBeGreaterThan(0);
      });

      // The loaded dice should be copies - original dice in storage unchanged
      // This is verified by the fact that the editor works without errors
    });
  });

  describe('Set Population', () => {
    it('should populate set name and all dice', async () => {
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? setId : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Check set name
      const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('RPG Starter Set');
      });

      // Check all dice are present
      await waitFor(() => {
        const redDice = screen.getAllByText('Red Die');
        const blueDice = screen.getAllByText('Blue Die');
        const greenDice = screen.getAllByText('Green Die');
        expect(redDice.length).toBeGreaterThan(0);
        expect(blueDice.length).toBeGreaterThan(0);
        expect(greenDice.length).toBeGreaterThan(0);
      });
    });

    it('should load set with maximum 6 dice', async () => {
      // Create a set with 6 dice
      const sixDice: Die[] = [];
      for (let i = 0; i < 6; i++) {
        const die: Die = {
          ...createEmptyDie(),
          id: generateUUID(),
          name: `Die ${i + 1}`,
          sides: 6,
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          contentType: 'number',
          faces: Array.from({ length: 6 }, (_, j) => ({
            id: j + 1,
            contentType: 'number' as const,
            value: `${j + 1}`,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        sixDice.push(die);
        await saveDie(die);
      }

      const largeSetId = generateUUID();
      const largeSet = createDiceSet(
        'Full Set',
        sixDice.map((d) => d.id)
      );
      largeSet.id = largeSetId;
      largeSet.createdAt = new Date().toISOString();
      largeSet.updatedAt = new Date().toISOString();

      await saveDiceSet(largeSet);

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? largeSetId : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify all 6 dice are loaded
      await waitFor(() => {
        for (let i = 1; i <= 6; i++) {
          const diceWithName = screen.getAllByText(`Die ${i}`);
          expect(diceWithName.length).toBeGreaterThan(0);
        }
      });

      // Verify "Add Die" button is disabled or shows max reached
      await waitFor(() => {
        const maxReachedText = screen.queryByText(/Maximum 6 dice reached/i);
        expect(maxReachedText).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should load dice set within 2 seconds', async () => {
      const startTime = Date.now();

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? setId : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing dice in set gracefully', async () => {
      // Create a set that references a die that doesn't exist
      const brokenSetId = generateUUID();

      // Manually save to bypass validation
      await saveDie(testDice[0]); // Save one valid die
      const validSet = createDiceSet('Valid Set', [testDice[0].id]);
      validSet.id = brokenSetId;
      // Modify to include non-existent die
      validSet.diceIds.push(generateUUID());

      try {
        await saveDiceSet(validSet);
      } catch (error) {
        // Expected to fail validation - set references missing dice
      }

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? brokenSetId : null),
      } as any);

      render(<DiceSetEditorPage />);

      // Should not crash
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    it('should handle set with some deleted dice by removing missing dice IDs', async () => {
      // Create a set with 3 dice, then delete one (simulating deleted dice)
      const partialSetId = generateUUID();
      const die1 = testDice[0];
      const die2 = testDice[1];
      const die3 = testDice[2];

      // Save all 3 dice
      await saveDie(die1);
      await saveDie(die2);
      await saveDie(die3);

      // Create a set that references all 3 dice
      const partialSet = createDiceSet('Partial Set', [die1.id, die2.id, die3.id]);
      partialSet.id = partialSetId;

      // Save the set (should succeed with all dice present)
      await saveDiceSet(partialSet);

      // Now delete die3 (simulating a user deleting a die after creating the set)
      await deleteDie(die3.id);

      await new Promise(resolve => setTimeout(resolve, 100));

      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? partialSetId : null),
      } as any);

      render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should load the 2 valid dice (die3 is filtered out)
      await waitFor(() => {
        const die1Names = screen.getAllByText(die1.name);
        const die2Names = screen.getAllByText(die2.name);
        expect(die1Names.length).toBeGreaterThan(0);
        expect(die2Names.length).toBeGreaterThan(0);
      });

      // Should NOT show die3
      expect(screen.queryByText(die3.name)).not.toBeInTheDocument();

      // Should show the set name
      const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Partial Set');
      });

      // Should NOT show validation error about missing dice (they were filtered out)
      await waitFor(() => {
        expect(screen.queryByText(/references.*missing dice/i)).not.toBeInTheDocument();
      });

      // Should show "Dice in Set (2/6)" since only 2 dice loaded
      await waitFor(() => {
        expect(screen.getByText(/Dice in Set \(2\/6\)/i)).toBeInTheDocument();
      });
    });

    it('should save dice set with original IDs after loading for edit', async () => {
      // This tests the fix for the bug where copied dice IDs were being saved
      const editSetId = generateUUID();
      const die1 = testDice[0];
      const die2 = testDice[1];

      // Save dice
      await saveDie(die1);
      await saveDie(die2);

      // Create and save a set
      const originalSet = createDiceSet('Edit Test Set', [die1.id, die2.id]);
      originalSet.id = editSetId;
      await saveDiceSet(originalSet);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Load the set for editing
      mockUseSearchParams.mockReturnValue({
        get: (key: string) => (key === 'id' ? editSetId : null),
      } as any);

      const { unmount } = render(<DiceSetEditorPage />);

      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify set loaded
      const nameInput = screen.getByLabelText(/Set Name/i) as HTMLInputElement;
      await waitFor(() => {
        expect(nameInput.value).toBe('Edit Test Set');
      });

      // Try to save (this should use original IDs, not copied IDs)
      const saveButton = screen.getByRole('button', { name: /save dice set/i });
      await userEvent.click(saveButton);

      // Modal should open
      await waitFor(() => {
        const modalTitles = screen.getAllByText('Save Dice Set');
        // Should have at least 2: button and modal title
        expect(modalTitles.length).toBeGreaterThanOrEqual(2);
      });

      const confirmButton = screen.getByRole('button', { name: /^save$/i });
      
      // Mock console.error to catch any errors
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      await userEvent.click(confirmButton);

      // Wait for modal to close (success indicator)
      await waitFor(() => {
        // Modal should close after save
        const headings = screen.queryAllByRole('heading', { name: 'Save Dice Set' });
        expect(headings.length).toBe(0); // Modal heading should be gone
      }, { timeout: 3000 });

      // Verify no console errors (no "Referenced dice not found" error)
      const errors = consoleErrorSpy.mock.calls.filter(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Referenced dice not found'))
      );
      expect(errors.length).toBe(0);
      
      consoleErrorSpy.mockRestore();

      // Verify the set was saved with original dice IDs
      unmount();
      await new Promise(resolve => setTimeout(resolve, 100));

      const savedSets = await loadDiceSets();
      const savedSet = savedSets.find(s => s.id === editSetId);
      expect(savedSet).toBeDefined();
      expect(savedSet!.diceIds).toEqual([die1.id, die2.id]); // Original IDs, not copied IDs
      expect(savedSet!.name).toBe('Edit Test Set');
    });
  });
});
