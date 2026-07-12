# D-001 — LMS RBAC via enum role, server-side per-request check

**Date:** 2026-07-11  
**Area:** Security  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Add a `role` enum column to the LMS `users` table (values: `student`, `staff`, `admin`). Every `/api/admin/*` route enforces role at request time via a server-side check. Roles are never settable through OIDC upsert or bulk import. The first admin user is bootstrapped via `ADMIN_BOOTSTRAP_EMAILS`.

## Context

The LMS `/api/admin/*` routes had no authentication, exposing student PII to unauthenticated callers. This was the highest-severity M0 finding. The fix needed to be minimal, correct, and shippable the same day — not a full identity overhaul (that is M1).

## Consequences

- Unauthenticated admin access closed immediately.
- Revocation is immediate — role check happens on every request, not at token issue.
- Role escalation via OIDC or import is structurally prevented.
- In M1 the LMS RBAC middleware was rewritten to delegate to the Policy Engine (D-013); enum roles remain the storage layer but authorization logic no longer lives in the middleware.

## Alternatives considered

- Session-based full auth: correct long-term solution but too large scope for M0 hotfix.
- Token in a header: obscurity, not authentication.
