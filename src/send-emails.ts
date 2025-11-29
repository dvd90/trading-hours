import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { toZonedTime } from 'date-fns-tz';

import type { User } from './types.js';
import { generateReport } from './markets.js';

function loadUsers(): User[] {
  try {
    const usersJson = readFileSync('users.json', 'utf-8');
    return JSON.parse(usersJson);
  } catch (error) {
    console.error('❌ Could not read users.json:', error);
    process.exit(1);
  }
}

function formatEmailSubject(): string {
  return `🕐 Market Hours - ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })}`;
}

function isTargetHour(timezone: string, targetHour: number): boolean {
  try {
    const now = new Date();
    const userTime = toZonedTime(now, timezone);
    const userHour = userTime.getHours();
    return userHour === targetHour;
  } catch (error) {
    console.error(`   ⚠️ Invalid timezone: ${timezone}`);
    return false;
  }
}

async function main() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const sendHour = parseInt(process.env.SEND_HOUR || '8', 10);
  const forceSend = process.env.FORCE_SEND === 'true';

  if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY environment variable is required');
    console.log('\nTo get an API key:');
    console.log('1. Go to https://resend.com');
    console.log('2. Sign up for free');
    console.log('3. Create an API key');
    console.log('4. Add it to GitHub Secrets as RESEND_API_KEY');
    process.exit(1);
  }

  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const users = loadUsers();

  if (users.length === 0) {
    console.log('No users configured in users.json');
    return;
  }

  const resend = new Resend(resendApiKey);

  console.log('='.repeat(55));
  console.log('📧 Sending Market Hours Emails');
  console.log(`⏰ Target hour: ${sendHour}:00 (in each user's timezone)`);
  console.log(`🔄 Force send: ${forceSend ? 'Yes' : 'No'}`);
  console.log('='.repeat(55));
  console.log();

  let sentCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    // Check if it's the right hour in user's timezone
    if (!forceSend && !isTargetHour(user.timezone, sendHour)) {
      const now = new Date();
      const userTime = toZonedTime(now, user.timezone);
      console.log(
        `⏭️  Skipping ${user.name} - it's ${userTime.getHours()}:00 in ${
          user.timezone
        } (not ${sendHour}:00)`
      );
      skippedCount++;
      continue;
    }

    console.log(`📤 Sending to ${user.name} (${user.email})...`);

    const report = generateReport(user.exchanges, user.timezone, user.name);

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: formatEmailSubject(),
        text: report.text,
        html: report.html,
      });

      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Sent! (ID: ${data?.id})`);
        sentCount++;
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err}`);
    }

    console.log();
  }

  console.log('='.repeat(55));
  console.log(`Done! Sent: ${sentCount}, Skipped: ${skippedCount}`);
}

main();
