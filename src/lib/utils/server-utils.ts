/**
 * Utility functions for server-side vs client-side detection
 */

/**
 * Check if we're running on the server side
 */
export const isServer = typeof window === "undefined";

/**
 * Check if we're running on the client side
 */
export const isClient = typeof window !== "undefined";

/**
 * Safely import server-side only modules
 * This prevents client-side imports that can cause build errors
 */
export async function safeServerImport<T>(
  importFn: () => Promise<T>,
): Promise<T | null> {
  if (isServer) {
    try {
      return await importFn();
    } catch (error) {
      console.error("Failed to import server-side module:", error);
      return null;
    }
  }
  return null;
}

/**
 * Execute a function only on the server side
 */
export function serverOnly<T>(fn: () => T): T | null {
  if (isServer) {
    return fn();
  }
  return null;
}

/**
 * Execute a function only on the client side
 */
export function clientOnly<T>(fn: () => T): T | null {
  if (isClient) {
    return fn();
  }
  return null;
}
