/**
 * Knowledge/capability graph (M1 §9, RP_CAPABILITY_GRAPH). Nodes/edges are
 * PROJECTIONS of domain events — never hand-curated. Sensitivity classes gate
 * query output (restricted nodes are excluded from non-admin reads).
 */
import { db } from "../db";
import { graphNodes, graphEdges, programs, type DomainEvent } from "../../shared/schema";
import { and, eq, or, ne } from "drizzle-orm";
import { registerConsumer } from "./events";

async function ensureNode(kind: string, refId: string, label: string, sensitivity = "internal", props: Record<string, unknown> = {}): Promise<number> {
  const [existing] = await db.select({ id: graphNodes.id }).from(graphNodes).where(and(eq(graphNodes.kind, kind), eq(graphNodes.refId, refId)));
  if (existing) return existing.id;
  const [node] = await db.insert(graphNodes).values({ kind, refId, label, sensitivity, props }).onConflictDoNothing().returning();
  if (node) return node.id;
  const [winner] = await db.select({ id: graphNodes.id }).from(graphNodes).where(and(eq(graphNodes.kind, kind), eq(graphNodes.refId, refId)));
  return winner.id;
}

async function ensureEdge(fromNode: number, toNode: number, kind: string, props: Record<string, unknown> = {}): Promise<void> {
  const [existing] = await db
    .select({ id: graphEdges.id })
    .from(graphEdges)
    .where(and(eq(graphEdges.fromNode, fromNode), eq(graphEdges.toNode, toNode), eq(graphEdges.kind, kind)));
  if (!existing) await db.insert(graphEdges).values({ fromNode, toNode, kind, props });
}

/** Event -> graph projection. One consumer handles all projection rules. */
async function project(event: DomainEvent): Promise<void> {
  const p = event.payload as any;
  switch (event.type) {
    case "PersonCreated": {
      await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      break;
    }
    case "NewsletterSubscribed": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const list = await ensureNode("campaign", "newsletter", "Newsletter", "internal");
      await ensureEdge(person, list, "SUBSCRIBED_TO", { source: p.source });
      break;
    }
    case "ApplicationSubmitted": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const program = await ensureNode("program", p.programSlug, p.programSlug, "public");
      await ensureEdge(person, program, "APPLIED_TO", { applicationId: p.applicationId });
      break;
    }
    case "DonationReceived": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const org = await ensureNode("campaign", "general-fund", "General Fund", "public");
      await ensureEdge(person, org, "DONATED_TO", { amountCents: p.amountCents, sessionId: p.sessionId });
      break;
    }
    case "RaffleTicketPurchased": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const raffle = await ensureNode("campaign", "raffle", "Raffle", "public");
      await ensureEdge(person, raffle, "PURCHASED_ENTRY", { entries: p.entryCount });
      break;
    }
    case "StudentEnrolled": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const program = await ensureNode("program", p.programSlug ?? "workforce", p.programSlug ?? "workforce", "public");
      await ensureEdge(person, program, "PARTICIPATES_IN", { role: "student" });
      if (p.courseId) {
        const course = await ensureNode("course", p.courseId, p.courseId, "internal");
        await ensureEdge(person, course, "ENROLLED_IN", { enrollmentId: p.enrollmentId });
        await ensureEdge(course, program, "PART_OF");
      }
      break;
    }
    case "CourseCompleted": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      if (p.courseId) {
        const course = await ensureNode("course", p.courseId, p.courseId, "internal");
        await ensureEdge(person, course, "COMPLETED", { enrollmentId: p.enrollmentId, completionDate: p.completionDate });
      }
      break;
    }
    case "VolunteerCreated": {
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const program = await ensureNode("program", p.programSlug ?? "workforce", p.programSlug ?? "workforce", "public");
      await ensureEdge(person, program, "VOLUNTEERS_FOR");
      break;
    }
    case "SponsorCreated": {
      const org = await ensureNode("organization", p.sponsorId ?? p.name, p.name ?? String(p.sponsorId), "internal");
      const program = await ensureNode("program", p.programSlug ?? "workforce", p.programSlug ?? "workforce", "public");
      await ensureEdge(org, program, "SPONSORS");
      break;
    }
    case "GrantSubmitted": {
      const grant = await ensureNode("grant", String(p.opportunityId ?? p.subjectRef), p.title ?? String(p.opportunityId), "internal");
      const org = await ensureNode("organization", "rising-promise", "Rising Promise", "public");
      await ensureEdge(org, grant, "SUBMITTED", { at: event.createdAt });
      break;
    }
    case "BackgroundCheckCompleted": {
      // Screening results are restricted: status + reference only, never content.
      const person = await ensureNode("person", p.personId, p.email ?? p.personId, "restricted");
      const screening = await ensureNode("document", `background-check:${p.referenceId}`, "Background check (reference)", "restricted");
      await ensureEdge(person, screening, "SCREENED_BY", { status: p.status });
      break;
    }
    case "PersonMerged": {
      const survivor = await ensureNode("person", p.survivorId, p.survivorId, "restricted");
      const duplicate = await ensureNode("person", p.duplicateId, p.duplicateId, "restricted");
      await ensureEdge(duplicate, survivor, "MERGED_INTO", { reason: p.reason });
      break;
    }
    case "WorkflowStarted": {
      const wf = await ensureNode("workflow", `instance:${p.instanceId}`, `${p.workflowId}#${p.instanceId}`, "internal", { workflowId: p.workflowId, state: p.state });
      if (p.personId) {
        const person = await ensureNode("person", p.personId, p.personId, "restricted");
        await ensureEdge(person, wf, "IN_WORKFLOW", { subjectRef: p.subjectRef });
      }
      break;
    }
    case "WorkflowTransitioned": {
      await ensureNode("workflow", `instance:${p.instanceId}`, `${p.workflowId}#${p.instanceId}`, "internal", { workflowId: p.workflowId, state: p.to });
      await db
        .update(graphNodes)
        .set({ props: { workflowId: p.workflowId, state: p.to, lastAction: p.action } })
        .where(and(eq(graphNodes.kind, "workflow"), eq(graphNodes.refId, `instance:${p.instanceId}`)));
      break;
    }
    case "DecisionRecorded": {
      // Approvals/decisions are graph citizens so impact queries can trace
      // why a change happened.
      if (p.ledgerId) {
        await ensureNode("decision", String(p.ledgerId), `${p.ledgerId}: ${String(p.decision).slice(0, 80)}`, "internal", { area: p.area });
      }
      break;
    }
    default:
      break; // event types without projection rules are fine
  }
}

