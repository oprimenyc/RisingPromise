/**
 * M0 runtime verification: role-based authorization.
 * Run: DATABASE_URL=... npx tsx server/rbac.verify.ts
 * Exercises requireRole/requireAdmin/requireStaff against the real database
 * with real user rows. Exits non-zero on any failure (CONSTITUTION §1).
 */
import { storage } from "./storage";
import { requireAdmin, requireStaff } from "./rbac";

type Result = { status?: number; nexted: boolean };

async function invoke(mw: any, userId: string): Promise<Result> {
  const r: Result = { nexted: false };
  const req: any = { user: { claims: { sub: userId } }, method: "GET", path: "/verify" };
  const res: any = {
    status(code: number) { r.status = code; return this; },
    json(_: any) { return this; },
  };
  await mw(req, res, () => { r.nexted = true; });
  return r;
}

function assert(name: string, cond: boolean): boolean {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  return cond;
}

async function main() {
  const suffix = Date.now();
  const student = await storage.upsertUser({ id: `verify-student-${suffix}`, email: `student-${suffix}@test.local` } as any);
  const admin = await storage.upsertUser({ id: `verify-admin-${suffix}`, email: `admin-${suffix}@test.local` } as any);
  const staff = await storage.upsertUser({ id: `verify-staff-${suffix}`, email: `staff-${suffix}@test.local` } as any);

  let ok = true;
  ok = assert("new users default to role=student", student.role === "student" && admin.role === "student") && ok;

  // Attempt privilege escalation through upsert (must be ignored)
  const escalated = await storage.upsertUser({ id: student.id, email: student.email, role: "admin" } as any);
  ok = assert("role NOT settable via upsert (escalation blocked)", escalated.role === "student") && ok;

  // Legitimate role grants
  await storage.setUserRole(admin.id, "admin");
  await storage.setUserRole(staff.id, "staff");

  ok = assert("student DENIED by requireAdmin (403)", (await invoke(requireAdmin, student.id)).status === 403) && ok;
  ok = assert("student DENIED by requireStaff (403)", (await invoke(requireStaff, student.id)).status === 403) && ok;
  ok = assert("staff DENIED by requireAdmin (403)", (await invoke(requireAdmin, staff.id)).status === 403) && ok;
  ok = assert("staff ALLOWED by requireStaff", (await invoke(requireStaff, staff.id)).nexted) && ok;
  ok = assert("admin ALLOWED by requireAdmin", (await invoke(requireAdmin, admin.id)).nexted) && ok;
  ok = assert("admin ALLOWED by requireStaff", (await invoke(requireStaff, admin.id)).nexted) && ok;
  ok = assert("unknown user DENIED (403)", (await invoke(requireAdmin, "no-such-user")).status === 403) && ok;
  ok = assert("missing identity DENIED (401)", (await invoke(requireAdmin, "")).status === 401) && ok;

  console.log(ok ? "\nRBAC VERIFICATION: ALL PASS" : "\nRBAC VERIFICATION: FAILURES PRESENT");
  process.exit(ok ? 0 : 1);
}

main().catch((e) => { console.error("VERIFICATION ERROR:", e); process.exit(1); });
