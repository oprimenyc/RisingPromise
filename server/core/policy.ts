/**
 * Policy Engine (M1; RP_MASTER_ARCHITECTURE §2 "code-as-config, versioned").
 * ALL authorization and eligibility rules live here as declarative, versioned
 * entries; route middleware and services call evaluate()/authorize() instead
 * of hard-coding role lists. Deny-by-default: an action with no policy is
 * refused loudly.
 *
 * Rule kinds:
 *  - authorization: which roles may perform an action
 *  - eligibility:   predicate over a context (program intake rules)
 *  - approval:      actions that additionally require a named-human approval
 *                   recorded in the decision ledger before execution (AI
 *                   departments and grant submission consume this — hard gate)
 */

export type Role = "student" | "instructor" | "staff" | "admin" | "board" | "volunteer" | "donor";

export interface PolicyDecision {
  allowed: boolean;
  policyId: string;
  version: number;
  reason: string;
  requiresApproval?: { approverRole: Role; rationale: string };
}

interface AuthorizationRule {
  kind: "authorization";
  id: string;
  version: number;
  description: string;
  actions: string[]; // action names this rule governs
  allowedRoles: Role[];
  requiresApproval?: { approverRole: Role; rationale: string };
}

interface EligibilityRule {
  kind: "eligibility";
  id: string;
  version: number;
  description: string;
  actions: string[];
  evaluate: (context: Record<string, unknown>) => { eligible: boolean; reason: string };
}

export type PolicyRule = AuthorizationRule | EligibilityRule;

/**
 * The policy registry. Versioned: bump `version` on any semantic change and
 * record the change in the decision ledger.
 */
export const policies: PolicyRule[] = [
  {
    kind: "authorization",
    id: "POL-001",
    version: 1,
    description: "LMS administration (bulk import/enroll, role grants, compliance status)",
    actions: ["lms.admin", "lms.users.role.grant", "lms.bulk.import", "lms.bulk.enroll", "lms.compliance.read"],
    allowedRoles: ["admin"],
  },
  {
    kind: "authorization",
    id: "POL-002",
    version: 1,
    description: "Staff operations (WIOA reports, email templates/triggers, AI spend)",
    actions: ["lms.staff", "wioa.reports", "email.templates", "ai.spend.read"],
    allowedRoles: ["admin", "staff"],
  },
  {
    kind: "authorization",
    id: "POL-003",
    version: 1,
    description: "Instructor surfaces (cohort dashboards, student progress within own courses)",
    actions: ["lms.instruct"],
    allowedRoles: ["admin", "staff", "instructor"],
  },
  {
    kind: "authorization",
    id: "POL-004",
    version: 1,
    description: "Platform observability and runtime verification",
    actions: ["platform.observability.read", "platform.verify.run", "platform.graph.read"],
    allowedRoles: ["admin"],
  },
  {
    kind: "authorization",
    id: "POL-005",
    version: 1,
    description: "Grant submission requires Executive Director sign-off (hard gate, RP_AI_DEPARTMENTS)",
    actions: ["grants.submit"],
    allowedRoles: ["admin", "staff"],
    requiresApproval: { approverRole: "admin", rationale: "External filing is irreversible; ED sign-off recorded in decision ledger before submission" },
  },
  {
    kind: "authorization",
    id: "POL-006",
    version: 1,
    description: "External communications (donor-facing messages, public content) require human approval",
    actions: ["communications.external.send", "content.publish"],
    allowedRoles: ["admin", "staff"],
    requiresApproval: { approverRole: "staff", rationale: "Publishing is irreversible; every external message is human-approved (RP_AI_DEPARTMENTS guardrail 2)" },
  },
  {
    kind: "authorization",
    id: "POL-007",
    version: 1,
    description: "Person-record mutation beyond self-service (merge, role grants)",
    actions: ["identity.merge", "identity.role.grant"],
    allowedRoles: ["admin"],
    requiresApproval: { approverRole: "admin", rationale: "Person records affect every program; merges are recorded in the decision ledger" },
  },
  {
    kind: "eligibility",
    id: "POL-101",
    version: 1,
    description: "CNA program intake eligibility (advisory at application time; verified before enrollment)",
    actions: ["program.apply.cna"],
    evaluate: (ctx) => {
      const missing: string[] = [];
      if (ctx.hasHighSchoolDiploma !== true) missing.push("high-school diploma / GED");
      if (ctx.hasTransportation !== true) missing.push("reliable transportation");
      return missing.length === 0
        ? { eligible: true, reason: "meets CNA intake requirements" }
        : { eligible: false, reason: `missing: ${missing.join(", ")}` };
    },
  },
  {
    kind: "eligibility",
    id: "POL-102",
    version: 1,
    description: "IT/CompTIA program intake eligibility (advisory at application time)",
    actions: ["program.apply.it"],
    evaluate: (ctx) => {
      const missing: string[] = [];
      if (ctx.hasHighSchoolDiploma !== true) missing.push("high-school diploma / GED");
      return missing.length === 0
        ? { eligible: true, reason: "meets IT intake requirements" }
        : { eligible: false, reason: `missing: ${missing.join(", ")}` };
    },
  },
];

function rulesFor(action: string): PolicyRule[] {
  return policies.filter((p) => p.actions.includes(action));
}

/** Authorization check. Deny-by-default: unknown actions are refused. */
export function authorize(action: string, roles: Role[] | string[]): PolicyDecision {
  const rules = rulesFor(action).filter((r): r is AuthorizationRule => r.kind === "authorization");
  if (rules.length === 0) {
    console.warn(`[policy] DENY (no policy) action=${action}`);
    return { allowed: false, policyId: "POL-000", version: 0, reason: `no policy governs action '${action}' — deny by default` };
  }
  for (const rule of rules) {
    if (roles.some((role) => rule.allowedRoles.includes(role as Role))) {
      return {
        allowed: true,
        policyId: rule.id,
        version: rule.version,
        reason: `role permitted by ${rule.id} (${rule.description})`,
        requiresApproval: rule.requiresApproval,
      };
    }
  }
  const rule = rules[0];
  console.warn(`[policy] DENY action=${action} roles=[${roles.join(",")}] policy=${rule.id}`);
  return { allowed: false, policyId: rule.id, version: rule.version, reason: `roles [${roles.join(", ")}] not in allowed [${rule.allowedRoles.join(", ")}]` };
}

/** Eligibility check. Unknown eligibility actions are ineligible-by-default. */
export function checkEligibility(action: string, context: Record<string, unknown>): PolicyDecision {
  const rules = rulesFor(action).filter((r): r is EligibilityRule => r.kind === "eligibility");
  if (rules.length === 0) {
    console.warn(`[policy] INELIGIBLE (no policy) action=${action}`);
    return { allowed: false, policyId: "POL-000", version: 0, reason: `no eligibility policy for '${action}' — ineligible by default` };
  }
  for (const rule of rules) {
    const result = rule.evaluate(context);
    if (!result.eligible) {
      return { allowed: false, policyId: rule.id, version: rule.version, reason: result.reason };
    }
  }
  const rule = rules[0];
  return { allowed: true, policyId: rule.id, version: rule.version, reason: "eligible under all governing policies" };
}

/** All policies, for observability/graph projection. */
export function listPolicies(): Array<{ id: string; version: number; kind: string; description: string; actions: string[] }> {
  return policies.map((p) => ({ id: p.id, version: p.version, kind: p.kind, description: p.description, actions: p.actions }));
}
