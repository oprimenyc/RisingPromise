/**
 * Knowledge graph projection verification (local cluster only):
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/core/graph.verify.ts
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { seedPrograms, ensurePerson } from "./identity";
import { registerGraphProjector, projectPrograms, projectPlatform, neighbors, graphStats } from "./graph";
import { publishEvent, dispatchPending } from "./events";
import { runVerification } from "./registry";
import { startWorkflow } from "./workflow";
import { mergePersons } from "./identityMerge";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

async function nodeCount(kind: string): Promise<number> {
  const [row] = await db.execute(sql`select count(*)::int n from core_graph_nodes where kind=${kind}`).then((r: any) => r.rows ?? r);
  return row.n;
}

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("local cluster only");

  await seedPrograms();
  registerGraphProjector();
  await projectPrograms();
  await runVerification();
  await projectPlatform();

  assert((await nodeCount("provider")) >= 12, `provider nodes projected (${await nodeCount("provider")})`);
  assert((await nodeCount("capability")) >= 17, `capability nodes projected (${await nodeCount("capability")})`);
  assert((await nodeCount("feature")) >= 5, `feature nodes projected (${await nodeCount("feature")})`);
  assert((await nodeCount("policy")) >= 9, `policy nodes projected (${await nodeCount("policy")})`);
  assert((await nodeCount("program")) >= 6, `program nodes projected (${await nodeCount("program")})`);

  const stripe = await neighbors("capability", "stripe", false);
  assert(stripe && stripe.edges.length >= 1, "capability node has DEPENDS_ON edges");

  // Event-driven projections: volunteer, sponsor, workflow, merge, decision
  const personId = await ensurePerson("graph.verify@example.org");
  const dupId = await ensurePerson("graph.verify.dup@example.org");
  await publishEvent("VolunteerCreated", { personId, email: "graph.verify@example.org", programSlug: "workforce" });
  await publishEvent("SponsorCreated", { sponsorId: "acme", name: "ACME Corp", programSlug: "workforce" });
  await publishEvent("GrantSubmitted", { opportunityId: "GG-123", title: "Workforce Expansion Grant" });
  await publishEvent("BackgroundCheckCompleted", { personId, referenceId: "chk-1", status: "clear" });
  await startWorkflow("donor.stewardship", { personId, subjectRef: "gift:1", actor: "verify" });
  await mergePersons(personId, dupId, "verify", "graph merge projection test");
  const dispatched = await dispatchPending(100);
  assert(dispatched.failed === 0, `all events projected without failure (processed=${dispatched.processed})`);

  const checks: Array<[string, string]> = [
    ["VOLUNTEERS_FOR", "volunteer edge"],
    ["SPONSORS", "sponsor edge"],
    ["SUBMITTED", "grant submission edge"],
    ["SCREENED_BY", "background check edge (restricted)"],
    ["IN_WORKFLOW", "workflow membership edge"],
    ["MERGED_INTO", "person merge edge"],
  ];
  for (const [kind, label] of checks) {
    const [row] = await db.execute(sql`select count(*)::int n from core_graph_edges where kind=${kind}`).then((r: any) => r.rows ?? r);
    assert(row.n >= 1, `${label} projected (${kind})`);
  }

  // Sensitivity: restricted person nodes are excluded from non-admin reads
  const pub = await neighbors("program", "workforce", false);
  const hasRestricted = pub?.neighbors.some((n: any) => n.sensitivity === "restricted");
  assert(hasRestricted === false, "restricted nodes excluded from non-admin neighborhood reads");
  const adminView = await neighbors("program", "workforce", true);
  assert((adminView?.neighbors.length ?? 0) > (pub?.neighbors.length ?? 0), "admin view includes restricted neighbors");

  const stats = await graphStats();
  console.log(`[graph] totals: ${JSON.stringify(stats)}`);
  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exit(1);
});
