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

export interface MarketStatus {
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
      name: 'Unknown',
      status: 'closed',
      timeUntilOpen: 'Unknown exchange',
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
      status: 'open',
      closesAt: format(closeInUserTz, 'yyyy-MM-dd HH:mm zzz', {
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
    status: 'closed',
    nextOpen: format(nextOpenInUserTz, 'yyyy-MM-dd HH:mm zzz', {
      timeZone: userTimezone,
    } as any),
    timeUntilOpen: formatDuration(msUntilOpen),
    hoursUntil: Math.round((msUntilOpen / 3600000) * 10) / 10,
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
): { text: string; html: string; statuses: MarketStatus[] } {
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

  // Text version
  let text = `🕐 Market Hours Check\n`;
  text += `📍 Timezone: ${userTimezone}\n`;
  text += `⏰ Current time: ${currentTime}\n\n`;

  for (const status of statuses) {
    text += formatOutput(status) + '\n\n';
  }

  // Beautiful HTML version
  const greeting = userName ? `Good morning, ${userName}` : 'Good morning';

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background: #0a0a0f;">
  <div style="max-width: 600px; margin: 0 auto; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

    <!-- Header with gradient -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); padding: 40px 30px 30px; border-radius: 0 0 24px 24px;">
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">📈</div>
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0 0 4px; letter-spacing: -0.5px;">
          ${greeting}
        </h1>
        <p style="color: #94a3b8; font-size: 16px; margin: 0;">
          ${currentDate}
        </p>
      </div>

      <!-- Time display -->
      <div style="text-align: center; margin-top: 24px;">
        <div style="display: inline-block; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 16px 32px;">
          <div style="color: #e2e8f0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Local Time</div>
          <div style="color: #ffffff; font-size: 36px; font-weight: 700; font-variant-numeric: tabular-nums;">${currentTime}</div>
          <div style="color: #64748b; font-size: 12px; margin-top: 4px;">${userTimezone}</div>
        </div>
      </div>

      <!-- Summary badges -->
      <div style="text-align: center; margin-top: 20px;">
        <span style="display: inline-block; background: ${
          openCount > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
        }; color: ${
    openCount > 0 ? '#34d399' : '#f87171'
  }; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
          ${openCount} of ${statuses.length} markets open
        </span>
      </div>
    </div>

    <!-- Markets section -->
    <div style="padding: 24px 20px;">
      <h2 style="color: #e2e8f0; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 8px; font-weight: 600;">Your Markets</h2>

      <div style="display: block;">
  `;

  for (const status of statuses) {
    const isOpen = status.status === 'open';
    const statusColor = isOpen ? '#10b981' : '#ef4444';
    const statusBg = isOpen
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(239, 68, 68, 0.1)';
    const statusText = isOpen ? 'OPEN' : 'CLOSED';
    const glowColor = isOpen ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none';

    const timeLabel = isOpen ? 'Closes in' : 'Opens in';
    const timeValue = isOpen ? status.timeUntilClose : status.timeUntilOpen;
    const scheduleTime = isOpen ? status.closesAt : status.nextOpen;

    // Extract just the time from the schedule
    const scheduleTimeOnly =
      scheduleTime?.split(' ').slice(1, 2).join(' ') || '';

    html += `
        <div style="background: linear-gradient(145deg, #1e1e2d 0%, #171723 100%); border-radius: 16px; padding: 20px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.05); box-shadow: ${glowColor};">
          <div style="display: table; width: 100%;">
            <div style="display: table-cell; vertical-align: middle;">
              <div style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 2px;">${
                status.exchange
              }</div>
              <div style="color: #64748b; font-size: 13px;">${status.name}</div>
            </div>
            <div style="display: table-cell; vertical-align: middle; text-align: right;">
              <div style="display: inline-block; background: ${statusBg}; border: 1px solid ${statusColor}; color: ${statusColor}; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px;">
                ● ${statusText}
              </div>
            </div>
          </div>

          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);">
            <div style="display: table; width: 100%;">
              <div style="display: table-cell; width: 50%;">
                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${timeLabel}</div>
                <div style="color: #f1f5f9; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums;">${timeValue}</div>
              </div>
              <div style="display: table-cell; width: 50%; text-align: right;">
                <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${
                  isOpen ? 'Closes at' : 'Opens at'
                }</div>
                <div style="color: #94a3b8; font-size: 16px; font-weight: 500;">${scheduleTimeOnly}</div>
              </div>
            </div>
          </div>
        </div>
    `;
  }

  html += `
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 20px 30px 40px; text-align: center;">
      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin-bottom: 20px;"></div>
      <p style="color: #475569; font-size: 12px; margin: 0;">
        Trading Hours • Powered by ☕ and code
      </p>
      <p style="color: #334155; font-size: 11px; margin: 8px 0 0;">
        Market hours may vary on holidays
      </p>
    </div>

  </div>
</body>
</html>
  `;

  return { text, html, statuses };
}
