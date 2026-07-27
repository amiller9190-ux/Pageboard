/**
 * Generate a unique ID using the native crypto API.
 * @returns {string} A random UUID v4 string.
 */
export function generateId() {
  return crypto.randomUUID();
}
