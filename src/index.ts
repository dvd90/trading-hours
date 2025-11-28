import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { getMarketStatus, formatOutput } from "./markets.js";

function main() {
  const userTimezone = process.env.TIMEZONE || "UTC";
  const exchangesStr = process.env.EXCHANGES || "NYSE,NASDAQ,LSE,JPX";
  const exchanges = exchangesStr.split(",").map((e) => e.trim());

  const now = new Date();
  const nowInUserTz = toZonedTime(now, userTimezone);

  console.log("=".repeat(55));
  console.log("🕐 Market Hours Check");
  console.log(`📍 Your timezone: ${userTimezone}`);
  console.log(
    `⏰ Current time: ${format(nowInUserTz, "yyyy-MM-dd HH:mm:ss zzz", {
      timeZone: userTimezone,
    } as any)}`
  );
  console.log("=".repeat(55));
  console.log();

  for (const exchange of exchanges) {
    const status = getMarketStatus(exchange, userTimezone);
    console.log(formatOutput(status));
    console.log();
  }

  console.log("=".repeat(55));
  console.log("Supported: NYSE, NASDAQ, LSE, JPX, XETRA, HKEX, ASX, TSX");
}

main();
