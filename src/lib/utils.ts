/**
 * Utility functions for styling, IDs, and calculations
 */

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
