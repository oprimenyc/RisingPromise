/**
 * Workflow Engine (M1): ONE generic state-machine executor; journeys are
 * configuration, not code. Definitions below cover the current constituent
 * journeys (student, volunteer, grant, donor, parent, sponsor, housing).
 * Future program types (V.I.A., N.O.B.L.E.) add DEFINITIONS — never engine
 * changes — and are intentionally NOT defined yet (owner directive: prepare,
 * don't build).
 *
 * Rules:
 *  - transitions are validated against the definition; invalid moves throw
 *  - transitions guarded by a policy action call the Policy Engine (single
 *    source of permission logic)
 *  - every start/transition appends to the instance history AND emits an
 *    event through the outbox (graph/audit consume it)
 */
import { db } from "../db";
import { workflowInstances } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { publishEvent } from "./events";
import { authorize, type Role } from "./policy";

export interface WorkflowDefinition {
  id: string;
  version: number;
  description: string;
  initial: string;
  states: string[];
  transitions: Array<{
    from: string;
    to: string;
    action: string;
    /** When set, the actor's roles must pass this Policy Engine action. */
    policyAction?: string;
  }>;
}

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "student.intake",
    version: 1,
    description: "Program application through enrollment/completion (any workforce program)",
    initial: "applied",
    states: ["applied", "under_review", "accepted", "rejected", "enrolled", "completed", "withdrawn"],
    transitions: [
      { from: "applied", to: "under_review", action: "begin_review", policyAction: "lms.staff" },
      { from: "under_review", to: "accepted", action: "accept", policyAction: "lms.staff" },
      { from: "under_review", to: "rejected", action: "reject", policyAction: "lms.staff" },
      { from: "accepted", to: "enrolled", action: "enroll" },
      { from: "enrolled", to: "completed", action: "complete" },
      { from: "enrolled", to: "withdrawn", action: "withdraw" },
    ],
  },
  {
    id: "volunteer.onboarding",
    version: 1,
    description: "Volunteer application, screening, activation",
    initial: "applied",
    states: ["applied", "screening", "background_check", "active", "inactive", "declined"],
    transitions: [
      { from: "applied", to: "screening", action: "begin_screening", policyAction: "lms.staff" },
      { from: "screening", to: "background_check", action: "request_background_check", policyAction: "lms.staff" },
      { from: "screening", to: "declined", action: "decline", policyAction: "lms.staff" },
      { from: "background_check", to: "active", action: "activate", policyAction: "lms.staff" },
      { from: "background_check", to: "declined", action: "decline", policyAction: "lms.staff" },
      { from: "active", to: "inactive", action: "deactivate" },
      { from: "inactive", to: "active", action: "reactivate", policyAction: "lms.staff" },
    ],
  },
  {
    id: "grant.pipeline",
    version: 1,
    description: "Grant opportunity from discovery to award; submission is ED-gated",
    initial: "discovered",
    states: ["discovered", "qualified", "drafting", "ed_review", "submitted", "awarded", "declined", "abandoned"],
    transitions: [
      { from: "discovered", to: "qualified", action: "qualify", policyAction: "lms.staff" },
      { from: "discovered", to: "abandoned", action: "abandon" },
      { from: "qualified", to: "drafting", action: "begin_draft", policyAction: "lms.staff" },
      { from: "qualified", to: "abandoned", action: "abandon" },
      { from: "drafting", to: "ed_review", action: "request_review", policyAction: "lms.staff" },
      { from: "ed_review", to: "drafting", action: "request_changes", policyAction: "lms.staff" },
      // The hard gate: only the grants.submit policy (ED approval recorded) permits this move.
      { from: "ed_review", to: "submitted", action: "submit", policyAction: "grants.submit" },
      { from: "submitted", to: "awarded", action: "record_award", policyAction: "lms.staff" },
      { from: "submitted", to: "declined", action: "record_decline", policyAction: "lms.staff" },
    ],
  },
  {
    id: "donor.stewardship",
    version: 1,
    description: "Donor relationship lifecycle",
    initial: "first_gift",
    states: ["first_gift", "thanked", "engaged", "lapsed", "reactivated"],
    transitions: [
      { from: "first_gift", to: "thanked", action: "thank" },
      { from: "thanked", to: "engaged", action: "engage" },
      { from: "engaged", to: "lapsed", action: "lapse" },
      { from: "lapsed", to: "reactivated", action: "reactivate" },
      { from: "reactivated", to: "engaged", action: "engage" },
    ],
  },
  {
    id: "parent.engagement",
    version: 1,
    description: "Parent/guardian engagement for youth programs",
    initial: "contacted",
    states: ["contacted", "oriented", "active", "inactive"],
    transitions: [
      { from: "contacted", to: "oriented", action: "orient", policyAction: "lms.staff" },
      { from: "oriented", to: "active", action: "activate", policyAction: "lms.staff" },
      { from: "active", to: "inactive", action: "deactivate" },
      { from: "inactive", to: "active", action: "reactivate", policyAction: "lms.staff" },
    ],
  },
  {
    id: "sponsor.partnership",
    version: 1,
    description: "Corporate/community sponsor from prospect to active partnership",
    initial: "prospect",
    states: ["prospect", "outreach", "mou_draft", "mou_signed", "active", "ended"],
    transitions: [
      { from: "prospect", to: "outreach", action: "begin_outreach", policyAction: "lms.staff" },
      { from: "outreach", to: "mou_draft", action: "draft_mou", policyAction: "lms.staff" },
      { from: "mou_draft", to: "mou_signed", action: "record_signature", policyAction: "lms.staff" },
      { from: "mou_signed", to: "active", action: "activate", policyAction: "lms.staff" },
      { from: "active", to: "ended", action: "end", policyAction: "lms.staff" },
    ],
  },
  {
    id: "housing.residency",
    version: 1,
    description: "Housing program intake through residency (participation records only until volume justifies more)",
    initial: "applied",
    states: ["applied", "screening", "waitlist", "placed", "resident", "exited", "declined"],
    transitions: [
      { from: "applied", to: "screening", action: "begin_screening", policyAction: "lms.staff" },
      { from: "screening", to: "waitlist", action: "waitlist", policyAction: "lms.staff" },
      { from: "screening", to: "declined", action: "decline", policyAction: "lms.staff" },
      { from: "waitlist", to: "placed", action: "place", policyAction: "lms.staff" },
      { from: "placed", to: "resident", action: "move_in", policyAction: "lms.staff" },
      { from: "resident", to: "exited", action: "exit", policyAction: "lms.staff" },
    ],
  },
];

