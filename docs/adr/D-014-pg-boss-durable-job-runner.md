# D-014 — pg-boss as durable job runner; in-process dispatcher retained with recovery sweep

**Date:** 2026-07-12  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

`pg-boss` (Postgres schema `jobs`) is the durable job runner for background work: retries, per-queue dead-letter queues (`<name>.dlq`), cron with wall-clock local time + timezone + intended-time logging (L-007 compliance), and terminal `SUCCESS`/`FAILED` status per run.

The in-process 3-second event dispatcher (from D-009) is **retained** for low-latency event fan-out. Durability for the dispatcher comes from the outbox rows surviving crashes plus a `events.sweep` recovery job (registered with pg-boss, runs every minute) that re-enqueues unprocessed events.

LMS automations were ported off `node-cron` (package removed) to pg-boss scheduled jobs.

## Context

Constitution §1 (D-006 family): jobs must survive restarts with observable terminal status — a cron that silently disappears on redeploy is a compliance event for a WIOA-funded program. `pg-boss` runs in the same Postgres cluster (no new infrastructure), has native DLQ support, and survives process restarts.

The event dispatcher stays in-process (not queued through pg-boss) because latency matters for the event→notification→task chain; 3 seconds is already within acceptable bounds for participant-facing notifications. The outbox ensures nothing is lost on crash.

L-007 rule: cron expressions must be wall-clock local time + a `timezone` option. Never pre-convert to UTC (pre-conversion breaks on DST changes). The `scheduleJob` wrapper enforces this contract and logs the human-readable intended time for auditability.

## Consequences

- Jobs survive restarts; DLQ makes failures visible in Mission Control.
- The `events.sweep` job means a process crash cannot silently lose events (at-least-once delivery with the outbox).
- All scheduled work obeys L-007: times are stated in their natural timezone, never silently shifted.
- Per-queue DLQ allows operators to inspect and replay specific failed job types without affecting others.

## Alternatives considered

- Bull/BullMQ (Redis-backed): correct, but requires a Redis cluster — adds operational cost.
- pg-boss + replace in-process dispatcher: correct but adds latency to the event→notification chain with no benefit; the outbox already provides durability.
- Keep node-cron: crons die silently on restart with no observability; explicitly unsuitable for compliance-adjacent scheduled tasks.
