/**
 * Migration tooling (M1 Unified Identity Broker): backfill every existing LMS
 * user into core_persons + core_identities(provider='replit') so people who
 * never log in again still exist once in the unified identity model.
 *
 * Idempotent — safe to re-run. Reads lms.users via SQL on the shared cluster
 * (no LMS code import needed). Run:
 *   DATABASE_URL=... npx tsx server/core/migrateLmsUsers.ts
 * Guard: refuses non-local databases unless MIGRATE_CONFIRM=yes (owner-run in
 * production per Constitution §3 — this touches person records).
 */
import { db } from "../db";
import { sql } from "drizzle-orm";
import { ensurePerson, linkIdentity, grantRole } from "./identity";

export async function migrateLmsUsers(): Promise<{ migrated: number; skippedNoEmail: number; total: number }> {
  const rows: Array<{ id: string; email: string | null; first_name: string | null; last_name: string | null; role: string }> = await db
    .execute(sql`select id, email, first_name, last_name, role from lms.users`)
    .then((r: any) => r.rows ?? r);

  let migrated = 0;
  let skippedNoEmail = 0;
  for (const u of rows) {
    if (!u.email) {
      skippedNoEmail++;
      console.warn(`[migrate] lms user ${u.id} has no email — cannot map to a person (left for manual review)`);
      continue;
    }
    const personId = await ensurePerson(u.email, { first: u.first_name ?? undefined, last: u.last_name ?? undefined });
    await linkIdentity(personId, "replit", u.id);
    await grantRole(personId, u.role === "admin" || u.role === "staff" || u.role === "instructor" ? u.role : "student", "migrateLmsUsers");
    migrated++;
  }
  const summary = { migrated, skippedNoEmail, total: rows.length };
  console.log(`[migrate] lms users -> core identity: ${JSON.stringify(summary)}`);
  return summary;
}

// CLI entrypoint
const invokedDirectly = process.argv[1]?.replace(/\\/g, "/").endsWith("core/migrateLmsUsers.ts");
if (invokedDirectly) {
  const url = new URL(process.env.DATABASE_URL ?? "postgresql://unset");
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (!isLocal && process.env.MIGRATE_CONFIRM !== "yes") {
    console.error("[migrate] refusing to run against a non-local database without MIGRATE_CONFIRM=yes");
    process.exit(1);
  }
  migrateLmsUsers()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error("[migrate] FAILED:", e);
      process.exit(1);
    });
}
