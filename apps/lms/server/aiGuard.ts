import type { RequestHandler } from "express";
import { storage } from "./storage";

/**
 * AI cost-abuse controls (LESSONS L-005: any endpoint that spends money per
 * request needs at least two of: auth, per-user rate limit, spend cap).
 * These endpoints already require auth; this adds per-user rate limiting AND
 * an org-wide daily spend cap with loud logging when either trips.
 *
 * Durable metering (M1 §2 step 5): the daily spend counter is persisted to
 * lms.system_settings (key ai_spend:<date>) on every recorded call and
 * rehydrated at boot, so restarts never reset the cap and the site's unified
 * observability endpoint can read spend from the shared cluster. Per-user
 * rate-limit windows remain in-memory (worst case after a restart: a user
 * gets a fresh hourly window — bounded; the org-wide cap is durable).
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Env-configurable caps with safe defaults
const CHAT_PER_USER_PER_HOUR = intEnv("AI_CHAT_PER_USER_PER_HOUR", 20);
const RESUME_PER_USER_PER_DAY = intEnv("AI_RESUME_PER_USER_PER_DAY", 5);
const DAILY_SPEND_CAP_USD = floatEnv("AI_DAILY_SPEND_CAP_USD", 10);

// Conservative per-call cost estimates (upper bound at current model pricing)
const EST_COST_USD: Record<string, number> = { chat: 0.01, resume: 0.05 };

function intEnv(key: string, fallback: number): number {
  const v = parseInt(process.env[key] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}
function floatEnv(key: string, fallback: number): number {
  const v = parseFloat(process.env[key] ?? "");
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

type Window = { count: number; windowStart: number };
const userWindows = new Map<string, Window>();

let spendDay = new Date().toDateString();
let spendTodayUsd = 0;
let capAlertFired = false;

const spendKey = (day: string) => `ai_spend:${day}`;

// Rehydrate today's spend from the durable store at boot. Failure is loud:
// running from zero after a restart would understate real spend.
let hydrated = false;
async function hydrateSpend(): Promise<void> {
  if (hydrated) return;
  try {
    const row = await storage.getSystemSetting(spendKey(spendDay));
    if (row) {
      const v = parseFloat(row.settingValue);
      if (Number.isFinite(v) && v > spendTodayUsd) spendTodayUsd = v;
    }
    hydrated = true;
    console.log(`[aiGuard] durable spend hydrated: $${spendTodayUsd.toFixed(2)} for ${spendDay}`);
  } catch (error: any) {
    console.error(`[aiGuard] spend hydration FAILED (will retry on next AI call): ${String(error?.message ?? error)}`);
  }
}
void hydrateSpend();

function persistSpend(): void {
  storage
    .setSystemSetting({
      settingKey: spendKey(spendDay),
      settingValue: spendTodayUsd.toFixed(4),
      description: "Estimated org-wide AI spend (USD) for the day; written by aiGuard",
    })
    .catch((error: any) => {
      console.error(`[aiGuard] spend persistence FAILED: ${String(error?.message ?? error)}`);
    });
}

function recordSpend(kind: string): void {
  const today = new Date().toDateString();
  if (today !== spendDay) {
    console.log(`[aiGuard] daily spend for ${spendDay}: $${spendTodayUsd.toFixed(2)} (estimated)`);
    spendDay = today;
    spendTodayUsd = 0;
    capAlertFired = false;
    hydrated = true; // a fresh day starts at zero by definition
  }
  spendTodayUsd += EST_COST_USD[kind] ?? 0.01;
  persistSpend();
}

export function getAiSpendStatus() {
  return {
    date: spendDay,
    estimatedSpendUsd: Number(spendTodayUsd.toFixed(2)),
    dailyCapUsd: DAILY_SPEND_CAP_USD,
    capReached: spendTodayUsd >= DAILY_SPEND_CAP_USD,
  };
}

function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const w = userWindows.get(key);
  if (!w || now - w.windowStart >= windowMs) {
    userWindows.set(key, { count: 1, windowStart: now });
    return false;
  }
  w.count += 1;
  return w.count > max;
}

function guard(kind: "chat" | "resume", max: number, windowMs: number): RequestHandler {
  return async (req: any, res, next) => {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!hydrated) await hydrateSpend();
    // Org-wide daily spend cap — checked first so a single user can't drain budget
    if (spendTodayUsd >= DAILY_SPEND_CAP_USD) {
      if (!capAlertFired) {
        capAlertFired = true;
        console.error(
          `[aiGuard] ALERT: daily AI spend cap of $${DAILY_SPEND_CAP_USD} reached (${spendDay}). All AI endpoints disabled until midnight.`
        );
      }
      return res.status(503).json({
        message: "AI assistance is temporarily unavailable (daily usage limit reached). Please try again tomorrow.",
      });
    }
    if (limited(`${kind}:${userId}`, max, windowMs)) {
      console.warn(`[aiGuard] rate limit: user=${userId} kind=${kind}`);
      return res.status(429).json({
        message: "You've reached the usage limit for this feature. Please try again later.",
      });
    }
    recordSpend(kind);
    return next();
  };
}

export const aiChatGuard = guard("chat", CHAT_PER_USER_PER_HOUR, HOUR);
export const aiResumeGuard = guard("resume", RESUME_PER_USER_PER_DAY, DAY);
