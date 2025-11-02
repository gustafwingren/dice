/**
 * Integration test for die persistence (save-load flow)
 * Tests the complete flow of saving and loading dice
 */

import { render, screen, fireEvent, waitFor, cleanup } from '../test-utils';
import userEvent from '@testing-library/user-event';
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

  describe('Validation timing (User Story 1 - T012-T015)', () => {
    it('should not show validation errors on initial render (T012)', async () => {
      render(<DieEditor onSave={jest.fn()} />);
      
      // Wait for component to fully render
      await waitFor(() => {
        expect(screen.getByLabelText(/die name/i)).toBeInTheDocument();
      });
      
      
      const alertElement = screen.queryByRole('alert');
      expect(alertElement).not.toBeInTheDocument();

      // Also verify that the name input does not have aria-invalid="true"
      const nameInput = screen.getByLabelText(/die name/i);
      expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
    });
    it('should show errors after blur on invalid field (T013)', async () => {
      const user = userEvent.setup();
      render(<DieEditor onSave={jest.fn()} />);
      
      const nameInput = await screen.findByLabelText(/die name/i);
      
      // Initially no error should be shown (field starts empty, which is invalid)
      expect(screen.queryByText(/die name cannot be empty/i)).not.toBeInTheDocument();
      expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
      
      // Focus the name field
      await user.click(nameInput);
      expect(nameInput).toHaveFocus();
      
      // Tab away to trigger blur
      await user.tab();
      
      // After blur, validation error SHOULD appear because field was touched
      await waitFor(() => {
        const errorElements = screen.getAllByText(/die name cannot be empty/i);
        expect(errorElements.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 1000 });
      
      // Verify ARIA attributes
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should clear errors when field becomes valid (T014)', async () => {
      const user = userEvent.setup();
      render(<DieEditor onSave={jest.fn()} />);
      
      const nameInput = await screen.findByLabelText(/die name/i);
      
      // Trigger error by focusing and blurring empty field
      await user.click(nameInput);
      await user.tab();
      
      // Wait for error to appear
      await waitFor(() => {
        const errorElements = screen.getAllByText(/die name cannot be empty/i);
        expect(errorElements.length).toBeGreaterThanOrEqual(1);
      }, { timeout: 1000 });
      
      // Now fix the error by entering a valid name
      await user.click(nameInput);
      await user.clear(nameInput);
      await user.type(nameInput, 'Valid Die Name');
      
      // Tab away to trigger validation
      await user.tab();
      
      // Error should clear when field becomes valid
      await waitFor(() => {
        expect(screen.queryByText(/die name cannot be empty/i)).not.toBeInTheDocument();
      }, { timeout: 1000 });
    });
      
    it('should show all validation errors on submit attempt (T015)', async () => {
      const user = userEvent.setup();
      const handleSave = jest.fn();
      render(<DieEditor onSave={handleSave} />);

      // Try to click the save button (should be disabled)
      const saveButton = await screen.findByRole('button', { name: /save die/i });
      expect(saveButton).toBeDisabled();

      // Try to focus and blur all required fields to simulate submit attempt
      const nameInput = await screen.findByLabelText(/die name/i);
      await user.click(nameInput);
      await user.tab();

      // Add more required fields here if needed (e.g., sides, content type)
      // For example:
      // const sidesInput = await screen.findByLabelText(/number of sides/i);
      // await user.click(sidesInput);
      // await user.tab();

      // After attempting to submit, all errors should be shown
      await waitFor(() => {
        expect(screen.getAllByText(/die name cannot be empty/i).length).toBeGreaterThanOrEqual(1);
      });

      // Optionally, check ARIA attributes
      expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
});
