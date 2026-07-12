/**
 * Unified Identity Broker runtime verification (local cluster only):
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/core/identity.verify.ts
 * Proves: session issue/lookup/expiry/revocation, merge strategy (tombstone,
 * identity/role/participation moves, session resolution through the merge),
 * and the LMS user backfill tooling.
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { ensurePerson, linkIdentity, grantRole, ensureParticipation, seedPrograms } from "./identity";
import { issueSession, sessionPerson, revokeSession, resolvePerson } from "./authBroker";
import { mergePersons } from "./identityMerge";
import { migrateLmsUsers } from "./migrateLmsUsers";

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
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("local cluster only");
  await seedPrograms();

  // Sessions
  const personA = await ensurePerson("broker.a@example.org", { first: "Broker", last: "A" });
  const session = await issueSession(personA, "google");
  const found = await sessionPerson(session.id);
  assert(found?.personId === personA, "issued session resolves to person");
  assert((await sessionPerson("00000000-0000-0000-0000-000000000000")) === null, "unknown session id rejected");
  assert((await sessionPerson("not-a-uuid")) === null, "malformed session id rejected");
  await revokeSession(session.id);
  assert((await sessionPerson(session.id)) === null, "revoked session rejected");

  // Expired session
  const s2 = await issueSession(personA, "google");
  await db.execute(sql`update core_sessions set expires_at = now() - interval '1 minute' where id = ${s2.id}`);
  assert((await sessionPerson(s2.id)) === null, "expired session rejected");

  // Merge strategy
  const personB = await ensurePerson("broker.b@example.org", { first: "Broker", last: "B" });
  await linkIdentity(personB, "google", "google-sub-B");
  await grantRole(personB, "donor", "verify");
  await ensureParticipation(personB, "comptia", "student", "verify");
  const survivorSession = await issueSession(personB, "google");

  await mergePersons(personA, personB, "verify-script", "same human, two emails (verification scenario)");

  assert((await resolvePerson(personB)) === personA, "resolvePerson follows tombstone");
  const bSession = await sessionPerson(survivorSession.id);
  assert(bSession?.personId === personA, "duplicate's live session now resolves to survivor");

  const [ident] = await db.execute(sql`select person_id from core_identities where provider='google' and subject='google-sub-B'`).then((r: any) => r.rows ?? r);
  assert(ident?.person_id === personA, "google identity moved to survivor");
  const [role] = await db.execute(sql`select person_id from core_person_roles where role='donor' and person_id=${personA}`).then((r: any) => r.rows ?? r);
  assert(role?.person_id === personA, "role moved to survivor");
  const [part] = await db.execute(sql`select person_id from core_program_participations where person_id=${personA}`).then((r: any) => r.rows ?? r);
  assert(part?.person_id === personA, "participation moved to survivor");
  const [emailIdent] = await db.execute(sql`select person_id from core_identities where provider='email' and subject='broker.b@example.org'`).then((r: any) => r.rows ?? r);
  assert(emailIdent?.person_id === personA, "duplicate's email preserved as survivor identity");
  const [mergeEvent] = await db.execute(sql`select count(*)::int n from core_events where type='PersonMerged'`).then((r: any) => r.rows ?? r);
  assert(mergeEvent.n >= 1, "PersonMerged event emitted");

  // Double-merge protection
  let threw = false;
  try {
    await mergePersons(personA, personB, "verify-script", "again");
  } catch {
    threw = true;
  }
  assert(threw, "re-merging an already-merged duplicate throws");

  // Migration tooling (lms.users seeded here since the DB was recreated)
  await db.execute(sql`insert into lms.users (id, email, first_name, last_name, role)
    values ('mig-sub-1','mig.user@example.org','Mig','User','staff') on conflict (id) do nothing`);
  const summary = await migrateLmsUsers();
  assert(summary.migrated >= 1, `migration backfilled users (migrated=${summary.migrated})`);
  const [migIdent] = await db.execute(sql`select i.person_id from core_identities i where i.provider='replit' and i.subject='mig-sub-1'`).then((r: any) => r.rows ?? r);
  assert(migIdent?.person_id, "migrated LMS user has replit identity");
  const [migRole] = await db.execute(sql`select 1 as ok from core_person_roles where person_id=${migIdent.person_id} and role='staff'`).then((r: any) => r.rows ?? r);
  assert(migRole?.ok === 1, "migrated LMS staff role granted");
  const again = await migrateLmsUsers();
  assert(again.migrated === again.total - again.skippedNoEmail, "migration idempotent on re-run");

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  process.exit(process.exitCode ?? 0);
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exit(1);
});
