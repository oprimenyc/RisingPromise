# D-009 — M1 core spine: event outbox, DB-backed registries, runtime verification engine

**Date:** 2026-07-11  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

The M1 core spine is built on four primitives:
1. **Event outbox** — durable Postgres-backed outbox (`core_events`) with an in-process 3-second dispatcher. At-least-once delivery. Dead-letter visibility. Events are the single mechanism feeding audit, knowledge graph projection, and workflow/notification automation.
2. **DB-backed capability and feature registries** — `core_capabilities` and `core_features` record runtime probe results (not configuration assertions). Provider statuses come from executed probes, never from env-var presence alone.
3. **Runtime verification engine** — runs at boot and every 15 minutes. Every provider's status is the output of a live probe against the real vendor API. "Runtime is the proof" (VERIDIAN doctrine).
4. **DB decision ledger** — `core_decisions`, seeded with all platform decisions, emits `DecisionRecorded` events.

## Context

The M0 spine was correct-enough for emergency fixes but had no shared identity, no cross-system events, no honest provider status, and no durable audit trail. M1 establishes the infrastructure every later milestone depends on (identity → events → jobs → compliance → grants).

## Consequences

- Every future capability (grants evidence, donor stewardship, AI departments) can be built by emitting and consuming events — no new infrastructure primitives needed.
- Provider status is always accurate — no provider can claim healthy status without a live probe passing.
- The knowledge graph derives from events, so it is always consistent with what actually happened.
- The dispatcher is in-process (3s latency) for simplicity; durability comes from outbox rows surviving crashes + a sweep job (D-014).

## Alternatives considered

- External message broker (Kafka, RabbitMQ): correct at scale, operationally complex for a sub-10-person org; the outbox pattern gives equivalent guarantees on a single Postgres cluster.
- Polling-only (no event outbox): simpler but loses the cross-system fan-out and audit trail.
