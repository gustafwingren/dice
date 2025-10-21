/**
 * Unit tests for UUID and timestamp utilities
 */

import { generateUUID } from '@/lib/uuid';
import { getCurrentTimestamp, parseTimestamp, formatTimestamp } from '@/lib/timestamp';

describe('UUID utilities', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });
});

describe('Timestamp utilities', () => {
  describe('getCurrentTimestamp', () => {
    it('should return an ISO 8601 timestamp', () => {
      const timestamp = getCurrentTimestamp();
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });

    it('should return a valid date string', () => {
      const timestamp = getCurrentTimestamp();
      expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
    });
  });

  describe('parseTimestamp', () => {
    it('should parse ISO 8601 timestamp to Date', () => {
      const timestamp = '2025-10-21T12:00:00.000Z';
      const date = parseTimestamp(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toBe(timestamp);
    });

    it('should handle different timezone formats', () => {
      const timestamp = '2025-10-21T12:00:00Z';
      const date = parseTimestamp(timestamp);
      expect(date).toBeInstanceOf(Date);
    });
  });

  describe('formatTimestamp', () => {
    it('should format Date as ISO 8601 string', () => {
      const date = new Date('2025-10-21T12:00:00.000Z');
      const timestamp = formatTimestamp(date);
      expect(timestamp).toBe('2025-10-21T12:00:00.000Z');
    });

    it('should produce parseable timestamps', () => {
      const originalDate = new Date();
      const timestamp = formatTimestamp(originalDate);
      const parsedDate = parseTimestamp(timestamp);
      expect(parsedDate.getTime()).toBe(originalDate.getTime());
    });
  });
});
