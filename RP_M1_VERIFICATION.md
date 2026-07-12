# RP_M1_VERIFICATION — Core Spine Runtime Verification (in progress)

Date: 2026-07-11. Runtime evidence from local Postgres 18 (:5599, db `rp_site`) and the site server on :5000. Runtime is the proof.

## Delivered and runtime-verified this pass

### Schema (`shared/coreSchema.ts`, 11 tables pushed and confirmed via `\dt`)
`core_persons`, `core_identities`, `core_person_roles`, `core_programs`, `core_program_participations`, `core_events`, `core_decisions`, `core_capabilities`, `core_features`, `core_graph_nodes`, `core_graph_edges`.

### Unified identity (`server/core/identity.ts`)
- `ensurePerson` (race-safe email dedupe), `linkIdentity` (for LMS OIDC subjects), `grantRole`, `ensureParticipation` (fails loudly on unknown program).
- **Verified end-to-end:** newsletter signup and CNA application each created a `core_persons` row + `email` identity; the application created a `cna` participation with role `applicant` (SQL output in session log).

### Program boundaries (D-008, seeded and verified)
V.I.A. (school) / N.O.B.L.E. (community, planned) / Workforce Development (umbrella) with CompTIA and CNA as children (`PART_OF` edges confirmed in graph query), plus Housing (planned). Independent program types on shared infrastructure — the site's `programType: "it"` maps to `comptia` under `workforce`.

### Event bus (`server/core/events.ts`)
Durable outbox rows, 3s dispatcher, at-least-once delivery, attempts/lastError on failure, dead-letter visibility. **Verified:** 4 events (PersonCreated ×2, NewsletterSubscribed, ApplicationSubmitted) all `processed=t, attempts=0`.

### Knowledge graph (`server/core/graph.ts`)
Projected from events only. **Verified:** `GET /api/admin/graph/program/cna` returned the CNA node with `PART_OF → workforce` and `APPLIED_TO` edge from the test applicant; person nodes carry `sensitivity: restricted` and are excluded from non-admin reads by the query layer.

### Capability registry + runtime verification engine (`server/core/registry.ts`, `server/providers/index.ts`)
13 providers + 5 platform capabilities, all probed at boot and every 15 min, results persisted with evidence + timestamp. **Verified result: `{verified: 6, failed: 0, unconfigured: 11, manual: 1}`** —
- verified: `core.database`, `core.event-bus`, `core.decision-ledger`, `core.graph`, `core.programs`, and **grantsgov** (live credential-free HTTP probe against the real Grants.gov search API)
- unconfigured (honest, never fake success): stripe, resend, brevo, givebutter, paypal, samgov, candid, guidestar, cloudflare, google, microsoft — each listing exactly which env keys are missing
- manual: techsoup (no public API; procurement channel)

### Feature registry
5 features (donations, raffle, applications, newsletter, observability) with capability/permission dependencies; `healthy` derived from live capability statuses each verification run.

### Decision ledger (`server/core/decisions.ts`)
DB-backed, seeded D-001…D-009; `core.decision-ledger` probe asserts seed completeness. `recordDecision` emits `DecisionRecorded` events.

### Observability (M1 §8)
- `GET /api/health` (public, coarse): observed `{"ok":true,"capabilities":{"unconfigured":11,"verified":6,"manual":1},"eventQueue":{"pending":0,"deadLettered":0,"total":0}}`; returns 503 if anything failed/dead-lettered.
- `GET /api/admin/observability` (admin): full capabilities with evidence, features, queue stats, graph stats, recent decisions — observed working.
- `POST /api/admin/verify` (admin): on-demand verification run.
- OpenAI spend lives in the LMS at `GET /api/admin/ai-spend` (M0). Grant-deadline panes intentionally absent — grants schema is M3; no placeholder panes.

### Type/build
Site `tsc` exit 0; `npm run build` OK (71.8kb server bundle). LMS unchanged this pass (still green from M0).

## 2026-07-12 pass — M1 completion (branch `mission/m1-consolidation`)
All runtime evidence from a throwaway local Postgres 18 (:5599, fresh `rp_site`); site on :5000, LMS on :5100. Production untouched (read-only check confirmed only the original 4 site tables exist there).

### §2 Monorepo consolidation — ✅ VERIFIED
`rpcourses` → `apps/lms` npm workspace (deps hoisted/deduped; LMS git history preserved at `../rpcourses-git-history-backup`). LMS Drizzle tables in Postgres schema `lms` on the shared cluster; site/core in `public` (16 + 11 tables confirmed via `\dt`). **Critical finding:** without `schemaFilter: ["lms"]` in the LMS drizzle config, `drizzle-kit push` DROPS every public-schema table — proven destructively on the throwaway cluster; the config now carries the guard + warning. LMS login and `createEnrollment` map users into `core_persons` + `identities(provider='replit')`; derived course completion stamps `enrollment.completionDate` once; `StudentEnrolled`/`CourseCompleted` emitted through the shared outbox and projected into the graph. `consolidation.verify.ts`: 10/10 PASS.

### Provider runtime framework — ✅ VERIFIED
Six-state lifecycle (`disabled`/`development`/`configured`/`verified`/`degraded`/`failed`) for all 13 providers incl. the 11 mission providers. `PROVIDERS_DISABLED` kill-switch honored by capability wrappers; degraded = slow probe or first failure after healthy; second consecutive failure = failed; recovery resets. `providers.verify.ts`: 22/22 PASS incl. live grants.gov probe. Boot registry: `{development:11, verified:6, configured:1}` (keyless baseline).

