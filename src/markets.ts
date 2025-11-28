import {
  format,
  addDays,
  isWeekend,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

// Market configurations with their trading hours
export const MARKETS: Record<
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
    name: "New York Stock Exchange",
    timezone: "America/New_York",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  NASDAQ: {
    name: "NASDAQ",
    timezone: "America/New_York",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  LSE: {
    name: "London Stock Exchange",
    timezone: "Europe/London",
    openHour: 8,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 30,
  },
  JPX: {
    name: "Tokyo Stock Exchange",
    timezone: "Asia/Tokyo",
    openHour: 9,
    openMinute: 0,
    closeHour: 15,
    closeMinute: 0,
  },
  XETRA: {
    name: "Frankfurt Stock Exchange",
    timezone: "Europe/Berlin",
    openHour: 9,
    openMinute: 0,
    closeHour: 17,
    closeMinute: 30,
  },
  HKEX: {
    name: "Hong Kong Stock Exchange",
    timezone: "Asia/Hong_Kong",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
  ASX: {
    name: "Australian Securities Exchange",
    timezone: "Australia/Sydney",
    openHour: 10,
    openMinute: 0,
    closeHour: 16,
    closeMinute: 0,
  },
  TSX: {
    name: "Toronto Stock Exchange",
    timezone: "America/Toronto",
    openHour: 9,
    openMinute: 30,
    closeHour: 16,
    closeMinute: 0,
  },
};

export interface MarketStatus {
  exchange: string;
  name: string;
  status: "open" | "closed";
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

  return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

function getNextTradingDay(date: Date, marketTz: string): Date {
  let nextDay = date;
  let marketTime = toZonedTime(nextDay, marketTz);

  while (isWeekend(marketTime)) {
    nextDay = addDays(nextDay, 1);
    marketTime = toZonedTime(nextDay, marketTz);
  }

  return nextDay;
}

export function getMarketStatus(
  exchangeCode: string,
  userTimezone: string
): MarketStatus {
  const market = MARKETS[exchangeCode];

  if (!market) {
    return {
      exchange: exchangeCode,
      name: "Unknown",
      status: "closed",
      timeUntilOpen: "Unknown exchange",
    };
  }

  const now = new Date();
  const nowInMarketTz = toZonedTime(now, market.timezone);

  let marketOpenToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.openHour), market.openMinute),
    0
  );
  let marketCloseToday = setSeconds(
    setMinutes(setHours(nowInMarketTz, market.closeHour), market.closeMinute),
    0
  );

  const marketOpenUTC = fromZonedTime(marketOpenToday, market.timezone);
  const marketCloseUTC = fromZonedTime(marketCloseToday, market.timezone);
  const isMarketWeekend = isWeekend(nowInMarketTz);

  if (!isMarketWeekend && now >= marketOpenUTC && now < marketCloseUTC) {
    const msUntilClose = marketCloseUTC.getTime() - now.getTime();
    const closeInUserTz = toZonedTime(marketCloseUTC, userTimezone);

    return {
      exchange: exchangeCode,
      name: market.name,
      status: "open",
      closesAt: format(closeInUserTz, "yyyy-MM-dd HH:mm zzz", {
        timeZone: userTimezone,
      } as any),
      timeUntilClose: formatDuration(msUntilClose),
      hoursUntil: Math.round((msUntilClose / 3600000) * 10) / 10,
    };
  }

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
    status: "closed",
    nextOpen: format(nextOpenInUserTz, "yyyy-MM-dd HH:mm zzz", {
      timeZone: userTimezone,
    } as any),
    timeUntilOpen: formatDuration(msUntilOpen),
    hoursUntil: Math.round((msUntilOpen / 3600000) * 10) / 10,
  };
}

export function formatOutput(status: MarketStatus): string {
  if (status.status === "open") {
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
  userTimezone: string
): { text: string; html: string; statuses: MarketStatus[] } {
  const now = new Date();
  const nowInUserTz = toZonedTime(now, userTimezone);
  const currentTime = format(nowInUserTz, "yyyy-MM-dd HH:mm:ss zzz", {
    timeZone: userTimezone,
  } as any);

  const statuses = exchanges.map((ex) => getMarketStatus(ex, userTimezone));

  // Text version
  let text = `🕐 Market Hours Check\n`;
  text += `📍 Timezone: ${userTimezone}\n`;
  text += `⏰ Current time: ${currentTime}\n\n`;

  for (const status of statuses) {
    text += formatOutput(status) + "\n\n";
  }

  // HTML version
  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1a1a1a; font-size: 24px; margin-bottom: 8px;">🕐 Market Hours Check</h1>
      <p style="color: #666; margin: 4px 0;">📍 Timezone: ${userTimezone}</p>
      <p style="color: #666; margin: 4px 0 20px;">⏰ ${currentTime}</p>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
  `;

  for (const status of statuses) {
    const isOpen = status.status === "open";
    const bgColor = isOpen ? "#ecfdf5" : "#fef2f2";
    const borderColor = isOpen ? "#10b981" : "#ef4444";
    const statusEmoji = isOpen ? "🟢" : "🔴";
    const statusText = isOpen ? "OPEN NOW" : "CLOSED";
    const timeInfo = isOpen
      ? `Closes at: ${status.closesAt}<br/>Time until close: ${status.timeUntilClose}`
      : `Next open: ${status.nextOpen}<br/>Time until open: ${status.timeUntilOpen} (${status.hoursUntil}h)`;

    html += `
      <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 16px; border-radius: 8px;">
        <div style="font-weight: 600; font-size: 16px; color: #1a1a1a;">
          ${statusEmoji} ${status.exchange} <span style="font-weight: 400; color: #666;">(${status.name})</span>
        </div>
        <div style="font-weight: 500; margin: 8px 0;">${statusText}</div>
        <div style="color: #666; font-size: 14px; line-height: 1.5;">${timeInfo}</div>
      </div>
    `;
  }

  html += `
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
        Sent by Trading Hours Service
      </p>
    </div>
  `;

  return { text, html, statuses };
}

