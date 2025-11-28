# 🕐 Trading Hours

A tiny TypeScript service that tells you how long until markets open and sends daily email notifications.

## Features

- ✅ Check market hours for 8+ global exchanges
- ✅ Manual checks via GitHub Actions
- ✅ **Daily email notifications** at 8 AM UTC (weekdays)
- ✅ Multi-user support with individual timezones and exchanges

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
4. Select your timezone and exchanges
5. See results in the workflow output!

## 📧 Daily Email Setup

### 1. Configure Users

Edit `users.json` with your users:

```json
[
  {
    "name": "David",
    "email": "david@example.com",
    "timezone": "America/New_York",
    "exchanges": ["NYSE", "NASDAQ"]
  },
  {
    "name": "Another User",
    "email": "user@example.com",
    "timezone": "Europe/London",
    "exchanges": ["LSE", "XETRA", "NYSE"]
  }
]
```

### 2. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free)
2. Create an API key
3. (Optional) Add and verify your domain for custom "from" address

### 3. Add GitHub Secrets

In your repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | (Optional) Sender email, default: `onboarding@resend.dev` |

### 4. Emails will be sent automatically!

The `Daily Market Emails` workflow runs at **8:00 AM UTC, Monday-Friday**.

You can also trigger it manually from the **Actions** tab.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TIMEZONE` | Your timezone | `UTC` |
| `EXCHANGES` | Comma-separated exchanges | `NYSE,NASDAQ,LSE,JPX` |
| `RESEND_API_KEY` | Resend API key (for emails) | - |
| `FROM_EMAIL` | Sender email | `onboarding@resend.dev` |

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

## Example Email

Each user receives a personalized email with their configured exchanges:

```
🕐 Market Hours Check
📍 Timezone: America/New_York
⏰ 2024-01-15 08:00:00 EST

🔴 NYSE (New York Stock Exchange): CLOSED
   Next open: 2024-01-15 09:30 EST
   Time until open: 1:30:00 (1.5h)

🟢 LSE (London Stock Exchange): OPEN NOW
   Closes at: 2024-01-15 11:30 EST
   Time until close: 3:30:00
```

## License

MIT
