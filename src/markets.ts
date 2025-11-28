import {
  format,
  addDays,
  isWeekend,
  setHours,
  setMinutes,
  setSeconds,
} from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

import type { MarketStatus, Report } from './types.js';
import { MARKETS } from './config.js';
import { formatDuration, getNextTradingDay, msToHours } from './utils.js';
import { generateEmailHtml } from './email-template.js';

export function getMarketStatus(
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

  const marketOpenToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.openHour), market.openMinute),
    0
  );
  const marketCloseToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.closeHour), market.closeMinute),
    0
  );

  const marketOpenUTC = fromZonedTime(marketOpenToday, market.timezone);
  const marketCloseUTC = fromZonedTime(marketCloseToday, market.timezone);
  const isMarketWeekend = isWeekend(nowInMarketTz);

  // Market is currently open
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
      hoursUntil: msToHours(msUntilClose),
    };
  }

  // Market is closed - find next open
  let nextOpenDate: Date;

  if (isMarketWeekend || now >= marketCloseUTC) {
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

    if (isMarketWeekend) {
      const daysToAdd = nowInMarketTz.getDay() === 0 ? 1 : 2;
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
    hoursUntil: msToHours(msUntilOpen),
  };
}

export function formatOutput(status: MarketStatus): string {
  if (status.status === 'open') {
    return `🟢 ${status.exchange} (${status.name}): OPEN NOW
   Closes at: ${status.closesAt}
   Time until close: ${status.timeUntilClose}`;
  }

  return `🔴 ${status.exchange} (${status.name}): CLOSED
   Next open: ${status.nextOpen}
   Time until open: ${status.timeUntilOpen} (${status.hoursUntil}h)`;
}

export function generateReport(
  exchanges: string[],
  userTimezone: string,
  userName?: string
): Report {
  const now = new Date();
  const nowInUserTz = toZonedTime(now, userTimezone);

  const currentTime = format(nowInUserTz, 'HH:mm', {
    timeZone: userTimezone,
  } as any);
  const currentDate = format(nowInUserTz, 'EEEE, MMMM d', {
    timeZone: userTimezone,
  } as any);

  const statuses = exchanges.map((ex) => getMarketStatus(ex, userTimezone));
  const openCount = statuses.filter((s) => s.status === 'open').length;

  // Plain text version
  let text = `🕐 Market Hours Check\n`;
  text += `📍 Timezone: ${userTimezone}\n`;
  text += `⏰ Current time: ${currentTime}\n\n`;

  for (const status of statuses) {
    text += formatOutput(status) + '\n\n';
  }

  // HTML version
  const greeting = userName ? `Good morning, ${userName}` : 'Good morning';

  const html = generateEmailHtml({
    greeting,
    currentDate,
    currentTime,
    userTimezone,
    openCount,
    totalCount: statuses.length,
    statuses,
  });

  return { text, html, statuses };
}
