/**
 * Event bus — transactional outbox with in-process dispatch (D-005 pattern,
 * RP_MASTER_ARCHITECTURE D5). Events are durable rows; the dispatcher polls
 * unprocessed rows and delivers to registered consumers at-least-once.
 * Failures are recorded on the row (attempts, lastError) — never swallowed.
 */
import { db } from "../db";
import { domainEvents, type DomainEvent } from "../../shared/schema";
import { isNull, asc, eq } from "drizzle-orm";

export type EventType =
  | "NewsletterSubscribed"
  | "ApplicationSubmitted"
  | "DonationReceived"
  | "RaffleTicketPurchased"
  | "StudentEnrolled"
  | "CourseCompleted"
  | "VolunteerCreated"
  | "GrantSubmitted"
  | "SponsorCreated"
  | "BackgroundCheckCompleted"
  | "PersonCreated"
  | "IdentityLinked"
  | "PersonMerged"
  | "DecisionRecorded";

export type Consumer = {
  name: string;
  handle: (event: DomainEvent) => Promise<void>;
};

const consumers: Consumer[] = [];
const MAX_ATTEMPTS = 5;
let dispatchTimer: ReturnType<typeof setInterval> | null = null;

export function registerConsumer(consumer: Consumer): void {
  consumers.push(consumer);
  console.log(`[events] consumer registered: ${consumer.name}`);
}

/** Persist an event. Durable the moment this resolves. */
export async function publishEvent(type: EventType, payload: Record<string, unknown>, actor?: string): Promise<void> {
  await db.insert(domainEvents).values({ type, payload, actor: actor ?? "system" });
}

/** Deliver pending events to all consumers. Returns count processed. */
export async function dispatchPending(batch = 50): Promise<{ processed: number; failed: number }> {
  const pending = await db
    .select()
    .from(domainEvents)
    .where(isNull(domainEvents.processedAt))
    .orderBy(asc(domainEvents.id))
    .limit(batch);

  let processed = 0;
  let failed = 0;
  for (const event of pending) {
    if (event.attempts >= MAX_ATTEMPTS) continue; // dead-lettered in place; visible via observability
    try {
      for (const consumer of consumers) {
        await consumer.handle(event);
      }
      await db.update(domainEvents).set({ processedAt: new Date() }).where(eq(domainEvents.id, event.id));
      processed++;
    } catch (error: any) {
      failed++;
      const message = String(error?.message ?? error).slice(0, 1000);
      console.error(`[events] FAILED ${event.type}#${event.id} attempt=${event.attempts + 1}: ${message}`);
      await db
        .update(domainEvents)
        .set({ attempts: event.attempts + 1, lastError: message })
        .where(eq(domainEvents.id, event.id));
    }
  }
  return { processed, failed };
}

export function startDispatcher(intervalMs = 3000): void {
  if (dispatchTimer) return;
  dispatchTimer = setInterval(() => {
    dispatchPending().catch((e) => console.error("[events] dispatcher error:", e));
  }, intervalMs);
  dispatchTimer.unref?.();
  console.log(`[events] dispatcher started (every ${intervalMs}ms, ${consumers.length} consumers)`);
}

/** Queue stats for observability. */
export async function queueStats(): Promise<{ pending: number; deadLettered: number; total: number }> {
  const rows = await db.select({ id: domainEvents.id, attempts: domainEvents.attempts, processedAt: domainEvents.processedAt }).from(domainEvents);
  const unprocessed = rows.filter((r) => !r.processedAt);
  return {
    pending: unprocessed.filter((r) => r.attempts < MAX_ATTEMPTS).length,
    deadLettered: unprocessed.filter((r) => r.attempts >= MAX_ATTEMPTS).length,
    total: rows.length,
  };
}
