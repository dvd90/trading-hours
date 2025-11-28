# ⏰ Trading Hours

> Never miss market open again! Get daily email notifications with countdown timers to market open, personalized to your timezone.

**🌐 Live Site:** [dvd90.github.io/trading-hours](https://dvd90.github.io/trading-hours)

![Markets](https://img.shields.io/badge/Markets-8+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 📧 **Daily Email Alerts** - Beautiful morning digest at 8 AM UTC
- 🌍 **Timezone Support** - All times converted to your local timezone
- ⏱️ **Live Countdown** - See exactly how long until each market opens/closes
- 🏦 **8+ Exchanges** - NYSE, NASDAQ, LSE, JPX, XETRA, HKEX, ASX, TSX
- 🎨 **Beautiful Emails** - Clean, modern design with country flags
- 🌐 **Landing Page** - Sign-up page hosted on GitHub Pages

## 🏦 Supported Exchanges

| Flag | Code | Exchange | Hours (Local) |
|------|------|----------|---------------|
| 🇺🇸 | NYSE | New York Stock Exchange | 9:30 AM - 4:00 PM |
| 🇺🇸 | NASDAQ | NASDAQ | 9:30 AM - 4:00 PM |
| 🇬🇧 | LSE | London Stock Exchange | 8:00 AM - 4:30 PM |
| 🇯🇵 | JPX | Tokyo Stock Exchange | 9:00 AM - 3:00 PM |
| 🇩🇪 | XETRA | Frankfurt Stock Exchange | 9:00 AM - 5:30 PM |
| 🇭🇰 | HKEX | Hong Kong Stock Exchange | 9:30 AM - 4:00 PM |
| 🇦🇺 | ASX | Australian Securities Exchange | 10:00 AM - 4:00 PM |
| 🇨🇦 | TSX | Toronto Stock Exchange | 9:30 AM - 4:00 PM |

## 🚀 Quick Start

### Run Locally

```bash
# Install dependencies
npm install

# Check market hours (console output)
npm run check

# With custom timezone and exchanges
TIMEZONE="America/New_York" EXCHANGES="NYSE,NASDAQ" npm run check

# Send emails to all users
npm run send
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TIMEZONE` | Your timezone | `UTC` |
| `EXCHANGES` | Comma-separated exchanges | `NYSE,NASDAQ,LSE,JPX` |
| `RESEND_API_KEY` | Resend API key (for emails) | Required for emails |
| `FROM_EMAIL` | Sender email | `onboarding@resend.dev` |

## 📧 Email Setup

### 1. Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up (free)
2. Create an API key
3. (Optional) Add and verify your domain for custom sender

### 2. Configure

**For local development:**
```bash
# Create .env file
echo "RESEND_API_KEY=re_your_api_key" > .env
```

**For GitHub Actions:**
1. Go to repo **Settings** → **Secrets** → **Actions**
2. Add `RESEND_API_KEY` secret

### 3. Add Users

Edit `users.json`:

```json
[
  {
    "name": "David",
    "email": "david@example.com",
    "timezone": "America/New_York",
    "exchanges": ["NYSE", "NASDAQ"]
  }
]
```

### 4. Send Emails

```bash
# Locally
npm run send

# Or via GitHub Actions → "Daily Market Emails" → Run workflow
```

## 🌐 Landing Page

The sign-up page is hosted on GitHub Pages at [dvd90.github.io/trading-hours](https://dvd90.github.io/trading-hours).

### Adding New Users from Form Submissions

1. User submits form → You receive email from Formspree
2. Go to **Actions** → **Add User from Form** → **Run workflow**
3. Enter user details (name, email, timezone, exchanges)
4. User is automatically added to `users.json`!

## ⚙️ GitHub Actions Workflows

| Workflow | Trigger | Description |
|----------|---------|-------------|
| **Market Hours Check** | Manual | Check market hours with custom timezone/exchanges |
| **Daily Market Emails** | Daily 8 AM UTC / Manual | Send emails to all users in `users.json` |
| **Add User from Form** | Manual | Add a new user from form submission |

## 📁 Project Structure

```
trading-hours/
├── src/
│   ├── index.ts          # CLI entry point
│   ├── send-emails.ts    # Email sender
│   ├── markets.ts        # Market status logic
│   ├── email-template.ts # HTML email template
│   ├── config.ts         # Market configurations
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # Helper functions
├── docs/
│   └── index.html        # Landing page (GitHub Pages)
├── .github/workflows/
│   ├── market-check.yml  # Manual market check
│   ├── daily-emails.yml  # Daily email sender
│   └── add-user.yml      # Add user workflow
├── users.json            # User list
└── package.json
```

## 📬 Example Email

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Good morning, David
   Friday, November 28
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🇺🇸 NYSE - New York Stock Exchange
   🔴 CLOSED
   Opens in: 1:30:00 (1.5h)

🇺🇸 NASDAQ - NASDAQ  
   🔴 CLOSED
   Opens in: 1:30:00 (1.5h)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Have a great trading day! 🚀
```

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **Email:** [Resend](https://resend.com)
- **Forms:** [Formspree](https://formspree.io)
- **Hosting:** GitHub Pages
- **CI/CD:** GitHub Actions
- **Date/Time:** date-fns + date-fns-tz

## 📄 License

MIT © [dvd90](https://github.com/dvd90)

---

<p align="center">
  Built with ☕ by <a href="https://github.com/dvd90">dvd90</a>
</p>
