/**
 * M1 §2 consolidation runtime verification. Run against a LOCAL throwaway
 * cluster only:
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/consolidation.verify.ts
 *
 * Proves, with real execution (runtime is the proof):
 *  1. LMS writes land in the lms schema on the shared cluster
 *  2. createEnrollment maps the user into core_persons + identities(replit)
 *     + program participation and emits StudentEnrolled through the outbox
 *  3. completing every module stamps enrollment.completionDate exactly once
 *     and emits CourseCompleted
 *  4. the shared dispatcher projects both events into the knowledge graph
 */
import { storage } from "./storage";
import { db as lmsDb } from "./db";
import { db as coreDb } from "../../../server/db";
import { dispatchPending, registerConsumer } from "../../../server/core/events";
import { registerGraphProjector } from "../../../server/core/graph";
import { seedPrograms } from "../../../server/core/identity";
import { courses, modules } from "@shared/schema";
import { sql } from "drizzle-orm";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) {
    throw new Error("consolidation.verify.ts must run against a local throwaway cluster");
  }

  await seedPrograms();
  registerGraphProjector();

  // 1. Seed LMS course + module + user
  const [course] = await lmsDb.insert(courses).values({ title: "Verify Course", totalModules: 1 }).returning();
  const [mod] = await lmsDb
    .insert(modules)
    .values({ courseId: course.id, title: "Only Module", orderIndex: 1, duration: 5 })
    .returning();
  const user = await storage.upsertUser({
    id: "verify-oidc-sub-001",
    email: "consolidation.verify@example.org",
    firstName: "Verify",
    lastName: "Student",
  });
  assert(user.role === "student", "new LMS user defaults to role=student");

  // 2. Enrollment → identity mapping + StudentEnrolled
  const enrollment = await storage.createEnrollment({ userId: user.id, courseId: course.id });
  const [person] = await coreDb
    .execute(sql`select p.id from core_persons p join core_identities i on i.person_id = p.id
                 where i.provider = 'replit' and i.subject = ${user.id}`)
    .then((r: any) => r.rows ?? r);
  assert(person?.id, "core person exists with linked replit identity");

  const [participation] = await coreDb
    .execute(sql`select pp.role from core_program_participations pp
                 join core_programs pr on pr.id = pp.program_id
                 where pp.person_id = ${person.id} and pr.slug = 'comptia'`)
    .then((r: any) => r.rows ?? r);
  assert(participation?.role === "student", "comptia participation with role=student created");

  // 3. Complete the only module → CourseCompleted exactly once
  await storage.updateProgress({ userId: user.id, moduleId: mod.id, courseId: course.id, watchTime: 300, totalTime: 300, isCompleted: true });
  // Re-complete: must NOT emit a second CourseCompleted
  await storage.updateProgress({ userId: user.id, moduleId: mod.id, courseId: course.id, watchTime: 301, totalTime: 300, isCompleted: true });

  const [enr] = await lmsDb
    .execute(sql`select completion_date from lms.enrollments where id = ${enrollment.id}`)
    .then((r: any) => r.rows ?? r);
  assert(enr?.completion_date, "enrollment completionDate stamped");

  const eventCounts = await coreDb
    .execute(sql`select type, count(*)::int as n from core_events
                 where type in ('StudentEnrolled','CourseCompleted') and payload->>'userId' = ${user.id}
                 group by type`)
    .then((r: any) => r.rows ?? r);
  const byType = Object.fromEntries(eventCounts.map((r: any) => [r.type, r.n]));
  assert(byType["StudentEnrolled"] === 1, `exactly one StudentEnrolled (got ${byType["StudentEnrolled"] ?? 0})`);
  assert(byType["CourseCompleted"] === 1, `exactly one CourseCompleted (got ${byType["CourseCompleted"] ?? 0})`);

  // 4. Dispatch + graph projection
  const dispatched = await dispatchPending();
  console.log(`[verify] dispatched: processed=${dispatched.processed} failed=${dispatched.failed}`);
  assert(dispatched.failed === 0, "dispatcher processed events without failures");

  const [edge] = await coreDb
    .execute(sql`select e.kind from core_graph_edges e
                 join core_graph_nodes f on f.id = e.from_node
                 join core_graph_nodes t on t.id = e.to_node
                 where f.kind = 'person' and f.ref_id = ${person.id} and t.kind = 'course' and e.kind = 'COMPLETED'`)
    .then((r: any) => r.rows ?? r);
  assert(edge?.kind === "COMPLETED", "graph has person -COMPLETED-> course edge");

  const [ai] = await coreDb
    .execute(sql`select 1 as ok from information_schema.tables where table_schema='lms' and table_name='system_settings'`)
    .then((r: any) => r.rows ?? r);
  assert(ai?.ok === 1, "lms.system_settings readable from core connection (AI spend surface)");

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exit(1);
});
