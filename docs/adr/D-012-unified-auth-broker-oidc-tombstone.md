# D-012 — Unified auth broker: OIDC over plain fetch, DB sessions, tombstone merge

**Date:** 2026-07-12  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

The unified identity broker (`server/core/authBroker.ts`) implements Google OIDC with:
- Plain `fetch` calls (no OpenID Connect SDK, no Passport strategy) to keep the auth path auditable and dependency-free.
- DB-backed revocable sessions (`core_sessions` table); revocation is immediate and survives restarts.
- Activation-ready posture: `/api/auth/google` returns `503` naming the missing env keys (`GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`) rather than crashing.

Person identity merge uses a **tombstone strategy**: `core_persons.merged_into` is a pointer to the surviving person. Sessions issued for the duplicate person resolve through the tombstone via `resolvePerson()`. History is never rewritten; the duplicate row is preserved.

The LMS user backfill tool (`server/core/migrateLmsUsers.ts`) refuses to run against a non-local database without `MIGRATE_CONFIRM=yes`.

## Context

The platform must support Google OIDC as the unified login without depending on a vendor SDK in the auth path (per the rule: no vendor SDK outside `server/providers/`). Sessions must be revocable independently of the token lifetime. Duplicate person records accumulate naturally (one person signs up via Google, their LMS record exists under a Replit ID) and must be merge-able without destroying history or invalidating live sessions.

## Consequences

- The auth path is ~150 lines of auditable fetch/crypto code with no hidden SDK behavior.
- Session revocation takes effect on the next request — no waiting for token expiry.
- Identity merges are safe to run online; live sessions for the merged-away person keep working.
- Double-merge is explicitly rejected (merge into an already-merged person throws).
- **Activation step required:** Google OAuth credentials must be supplied before the broker goes live; until then, the endpoint honestly returns 503 with the missing-keys list.
- Admin surfaces still use the M0 SHA-256 header auth (D-002); migration onto broker sessions is a follow-on pass.

## Alternatives considered

- `openid-client` / Passport OIDC: correct, but adds SDK vendor lock-in to the most security-sensitive path; plain fetch is more auditable.
- JWT-only sessions (stateless): cannot be individually revoked; unacceptable for a system handling participant PII.
- Soft-delete merge (reassign and delete duplicate): destroys the audit trail; tombstoning is the only history-safe option.
