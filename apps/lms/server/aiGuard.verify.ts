/**
 * M0 runtime verification: AI usage controls (L-005).
 * Run: AI_CHAT_PER_USER_PER_HOUR=5 AI_DAILY_SPEND_CAP_USD=0.07 npx tsx server/aiGuard.verify.ts
 */
import { aiChatGuard, getAiSpendStatus } from "./aiGuard";

function call(userId: string): Promise<number | "next"> {
  return new Promise((resolve) => {
    const req: any = { user: { claims: { sub: userId } } };
    const res: any = {
      status(code: number) { resolve(code); return this; },
      json(_: any) { return this; },
    };
    aiChatGuard(req, res, () => resolve("next"));
  });
}

function assert(name: string, cond: boolean): boolean {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  return cond;
}

async function main() {
  let ok = true;
  // Per-user limit: cap=5/hr → calls 1-5 pass, 6th 429
  const results: (number | "next")[] = [];
  for (let i = 0; i < 6; i++) results.push(await call("user-a"));
  ok = assert("first 5 chat calls allowed", results.slice(0, 5).every((r) => r === "next")) && ok;
  ok = assert("6th chat call rate-limited (429)", results[5] === 429) && ok;

  // Different user has an independent window BUT spend cap is org-wide:
  // spend so far = 5 x $0.01 = $0.05; cap $0.07 → 2 more allowed, then 503
  const b1 = await call("user-b");
  const b2 = await call("user-b");
  const b3 = await call("user-b");
  ok = assert("second user allowed until org cap", b1 === "next" && b2 === "next") && ok;
  ok = assert("org daily spend cap trips (503)", b3 === 503) && ok;

  const status = getAiSpendStatus();
  console.log("spend status:", JSON.stringify(status));
  ok = assert("spend status reports capReached", status.capReached === true) && ok;

  console.log(ok ? "\nAI GUARD VERIFICATION: ALL PASS" : "\nAI GUARD VERIFICATION: FAILURES PRESENT");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error("VERIFICATION ERROR:", e); process.exit(1); });
