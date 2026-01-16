/**
 * Utility functions for formatting history-related data
 * Used by HistoryDrawer and other history display components
 */

/**
 * Get user initials from first and last name
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Uppercased initials (e.g., "JD" for "John Doe")
 * @example
 * getUserNameInitials('John', 'Doe') // 'JD'
 */
export function getUserNameInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Format a timestamp as a relative or absolute date in Spanish (Mexico City timezone)
 * @param timestamp - ISO timestamp string
 * @param uppercase - Whether to return the result in uppercase
 * @returns "Hoy", "Ayer", or full date string (e.g., "lunes, 22 de diciembre de 2025")
 * @example
 * formatHistoryDate('2025-12-22T10:00:00Z') // 'Hoy'
 * formatHistoryDate('2025-12-21T10:00:00Z') // 'Ayer'
 * formatHistoryDate('2025-12-20T10:00:00Z') // 'viernes, 20 de diciembre de 2025'
 * formatHistoryDate('2025-12-22T10:00:00Z', true) // 'HOY'
 */
export function formatHistoryDate(timestamp: string, uppercase = false): string {
  const date = new Date(timestamp);
  const now = new Date();

  const mexicoDateStr = date.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });
  const mexicoNowStr = now.toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City' });

  const [dayD, monthD, yearD] = mexicoDateStr.split('/').map(Number);
  const [dayN, monthN, yearN] = mexicoNowStr.split('/').map(Number);

  const dateOnly = new Date(yearD, monthD - 1, dayD);
  const nowOnly = new Date(yearN, monthN - 1, dayN);
  const diffDays = Math.floor((nowOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  let result: string;

  if (diffDays === 0) {
    result = 'Hoy';
  } else if (diffDays === 1) {
    result = 'Ayer';
  } else {
    result = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'America/Mexico_City',
    });
  }

  return uppercase ? result.toUpperCase() : result;
}

/**
 * Format a timestamp as time in 12-hour format (Mexico City timezone)
 * @param timestamp - ISO timestamp string
 * @returns Time string (e.g., "02:30 p. m.")
 * @example
 * formatHistoryTime('2025-12-22T14:30:00Z') // '02:30 p. m.'
 */
export function formatHistoryTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City',
  });
}
