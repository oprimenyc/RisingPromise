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

## Remaining M1 work (explicitly NOT done — no hidden stubs)
1. **Auth broker (unified login)**: Google OIDC needs `GOOGLE_OAUTH_CLIENT_ID/SECRET` from the owner's Cloud console. The identity model and `linkIdentity` are ready; session issuance against `core_persons` is the next build once credentials exist.
2. **Monorepo consolidation**: `rpcourses` is still a nested repo/DB. Merge plan: move under `apps/lms`, point at the shared cluster, map `users` → `core_persons` via `identities(provider='replit')`, emit `StudentEnrolled`/`CourseCompleted` events.
3. **Business-logic rewiring through providers**: ✅ DONE 2026-07-11 (branch `mission/m1-provider-rewiring`). `server/providers/payments.ts` (payments.checkout/webhooks capability wrapping Stripe; vendor-neutral `CheckoutCompleted` webhook event) and `server/providers/mail.ts` (mail.transactional wrapping Resend). `routes.ts` and `email.ts` now depend only on capability interfaces — vendor SDK imports exist solely under `server/providers/` (grep-verified). Runtime proof: (a) configured boot → registry `{verified:7, failed:1, unconfigured:9, manual:1}`; stripe probe verified live (HTTP 200); newsletter route exercised end-to-end (person + `NewsletterSubscribed`/`PersonCreated` events `processed`, attempts=0); (b) keyless boot → `[boot] payments.checkout unconfigured — donation/raffle checkout DISABLED` warning and checkout endpoint fails closed with `{"error":"Payments capability is not configured."}`; registry `{verified:6, unconfigured:11}` matching the M1 baseline. **Finding:** the local `RESEND_API_KEY` is invalid (Resend API: "API key is invalid", HTTP 400) — honest `failed` probe status; owner must rotate the key before transactional email works. Webhook path typecheck-verified only (no live Stripe event fired — external action, DL-009 fail closed).
4. **Durable job queue**: events are durable; the dispatcher/verification scheduler are in-process intervals. pg-boss (or equivalent) replaces them when jobs beyond dispatch/verification exist.
5. **LMS event emission + AI-spend surfacing in the unified observability endpoint** (follows consolidation).

## Deploy steps for production
`npm run db:push` against production DB (adds 11 core tables; purely additive), then normal deploy. No behavior change for site visitors; new endpoints are additive.
