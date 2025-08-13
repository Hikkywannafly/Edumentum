/**
 * Utility functions for text processing
 */

/**
 * Strip HTML tags from a string and return plain text
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  // Create a temporary div element to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Get text content and trim whitespace
  return tempDiv.textContent || tempDiv.innerText || "";
}

/**
 * Convert HTML to plain text for display purposes
 * @param html - HTML string
 * @returns Clean text for display
 */
export function htmlToText(html: string): string {
  return stripHtml(html).trim();
}

/**
 * Truncate text to a specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength).trim()}...`;
}
