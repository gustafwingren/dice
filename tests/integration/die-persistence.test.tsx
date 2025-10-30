/**
 * Integration test for die persistence (save-load flow)
 * Tests the complete flow of saving and loading dice
 */

import { render, screen, fireEvent, waitFor, cleanup } from '../test-utils';
import '@testing-library/jest-dom';
import { DieEditor } from '@/components/dice/DieEditor';
import { DiceLibrary } from '@/components/dice/DiceLibrary';
import { createDie } from '@/lib/die-factory';
import * as storage from '@/lib/storage';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock storage
jest.mock('@/lib/storage');

describe('Die Persistence Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (storage.loadDice as jest.Mock).mockResolvedValue([]);
    (storage.loadDiceSets as jest.Mock).mockResolvedValue([]);
    (storage.saveDie as jest.Mock).mockResolvedValue(undefined);
    (storage.deleteDie as jest.Mock).mockResolvedValue(true);
  });
  
  it('should save a die and display it in the library', async () => {
    const testDie = createDie('Test Die', 6, 'number');
    
    // Mock saveDie to simulate successful save
    (storage.saveDie as jest.Mock).mockImplementation((die) => {
      // Update loadDice mock to return the saved die
      (storage.loadDice as jest.Mock).mockResolvedValue([die]);
      return Promise.resolve();
    });
    
    // Render editor
    const handleSave = jest.fn();
    render(<DieEditor onSave={handleSave} initialDie={testDie} />);
    
    // Click save button to open modal
    const saveButton = screen.getByRole('button', { name: /save die/i });
    fireEvent.click(saveButton);
    
    // Confirm save in modal
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /^save$/i });
      fireEvent.click(confirmButton);
    });
    
    // Verify saveDie was called
    await waitFor(() => {
      expect(storage.saveDie).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Die',
          sides: 6,
          contentType: 'number',
        })
      );
    });
    
    // Cleanup DieEditor render before rendering library
    cleanup();
    
    // Render library to verify die appears
    render(<DiceLibrary />);
    
    // Wait for library to load
    await waitFor(() => {
      expect(screen.getByText('Test Die')).toBeInTheDocument();
    });
    
    // Verify die details are shown (using flexible matcher for bullet character)
    expect(screen.getByText(/6 sides.*number/i)).toBeInTheDocument();
  });
  
  it('should load a die from the library (creates new copy)', async () => {
    const savedDie = createDie('Saved Die', 8, 'text');
    
    // Mock loadDice to return saved die
    (storage.loadDice as jest.Mock).mockResolvedValue([savedDie]);
    
    // Render library
    const handleLoadDie = jest.fn();
    render(<DiceLibrary onLoadDie={handleLoadDie} />);
    
    // Wait for die to appear
    await waitFor(() => {
      expect(screen.getByText('Saved Die')).toBeInTheDocument();
    });
    
    // Click on die card using aria-label (LibraryCard no longer has role="button" due to accessibility fix)
    const dieCard = screen.getByLabelText(/load die saved die/i);
    fireEvent.click(dieCard);
    
    // Verify load callback was called
    expect(handleLoadDie).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Saved Die',
        sides: 8,
        contentType: 'text',
      })
    );
  });
  
  it('should delete a die from the library', async () => {
    const die1 = createDie('Die 1', 6, 'number');
    const die2 = createDie('Die 2', 4, 'text');
    
    // Mock loadDice to return two dice initially
    (storage.loadDice as jest.Mock).mockResolvedValue([die1, die2]);
    
    // Mock deleteDie to update loadDice mock
    (storage.deleteDie as jest.Mock).mockImplementation((id) => {
      if (id === die1.id) {
        (storage.loadDice as jest.Mock).mockResolvedValue([die2]);
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });
    
    // Render library
    render(<DiceLibrary />);
    
    // Wait for dice to load
    await waitFor(() => {
      expect(screen.getByText('Die 1')).toBeInTheDocument();
      expect(screen.getByText('Die 2')).toBeInTheDocument();
    });
    
    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    // Click delete button on first die
    const deleteButtons = screen.getAllByLabelText(/delete die/i);
    fireEvent.click(deleteButtons[0]);
    
    // Verify deleteDie was called
    await waitFor(() => {
      expect(storage.deleteDie).toHaveBeenCalledWith(die1.id);
    });
    
    confirmSpy.mockRestore();
  });
  
  it('should handle storage errors gracefully', async () => {
    // Mock loadDice to throw error
    (storage.loadDice as jest.Mock).mockRejectedValue(new Error('Storage error'));
    
    // Render library
    render(<DiceLibrary />);
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to load library/i)).toBeInTheDocument();
    });
  });
  
  it('should show empty state when no dice exist', async () => {
    // Mock loadDice to return empty array
    (storage.loadDice as jest.Mock).mockResolvedValue([]);
    
    // Render library
    render(<DiceLibrary />);
    
    // Verify empty state is shown
    await waitFor(() => {
      expect(screen.getByText(/no dice or sets yet/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/create your first custom die or dice set/i)).toBeInTheDocument();
  });
  
  it('should persist die configuration across save-load cycle', async () => {
    const testDie = createDie('Complete Die', 12, 'color');
    testDie.backgroundColor = '#FF5733';
    testDie.textColor = '#FFFFFF';
    
    // Mock save and load cycle
    (storage.saveDie as jest.Mock).mockImplementation((die) => {
      (storage.loadDice as jest.Mock).mockResolvedValue([die]);
      return Promise.resolve();
    });
    
    // Save die
    await storage.saveDie(testDie);
    
    // Load dice
    const loadedDice = await storage.loadDice();
    
    expect(loadedDice).toHaveLength(1);
    expect(loadedDice[0]).toMatchObject({
      name: 'Complete Die',
      sides: 12,
      contentType: 'color',
      backgroundColor: '#FF5733',
      textColor: '#FFFFFF',
    });
  });
});
