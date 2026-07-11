/**
 * Knowledge/capability graph (M1 §9, RP_CAPABILITY_GRAPH). Nodes/edges are
 * PROJECTIONS of domain events — never hand-curated. Sensitivity classes gate
 * query output (restricted nodes are excluded from non-admin reads).
 */
import { db } from "../db";
import { graphNodes, graphEdges, programs, type DomainEvent } from "@shared/schema";
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
