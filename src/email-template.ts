import type { MarketStatus } from './types.js';

interface EmailTemplateParams {
  userName: string;
  currentDate: string;
  currentTime: string;
  userTimezone: string;
  openCount: number;
  totalCount: number;
  statuses: MarketStatus[];
}

function getMarketFlag(exchange: string): string {
  const flags: Record<string, string> = {
    NYSE: '🇺🇸',
    NASDAQ: '🇺🇸',
    LSE: '🇬🇧',
    JPX: '🇯🇵',
    XETRA: '🇩🇪',
    HKEX: '🇭🇰',
    ASX: '🇦🇺',
    TSX: '🇨🇦',
  };
  return flags[exchange] || '🌐';
}

function renderMarketRow(status: MarketStatus): string {
  const isOpen = status.status === 'open';
  const flag = getMarketFlag(status.exchange);

  const statusDot = isOpen
    ? '<span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;margin-right:6px;"></span>'
    : '<span style="display:inline-block;width:8px;height:8px;background:#ef4444;border-radius:50%;margin-right:6px;"></span>';

  const statusText = isOpen ? 'Open' : 'Closed';
  const statusColor = isOpen ? '#22c55e' : '#ef4444';

  const timeLabel = isOpen ? 'Closes in' : 'Opens in';
  const countdown = isOpen ? status.timeUntilClose : status.timeUntilOpen;
  const scheduleLabel = isOpen ? 'Closes at' : 'Opens at';
  const scheduleTime = isOpen ? status.closesAt : status.nextOpen;
  const scheduleTimeShort = scheduleTime?.split(' ')[1] || '';

  return `
    <tr>
      <td style="padding:16px 20px;border-bottom:1px solid #f1f5f9;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="48" style="vertical-align:top;padding-right:12px;">
              <div style="width:44px;height:44px;background:linear-gradient(135deg,#f8fafc 0%,#e2e8f0 100%);border-radius:12px;text-align:center;line-height:44px;font-size:20px;">
                ${flag}
              </div>
            </td>
            <td style="vertical-align:top;">
              <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:2px;">${status.exchange}</div>
              <div style="font-size:13px;color:#64748b;">${status.name}</div>
            </td>
            <td width="90" style="vertical-align:top;text-align:right;">
              <div style="font-size:12px;color:${statusColor};font-weight:600;margin-bottom:4px;">
                ${statusDot}${statusText}
              </div>
              <div style="font-size:11px;color:#94a3b8;">${scheduleLabel} ${scheduleTimeShort}</div>
            </td>
          </tr>
          <tr>
            <td colspan="3" style="padding-top:12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#f8fafc;border-radius:8px;padding:10px 14px;">
                    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">${timeLabel}</div>
                    <div style="font-size:22px;font-weight:700;color:#0f172a;font-family:'SF Mono',Monaco,monospace;">${countdown}</div>
                  </td>
                  <td width="12"></td>
                  <td style="background:${isOpen ? '#f0fdf4' : '#fef2f2'};border-radius:8px;padding:10px 14px;text-align:center;" width="100">
                    <div style="font-size:11px;color:#64748b;margin-bottom:2px;">${status.hoursUntil}h</div>
                    <div style="font-size:13px;font-weight:600;color:${statusColor};">${isOpen ? 'remaining' : 'until open'}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

export function generateEmailHtml(params: EmailTemplateParams): string {
  const {
    userName,
    currentDate,
    currentTime,
    userTimezone,
    openCount,
    totalCount,
    statuses,
  } = params;

  const marketRows = statuses.map(renderMarketRow).join('');
  const summaryBg = openCount > 0 ? '#dcfce7' : '#fee2e2';
  const summaryColor = openCount > 0 ? '#166534' : '#991b1b';
  const summaryIcon = openCount > 0 ? '📈' : '📉';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Market Hours</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  
  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        
        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);padding:32px 24px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">⏰</div>
              <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#ffffff;">
                Good morning, ${userName}
              </h1>
              <p style="margin:0;font-size:14px;color:#94a3b8;">
                ${currentDate}
              </p>
            </td>
          </tr>
          
          <!-- Time Display -->
          <tr>
            <td style="padding:24px;text-align:center;border-bottom:1px solid #e2e8f0;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#f8fafc;border-radius:12px;padding:16px 28px;text-align:center;">
                    <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Your Local Time</div>
                    <div style="font-size:36px;font-weight:700;color:#0f172a;font-family:'SF Mono',Monaco,monospace;letter-spacing:-1px;">${currentTime}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:4px;">${userTimezone}</div>
                  </td>
                </tr>
              </table>
              
              <!-- Summary Badge -->
              <div style="margin-top:16px;">
                <span style="display:inline-block;background:${summaryBg};color:${summaryColor};padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;">
                  ${summaryIcon} ${openCount} of ${totalCount} markets open
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Markets Header -->
          <tr>
            <td style="padding:20px 20px 8px;">
              <div style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;">
                Your Watchlist
              </div>
            </td>
          </tr>
          
          <!-- Market Cards -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${marketRows}
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px;text-align:center;background:#f8fafc;">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
                Have a great trading day! 🚀
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                Market hours may vary on holidays • <a href="#" style="color:#3b82f6;text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer Text -->
        <p style="margin:16px 0 0;font-size:11px;color:#94a3b8;text-align:center;">
          Trading Hours • Built with ☕
        </p>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
}
