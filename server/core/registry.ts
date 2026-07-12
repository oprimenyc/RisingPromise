/**
 * Capability + feature registries with the runtime verification engine
 * (M1 §3–5). Claims are not proof: every capability's status comes from an
 * executed probe, persisted with evidence and timestamp.
 */
import { db } from "../db";
import { capabilities, features } from "../../shared/schema";
import { providers, evaluateProvider, type ProbeResult } from "../providers";
import { queueStats } from "./events";
import { sql } from "drizzle-orm";

type CapabilityDef = {
  name: string;
  domain: string;
  owner: string;
  dependsOn: string[]; // provider or capability names
  probe: () => Promise<ProbeResult>;
};

type FeatureDef = {
  name: string;
  description: string;
  requiredCapabilities: string[];
  requiredPermissions: string[];
};

// ── Platform capabilities (beyond raw providers) ────────────────────────────
const platformCapabilities: CapabilityDef[] = [
  {
    name: "core.database",
    domain: "core",
    owner: "platform",
    dependsOn: [],
    probe: async () => {
      const [row] = await db.execute(sql`select 1 as ok`).then((r: any) => r.rows ?? r);
      return row?.ok === 1
        ? { ok: true, status: "verified", detail: "select 1 round-trip succeeded" }
        : { ok: false, status: "failed", detail: "unexpected select 1 result" };
    },
  },
  {
    name: "core.event-bus",
    domain: "core",
    owner: "platform",
    dependsOn: ["core.database"],
    probe: async () => {
      const stats = await queueStats();
      if (stats.deadLettered > 0) {
        return { ok: false, status: "failed", detail: `dead-lettered events present: ${stats.deadLettered}` };
      }
      return { ok: true, status: "verified", detail: `queue healthy: pending=${stats.pending} total=${stats.total}` };
    },
  },
  {
    name: "core.decision-ledger",
    domain: "core",
    owner: "platform",
    dependsOn: ["core.database"],
    probe: async () => {
      const [row] = await db.execute(sql`select count(*)::int as n from core_decisions`).then((r: any) => r.rows ?? r);
      return row.n >= 9
        ? { ok: true, status: "verified", detail: `${row.n} ledger entries present (seed complete)` }
        : { ok: false, status: "failed", detail: `only ${row.n} ledger entries; seed incomplete` };
    },
  },
  {
    name: "core.graph",
    domain: "core",
    owner: "platform",
    dependsOn: ["core.database", "core.event-bus"],
    probe: async () => {
      const [row] = await db.execute(sql`select count(*)::int as n from core_graph_nodes`).then((r: any) => r.rows ?? r);
      return { ok: true, status: "verified", detail: `graph reachable; ${row.n} nodes projected` };
    },
  },
  {
    name: "core.programs",
    domain: "core",
    owner: "platform",
    dependsOn: ["core.database"],
    probe: async () => {
      const [row] = await db.execute(sql`select count(*)::int as n from core_programs where slug in ('via','noble','workforce')`).then((r: any) => r.rows ?? r);
      return row.n === 3
        ? { ok: true, status: "verified", detail: "V.I.A. / N.O.B.L.E. / Workforce program boundaries present" }
        : { ok: false, status: "failed", detail: `program seed incomplete (${row.n}/3 umbrella programs)` };
    },
  },
];

// ── Feature registry ────────────────────────────────────────────────────────
const featureDefs: FeatureDef[] = [
  { name: "donations.one-time", description: "One-time card donations via hosted checkout", requiredCapabilities: ["stripe", "core.database", "resend"], requiredPermissions: ["public"] },
  { name: "raffle.ticket-sales", description: "Raffle ticket purchase with unique entry codes", requiredCapabilities: ["stripe", "core.database", "resend"], requiredPermissions: ["public"] },
  { name: "programs.applications", description: "CNA/IT program application intake + admin review", requiredCapabilities: ["core.database", "resend"], requiredPermissions: ["public", "admin:review"] },
  { name: "newsletter.signup", description: "Newsletter subscription", requiredCapabilities: ["core.database"], requiredPermissions: ["public"] },
  { name: "admin.observability", description: "Platform health, verification status, queue and ledger visibility", requiredCapabilities: ["core.database", "core.event-bus"], requiredPermissions: ["admin"] },
];

// ── Verification engine ─────────────────────────────────────────────────────
export async function runVerification(): Promise<Record<string, number>> {
  const started = Date.now();
  const counts: Record<string, number> = {};

  // Prior persisted state drives the degraded->failed lifecycle transition.
  const priorRows = await db.select({ name: capabilities.name, status: capabilities.status, evidence: capabilities.evidence }).from(capabilities);
  const prior = new Map(priorRows.map((r) => [r.name, { status: r.status, consecutiveFailures: (r.evidence as any)?.consecutiveFailures ?? 0 }]));

  const targets: Array<{ name: string; domain: string; owner: string; dependsOn: string[]; probe: () => Promise<ProbeResult> }> = [
    ...providers.map((p) => ({ name: p.name, domain: "provider", owner: "platform", dependsOn: p.requiredConfig, probe: () => evaluateProvider(p, prior.get(p.name)) })),
    ...platformCapabilities,
  ];

  const statusByName = new Map<string, string>();
  for (const t of targets) {
    let result: ProbeResult;
    try {
      result = await t.probe();
    } catch (error: any) {
      result = { ok: false, status: "failed", detail: `probe threw: ${String(error?.message ?? error).slice(0, 200)}` };
    }
    counts[result.status] = (counts[result.status] ?? 0) + 1;
    statusByName.set(t.name, result.status);
    await db
      .insert(capabilities)
      .values({ name: t.name, domain: t.domain, owner: t.owner, dependsOn: t.dependsOn, status: result.status, evidence: result as any, lastVerifiedAt: new Date() })
      .onConflictDoUpdate({
        target: capabilities.name,
        set: { status: result.status, evidence: result as any, lastVerifiedAt: new Date(), dependsOn: t.dependsOn },
      });
  }

  // Feature health derives from capability statuses. 'degraded' still serves
  // traffic (loudly visible in the registry); 'configured' covers manual
  // channels that cannot be runtime-probed.
  for (const f of featureDefs) {
    const healthy = f.requiredCapabilities.every((c) => ["verified", "degraded", "configured"].includes(statusByName.get(c) ?? "missing"));
    await db
      .insert(features)
      .values({ name: f.name, description: f.description, requiredCapabilities: f.requiredCapabilities, requiredPermissions: f.requiredPermissions, healthy, lastVerifiedAt: new Date() })
      .onConflictDoUpdate({
        target: features.name,
        set: { healthy, lastVerifiedAt: new Date(), description: f.description, requiredCapabilities: f.requiredCapabilities, requiredPermissions: f.requiredPermissions },
      });
  }

  console.log(`[verify] runtime verification complete in ${Date.now() - started}ms:`, JSON.stringify(counts));
  return counts;
}

let verifyTimer: ReturnType<typeof setInterval> | null = null;
export function startVerificationSchedule(intervalMs = 15 * 60 * 1000): void {
  if (verifyTimer) return;
  verifyTimer = setInterval(() => {
    runVerification().catch((e) => console.error("[verify] scheduled verification error:", e));
  }, intervalMs);
  verifyTimer.unref?.();
  console.log(`[verify] verification scheduled every ${intervalMs / 60000}min`);
}
