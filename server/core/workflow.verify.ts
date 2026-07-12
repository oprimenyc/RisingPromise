/**
 * Workflow Engine runtime verification (local cluster only):
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/core/workflow.verify.ts
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { ensurePerson, seedPrograms } from "./identity";
import { startWorkflow, transition, getInstance, startIntakeOnApplication, workflowDefinitions } from "./workflow";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

async function expectThrow(fn: () => Promise<unknown>, label: string, contains?: string): Promise<void> {
  try {
    await fn();
    assert(false, `${label} (did not throw)`);
  } catch (e: any) {
    assert(!contains || String(e.message).includes(contains), `${label} (${String(e.message).slice(0, 80)})`);
  }
}

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("local cluster only");
  await seedPrograms();

  // Definitions sanity: every transition references declared states
  for (const def of workflowDefinitions) {
    const ok = def.transitions.every((t) => def.states.includes(t.from) && def.states.includes(t.to)) && def.states.includes(def.initial);
    assert(ok, `definition consistent: ${def.id} v${def.version}`);
  }
  assert(!workflowDefinitions.some((d) => d.id.includes("via") || d.id.includes("noble")), "V.I.A./N.O.B.L.E. intentionally NOT defined (prepare, don't build)");

  const personId = await ensurePerson("workflow.verify@example.org", { first: "Wf", last: "Verify" });

  // student.intake full path with policy gates
  const { instanceId } = await startWorkflow("student.intake", { personId, subjectRef: "application:verify-1", actor: "verify" });
  await expectThrow(
    () => transition(instanceId, "begin_review", { id: "student-x", roles: ["student"] }),
    "student denied begin_review by policy",
    "denies"
  );
  await transition(instanceId, "begin_review", { id: "staff-x", roles: ["staff"] });
  await transition(instanceId, "accept", { id: "staff-x", roles: ["staff"] });
  await transition(instanceId, "enroll", { id: "system", roles: [] });
  await expectThrow(() => transition(instanceId, "accept", { id: "staff-x", roles: ["staff"] }), "invalid transition from enrolled rejected", "Invalid transition");
  const inst = await getInstance(instanceId);
  assert(inst?.state === "enrolled", "student.intake reached enrolled");
  assert((inst?.history as any[]).length === 4, `history has 4 entries (got ${(inst?.history as any[]).length})`);

  // grant.pipeline: ED gate requires approval note
  const grant = await startWorkflow("grant.pipeline", { subjectRef: "opportunity:verify-1", actor: "verify" });
  await transition(grant.instanceId, "qualify", { id: "staff-x", roles: ["staff"] });
  await transition(grant.instanceId, "begin_draft", { id: "staff-x", roles: ["staff"] });
  await transition(grant.instanceId, "request_review", { id: "staff-x", roles: ["staff"] });
  await expectThrow(
    () => transition(grant.instanceId, "submit", { id: "staff-x", roles: ["staff"] }),
    "submission without recorded approval blocked",
    "requires recorded approval"
  );
  await transition(grant.instanceId, "submit", { id: "staff-x", roles: ["staff"] }, "ED approval recorded in decision ledger entry D-verify");
  assert((await getInstance(grant.instanceId))?.state === "submitted", "grant submitted after approval note");

  // event-driven intake (consumer) + idempotence
  await startIntakeOnApplication({ type: "ApplicationSubmitted", payload: { personId, applicationId: 999001 } });
  await startIntakeOnApplication({ type: "ApplicationSubmitted", payload: { personId, applicationId: 999001 } });
  const [count] = await db
    .execute(sql`select count(*)::int n from core_workflow_instances where subject_ref = 'application:999001'`)
    .then((r: any) => r.rows ?? r);
  assert(count.n === 1, `event consumer starts exactly one intake per application (got ${count.n})`);

  const [events] = await db
    .execute(sql`select count(*)::int n from core_events where type in ('WorkflowStarted','WorkflowTransitioned')`)
    .then((r: any) => r.rows ?? r);
  assert(events.n >= 9, `workflow events emitted through outbox (got ${events.n})`);

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exit(1);
});
