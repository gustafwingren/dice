// Mock the hooks - must be before imports
jest.mock('@/hooks/useDiceStorage');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

import { render, screen, waitFor } from '../test-utils';
import userEvent from '@testing-library/user-event';
import { DiceLibrary } from '@/components/dice/DiceLibrary';
import { Die } from '@/types';

const mockUseDiceStorage = require('@/hooks/useDiceStorage').useDiceStorage as jest.Mock;

describe('DiceLibrary - Progressive Loading Integration', () => {
  const createMockDie = (id: number): Die => ({
    id: `die-${id}`,
    name: `Test Die ${id}`,
    sides: 6,
    faces: Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      value: String(i + 1),
      backgroundColor: '#ffffff',
      textColor: '#000000',
      contentType: 'number' as const,
    })),
    backgroundColor: '#ffffff',
    textColor: '#000000',
    contentType: 'number',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('T042: should render without overflow styles', async () => {
    const mockDice = Array.from({ length: 10 }, (_, i) => createMockDie(i + 1));
    
    mockUseDiceStorage.mockReturnValue({
      dice: mockDice,
      diceSets: [],
      isLoading: false,
      error: null,
      deleteDie: jest.fn(),
      deleteDiceSet: jest.fn(),
    });

    const { container } = render(<DiceLibrary />);
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText(/Individual Dice/i)).toBeInTheDocument();
    });
    
    // Find the main container
    const mainContainer = container.querySelector('div.space-y-8');
    expect(mainContainer).toBeInTheDocument();
    
    // Verify no overflow styles are applied
    if (mainContainer) {
      const styles = window.getComputedStyle(mainContainer);
      expect(styles.overflowY).not.toBe('auto');
      expect(styles.overflowY).not.toBe('scroll');
    }
  });

  it('should show "Show More" button when more than 50 dice exist', async () => {
    const mockDice = Array.from({ length: 60 }, (_, i) => createMockDie(i + 1));
    
    mockUseDiceStorage.mockReturnValue({
      dice: mockDice,
      diceSets: [],
      isLoading: false,
      error: null,
      deleteDie: jest.fn(),
      deleteDiceSet: jest.fn(),
    });

    render(<DiceLibrary />);
    
    await waitFor(() => {
      expect(screen.getByText(/Individual Dice/i)).toBeInTheDocument();
    });
    
    // Should show "Show More" button
    const showMoreButton = screen.getByRole('button', { name: /Show \d+ More Dice/i });
    expect(showMoreButton).toBeInTheDocument();
    expect(showMoreButton).toHaveTextContent('Show More Dice (10 remaining)');
  });

  it('should not show "Show More" button when 50 or fewer dice exist', async () => {
    const mockDice = Array.from({ length: 30 }, (_, i) => createMockDie(i + 1));
    
    mockUseDiceStorage.mockReturnValue({
      dice: mockDice,
      diceSets: [],
      isLoading: false,
      error: null,
      deleteDie: jest.fn(),
      deleteDiceSet: jest.fn(),
    });

    render(<DiceLibrary />);
    
    await waitFor(() => {
      expect(screen.getByText(/Individual Dice/i)).toBeInTheDocument();
    });
    
    // Should NOT show "Show More" button
    const showMoreButton = screen.queryByRole('button', { name: /Show More Dice/i });
    expect(showMoreButton).not.toBeInTheDocument();
  });

  it('should load more dice when "Show More" button is clicked', async () => {
    const user = userEvent.setup();
    const mockDice = Array.from({ length: 120 }, (_, i) => createMockDie(i + 1));
    
    mockUseDiceStorage.mockReturnValue({
      dice: mockDice,
      diceSets: [],
      isLoading: false,
      error: null,
      deleteDie: jest.fn(),
      deleteDiceSet: jest.fn(),
    });

    render(<DiceLibrary />);
    
    await waitFor(() => {
      expect(screen.getByText(/Individual Dice/i)).toBeInTheDocument();
    });
    
    // Initially should show first 50
    let diceCards = screen.getAllByRole('article');
    expect(diceCards.length).toBeLessThanOrEqual(50);
    
    // Click "Show More"
    const showMoreButton = screen.getByRole('button', { name: /Show \d+ More Dice/i });
    await user.click(showMoreButton);
    
    // Should now show up to 100
    await waitFor(() => {
      diceCards = screen.getAllByRole('article');
      expect(diceCards.length).toBeGreaterThan(50);
      expect(diceCards.length).toBeLessThanOrEqual(100);
    });
    
    // Button should still exist with updated count
    expect(showMoreButton).toBeInTheDocument();
    expect(showMoreButton).toHaveTextContent('Show More Dice (20 remaining)');
  });

  it('should hide "Show More" button when all items are visible', async () => {
    const user = userEvent.setup();
    const mockDice = Array.from({ length: 60 }, (_, i) => createMockDie(i + 1));
    
    mockUseDiceStorage.mockReturnValue({
      dice: mockDice,
      diceSets: [],
      isLoading: false,
      error: null,
      deleteDie: jest.fn(),
      deleteDiceSet: jest.fn(),
    });

    render(<DiceLibrary />);
    
    await waitFor(() => {
      expect(screen.getByText(/Individual Dice/i)).toBeInTheDocument();
    });
    
    // Click "Show More" to load all remaining dice
    const showMoreButton = screen.getByRole('button', { name: /Show \d+ More Dice/i });
    await user.click(showMoreButton);
    
    // Button should disappear after showing all items
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Show \d+ More Dice/i })).not.toBeInTheDocument();
    });
    
    // All 60 dice should be visible
    const diceCards = screen.getAllByRole('article');
    expect(diceCards.length).toBe(60);
  });
});
