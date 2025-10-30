/**
 * UUID generation utility using crypto.randomUUID()
 */

/**
 * Generate a UUID v4
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
