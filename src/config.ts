import type { MarketConfig } from './types.js';

export const MARKETS: Record<string, MarketConfig> = {
  NYSE: {
    name: 'New York Stock Exchange',
    timezone: 'America/New_York',
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  NASDAQ: {
    name: 'NASDAQ',
    timezone: 'America/New_York',
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  LSE: {
    name: 'London Stock Exchange',
    timezone: 'Europe/London',
    openHour: 8,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 30,
  },
  JPX: {
    name: 'Tokyo Stock Exchange',
    timezone: 'Asia/Tokyo',
    openHour: 9,
    openMinute: 0,
    closeHour: 15,
    closeMinute: 0,
  },
  XETRA: {
    name: 'Frankfurt Stock Exchange',
    timezone: 'Europe/Berlin',
    openHour: 9,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 30,
  },
  HKEX: {
    name: 'Hong Kong Stock Exchange',
    timezone: 'Asia/Hong_Kong',
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  ASX: {
    name: 'Australian Securities Exchange',
    timezone: 'Australia/Sydney',
    openHour: 10,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
  },
  TSX: {
    name: 'Toronto Stock Exchange',
    timezone: 'America/Toronto',
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
};

export const DEFAULT_EXCHANGES = ['NYSE', 'NASDAQ', 'LSE', 'JPX'];
export const DEFAULT_TIMEZONE = 'UTC';

