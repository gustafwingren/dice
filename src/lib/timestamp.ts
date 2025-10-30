/**
 * Timestamp utilities for ISO 8601 date strings
 */

/**
 * Get current timestamp as ISO 8601 string
 * @returns ISO 8601 timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parse ISO 8601 timestamp to Date
 * @param timestamp ISO 8601 string
 * @returns Date object
 */
export function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Format Date as ISO 8601 string
 * @param date Date object
 * @returns ISO 8601 timestamp
 */
export function formatTimestamp(date: Date): string {
  return date.toISOString();
}
