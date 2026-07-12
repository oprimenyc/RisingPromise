/**
 * Notification Framework runtime verification (local cluster only):
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/core/notifications.verify.ts
 */
import { startJobs, stopJobs } from "./jobs";
import { notify, registerNotificationWorker, listNotifications, notificationStats, completeTask, raiseTasksFromEvents } from "./notifications";
import { db } from "../db";
import { sql } from "drizzle-orm";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function status(id: number): Promise<{ status: string; error: string | null } | undefined> {
  const [row] = await db.execute(sql`select status, error from core_notifications where id=${id}`).then((r: any) => r.rows ?? r);
  return row;
}

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("local cluster only");

  await startJobs();
  await registerNotificationWorker();

  // internal + task channels: persisted immediately, no delivery job needed
  const internalId = await notify({ channel: "internal", subject: "Internal note", body: "visible on admin surface" });
  assert(internalId !== null, "internal notification persisted");

  const taskId = await notify({ channel: "task", subject: "Do the thing", body: "actionable", dedupeKey: "verify:task-1" });
  const deduped = await notify({ channel: "task", subject: "Do the thing", body: "actionable", dedupeKey: "verify:task-1" });
  assert(taskId !== null && deduped === null, "task created once; dedupeKey suppresses repeat");
  assert((await status(taskId!))?.status === "open", "task starts open");
  await completeTask(taskId!, "verify");
  assert((await status(taskId!))?.status === "done", "task completes");

  // email channel without provider: unavailable, loud, never fake-sent
  delete process.env.RESEND_API_KEY;
  const emailId = await notify({ channel: "email", address: "someone@example.org", subject: "Hello", body: "<p>hi</p>" });
  for (let i = 0; i < 30 && (await status(emailId!))?.status === "queued"; i++) await sleep(500);
  const emailRow = await status(emailId!);
  assert(emailRow?.status === "unavailable" && /unconfigured/.test(emailRow.error ?? ""), `keyless email -> unavailable with reason (got ${emailRow?.status}: ${emailRow?.error})`);

  // sms channel without provider: unavailable (activation-ready)
  const smsId = await notify({ channel: "sms", address: "+15555550100", subject: "Ping", body: "test" });
  for (let i = 0; i < 30 && (await status(smsId!))?.status === "queued"; i++) await sleep(500);
  const smsRow = await status(smsId!);
  assert(smsRow?.status === "unavailable" && /TWILIO/.test(smsRow.error ?? ""), `keyless sms -> unavailable naming TWILIO keys (got ${smsRow?.status})`);

  // calendar channel: recorded + unavailable pending google module
  const calId = await notify({ channel: "calendar", subject: "Board meeting", body: "2026-08-01 18:00" });
  for (let i = 0; i < 30 && (await status(calId!))?.status === "queued"; i++) await sleep(500);
  assert((await status(calId!))?.status === "unavailable", "calendar recorded as unavailable (activation-ready)");

  // event -> internal task consumer
  await raiseTasksFromEvents({ id: 1, type: "ApplicationSubmitted", payload: { applicationId: 424242, programSlug: "cna", eligibility: { eligible: false, reason: "missing transport" } } });
  await raiseTasksFromEvents({ id: 2, type: "ApplicationSubmitted", payload: { applicationId: 424242, programSlug: "cna" } });
  const [taskCount] = await db.execute(sql`select count(*)::int n from core_notifications where dedupe_key='task:application-review:424242'`).then((r: any) => r.rows ?? r);
  assert(taskCount.n === 1, "application event raises exactly one review task");

  const stats = await notificationStats();
  assert((stats.unavailable ?? 0) >= 3, `stats aggregate statuses ${JSON.stringify(stats)}`);
  const tasks = await listNotifications({ channel: "task" });
  assert(tasks.length >= 2, "task list retrievable");

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  await stopJobs();
  process.exit(process.exitCode ?? 0);
}

main().catch(async (e) => {
  console.error("verify crashed:", e);
  await stopJobs();
  process.exit(1);
});
