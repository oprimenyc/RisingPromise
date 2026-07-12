/**
 * Policy Engine runtime verification: npx tsx server/core/policy.verify.ts
 */
import { authorize, checkEligibility, listPolicies } from "./policy";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

// Authorization
assert(authorize("lms.admin", ["admin"]).allowed, "admin allowed lms.admin");
assert(!authorize("lms.admin", ["staff"]).allowed, "staff denied lms.admin");
assert(!authorize("lms.admin", ["student"]).allowed, "student denied lms.admin");
assert(authorize("lms.staff", ["staff"]).allowed, "staff allowed lms.staff");
assert(authorize("lms.staff", ["admin"]).allowed, "admin allowed lms.staff");
assert(!authorize("lms.staff", ["instructor"]).allowed, "instructor denied lms.staff");
assert(!authorize("no.such.action", ["admin"]).allowed, "unknown action denied even for admin (deny-by-default)");

// Approval gates
const grant = authorize("grants.submit", ["staff"]);
assert(grant.allowed && grant.requiresApproval?.approverRole === "admin", "grants.submit allowed for staff but requires ED approval");
const comms = authorize("communications.external.send", ["staff"]);
assert(comms.requiresApproval !== undefined, "external communications require approval");
const merge = authorize("identity.merge", ["admin"]);
assert(merge.allowed && merge.requiresApproval, "identity.merge admin-only with approval record");

// Eligibility
assert(checkEligibility("program.apply.cna", { hasHighSchoolDiploma: true, hasTransportation: true }).allowed, "CNA eligible with diploma+transport");
const noTransport = checkEligibility("program.apply.cna", { hasHighSchoolDiploma: true, hasTransportation: false });
assert(!noTransport.allowed && noTransport.reason.includes("transportation"), "CNA ineligible without transport, reason named");
assert(checkEligibility("program.apply.it", { hasHighSchoolDiploma: true }).allowed, "IT eligible with diploma");
assert(!checkEligibility("program.apply.it", { hasHighSchoolDiploma: false }).allowed, "IT ineligible without diploma");
assert(!checkEligibility("program.apply.unknown", {}).allowed, "unknown program ineligible by default");

// Registry
const list = listPolicies();
assert(list.length >= 9, `policy registry lists all policies (${list.length})`);
assert(list.every((p) => p.id && p.version >= 1), "every policy has id + version");

console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
process.exit(process.exitCode ?? 0);
