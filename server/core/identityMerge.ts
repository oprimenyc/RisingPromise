/**
 * Identity merge strategy (M1 Unified Identity Broker).
 * Duplicates happen (same human, two emails). Strategy:
 *  - the duplicate is TOMBSTONED (persons.merged_into -> survivor), never deleted
 *  - identities / roles / participations move to the survivor (idempotent,
 *    unique-constraint-safe: conflicting rows are dropped from the duplicate
 *    because the survivor already holds the equivalent claim)
 *  - active sessions of the duplicate keep working: session resolution
 *    follows merged_into (authBroker.resolvePerson)
 *  - immutable history (events) is NOT rewritten; a PersonMerged event links
 *    both ids so the graph and audits can connect the histories
 */
import { db } from "../db";
import { persons, identities, personRoles, programParticipations } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { publishEvent } from "./events";
import { recordDecision } from "./decisions";

export async function mergePersons(survivorId: string, duplicateId: string, actor: string, reason: string): Promise<void> {
  if (survivorId === duplicateId) throw new Error("mergePersons: survivor and duplicate are the same person");
  const [survivor] = await db.select().from(persons).where(eq(persons.id, survivorId));
  const [duplicate] = await db.select().from(persons).where(eq(persons.id, duplicateId));
  if (!survivor) throw new Error(`mergePersons: survivor ${survivorId} not found`);
  if (!duplicate) throw new Error(`mergePersons: duplicate ${duplicateId} not found`);
  if (survivor.mergedInto) throw new Error(`mergePersons: survivor ${survivorId} is itself merged into ${survivor.mergedInto}`);
  if (duplicate.mergedInto) throw new Error(`mergePersons: duplicate ${duplicateId} already merged into ${duplicate.mergedInto}`);

  // Move identities; on provider+subject conflict the survivor's row wins and
  // the duplicate's redundant row is removed.
  const dupIdentities = await db.select().from(identities).where(eq(identities.personId, duplicateId));
  for (const ident of dupIdentities) {
    try {
      await db.update(identities).set({ personId: survivorId }).where(eq(identities.id, ident.id));
    } catch {
      await db.delete(identities).where(eq(identities.id, ident.id));
    }
  }

  const dupRoles = await db.select().from(personRoles).where(eq(personRoles.personId, duplicateId));
  for (const role of dupRoles) {
    try {
      await db.update(personRoles).set({ personId: survivorId }).where(eq(personRoles.id, role.id));
    } catch {
      await db.delete(personRoles).where(eq(personRoles.id, role.id));
    }
  }

  await db.update(programParticipations).set({ personId: survivorId }).where(eq(programParticipations.personId, duplicateId));

  // Tombstone. The duplicate's unique email must be preserved as an identity
  // of the survivor so future logins with it resolve correctly.
  if (duplicate.primaryEmail) {
    await db.insert(identities).values({ personId: survivorId, provider: "email", subject: duplicate.primaryEmail }).onConflictDoNothing();
  }
  await db.update(persons).set({ mergedInto: survivorId, updatedAt: new Date() }).where(eq(persons.id, duplicateId));

  await publishEvent("PersonMerged", { survivorId, duplicateId, reason }, actor);
  await recordDecision({
    area: "migration",
    decision: `Merged person ${duplicateId} into ${survivorId}`,
    rationale: reason,
    actor,
  });
  console.log(`[identity] merged person ${duplicateId} -> ${survivorId} (${reason})`);
}