### Unified Identity Broker — ✅ VERIFIED (Google creds = owner activation step)
`core/authBroker.ts`: Google OIDC code flow (no vendor SDK), CSRF state, DB-backed revocable `core_sessions`; activation-ready — `/api/auth/google` returns 503 naming the missing keys; `/api/auth/me` 401 unauthenticated (observed). Account linking: sub match → person; verified-email match → link; else create. `identityMerge.ts`: tombstone merge (`persons.merged_into`), identities/roles/participations move, live sessions resolve through the tombstone. `migrateLmsUsers.ts` backfill (idempotent; refuses non-local DB without `MIGRATE_CONFIRM=yes`). `identity.verify.ts`: 19/19 PASS.

### Policy Engine — ✅ VERIFIED
`core/policy.ts`: deny-by-default versioned rules (9 policies) for authorization, eligibility (CNA/IT intake), and approval gates (grants.submit ED sign-off; external comms; identity.merge). LMS RBAC middleware delegates entirely to it; application intake evaluates eligibility into the `ApplicationSubmitted` event. `policy.verify.ts` 18/18 PASS; LMS `rbac.verify.ts` re-run ALL PASS (L-008).

### Durable job queue — ✅ VERIFIED
pg-boss (schema `jobs`): retries, per-queue DLQ, cron with wall-clock + timezone + intended-time logging (L-007), terminal SUCCESS/FAILED per run. Site: `platform.verify` (*/15) + `events.sweep` recovery (every minute); LMS automations ported off node-cron (dep removed): inactivity 9AM ET, milestones hourly, welcome */30. `jobs.verify.ts` ALL PASS (retry → DLQ observed live).

### Workflow Engine — ✅ VERIFIED
One generic executor + `core_workflow_instances` (append-only history). Definitions: student.intake, volunteer.onboarding, grant.pipeline (submit transition policy-gated with required approval note), donor.stewardship, parent.engagement, sponsor.partnership, housing.residency. V.I.A./N.O.B.L.E. deliberately absent (prepare-only per owner directive). `ApplicationSubmitted` auto-opens intake (idempotent). `workflow.verify.ts`: 16/16 PASS.

### Notification Framework — ✅ VERIFIED
`core_notifications` + channels email/sms/internal/task/calendar resolved to capabilities at delivery time on the durable queue. Missing providers → status `unavailable` with reason (observed for email/sms/calendar keyless) — never silent, never faked. Application events raise deduped review tasks. Admin endpoints: list + task complete. `notifications.verify.ts`: 11/11 PASS.

### Mission Control — ✅ VERIFIED
`GET /api/admin/mission-control`: runtime verification counts, per-provider health, capabilities/features, event queue, jobs + DLQ, notifications, workflow counts, security posture (admin auth, broker state, payments fail-closed), graph stats, AI spend, decisions, policies, and an honest healthy/attention rollup — observed correctly flagging unconfigured payment/mail features and a synthetic DLQ row from verification.

### Knowledge Graph — ✅ VERIFIED
New projections: volunteers, sponsors, grants, background checks (restricted, reference-only), person merges, workflow instances (state on node), decisions; `projectPlatform()` projects providers/capabilities (DEPENDS_ON)/features (REQUIRES)/policies at boot. Restricted-node exclusion re-verified. `graph.verify.ts`: 17/17 PASS (58 nodes / 32 edges on the verification dataset).

### Ledger & registries
Decision ledger seeded D-001…D-015 (probe now asserts ≥15). Capability registry persists six-state statuses with evidence + consecutive-failure counts. AI spend durable in `lms.system_settings`, surfaced in observability + mission control.

### Type/build (final sweep, fresh DB)
Site `tsc` 0 / build OK; LMS `tsc` 0 / build OK; all 10 verification suites ALL PASS (providers, policy, identity, workflow, jobs, notifications, graph, consolidation, rbac, aiGuard).

## Remaining work (explicitly NOT done — no hidden stubs)
1. **OIDC activation** — owner supplies `GOOGLE_OAUTH_CLIENT_ID/SECRET`; broker + linking already runtime-verified. BLOCKED on external credential.
2. **Provider credentials** — stripe/resend/brevo/givebutter/paypal/samgov/candid/cloudflare/microsoft/google remain `development` (activation-ready, missing keys named) until owner supplies keys. `RESEND_API_KEY` in `.env` is invalid (2026-07-11 finding) — rotate before transactional email works.
3. **SMS provider** — Twilio delivery path implemented; needs `TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER`.
4. **Calendar channel** — activation-ready stub pending the Google provider module (RP_GOOGLE_PROVIDER); requests are recorded `unavailable`, never dropped.
5. **LMS session-auth migration off Replit OIDC** — broker is ready; the cutover (LMS consuming `core_sessions`) is deliberately sequenced after Google creds exist so students aren't stranded between IdPs.

## Deploy steps for production (owner)
1. `npm run db:push` at repo root (adds core tables incl. sessions/workflows/notifications; additive).
2. `cd apps/lms && npm run db:push` — **only with the committed `schemaFilter: ["lms"]` config** (creates the `lms` schema; without the filter it would drop public tables).
3. One-time: `MIGRATE_CONFIRM=yes npx tsx server/core/migrateLmsUsers.ts` to backfill LMS users into core identity.
4. Migrate LMS data from the old Replit DB into the `lms` schema (pg_dump/restore) before pointing the LMS at the shared cluster.
5. Set `GOOGLE_OAUTH_CLIENT_ID/SECRET` when ready to activate unified login; rotate `RESEND_API_KEY`.
