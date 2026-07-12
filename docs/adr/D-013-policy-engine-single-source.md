# D-013 — Policy Engine is single source of authorization + eligibility; deny-by-default

**Date:** 2026-07-12  
**Area:** Security  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

`server/core/policy.ts` is the single source of authorization and eligibility logic for the entire platform. Rules are versioned code-as-config (a static array, not a database); unknown actions are denied. No other module may duplicate permission logic.

Policies shipped in M1:
- POL-001: `lms.admin` → admin only
- POL-002: `lms.staff` → admin or staff
- POL-003: `lms.instruct` → admin, staff, or instructor
- POL-004: `platform.observability.read` → admin only
- POL-005: `grants.submit` → requires ED approval note
- POL-006: `communications.external.send` → requires approval (AI departments prerequisite)
- POL-007: `identity.merge` → admin role + approval note
- POL-101: CNA eligibility (age, residency, enrollment status)
- POL-102: IT eligibility (age, residency, enrollment status)

The LMS RBAC middleware (`apps/lms/server/rbac.ts`) delegates entirely to `authorize()` — it contains no logic of its own.

## Context

Duplicate permission logic is how nonprofits accumulate shadow security holes: one check in the LMS, a different check in the site, a third check in the notification system. AI departments (M6) have the hard requirement that agents draft and humans approve anything external, financial, or person-affecting — this requires machine-readable approval gates at the policy layer before the AI layer is built.

## Consequences

- Adding or changing a permission requires editing exactly one file.
- Approval-gated actions (`grants.submit`, `communications.external.send`, `identity.merge`) will integrate cleanly with the future AI departments approval flow.
- The deny-by-default posture means new code paths fail closed until a policy is explicitly added.
- LMS RBAC is now re-verified on every policy change (L-008 constraint).
- Versioned policies make it auditable which rule version allowed or denied a given action.

## Alternatives considered

- Database-driven policy rules: dynamic and operator-editable, but harder to audit, test, and review in PRs.
- Per-route middleware: the existing M0 approach; inevitably diverges across apps.
