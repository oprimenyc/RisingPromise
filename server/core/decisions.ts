/**
 * Decision ledger (M1 §7) — DB-backed, append-only. Seeds the M0 file entries
 * (RP_DECISION_LEDGER.md D-001..D-008) so the ledger is complete from day one.
 */
import { db } from "../db";
import { decisions } from "@shared/schema";
import { desc } from "drizzle-orm";
import { publishEvent } from "./events";

export async function recordDecision(entry: {
  ledgerId?: string;
  area: "architecture" | "security" | "provider" | "migration" | "compliance";
  decision: string;
  rationale: string;
  actor: string;
}): Promise<void> {
  await db.insert(decisions).values(entry).onConflictDoNothing({ target: decisions.ledgerId });
  await publishEvent("DecisionRecorded", { ledgerId: entry.ledgerId ?? null, area: entry.area, decision: entry.decision });
}

export async function recentDecisions(limit = 20) {
  return db.select().from(decisions).orderBy(desc(decisions.decidedAt)).limit(limit);
}

const M0_ENTRIES: Array<Parameters<typeof recordDecision>[0]> = [
  { ledgerId: "D-001", area: "security", actor: "Claude (M0)", decision: "LMS RBAC via users.role enum, server-side per-request check; roles never settable via OIDC upsert or bulk import; ADMIN_BOOTSTRAP_EMAILS for first admin.", rationale: "Cheapest correct fix for critical PII exposure; per-request lookup makes revocation immediate." },
  { ledgerId: "D-002", area: "security", actor: "Claude (M0)", decision: "Site admin auth via timing-safe SHA-256 (ADMIN_PASSWORD_SHA256) + rate limit; exec bible behind Basic auth, removed from static build.", rationale: "Closes plaintext/timing/enumeration holes without breaking the admin UI; full session auth is M1 unified identity." },
  { ledgerId: "D-003", area: "architecture", actor: "Claude (M0)", decision: "In-house in-memory rate limiter and AI metering instead of new dependencies.", rationale: "Simplest working implementation; restart-reset limitation documented; durable versions on the M1 spine." },
  { ledgerId: "D-004", area: "compliance", actor: "Claude (M0)", decision: "Removed simulated payment path entirely; docs corrected to state payments are NOT implemented.", rationale: "No simulated production behavior; fake $8,500 transactions were a trust/compliance liability and inflated WIOA funding reports." },
  { ledgerId: "D-005", area: "architecture", actor: "Claude (M0)", decision: "DB driver selectable by hostname (node-postgres locally, Neon in production), logged at boot.", rationale: "Local runtime verification is mandatory and must exercise the real schema; Neon driver cannot reach local Postgres." },
  { ledgerId: "D-006", area: "compliance", actor: "Claude (M0)", decision: "Crypto-random raffle codes; IRS no-goods-or-services receipt language; raffle non-deductibility notice; API response bodies no longer logged.", rationale: "Drawing integrity, IRS receipt compliance, PII must not reach logs." },
  { ledgerId: "D-007", area: "migration", actor: "Claude (M0)", decision: "rpcourses stays a nested git repo through M0; monorepo consolidation is early M1.", rationale: "M0 is stop-the-bleeding; restructuring mid-hotfix mixes concerns and complicates rollback." },
  { ledgerId: "D-008", area: "architecture", actor: "Owner + Claude (M1)", decision: "V.I.A. (school), N.O.B.L.E. (community), Workforce Development (CompTIA/CNA/WIOA) are independent program types sharing core infrastructure — not separate applications.", rationale: "Owner directive; matches one-spine/many-surfaces thesis in RP_MASTER_ARCHITECTURE." },
  { ledgerId: "D-009", area: "architecture", actor: "Claude (M1)", decision: "M1 core spine: Postgres-backed event outbox + in-process dispatcher, DB-backed capability/feature registries with runtime verification engine, DB decision ledger, projected graph, provider layer with honest 'unconfigured' statuses.", rationale: "One mechanism (events) feeds audit, graph, and automation; providers never fake success without credentials — runtime is the proof." },
];

export async function seedDecisionLedger(): Promise<void> {
  for (const entry of M0_ENTRIES) {
    await db.insert(decisions).values(entry).onConflictDoNothing({ target: decisions.ledgerId });
  }
  console.log(`[decisions] ledger ensured (${M0_ENTRIES.length} seed entries)`);
}
