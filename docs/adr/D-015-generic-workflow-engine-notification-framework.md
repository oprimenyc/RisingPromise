# D-015 — Generic workflow engine + notification framework; programs are configuration not code

**Date:** 2026-07-12  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

**Workflow engine:** A single generic executor (`server/core/workflow.ts`) runs state machines defined in a static config array (`workflowDefinitions`). Each definition specifies states, transitions, policy gates, and approval-note requirements. The executor is program-agnostic. Definitions shipped in M1: `student.intake`, `volunteer.onboarding`, `grant.pipeline`, `donor.stewardship`, `parent.engagement`, `sponsor.partnership`, `housing.residency`.

V.I.A. and N.O.B.L.E. workflow definitions are **deliberately absent** (per D-008: prepare, do not implement until programs operate).

**Notification framework:** `server/core/notifications.ts` routes notifications to channels (`email`, `sms`, `internal`, `task`, `calendar`) resolved to capabilities at delivery time via the durable queue. When a channel's provider is absent, the notification is recorded with status `unavailable` and a reason — it is never silently dropped.

## Context

The owner directive states programs must be configuration-driven, never hardcoded. Without a generic workflow engine, each new program type (housing, volunteers, donors) would require bespoke state-machine code with duplicated policy and approval logic. The notification framework enforces the same principle for communications: no provider should fail silently, and channel routing should not be scattered across feature code.

The grant pipeline workflow carries a policy gate (`policyAction: "grants.submit"`) on the submit transition — this is the structural prerequisite for the M6 AI departments grant-writing agent, which must draft and route submissions for human approval before they leave the platform.

## Consequences

- New program workflows are added by extending the config array; the executor, persistence, and policy evaluation are unchanged.
- Approval gates in the grant pipeline are enforced structurally, not by convention.
- `ApplicationSubmitted` events automatically open a `student.intake` workflow instance (idempotent).
- Missing notification providers are visible in Mission Control — the ops team sees `unavailable` with a reason rather than silently dropped work.
- Calendar channel is activation-ready (stub) pending the `RP_GOOGLE_PROVIDER` module.

## Alternatives considered

- Per-program workflow modules: duplicates the executor and makes policy gates per-module — exactly the fragmentation this platform is designed to eliminate.
- External BPM engine (Camunda, Temporal): correct at scale; single Postgres table is sufficient for the current program volume and keeps the dependency surface minimal.
- Fire-and-forget notifications: violates the requirement that missing providers be visible; `unavailable` status is the correct behavior.
