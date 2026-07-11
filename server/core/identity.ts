/**
 * Unified identity (M1 §1). One person record across site + LMS + future
 * programs. Site flows call ensurePerson(); the LMS migration maps its users
 * into core_persons via identities(provider='replit', subject=<oidc sub>).
 */
import { db } from "../db";
import { persons, identities, personRoles, programs, programParticipations } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { publishEvent } from "./events";

export async function ensurePerson(email: string, name?: { first?: string; last?: string }): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const [existing] = await db.select().from(persons).where(eq(persons.primaryEmail, normalized));
  if (existing) return existing.id;

  const [person] = await db
    .insert(persons)
    .values({ primaryEmail: normalized, firstName: name?.first ?? null, lastName: name?.last ?? null })
    .onConflictDoNothing({ target: persons.primaryEmail })
    .returning();

  if (!person) {
    // Lost a race — fetch the winner
    const [winner] = await db.select().from(persons).where(eq(persons.primaryEmail, normalized));
    return winner.id;
  }

  await db.insert(identities).values({ personId: person.id, provider: "email", subject: normalized }).onConflictDoNothing();
  await publishEvent("PersonCreated", { personId: person.id, email: normalized });
  return person.id;
}

export async function grantRole(personId: string, role: string, grantedBy: string): Promise<void> {
  await db.insert(personRoles).values({ personId, role, grantedBy }).onConflictDoNothing();
}

/** Link an external auth subject (e.g. LMS Replit OIDC sub) to a person. */
export async function linkIdentity(personId: string, provider: string, subject: string): Promise<void> {
  await db.insert(identities).values({ personId, provider, subject }).onConflictDoNothing();
}

export async function ensureParticipation(personId: string, programSlug: string, role: string, sourceRef?: string): Promise<void> {
  const [program] = await db.select().from(programs).where(eq(programs.slug, programSlug));
  if (!program) {
    // Loud failure: participation in an unknown program is a data bug, not a no-op
    throw new Error(`ensureParticipation: unknown program slug '${programSlug}'`);
  }
  const existing = await db
    .select({ id: programParticipations.id })
    .from(programParticipations)
    .where(and(
      eq(programParticipations.personId, personId),
      eq(programParticipations.programId, program.id),
      eq(programParticipations.role, role),
    ));
  if (existing.length === 0) {
    await db.insert(programParticipations).values({ personId, programId: program.id, role, sourceRef: sourceRef ?? null });
  }
}

/**
 * Organizational program boundaries (owner directive, D-008):
 * V.I.A. = AI-first online school; N.O.B.L.E. = youth leadership/mentorship
 * community; Workforce Development = CompTIA/CNA/WIOA. Independent program
 * types on shared infrastructure — never separate applications.
 */
export async function seedPrograms(): Promise<void> {
  const seed = [
    { slug: "via", name: "V.I.A.", programType: "school", status: "active", description: "AI-first online school. Own educational identity and roadmap; not a workforce program." },
    { slug: "noble", name: "N.O.B.L.E.", programType: "community", status: "planned", description: "Youth leadership and mentorship community; human guidance with AI-assisted mentoring. Not a school." },
    { slug: "workforce", name: "Workforce Development", programType: "workforce", status: "active", description: "Adult workforce initiatives umbrella (CompTIA, CNA, WIOA)." },
    { slug: "comptia", name: "CompTIA Certification Training", programType: "workforce", parentSlug: "workforce", status: "active", description: "CompTIA Tech+/A+ certification track (WIOA-eligible)." },
    { slug: "cna", name: "CNA Training", programType: "workforce", parentSlug: "workforce", status: "active", description: "Certified Nursing Assistant training track." },
    { slug: "housing", name: "Independent Living Housing", programType: "housing", status: "planned", description: "Sustainable housing / independent living program." },
  ];
  for (const p of seed) {
    await db.insert(programs).values(p).onConflictDoNothing({ target: programs.slug });
  }
  console.log(`[identity] program registry ensured (${seed.length} programs)`);
}
