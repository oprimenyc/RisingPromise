/**
 * Notification Framework (M1): provider-independent channels. Callers say
 * WHAT to send (channel, recipient, subject, body); providers are resolved
 * behind capability interfaces at delivery time. Delivery runs on the durable
 * job queue (retries + DLQ). No channel silently drops work:
 *  - email    -> mail.transactional capability (Resend today)
 *  - sms      -> Twilio when TWILIO_* config exists; otherwise the row is
 *                marked 'unavailable' loudly (activation-ready, never faked)
 *  - internal -> persisted, listed on the admin surface
 *  - task     -> persisted actionable item (status open -> done)
 *  - calendar -> Google Calendar when the google provider is configured;
 *                otherwise 'unavailable' (activation-ready)
 */
import { db } from "../db";
import { notifications } from "../../shared/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { mail } from "../providers/mail";
import { registerJob, enqueue } from "./jobs";

export type Channel = "email" | "sms" | "internal" | "task" | "calendar";

export interface NotifyRequest {
  channel: Channel;
  personId?: string;
  address?: string; // email/phone for external channels
  subject: string;
  body: string;
  /** Optional idempotence key — repeat notify() calls with the same key are no-ops. */
  dedupeKey?: string;
}

/** Queue a notification. Returns the notification id (null if deduped). */
export async function notify(req: NotifyRequest): Promise<number | null> {
  const [row] = await db
    .insert(notifications)
    .values({
      channel: req.channel,
      personId: req.personId ?? null,
      address: req.address ?? null,
      subject: req.subject,
      body: req.body,
      dedupeKey: req.dedupeKey ?? null,
      status: req.channel === "task" ? "open" : "queued",
    })
    .onConflictDoNothing({ target: notifications.dedupeKey })
    .returning();
  if (!row) return null; // deduped
  if (req.channel !== "internal" && req.channel !== "task") {
    await enqueue("notifications.deliver", { notificationId: row.id });
  }
  return row.id;
}

async function markStatus(id: number, status: string, providerUsed?: string, error?: string): Promise<void> {
  await db
    .update(notifications)
    .set({ status, providerUsed: providerUsed ?? null, error: error ?? null, sentAt: status === "sent" ? new Date() : null })
    .where(eq(notifications.id, id));
}

async function deliver(notificationId: number): Promise<void> {
  const [n] = await db.select().from(notifications).where(eq(notifications.id, notificationId));
  if (!n) throw new Error(`notification ${notificationId} not found`);
  if (n.status === "sent") return; // idempotent re-delivery

  switch (n.channel) {
    case "email": {
      if (!mail) {
        await markStatus(n.id, "unavailable", undefined, "mail.transactional capability unconfigured");
        console.warn(`[notify] email #${n.id} UNAVAILABLE (mail capability unconfigured) — subject '${n.subject}'`);
        return;
      }
      if (!n.address) throw new Error(`email notification ${n.id} has no address`);
      await mail.send({ to: n.address, subject: n.subject, html: n.body });
      await markStatus(n.id, "sent", "resend");
      return;
    }
    case "sms": {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM_NUMBER;
      if (!sid || !token || !from) {
        await markStatus(n.id, "unavailable", undefined, "sms provider unconfigured (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER)");
        console.warn(`[notify] sms #${n.id} UNAVAILABLE (twilio unconfigured, activation-ready)`);
        return;
      }
      if (!n.address) throw new Error(`sms notification ${n.id} has no address`);
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: n.address, From: from, Body: `${n.subject}\n${n.body}` }).toString(),
      });
      if (!res.ok) throw new Error(`twilio send failed: HTTP ${res.status}`);
      await markStatus(n.id, "sent", "twilio");
      return;
    }
    case "calendar": {
      // Google Calendar lands with the google provider module build-out
      // (RP_GOOGLE_PROVIDER). Until credentials + module exist the request is
      // recorded and marked unavailable — never dropped silently.
      await markStatus(n.id, "unavailable", undefined, "calendar capability pending google provider module (activation-ready)");
      console.warn(`[notify] calendar #${n.id} UNAVAILABLE (google calendar module pending)`);
      return;
    }
    default:
      throw new Error(`deliver() called for non-deliverable channel '${n.channel}'`);
  }
}

/** Boot-time registration of the durable delivery worker. */
export async function registerNotificationWorker(): Promise<void> {
  await registerJob<{ notificationId: number }>(
    "notifications.deliver",
    async (data) => deliver(data.notificationId),
    { retryLimit: 3, retryDelaySeconds: 60 }
  );
}

/** Admin surfaces. */
export async function listNotifications(opts: { channel?: Channel; limit?: number } = {}) {
  const base = db.select().from(notifications);
  const query = opts.channel ? base.where(eq(notifications.channel, opts.channel)) : base;
  return query.orderBy(desc(notifications.createdAt)).limit(opts.limit ?? 50);
}

export async function notificationStats(): Promise<Record<string, number>> {
  const rows = await db.select({ status: notifications.status }).from(notifications);
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
  return counts;
}

export async function completeTask(id: number, actor: string): Promise<void> {
  const [row] = await db.select().from(notifications).where(eq(notifications.id, id));
  if (!row || row.channel !== "task") throw new Error(`task ${id} not found`);
  await db.update(notifications).set({ status: "done", providerUsed: actor, sentAt: new Date() }).where(eq(notifications.id, id));
}

/**
 * Event consumer: operational events raise internal tasks so nothing lands
 * in a void (applications need review; dead-lettered work needs attention).
 */
export async function raiseTasksFromEvents(event: { id: number; type: string; payload: unknown }): Promise<void> {
  if (event.type === "ApplicationSubmitted") {
    const p = event.payload as { applicationId?: number; programSlug?: string; eligibility?: { eligible?: boolean; reason?: string } };
    await notify({
      channel: "task",
      subject: `Review program application #${p.applicationId} (${p.programSlug})`,
      body: p.eligibility ? `Intake eligibility: ${p.eligibility.eligible ? "eligible" : "NOT eligible"} — ${p.eligibility.reason}` : "Application awaiting staff review.",
      dedupeKey: `task:application-review:${p.applicationId}`,
    });
  }
}
