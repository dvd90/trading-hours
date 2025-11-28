import {
  format,
  addDays,
  isWeekend,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Market configurations with their trading hours
const MARKETS: Record<
  string,
  {
    name: string;
    timezone: string;
    openHour: number;
    openMinute: number;
    closeHour: number;
    closeMinute: number;
  }
> = {
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

interface MarketStatus {
  exchange: string;
  name: string;
  status: 'open' | 'closed';
  nextOpen?: string;
  closesAt?: string;
  timeUntilOpen?: string;
  timeUntilClose?: string;
  hoursUntil?: number;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

function getNextTradingDay(date: Date, marketTz: string): Date {
  let nextDay = date;

  // Convert to market timezone to check weekend
  let marketTime = toZonedTime(nextDay, marketTz);

  // Skip weekends
  while (isWeekend(marketTime)) {
    nextDay = addDays(nextDay, 1);
    marketTime = toZonedTime(nextDay, marketTz);
  }

  return nextDay;
}

function getMarketStatus(
  exchangeCode: string,
  userTimezone: string
): MarketStatus {
  const market = MARKETS[exchangeCode];

  if (!market) {
    return {
      exchange: exchangeCode,
      name: 'Unknown',
      status: 'closed',
      timeUntilOpen: 'Unknown exchange',
    };
  }

  const now = new Date();
  const nowInMarketTz = toZonedTime(now, market.timezone);
  const nowInUserTz = toZonedTime(now, userTimezone);

  // Create market open time for today in market timezone
  let marketOpenToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.openHour), market.openMinute),
    0
  );
  let marketCloseToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.closeHour), market.closeMinute),
    0
  );

  // Convert to UTC for comparison
  const marketOpenUTC = fromZonedTime(marketOpenToday, market.timezone);
  const marketCloseUTC = fromZonedTime(marketCloseToday, market.timezone);

  // Check if it's a weekend in market timezone
  const isMarketWeekend = isWeekend(nowInMarketTz);

  // Check if market is currently open
  if (!isMarketWeekend && now >= marketOpenUTC && now < marketCloseUTC) {
    const msUntilClose = marketCloseUTC.getTime() - now.getTime();
    const closeInUserTz = toZonedTime(marketCloseUTC, userTimezone);

    return {
      exchange: exchangeCode,
      name: market.name,
      status: 'open',
      closesAt: format(closeInUserTz, 'yyyy-MM-dd HH:mm zzz', {
        timeZone: userTimezone,
      } as any),
      timeUntilClose: formatDuration(msUntilClose),
      hoursUntil: Math.round((msUntilClose / 3600000) * 10) / 10,
    };
  }

  // Market is closed - find next open
  let nextOpenDate: Date;

  if (isMarketWeekend || now >= marketCloseUTC) {
    // Market closed for the day or weekend, find next trading day
    const tomorrow = addDays(now, isMarketWeekend ? 0 : 1);
    const nextTradingDay = getNextTradingDay(tomorrow, market.timezone);
    const nextDayInMarketTz = toZonedTime(nextTradingDay, market.timezone);
    const nextOpen = setSeconds(
      setMinutes(
        setHours(nextDayInMarketTz, market.openHour),
        market.openMinute
      ),
      0
    );
    nextOpenDate = fromZonedTime(nextOpen, market.timezone);

    // Handle weekend case
    if (isMarketWeekend) {
      const daysToAdd = nowInMarketTz.getDay() === 0 ? 1 : 2; // Sunday = 1 day, Saturday = 2 days
      const mondayInMarketTz = addDays(nowInMarketTz, daysToAdd);
      const mondayOpen = setSeconds(
        setMinutes(
          setHours(mondayInMarketTz, market.openHour),
          market.openMinute
        ),
        0
      );
      nextOpenDate = fromZonedTime(mondayOpen, market.timezone);
    }
  } else {
    // Market hasn't opened yet today
    nextOpenDate = marketOpenUTC;
  }

  const msUntilOpen = nextOpenDate.getTime() - now.getTime();
  const nextOpenInUserTz = toZonedTime(nextOpenDate, userTimezone);

  return {
    exchange: exchangeCode,
    name: market.name,
    status: 'closed',
    nextOpen: format(nextOpenInUserTz, 'yyyy-MM-dd HH:mm zzz', {
      timeZone: userTimezone,
    } as any),
    timeUntilOpen: formatDuration(msUntilOpen),
    hoursUntil: Math.round((msUntilOpen / 3600000) * 10) / 10,
  };
}

function formatOutput(status: MarketStatus): string {
  if (status.status === 'open') {
    return `🟢 ${status.exchange} (${status.name}): OPEN NOW
   Closes at: ${status.closesAt}
   Time until close: ${status.timeUntilClose}`;
  }

  return `🔴 ${status.exchange} (${status.name}): CLOSED
   Next open: ${status.nextOpen}
   Time until open: ${status.timeUntilOpen} (${status.hoursUntil}h)`;
}

function main() {
  const userTimezone = process.env.TIMEZONE || 'UTC';
  const exchangesStr = process.env.EXCHANGES || 'NYSE,NASDAQ,LSE,JPX';
  const exchanges = exchangesStr.split(',').map((e) => e.trim());

  const now = new Date();
  const nowInUserTz = toZonedTime(now, userTimezone);

  console.log('='.repeat(55));
  console.log('🕐 Market Hours Check');
  console.log(`📍 Your timezone: ${userTimezone}`);
  console.log(
    `⏰ Current time: ${format(nowInUserTz, 'yyyy-MM-dd HH:mm:ss zzz', {
      timeZone: userTimezone,
    } as any)}`
  );
  console.log('='.repeat(55));
  console.log();

  for (const exchange of exchanges) {
    const status = getMarketStatus(exchange, userTimezone);
    console.log(formatOutput(status));
    console.log();
  }

  console.log('='.repeat(55));
  console.log('Supported: NYSE, NASDAQ, LSE, JPX, XETRA, HKEX, ASX, TSX');
}

main();
