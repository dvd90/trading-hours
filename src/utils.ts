import { addDays, isWeekend } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Formats milliseconds into HH:MM:SS string
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

/**
 * Gets the next trading day (skips weekends)
 */
export function getNextTradingDay(date: Date, marketTz: string): Date {
  let nextDay = date;
  let marketTime = toZonedTime(nextDay, marketTz);

  while (isWeekend(marketTime)) {
    nextDay = addDays(nextDay, 1);
    marketTime = toZonedTime(nextDay, marketTz);
  }

  return nextDay;
}

/**
 * Converts milliseconds to hours (rounded to 1 decimal)
 */
export function msToHours(ms: number): number {
  return Math.round((ms / 3600000) * 10) / 10;
}
