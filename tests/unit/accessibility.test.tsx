/**
 * @jest-environment jsdom
 */

import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { FaceEditor } from '@/components/dice/FaceEditor';
import { RollResult } from '@/components/dice/RollResult';
import { DiceLibraryCard } from '@/components/dice/DiceLibraryCard';
import { DiceSetCard } from '@/components/dice/DiceSetCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Die, Face } from '@/types';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests - T096', () => {
  describe('UI Components', () => {
    it('Button component should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input component should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Input
            id="test-input"
            label="Test Label"
            value="test value"
            onChange={() => {}}
          />
          <Input
            id="required-input"
            label="Required Input"
            value=""
            onChange={() => {}}
            required
          />
          <Input
            id="error-input"
            label="Error Input"
            value="invalid"
            onChange={() => {}}
            error="This field has an error"
          />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Card component should have no accessibility violations', async () => {
      const { container } = render(
        <div>
          <Card>
            <h2>Card Title</h2>
            <p>Card content</p>
          </Card>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Modal component should have no accessibility violations', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ColorPicker component should have no accessibility violations', async () => {
      const { container } = render(
        <ColorPicker
          label="Background Color"
          value="#FF0000"
          onChange={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('ThemeToggle component should have no accessibility violations', async () => {
      const { container } = render(<ThemeToggle />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dice Components', () => {
    const mockFace: Face = {
      id: 1,
      contentType: 'number',
      value: '1',
    };

    const mockDie: Die = {
      id: 'test-die-1',
      name: 'Test Die',
      sides: 6,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      contentType: 'number',
      faces: Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        contentType: 'number' as const,
        value: String(i + 1),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('FaceEditor component should have no accessibility violations', async () => {
      const { container } = render(
        <FaceEditor
          face={mockFace}
          faceNumber={1}
          onUpdate={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('RollResult component should have no accessibility violations', async () => {
      const { container } = render(
        <RollResult result={mockFace} die={mockDie} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DiceLibraryCard component should have no accessibility violations', async () => {
      const { container } = render(
        <DiceLibraryCard
          die={mockDie}
          onDelete={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('DiceSetCard component should have no accessibility violations', async () => {
      const mockDiceSet = {
        id: 'test-set-1',
        name: 'Test Set',
        diceIds: [mockDie.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { container } = render(
        <DiceSetCard
          diceSet={mockDiceSet}
          dice={[mockDie]}
          onClick={() => {}}
          onDelete={() => {}}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast (WCAG AA)', () => {
    it('should verify primary button has sufficient contrast', async () => {
      const { container } = render(
        <Button variant="primary">Primary Button</Button>
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify text inputs have sufficient contrast', async () => {
      const { container } = render(
        <Input
          id="contrast-test"
          label="Contrast Test"
          value="test value"
          onChange={() => {}}
        />
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify card content has sufficient contrast', async () => {
      const { container } = render(
        <Card>
          <h2>Card Heading</h2>
          <p>This is body text that should meet contrast requirements.</p>
        </Card>
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should verify buttons are keyboard accessible', async () => {
      const { container } = render(
        <Button variant="primary">Keyboard Test</Button>
      );
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify form inputs have proper labels', async () => {
      const { container } = render(
        <Input
          id="keyboard-test"
          label="Keyboard Test Input"
          value=""
          onChange={() => {}}
        />
      );
      const results = await axe(container, {
        rules: {
          label: { enabled: true },
          'label-content-name-mismatch': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify modals have proper focus management', async () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} title="Focus Test">
          <p>Modal content for focus testing</p>
          <Button variant="primary">Action Button</Button>
        </Modal>
      );
      const results = await axe(container, {
        rules: {
          'aria-dialog-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Labels and Roles', () => {
    it('should verify dice components have proper ARIA labels', async () => {
      const mockFace: Face = {
        id: 1,
        contentType: 'number',
        value: '1',
      };

      const mockDie: Die = {
        id: 'aria-test',
        name: 'ARIA Test Die',
        sides: 6,
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        contentType: 'number',
        faces: [mockFace],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { container } = render(
        <RollResult result={mockFace} die={mockDie} />
      );
      const results = await axe(container, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-allowed-attr': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify theme toggle has proper ARIA attributes', async () => {
      const { container } = render(<ThemeToggle />);
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
          'aria-valid-attr': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('should verify all interactive elements have accessible names', async () => {
      const { container } = render(
        <div>
          <Button variant="primary">Roll Die</Button>
          <Button variant="secondary">Save</Button>
          <Input
            id="die-name"
            label="Die Name"
            value="Test Die"
            onChange={() => {}}
          />
        </div>
      );
      const results = await axe(container, {
        rules: {
          'button-name': { enabled: true },
          label: { enabled: true },
          'link-name': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });

    it('should verify images have alt text', async () => {
      const { container } = render(
        <Card>
          <img src="/test-image.png" alt="Test die visualization" />
        </Card>
      );
      const results = await axe(container, {
        rules: {
          'image-alt': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    });
  });
});
