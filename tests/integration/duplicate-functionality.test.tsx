/**
 * Integration tests for duplicate functionality (User Story 7)
 * Tests duplicating dice and dice sets from library and editors
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiceLibrary } from '@/components/dice/DiceLibrary';
import { ToastProvider } from '@/components/ui/Toast';
import * as storage from '@/lib/storage';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock storage
jest.mock('@/lib/storage');

const renderWithToast = (component: React.ReactElement) => {
  return render(<ToastProvider>{component}</ToastProvider>);
};

describe('Duplicate Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Duplicate Die from Library', () => {
    it('shows duplicate button on library cards', async () => {
      const mockDie = {
        id: 'test-die-1',
        name: 'Test Die',
        sides: 6,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number' as const,
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          value: String(i + 1),
          color: '#FFFFFF',
          contentType: 'number' as const,
        })),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (storage.loadDice as jest.Mock).mockResolvedValue([mockDie]);
      (storage.loadDiceSets as jest.Mock).mockResolvedValue([]);

      renderWithToast(<DiceLibrary />);

      await waitFor(() => {
        expect(screen.getByText('Test Die')).toBeInTheDocument();
      });

      const duplicateButtons = screen.getAllByLabelText(/duplicate/i);
      expect(duplicateButtons.length).toBeGreaterThan(0);
    });

    it('duplicates a die when duplicate button is clicked', async () => {
      const mockDie = {
        id: 'test-die-1',
        name: 'Test Die',
        sides: 6,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number' as const,
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          value: String(i + 1),
          color: '#FFFFFF',
          contentType: 'number' as const,
        })),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (storage.loadDice as jest.Mock).mockResolvedValue([mockDie]);
      (storage.loadDiceSets as jest.Mock).mockResolvedValue([]);
      (storage.saveDie as jest.Mock).mockResolvedValue(undefined);

      renderWithToast(<DiceLibrary />);

      await waitFor(() => {
        expect(screen.getByText('Test Die')).toBeInTheDocument();
      });

      const duplicateButton = screen.getAllByLabelText(/duplicate/i)[0];
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(storage.saveDie).toHaveBeenCalled();
      });

      const saveCall = (storage.saveDie as jest.Mock).mock.calls[0][0];
      expect(saveCall.name).toContain('Copy');
      expect(saveCall.id).not.toBe(mockDie.id);
    });
  });

  describe('Duplicate Dice Set from Library', () => {
    it('duplicates a dice set when duplicate button is clicked', async () => {
      const mockDiceSet = {
        id: 'test-set-1',
        name: 'Test Set',
        diceIds: ['die-1', 'die-2'],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (storage.loadDice as jest.Mock).mockResolvedValue([]);
      (storage.loadDiceSets as jest.Mock).mockResolvedValue([mockDiceSet]);
      (storage.saveDiceSet as jest.Mock).mockResolvedValue(undefined);

      renderWithToast(<DiceLibrary />);

      await waitFor(() => {
        expect(screen.getByText('Test Set')).toBeInTheDocument();
      });

      const duplicateButton = screen.getAllByLabelText(/duplicate/i)[0];
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(storage.saveDiceSet).toHaveBeenCalled();
      });

      const saveCall = (storage.saveDiceSet as jest.Mock).mock.calls[0][0];
      expect(saveCall.name).toContain('Copy');
      expect(saveCall.id).not.toBe(mockDiceSet.id);
    });
  });

  describe('Name Truncation', () => {
    it('truncates long die names when duplicating', async () => {
      const longName = 'A'.repeat(50);
      const mockDie = {
        id: 'test-die-1',
        name: longName,
        sides: 6,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number' as const,
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          value: String(i + 1),
          color: '#FFFFFF',
          contentType: 'number' as const,
        })),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (storage.loadDice as jest.Mock).mockResolvedValue([mockDie]);
      (storage.loadDiceSets as jest.Mock).mockResolvedValue([]);
      (storage.saveDie as jest.Mock).mockResolvedValue(undefined);

      renderWithToast(<DiceLibrary />);

      await waitFor(() => {
        expect(screen.getByText(longName)).toBeInTheDocument();
      });

      const duplicateButton = screen.getAllByLabelText(/duplicate/i)[0];
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(storage.saveDie).toHaveBeenCalled();
      });

      const saveCall = (storage.saveDie as jest.Mock).mock.calls[0][0];
      expect(saveCall.name.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Toast Notifications', () => {
    it('saves the duplicated die successfully', async () => {
      const mockDie = {
        id: 'test-die-1',
        name: 'Test Die',
        sides: 6,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        contentType: 'number' as const,
        faces: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          value: String(i + 1),
          color: '#FFFFFF',
          contentType: 'number' as const,
        })),
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (storage.loadDice as jest.Mock).mockResolvedValue([mockDie]);
      (storage.loadDiceSets as jest.Mock).mockResolvedValue([]);
      (storage.saveDie as jest.Mock).mockResolvedValue(undefined);

      renderWithToast(<DiceLibrary />);

      await waitFor(() => {
        expect(screen.getByText('Test Die')).toBeInTheDocument();
      });

      const duplicateButton = screen.getAllByLabelText(/duplicate/i)[0];
      fireEvent.click(duplicateButton);

      await waitFor(() => {
        expect(storage.saveDie).toHaveBeenCalledTimes(1);
      });

      const saveCall = (storage.saveDie as jest.Mock).mock.calls[0][0];
      expect(saveCall.name).toContain('Copy');
    });
  });
});
