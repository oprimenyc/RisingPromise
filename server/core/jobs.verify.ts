/**
 * Durable job queue runtime verification (local cluster only):
 *   DATABASE_URL=postgresql://postgres@127.0.0.1:5599/rp_site npx tsx server/core/jobs.verify.ts
 * Proves with real pg-boss execution: enqueue -> worker runs; failing job
 * retries then dead-letters into <name>.dlq; scheduling registers a cron;
 * jobStats reports queue depths.
 */
import { startJobs, stopJobs, registerJob, scheduleJob, enqueue, jobStats } from "./jobs";

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1", "::1"].includes(url.hostname)) throw new Error("local cluster only");

  await startJobs();

  // 1. success path
  let ran = 0;
  await registerJob<{ n: number }>("verify.success", async (data) => {
    ran = data.n;
  });
  const id = await enqueue("verify.success", { n: 42 });
  assert(id, "job enqueued with id");
  for (let i = 0; i < 20 && ran !== 42; i++) await sleep(500);
  assert(ran === 42, `worker executed with payload (ran=${ran})`);

  // 2. retry -> dead letter
  let attempts = 0;
  await registerJob("verify.fail", async () => {
    attempts++;
    throw new Error("synthetic failure for DLQ verification");
  }, { retryLimit: 1, retryDelaySeconds: 1, retryBackoff: false });
  await enqueue("verify.fail", {});
  for (let i = 0; i < 40 && attempts < 2; i++) await sleep(500);
  assert(attempts === 2, `failing job retried (attempts=${attempts}, expected 2 = first + 1 retry)`);

  // give dead-letter propagation a moment
  let dlqSeen = false;
  for (let i = 0; i < 30 && !dlqSeen; i++) {
    await sleep(500);
    const stats = await jobStats();
    dlqSeen = !!stats.queues?.some((q) => q.name === "verify.fail.dlq");
  }
  const stats = await jobStats();
  assert(stats.available, "jobStats reads jobs schema");
  assert(dlqSeen, `exhausted job landed in verify.fail.dlq (queues=${JSON.stringify(stats.queues)})`);

  // 3. cron scheduling (L-007 contract)
  await registerJob("verify.cron", async () => {});
  await scheduleJob("verify.cron", "0 6 * * *", "America/New_York", "6:00 AM Eastern daily");
  const boss = await startJobs();
  const schedules = await boss.getSchedules();
  const cronJob = schedules.find((s) => s.name === "verify.cron");
  assert(cronJob?.cron === "0 6 * * *", "cron expression stored as wall-clock");
  assert((cronJob?.options as any)?.tz === "America/New_York", "timezone stored alongside expression (L-007)");

  console.log(process.exitCode ? "RESULT: FAILURES PRESENT" : "RESULT: ALL PASS");
  await stopJobs();
  process.exit(process.exitCode ?? 0);
}

main().catch(async (e) => {
  console.error("verify crashed:", e);
  await stopJobs();
  process.exit(1);
});
