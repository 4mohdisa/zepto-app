/**
 * Format a number as a USD currency string.
 * e.g. 1234.5 → "$1,234.50"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format an ISO date string (YYYY-MM-DD) into a short display label.
 * e.g. "2026-03-13" → "Mar 13"
 * Returns empty string for null/undefined input.
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Returns today's date as an ISO string YYYY-MM-DD using local time.
 */
export function getTodayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Returns today's date in DD/MM/YYYY display format.
 */
export function getTodayDisplay(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${now.getFullYear()}`;
}

/**
 * Convert ISO date (YYYY-MM-DD) to display format (DD/MM/YYYY).
 */
export function isoToDisplay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

/**
 * Convert display date (DD/MM/YYYY) to ISO format (YYYY-MM-DD).
 */
export function displayToISO(displayDate: string): string {
  const [d, m, y] = displayDate.split('/');
  if (!d || !m || !y) return displayDate;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

/**
 * Validates a YYYY-MM-DD date string is a real calendar date.
 */
export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

/**
 * Validates a DD/MM/YYYY display date string is a real calendar date.
 */
export function isValidDisplayDate(displayDate: string): boolean {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate)) return false;
  return isValidDate(displayToISO(displayDate));
}
