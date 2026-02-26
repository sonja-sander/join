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

export async function compressImage(file: File | Blob, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  const img = await blobToImage(file);
  const { width, height } = calculateImageSize(img, maxWidth, maxHeight);
  return drawAndExportBase64(img, width, height, quality);
}

function blobToImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) {
        reject('No file result');
        return;
      }

      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject('Error while loading image');
      img.src = event.target.result as string;
    };

    reader.onerror = () => reject('Error while reading file');
    reader.readAsDataURL(file);
  });
}

function calculateImageSize(img: HTMLImageElement, maxWidth: number, maxHeight: number): { width: number; height: number } {
  let width = img.width;
  let height = img.height;

  if (width > maxWidth || height > maxHeight) {
    if (width > height) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    } else {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }
  }

  return { width, height };
}

function drawAndExportBase64(img: HTMLImageElement, width: number, height: number, quality: number): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No canvas context');
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}
