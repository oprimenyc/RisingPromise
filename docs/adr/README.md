# Architecture Decision Records — Rising Promise Platform

ADRs document significant decisions made during platform development. Each record is immutable once accepted; superseded decisions remain in the index with a link to the superseding ADR.

**Source of truth for accepted decisions:** `server/core/decisions.ts` (DB-backed ledger, seeded at boot). ADR files here are the human-readable expansions.

**Status vocabulary:** `accepted` · `superseded` · `deprecated` · `deferred`

---

## Index

| ID | Title | Area | Status | Milestone |
|----|-------|------|--------|-----------|
| [D-001](D-001-lms-rbac-enum-role.md) | LMS RBAC via enum role, server-side per-request check | Security | accepted | M0 |
| [D-002](D-002-site-admin-hashed-password.md) | Site admin auth: SHA-256 + rate limit, exec bible behind auth | Security | accepted | M0 |
| [D-003](D-003-in-house-rate-limiting-ai-metering.md) | In-house rate limiter and AI metering (no new deps) | Architecture | accepted | M0 |
| [D-004](D-004-remove-simulated-payments.md) | Remove simulated payment path entirely | Compliance | accepted | M0 |
| [D-005](D-005-db-driver-selectable-by-hostname.md) | DB driver selectable by hostname (node-postgres / Neon) | Architecture | accepted | M0 |
| [D-006](D-006-raffle-compliance-irs-receipt.md) | Crypto-random raffle codes, IRS receipt language, no body logging | Compliance | accepted | M0 |
| [D-007](D-007-lms-stays-nested-repo-through-m0.md) | LMS stays a nested git repo through M0 | Migration | superseded | M0 |
| [D-008](D-008-program-types-one-spine.md) | V.I.A. / N.O.B.L.E. / Workforce are independent program types on shared infrastructure | Architecture | accepted | M1 |
| [D-009](D-009-m1-core-spine-event-driven.md) | M1 core spine: event outbox, DB-backed registries, runtime verification engine | Architecture | accepted | M1 |
| [D-010](D-010-monorepo-apps-lms-schema-per-domain.md) | rpcourses → apps/lms workspace; tables in schema `lms`; drizzle schemaFilter mandatory | Migration | accepted | M1 |
| [D-011](D-011-six-state-provider-lifecycle.md) | Six-state provider lifecycle with degraded grace and operator kill-switch | Provider | accepted | M1 |
| [D-012](D-012-unified-auth-broker-oidc-tombstone.md) | Unified auth broker: OIDC over plain fetch, DB sessions, tombstone merge | Architecture | accepted | M1 |
| [D-013](D-013-policy-engine-single-source.md) | Policy Engine is single source of authorization + eligibility; deny-by-default | Security | accepted | M1 |
| [D-014](D-014-pg-boss-durable-job-runner.md) | pg-boss as durable job runner; in-process dispatcher retained with recovery sweep | Architecture | accepted | M1 |
| [D-015](D-015-generic-workflow-engine-notification-framework.md) | Generic workflow engine + notification framework; programs are configuration not code | Architecture | accepted | M1 |

> D-007 is superseded by D-010 (monorepo consolidation completed in M1).

---

## How to add a new ADR

1. Pick the next `D-NNN` ID from `server/core/decisions.ts`.
2. Copy the template below to `docs/adr/D-NNN-short-slug.md`.
3. Add a seed entry in `M0_ENTRIES` (or a `recordDecision()` call) in `decisions.ts`.
4. Add a row to the index above.

### Template

```markdown
# D-NNN — Title

**Date:** YYYY-MM-DD  
**Area:** architecture | security | provider | migration | compliance  
**Status:** accepted  
**Actor:** Name (Milestone)  
**Milestone:** MN  

## Decision

One paragraph.

## Context

Why was this decision necessary? What constraints existed?

## Consequences

- What becomes easier
- What becomes harder or is now constrained
- Any follow-up work required

## Alternatives considered

Brief notes on rejected options.
```