export function registerGraphProjector(): void {
  registerConsumer({ name: "graph-projector", handle: project });
}

/** Seed program nodes so the graph always knows the org structure. */
export async function projectPrograms(): Promise<void> {
  const rows = await db.select().from(programs);
  const byName = new Map<string, number>();
  for (const prog of rows) {
    byName.set(prog.slug, await ensureNode("program", prog.slug, prog.name, "public", { type: prog.programType, status: prog.status }));
  }
  for (const prog of rows) {
    if (prog.parentSlug && byName.has(prog.parentSlug)) {
      await ensureEdge(byName.get(prog.slug)!, byName.get(prog.parentSlug)!, "PART_OF");
    }
  }
}

/**
 * Project platform structure: providers, capabilities (DEPENDS_ON provider),
 * features (REQUIRES capability), policies (GOVERNS action groups). Runs at
 * boot after verification so statuses are current. Structural — sourced from
 * the registries, the same way programs are.
 */
export async function projectPlatform(): Promise<void> {
  const { providers } = await import("../providers");
  const { listPolicies } = await import("./policy");
  const { capabilities: capsTable, features: featsTable } = await import("../../shared/schema");

  const providerNodes = new Map<string, number>();
  for (const p of providers) {
    providerNodes.set(p.name, await ensureNode("provider", p.name, p.name, "public"));
  }
  const caps = await db.select().from(capsTable);
  for (const cap of caps) {
    const capNode = await ensureNode("capability", cap.name, cap.name, "public", { status: cap.status });
    await db.update(graphNodes).set({ props: { status: cap.status, domain: cap.domain } }).where(and(eq(graphNodes.kind, "capability"), eq(graphNodes.refId, cap.name)));
    const provider = providerNodes.get(cap.name);
    if (provider && provider !== capNode) await ensureEdge(capNode, provider, "DEPENDS_ON");
  }
  const feats = await db.select().from(featsTable);
  for (const f of feats) {
    const featNode = await ensureNode("feature", f.name, f.name, "public", { healthy: f.healthy });
    for (const cap of (f.requiredCapabilities as string[] | null) ?? []) {
      const capNode = await ensureNode("capability", cap, cap, "public");
      await ensureEdge(featNode, capNode, "REQUIRES");
    }
  }
  for (const pol of listPolicies()) {
    await ensureNode("policy", pol.id, `${pol.id}: ${pol.description.slice(0, 60)}`, "public", { version: pol.version, kind: pol.kind, actions: pol.actions });
  }
  console.log("[graph] platform structure projected (providers/capabilities/features/policies)");
}

/** Neighborhood query. Restricted nodes excluded unless includeRestricted. */
export async function neighbors(kind: string, refId: string, includeRestricted = false) {
  const [node] = await db.select().from(graphNodes).where(and(eq(graphNodes.kind, kind), eq(graphNodes.refId, refId)));
  if (!node) return null;
  const edges = await db
    .select()
    .from(graphEdges)
    .where(or(eq(graphEdges.fromNode, node.id), eq(graphEdges.toNode, node.id)));
  const neighborIds = Array.from(new Set(edges.flatMap((e) => [e.fromNode, e.toNode]).filter((id) => id !== node.id)));
  const nodes = neighborIds.length
    ? await db.select().from(graphNodes).where(
        includeRestricted ? or(...neighborIds.map((id) => eq(graphNodes.id, id)))! : and(or(...neighborIds.map((id) => eq(graphNodes.id, id)))!, ne(graphNodes.sensitivity, "restricted"))
      )
    : [];
  return { node, edges, neighbors: nodes };
}

export async function graphStats() {
  const nodes = await db.select({ id: graphNodes.id }).from(graphNodes);
  const edges = await db.select({ id: graphEdges.id }).from(graphEdges);
  return { nodes: nodes.length, edges: edges.length };
}
