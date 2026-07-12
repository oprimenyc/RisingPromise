/**
 * Durable job queue (M1 §4, D6) on pg-boss over the shared Postgres cluster
 * (schema "jobs" — no new infrastructure). Replaces in-process node-cron:
 * jobs survive restarts, retry with backoff, land in a per-queue dead-letter
 * queue when retries exhaust, and every run emits a terminal SUCCESS/FAILED
 * log line (Constitution §1: "ran and produced nothing" is a failure).
 *
 * Cron rule (LESSONS L-007): expressions are written in LOCAL WALL-CLOCK time
 * and the timezone is passed alongside — never pre-converted to UTC. Every
 * schedule call requires the intended local fire time as a string; it is
 * logged so drift between intent and expression is reviewable.
 */
import { PgBoss, type Job } from "pg-boss";
import { db } from "../db";
import { sql } from "drizzle-orm";

let boss: PgBoss | null = null;

export async function startJobs(): Promise<PgBoss> {
  if (boss) return boss;
  if (!process.env.DATABASE_URL) throw new Error("[jobs] DATABASE_URL required");
  boss = new PgBoss({ connectionString: process.env.DATABASE_URL, schema: "jobs" });
  boss.on("error", (error: unknown) => console.error("[jobs] pg-boss error:", error));
  await boss.start();
  console.log("[jobs] pg-boss started (schema=jobs)");
  return boss;
}

export async function stopJobs(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
  }
}

export interface JobOptions {
  retryLimit?: number; // attempts after the first failure
  retryDelaySeconds?: number;
  retryBackoff?: boolean;
}

/**
 * Register a worker for a named queue with retries and a dead-letter queue
 * (`<name>.dlq`). Terminal status is always logged.
 */
export async function registerJob<T extends object>(
  name: string,
  handler: (data: T) => Promise<void>,
  opts: JobOptions = {}
): Promise<void> {
  const b = await startJobs();
  const dlq = `${name}.dlq`;
  await b.createQueue(dlq).catch(() => {}); // exists already — fine
  await b
    .createQueue(name, {
      retryLimit: opts.retryLimit ?? 3,
      retryDelay: opts.retryDelaySeconds ?? 60,
      retryBackoff: opts.retryBackoff ?? true,
      deadLetter: dlq,
    })
    .catch(async () => {
      // queue exists — update its policy so option changes take effect
      await b.updateQueue(name, {
        retryLimit: opts.retryLimit ?? 3,
        retryDelay: opts.retryDelaySeconds ?? 60,
        retryBackoff: opts.retryBackoff ?? true,
        deadLetter: dlq,
      });
    });

  await b.work<T>(name, async ([job]: Job<T>[]) => {
    const started = Date.now();
    try {
      await handler(job.data);
      console.log(`[jobs] SUCCESS ${name}#${job.id} in ${Date.now() - started}ms`);
    } catch (error: any) {
      console.error(`[jobs] FAILED ${name}#${job.id}: ${String(error?.message ?? error)}`);
      throw error; // pg-boss handles retry/dead-letter
    }
  });

  // DLQ watcher: dead-lettered work is loud, never silent.
  await b.work(dlq, async ([job]: Job<object>[]) => {
    console.error(`[jobs] DEAD-LETTER ${name}: job ${job.id} exhausted retries; payload=${JSON.stringify(job.data).slice(0, 500)}`);
    // Leave completed in the DLQ table for the observability endpoint / manual review.
  });
}

/**
 * Cron schedule (L-007 contract): `cronLocal` is wall-clock in `timezone`;
 * `intendedLocalTime` documents intent and is logged next to the expression.
 */
export async function scheduleJob(name: string, cronLocal: string, timezone: string, intendedLocalTime: string): Promise<void> {
  const b = await startJobs();
  await b.schedule(name, cronLocal, {}, { tz: timezone });
  console.log(`[jobs] scheduled ${name}: '${cronLocal}' tz=${timezone} (intended: ${intendedLocalTime})`);
}

/** Enqueue a one-off job. Returns the job id. */
export async function enqueue<T extends object>(name: string, data: T, opts?: { startAfterSeconds?: number }): Promise<string | null> {
  const b = await startJobs();
  return b.send(name, data, opts?.startAfterSeconds ? { startAfter: opts.startAfterSeconds } : {});
}

/** Queue monitoring for observability: counts by queue and state + DLQ depth. */
export async function jobStats(): Promise<{ available: boolean; queues?: Array<{ name: string; state: string; count: number }>; deadLettered?: number; reason?: string }> {
  try {
    const rows: Array<{ name: string; state: string; count: number }> = await db
      .execute(sql`select name, state, count(*)::int as count from jobs.job group by name, state order by name, state`)
      .then((r: any) => r.rows ?? r);
    const deadLettered = rows.filter((r) => r.name.endsWith(".dlq") && (r.state === "created" || r.state === "completed")).reduce((a, r) => a + r.count, 0);
    return { available: true, queues: rows, deadLettered };
  } catch (error: any) {
    return { available: false, reason: `jobs schema unreadable: ${String(error?.message ?? error).slice(0, 200)}` };
  }
}
