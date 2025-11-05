import { adjustFacesForSideChange } from '@/lib/face-factory';
import { Face } from '@/types';

describe('face-factory', () => {
  describe('adjustFacesForSideChange', () => {
    it('should preserve existing faces when increasing sides', () => {
      const existingFaces: Face[] = [
        { id: 1, contentType: 'number', value: 'custom1' },
        { id: 2, contentType: 'number', value: 'custom2' },
        { id: 3, contentType: 'number', value: '3' },
      ];
      
      const result = adjustFacesForSideChange(existingFaces, 5, 'number');
      
      expect(result).toHaveLength(5);
      expect(result[0].value).toBe('custom1');
      expect(result[1].value).toBe('custom2');
      expect(result[2].value).toBe('3');
      expect(result[3].value).toBe('4');
      expect(result[4].value).toBe('5');
    });

    it('should preserve existing faces when decreasing sides', () => {
      const existingFaces: Face[] = [
        { id: 1, contentType: 'number', value: 'custom1' },
        { id: 2, contentType: 'number', value: 'custom2' },
        { id: 3, contentType: 'number', value: '3' },
        { id: 4, contentType: 'number', value: '4' },
        { id: 5, contentType: 'number', value: '5' },
      ];
      
      const result = adjustFacesForSideChange(existingFaces, 3, 'number');
      
      expect(result).toHaveLength(3);
      expect(result[0].value).toBe('custom1');
      expect(result[1].value).toBe('custom2');
      expect(result[2].value).toBe('3');
    });

    it('should return unchanged array if sides count is same', () => {
      const existingFaces: Face[] = [
        { id: 1, contentType: 'number', value: 'custom1' },
        { id: 2, contentType: 'number', value: 'custom2' },
      ];
      
      const result = adjustFacesForSideChange(existingFaces, 2, 'number');
      
      expect(result).toHaveLength(2);
      expect(result).toBe(existingFaces); // Same reference
    });

    it('should preserve text face values when increasing sides', () => {
      const existingFaces: Face[] = [
        { id: 1, contentType: 'text', value: 'Yes' },
        { id: 2, contentType: 'text', value: 'No' },
      ];
      
      const result = adjustFacesForSideChange(existingFaces, 4, 'text');
      
      expect(result).toHaveLength(4);
      expect(result[0].value).toBe('Yes');
      expect(result[1].value).toBe('No');
      expect(result[2].value).toBe('');
      expect(result[3].value).toBe('');
    });

    it('should preserve color face values when increasing sides', () => {
      const existingFaces: Face[] = [
        { id: 1, contentType: 'color', value: '', color: '#FF0000' },
        { id: 2, contentType: 'color', value: '', color: '#00FF00' },
      ];
      
      const result = adjustFacesForSideChange(existingFaces, 4, 'color');
      
      expect(result).toHaveLength(4);
      expect(result[0].color).toBe('#FF0000');
      expect(result[1].color).toBe('#00FF00');
      expect(result[2].color).toBeDefined();
      expect(result[3].color).toBeDefined();
    });
  });
});
