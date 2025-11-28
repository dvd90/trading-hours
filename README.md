# 🕐 Trading Hours

A tiny TypeScript service that tells you how long until markets open based on your timezone.

## Quick Start

### Run Locally

```bash
npm install
npm run check

# With custom timezone and exchanges
TIMEZONE="America/New_York" EXCHANGES="NYSE,NASDAQ" npm run check
```

### Run with GitHub Actions

1. Push this repo to GitHub
2. Go to **Actions** → **Market Hours Check**
3. Click **Run workflow**
4. Enter your timezone and exchanges
5. See results in the workflow output!

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TIMEZONE` | Your timezone (e.g., `America/New_York`, `Europe/London`) | `UTC` |
| `EXCHANGES` | Comma-separated list of exchanges | `NYSE,NASDAQ,LSE,JPX` |

## Supported Exchanges

| Code | Exchange |
|------|----------|
| NYSE | New York Stock Exchange |
| NASDAQ | NASDAQ |
| LSE | London Stock Exchange |
| JPX | Tokyo Stock Exchange |
| XETRA | Frankfurt Stock Exchange |
| HKEX | Hong Kong Stock Exchange |
| ASX | Australian Securities Exchange |
| TSX | Toronto Stock Exchange |

## Example Output

```
=======================================================
🕐 Market Hours Check
📍 Your timezone: America/New_York
⏰ Current time: 2024-01-15 08:30:00 EST
=======================================================

🔴 NYSE (New York Stock Exchange): CLOSED
   Next open: 2024-01-15 09:30 EST
   Time until open: 1:00:00 (1h)

🟢 LSE (London Stock Exchange): OPEN NOW
   Closes at: 2024-01-15 11:30 EST
   Time until close: 3:00:00
```

## License

MIT
