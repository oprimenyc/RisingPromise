# RP_M1_CONSOLIDATION_PLAN — rpcourses → monorepo (M1 §2 remainder)

Pre-flight facts verified 2026-07-11 (post provider-rewiring, branch `mission/m1-provider-rewiring`). Written so the executing session starts from evidence, not rediscovery.

## Verified current state
- `rpcourses/` is a **nested git repo** inside RisingPromise (untracked by the parent), clean tree, HEAD `e24276f` "M0 security hardening: RBAC, AI usage controls, remove simulated payments".
- Own `package.json` (scripts: `dev` = tsx server/index.ts, `db:push` = drizzle-kit push), own `node_modules`, own Vite client, own Drizzle schema.
- LMS schema tables (`rpcourses/shared/schema.ts`): `users`, `courses`, `modules`, `enrollments`, `user_progress`, `study_sessions`, `email_log`, `email_templates`, `system_settings`, `wioa_reports`.
- Auth: Replit OIDC (`server/replitAuth.ts`, passport/openid). Site-side `linkIdentity(provider='replit')` in `server/core/identity.ts` is ready for exactly this (RP_M1_VERIFICATION §identity).
- Site core spine tables live in `shared/coreSchema.ts` (11 `core_*` tables) — additive, already push-verified.

## Execution order (each step independently committable)
1. **Workspace layout**: add npm workspaces to root `package.json`; move `rpcourses` → `apps/lms` (`git rm --cached` nothing needed in parent since untracked; preserve the nested repo's history by keeping its `.git` OR absorb via `git add` after removing nested `.git` — founder preference not required, absorbing is standard; the nested history remains in the old folder's git pack if kept aside). Keep the LMS running standalone throughout.
2. **One Postgres cluster, schema-per-domain**: LMS tables move to schema `lms` (Drizzle `pgSchema("lms")`); site/core stay in `public`. Locally provable with a throwaway cluster (initdb in scratchpad, `db:push` both apps — pattern used for MQ-007 proof). Production push is an owner deploy step.
3. **Identity mapping**: on LMS login/user-upsert, call `ensurePerson(email)` + `linkIdentity(personId,'replit',sub)`. L-008: re-verify every client flow after touching auth.
4. **Event emission**: LMS emits `StudentEnrolled` / `CourseCompleted` through the shared outbox (`server/core/events.ts`) — these are the evidence events the M3 Grant OS consumes.
5. **Unified observability**: surface LMS `/api/admin/ai-spend` in site `/api/admin/observability`.

## Constraints
- Feature branch only (`mission/m1-consolidation`); merges via VERIDIAN MERGE_QUEUE (DL-009).
- `.env` DATABASE_URL points at **Railway production** — never run db:push/dev against it autonomously; use a throwaway local cluster.
- RESEND_API_KEY is invalid (VERIDIAN CONFLICTS C-008) — email side effects will warn/fail until the owner rotates it; not a consolidation blocker.
- No code copying between repos: after consolidation these are one workspace, so the LMS imports core modules directly.
