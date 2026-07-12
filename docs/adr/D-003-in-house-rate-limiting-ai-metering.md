# D-003 — In-house rate limiter and AI metering (no new deps)

**Date:** 2026-07-11  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Implement per-user rate limiting and daily AI spend capping with in-process in-memory data structures rather than introducing new infrastructure dependencies (Redis, etc.).

## Context

OpenAI endpoints were unmetered and unprotected. A fix was needed immediately but adding new infrastructure (Redis, external rate-limit service) was out of scope for an M0 hotfix.

## Consequences

- Rate limit and spend state resets on process restart — documented limitation.
- No new runtime dependencies.
- Durable versions shipped in M1: AI spend now persisted in `lms.system_settings` (D-014, aiGuard.ts), job queue retries survive restarts.
- The in-memory limiter remains in production for its intended scope (per-request burst protection); persistence is additive, not a replacement.

## Alternatives considered

- Redis-backed rate limit: correct long-term but requires new infrastructure provisioning.
- External API gateway rate limiting: future option, not zero-cost to configure.
