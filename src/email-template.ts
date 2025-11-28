import type { MarketStatus } from './types.js';

interface EmailTemplateParams {
  greeting: string;
  currentDate: string;
  currentTime: string;
  userTimezone: string;
  openCount: number;
  totalCount: number;
  statuses: MarketStatus[];
}

function renderMarketCard(status: MarketStatus): string {
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
  const scheduleTimeOnly = scheduleTime?.split(' ').slice(1, 2).join(' ') || '';

  return `
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

export function generateEmailHtml(params: EmailTemplateParams): string {
  const {
    greeting,
    currentDate,
    currentTime,
    userTimezone,
    openCount,
    totalCount,
    statuses,
  } = params;

  const badgeBg =
    openCount > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
  const badgeColor = openCount > 0 ? '#34d399' : '#f87171';

  const marketCards = statuses.map(renderMarketCard).join('');

  return `
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
        <span style="display: inline-block; background: ${badgeBg}; color: ${badgeColor}; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">
          ${openCount} of ${totalCount} markets open
        </span>
      </div>
    </div>

    <!-- Markets section -->
    <div style="padding: 24px 20px;">
      <h2 style="color: #e2e8f0; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 8px; font-weight: 600;">Your Markets</h2>

      <div style="display: block;">
        ${marketCards}
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
}
