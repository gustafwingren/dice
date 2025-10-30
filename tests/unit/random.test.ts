import { getSecureRandomInt, rollDie, rollDiceSet } from '@/lib/random';
import { createEmptyDie } from '@/lib/die-factory';
import { createEmptyDiceSet } from '@/lib/set-factory';
import { Die } from '@/types';

describe('random.ts', () => {
  describe('getSecureRandomInt', () => {
    it('should generate numbers within specified range', () => {
      const min = 1;
      const max = 6;
      
      for (let i = 0; i < 100; i++) {
        const result = getSecureRandomInt(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });

    it('should generate all numbers in range over many iterations', () => {
      const min = 1;
      const max = 6;
      const results = new Set<number>();
      
      // Run enough iterations to likely hit all values
      for (let i = 0; i < 1000; i++) {
        results.add(getSecureRandomInt(min, max));
      }
      
      // Should have seen all 6 values
      expect(results.size).toBe(6);
      expect(results.has(1)).toBe(true);
      expect(results.has(6)).toBe(true);
    });

    it('should handle range of 1 (min === max)', () => {
      const value = 42;
      const result = getSecureRandomInt(value, value);
      expect(result).toBe(value);
    });

    it('should throw error if min > max', () => {
      expect(() => getSecureRandomInt(10, 5)).toThrow('min must be less than or equal to max');
    });

    it('should handle large ranges', () => {
      const min = 1;
      const max = 101;
      
      for (let i = 0; i < 100; i++) {
        const result = getSecureRandomInt(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
      }
    });

    it('should have reasonable distribution', () => {
      const min = 1;
      const max = 6;
      const counts = new Map<number, number>();
      const iterations = 6000;
      
      // Initialize counts
      for (let i = min; i <= max; i++) {
        counts.set(i, 0);
      }
      
      // Generate random numbers
      for (let i = 0; i < iterations; i++) {
        const result = getSecureRandomInt(min, max);
        counts.set(result, (counts.get(result) || 0) + 1);
      }
      
      // Each value should appear roughly 1000 times (±30%)
      const expectedCount = iterations / (max - min + 1);
      const tolerance = expectedCount * 0.3;
      
      for (let i = min; i <= max; i++) {
        const count = counts.get(i) || 0;
        expect(count).toBeGreaterThan(expectedCount - tolerance);
        expect(count).toBeLessThan(expectedCount + tolerance);
      }
    });
  });

  describe('rollDie', () => {
    it('should return a face from the die', () => {
      const die = createEmptyDie();
      die.sides = 6;
      // Die factory creates faces automatically
      
      const result = rollDie(die);
      
      expect(die.faces).toContainEqual(result);
    });

    it('should return different faces over multiple rolls', () => {
      const die = createEmptyDie();
      die.sides = 6;
      
      const results = new Set();
      
      // Roll many times
      for (let i = 0; i < 100; i++) {
        const result = rollDie(die);
        results.add(result.value);
      }
      
      // Should see multiple different values (very unlikely to get only 1 value in 100 rolls)
      expect(results.size).toBeGreaterThan(1);
    });

    it('should work with dies of different sizes', () => {
      const die101 = createEmptyDie();
      die101.sides = 101;
      
      for (let i = 0; i < 50; i++) {
        const result = rollDie(die101);
        expect(die101.faces).toContainEqual(result);
      }
    });

    it('should throw error for die with no faces', () => {
      const die: Die = {
        ...createEmptyDie(),
        faces: [],
      };
      
      expect(() => rollDie(die)).toThrow('Die has no faces');
    });

    it('should work with text dice', () => {
      const die = createEmptyDie(4, 'text');
      die.faces[0].value = 'Yes';
      die.faces[1].value = 'No';
      die.faces[2].value = 'Maybe';
      die.faces[3].value = 'Later';
      
      const result = rollDie(die);
      
      expect(['Yes', 'No', 'Maybe', 'Later']).toContain(result.value);
    });

    it('should work with color dice', () => {
      const die = createEmptyDie(3, 'color');
      
      // Set specific colors for the test
      die.faces[0].color = '#ff0000';
      die.faces[1].color = '#00ff00';
      die.faces[2].color = '#0000ff';
      
      const result = rollDie(die);
      
      expect(result.color).toBeDefined();
      expect(['#ff0000', '#00ff00', '#0000ff']).toContain(result.color);
    });
  });

  describe('rollDiceSet', () => {
    it('should return one result per die', () => {
      const diceSet = createEmptyDiceSet();
      const die1 = createEmptyDie();
      die1.sides = 6;
      const die2 = createEmptyDie();
      die2.sides = 6;
      const die3 = createEmptyDie();
      die3.sides = 6;
      
      const dice = [die1, die2, die3];
      diceSet.diceIds = dice.map(d => d.id);
      
      const results = rollDiceSet(dice);
      
      expect(results).toHaveLength(3);
      expect(die1.faces).toContainEqual(results[0]);
      expect(die2.faces).toContainEqual(results[1]);
      expect(die3.faces).toContainEqual(results[2]);
    });

    it('should work with single die', () => {
      const diceSet = createEmptyDiceSet();
      const die = createEmptyDie();
      die.sides = 6;
      
      const dice = [die];
      diceSet.diceIds = [die.id];
      
      const results = rollDiceSet(dice);
      
      expect(results).toHaveLength(1);
      expect(die.faces).toContainEqual(results[0]);
    });

    it('should work with 6 dice (max)', () => {
      const diceSet = createEmptyDiceSet();
      const dice: Die[] = [];
      
      for (let i = 0; i < 6; i++) {
        const die = createEmptyDie();
        die.sides = 6;
        dice.push(die);
      }
      
      diceSet.diceIds = dice.map(d => d.id);
      
      const results = rollDiceSet(dice);
      
      expect(results).toHaveLength(6);
    });

    it('should throw error for empty dice array', () => {
      const dice: Die[] = [];
      
      expect(() => rollDiceSet(dice)).toThrow('No dice to roll');
    });

    it('should work with mixed die types', () => {
      const diceSet = createEmptyDiceSet();
      
      const numberDie = createEmptyDie();
      numberDie.sides = 6;
      numberDie.contentType = 'number';
      
      const textDie = createEmptyDie();
      textDie.sides = 4;
      textDie.contentType = 'text';
      textDie.faces[0].value = 'Yes';
      textDie.faces[1].value = 'No';
      textDie.faces[2].value = 'Maybe';
      textDie.faces[3].value = 'Later';
      
      const colorDie = createEmptyDie(3, 'color');
      colorDie.faces[0].color = '#ff0000';
      colorDie.faces[1].color = '#00ff00';
      colorDie.faces[2].color = '#0000ff';
      
      const dice = [numberDie, textDie, colorDie];
      diceSet.diceIds = dice.map(d => d.id);
      
      const results = rollDiceSet(dice);
      
      expect(results).toHaveLength(3);
      expect(numberDie.faces).toContainEqual(results[0]);
      expect(textDie.faces).toContainEqual(results[1]);
      expect(colorDie.faces).toContainEqual(results[2]);
    });
  });
});

  describe('Chi-squared randomness test (SC-016)', () => {
    /**
     * Chi-squared test for uniform distribution
     * Tests that random number generation produces statistically uniform distribution
     * with p>0.05 (95% confidence that distribution is uniform)
     */
    function chiSquaredTest(observed: number[], expected: number): number {
      let chiSquared = 0;
      for (const count of observed) {
        const diff = count - expected;
        chiSquared += (diff * diff) / expected;
      }
      return chiSquared;
    }

    /**
     * Get critical value for chi-squared test at 95% confidence (p=0.05)
     * For degrees of freedom (df) = categories - 1
     */
    function getCriticalValue(degreesOfFreedom: number): number {
      // Chi-squared critical values at p=0.05
      const criticalValues: Record<number, number> = {
        1: 3.841,
        2: 5.991,
        3: 7.815,
        4: 9.488,
        5: 11.070,
        6: 12.592,
        100: 124.342, // For 101-sided die (df=100)
      };
      return criticalValues[degreesOfFreedom] || criticalValues[100];
    }

    it('should pass chi-squared test for 2-sided die (1000+ rolls)', () => {
      const die = createEmptyDie(2, 'number');
      const rolls = 1000;
      const counts = new Map<string, number>();
      
      // Initialize counts
      die.faces.forEach(face => {
        counts.set(String(face.value), 0);
      });
      
      // Perform rolls
      for (let i = 0; i < rolls; i++) {
        const result = rollDie(die);
        counts.set(String(result.value), (counts.get(String(result.value)) || 0) + 1);
      }
      
      // Calculate chi-squared
      const observed = Array.from(counts.values());
      const expected = rolls / die.sides;
      const chiSquared = chiSquaredTest(observed, expected);
      const degreesOfFreedom = die.sides - 1;
      const criticalValue = getCriticalValue(degreesOfFreedom);
      
      // Test: chi-squared should be less than critical value (p>0.05)
      expect(chiSquared).toBeLessThan(criticalValue);
    });

    it('should pass chi-squared test for 6-sided die (1000+ rolls)', () => {
      const die = createEmptyDie(6, 'number');
      const rolls = 1000;
      const counts = new Map<string, number>();
      
      // Initialize counts
      die.faces.forEach(face => {
        counts.set(String(face.value), 0);
      });
      
      // Perform rolls
      for (let i = 0; i < rolls; i++) {
        const result = rollDie(die);
        counts.set(String(result.value), (counts.get(String(result.value)) || 0) + 1);
      }
      
      // Calculate chi-squared
      const observed = Array.from(counts.values());
      const expected = rolls / die.sides;
      const chiSquared = chiSquaredTest(observed, expected);
      const degreesOfFreedom = die.sides - 1;
      const criticalValue = getCriticalValue(degreesOfFreedom);
      
      // Test: chi-squared should be less than critical value (p>0.05)
      expect(chiSquared).toBeLessThan(criticalValue);
    });

    it('should pass chi-squared test for 101-sided die (1000+ rolls)', () => {
      const die = createEmptyDie(101, 'number');
      const rolls = 1000;
      const counts = new Map<string, number>();
      
      // Initialize counts
      die.faces.forEach(face => {
        counts.set(String(face.value), 0);
      });
      
      // Perform rolls
      for (let i = 0; i < rolls; i++) {
        const result = rollDie(die);
        counts.set(String(result.value), (counts.get(String(result.value)) || 0) + 1);
      }
      
      // Calculate chi-squared
      const observed = Array.from(counts.values());
      const expected = rolls / die.sides;
      const chiSquared = chiSquaredTest(observed, expected);
      const degreesOfFreedom = die.sides - 1;
      const criticalValue = getCriticalValue(degreesOfFreedom);
      
      // Test: chi-squared should be less than critical value (p>0.05)
      expect(chiSquared).toBeLessThan(criticalValue);
    });
  });