export function getDefinition(workflowId: string): WorkflowDefinition {
  const def = workflowDefinitions.find((d) => d.id === workflowId);
  if (!def) throw new Error(`Unknown workflow: ${workflowId}`);
  return def;
}

export async function startWorkflow(
  workflowId: string,
  opts: { personId?: string; subjectRef?: string; actor: string }
): Promise<{ instanceId: number; state: string }> {
  const def = getDefinition(workflowId);
  const [instance] = await db
    .insert(workflowInstances)
    .values({
      workflowId: def.id,
      version: def.version,
      personId: opts.personId ?? null,
      subjectRef: opts.subjectRef ?? null,
      state: def.initial,
      history: [{ at: new Date().toISOString(), from: null, to: def.initial, action: "start", actor: opts.actor }],
    })
    .returning();
  await publishEvent("WorkflowStarted", { instanceId: instance.id, workflowId: def.id, state: def.initial, personId: opts.personId ?? null, subjectRef: opts.subjectRef ?? null }, opts.actor);
  return { instanceId: instance.id, state: def.initial };
}

export async function transition(
  instanceId: number,
  action: string,
  actor: { id: string; roles: Role[] | string[] },
  note?: string
): Promise<{ state: string }> {
  const [instance] = await db.select().from(workflowInstances).where(eq(workflowInstances.id, instanceId));
  if (!instance) throw new Error(`Workflow instance ${instanceId} not found`);
  const def = getDefinition(instance.workflowId);

  const rule = def.transitions.find((t) => t.from === instance.state && t.action === action);
  if (!rule) {
    throw new Error(`Invalid transition: '${action}' from state '${instance.state}' in ${def.id} v${def.version}`);
  }
  if (rule.policyAction) {
    const decision = authorize(rule.policyAction, actor.roles);
    if (!decision.allowed) {
      throw new Error(`Policy ${decision.policyId} denies '${action}' (${rule.policyAction}): ${decision.reason}`);
    }
    if (decision.requiresApproval) {
      // Approval-gated transitions must carry a note naming the approval —
      // the ledger entry is written by the caller performing the approval.
      if (!note) throw new Error(`Transition '${action}' requires recorded approval (${decision.requiresApproval.rationale}); pass a note referencing the approval`);
    }
  }

  const history = [...(instance.history as any[]), { at: new Date().toISOString(), from: instance.state, to: rule.to, action, actor: actor.id, note: note ?? null }];
  await db.update(workflowInstances).set({ state: rule.to, history, updatedAt: new Date() }).where(eq(workflowInstances.id, instanceId));
  await publishEvent("WorkflowTransitioned", { instanceId, workflowId: def.id, from: instance.state, to: rule.to, action, personId: instance.personId, subjectRef: instance.subjectRef }, actor.id);
  return { state: rule.to };
}

export async function getInstance(instanceId: number) {
  const [instance] = await db.select().from(workflowInstances).where(eq(workflowInstances.id, instanceId));
  return instance ?? null;
}

/** Registered as an event consumer: applications automatically open intake workflows. */
export async function startIntakeOnApplication(event: { type: string; payload: unknown }): Promise<void> {
  if (event.type !== "ApplicationSubmitted") return;
  const p = event.payload as { personId?: string; applicationId?: number };
  if (!p.personId || p.applicationId == null) return;
  // Idempotence: one intake workflow per application
  const existing = await db.select({ id: workflowInstances.id }).from(workflowInstances).where(eq(workflowInstances.subjectRef, `application:${p.applicationId}`));
  if (existing.length > 0) return;
  await startWorkflow("student.intake", { personId: p.personId, subjectRef: `application:${p.applicationId}`, actor: "system:intake" });
}
