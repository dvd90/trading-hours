import { Resend } from "resend";
import { readFileSync } from "fs";
import { generateReport } from "./markets.js";

interface User {
  name: string;
  email: string;
  timezone: string;
  exchanges: string[];
}

async function main() {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("❌ RESEND_API_KEY environment variable is required");
    console.log("\nTo get an API key:");
    console.log("1. Go to https://resend.com");
    console.log("2. Sign up for free");
    console.log("3. Create an API key");
    console.log("4. Add it to GitHub Secrets as RESEND_API_KEY");
    process.exit(1);
  }

  const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev";

  // Load users
  let users: User[];
  try {
    const usersJson = readFileSync("users.json", "utf-8");
    users = JSON.parse(usersJson);
  } catch (error) {
    console.error("❌ Could not read users.json:", error);
    process.exit(1);
  }

  if (users.length === 0) {
    console.log("No users configured in users.json");
    return;
  }

  const resend = new Resend(resendApiKey);

  console.log("=".repeat(55));
  console.log("📧 Sending Market Hours Emails");
  console.log("=".repeat(55));
  console.log();

  for (const user of users) {
    console.log(`📤 Sending to ${user.name} (${user.email})...`);

    const report = generateReport(user.exchanges, user.timezone);

    try {
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: user.email,
        subject: `🕐 Market Hours - ${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}`,
        text: report.text,
        html: report.html,
      });

      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Sent! (ID: ${data?.id})`);
      }
    } catch (err) {
      console.error(`   ❌ Error: ${err}`);
    }

    console.log();
  }

  console.log("=".repeat(55));
  console.log("Done!");
}

main();

