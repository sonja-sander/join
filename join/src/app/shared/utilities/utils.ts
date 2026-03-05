import { Contact } from '../interfaces/contact';

/**
 * Capitalizes a full name.
 *
 * Trims the input string, splits it into words,
 * and capitalizes the first letter of each part.
 *
 * @param fullName The full name to format
 * @returns The capitalized full name
 */
export function capitalizeFullname(fullName?: string): string {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Predefined list of user colors.
 *
 * Used to assign a random display color to users.
 */
export const userColors = [
  '#ff4646',
  '#ff745e',
  '#ffa35e',
  '#ff7a00',
  '#ffbb2b',
  '#ffc701',
  '#ffe62b',
  '#c3ff2b',
  '#1fd7c1',
  '#00bee8',
  '#0038ff',
  '#fc71ff',
  '#ff5eb3',
  '#6e52ff',
  '#9327ff',
];

/**
 * Returns a random user color.
 *
 * Selects a color from the predefined
 * list of available user colors.
 *
 * @returns A random color string
 */
export function setUserColor(): string {
  return userColors[Math.floor(Math.random() * userColors.length)];
}

/**
 * Extracts up to two initials from a full name.
 *
 * Takes the first letter of the first two words
 * and converts them to uppercase.
 *
 * @param fullName The full name to extract initials from
 * @returns The extracted initials
 */
export function getTwoInitials(fullName?: string): string {
  if (!fullName) return '';
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

/**
 * Returns today's date as a formatted string.
 *
 * Format: YYYY/MM/DD
 *
 * @returns The formatted date string
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * Returns a contextual greeting based on the current time.
 *
 * @returns A greeting string appropriate for the time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good day';
  } else if (hour >= 17 && hour < 22) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}
