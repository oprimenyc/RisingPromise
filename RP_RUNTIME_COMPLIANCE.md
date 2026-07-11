# RP_RUNTIME_COMPLIANCE — VERIDIAN Architecture Compliance Assessment

Doctrine: runtime is the proof; everything else is a claim. Scored against the current repo.

## Compliance scorecard

| Requirement | Status | Evidence / violation |
|---|---|---|
| Provider abstraction | ❌ VIOLATED | Stripe SDK in `server/routes.ts`; Resend in `server/email.ts`; OpenAI constructed inside `rpcourses/server/storage.ts` (a *storage* module calling an AI vendor is also a layering violation); Replit OIDC hardwired in `replitAuth.ts` |
| Capability registry | ❌ ABSENT | No registry; docs claim capabilities runtime lacks (LMS Stripe payments = stub; admin RBAC = nonexistent) — precisely the failure the registry exists to expose |
| Feature registry / flags | ⚠️ PARTIAL | `featureTogglesSchema` (raffleActive etc.) is a real typed flag system for site content; nothing equivalent server-side |
| Event bus | ❌ ABSENT | All effects are inline calls (webhook → storage → email in one function) |
| Observability | ⚠️ PARTIAL | Request logging exists (`server/index.ts`) but logs response bodies (PII leak vector) and truncates at 80 chars (useless for diagnosis — fails §1 twice); LMS has structured error handlers (best code in repo); no alerting, no health endpoints |
| Decision ledger | ❌ ABSENT | — |
| Knowledge graph | ❌ ABSENT | — |
| Policy engine | ❌ ABSENT | Approval logic nonexistent; admin = shared password |
| Job queues | ❌ ABSENT | node-cron in-process only (`automationService.ts`): jobs die with the process, no retry, no terminal status — violates Constitution §1 ("ran and produced nothing is a failure"); L-007 timezone audit required on existing expressions |
| Runtime verification | ❌ ABSENT | No self-tests; the unauthenticated-route probe (L-003 checklist) would have caught the `/api/admin/bulk-import` hole |
| Health monitoring | ❌ ABSENT | No /health, no uptime checks |
| Dependency graph | ❌ ABSENT | Two package.json trees; App A carries ghost deps (passport, express-session, connect-pg-simple, memorystore installed-unused — L-001 audit blind spot) |
| Audit logging | ⚠️ MINIMAL | `email_log` table (LMS) is genuine audit logging; nothing else — no record of who changed enrollments, imported users, or viewed PII |
| Configuration management | ⚠️ PARTIAL | `siteConfigSchema` is exemplary typed config; server env vars unvalidated at boot (Stripe silently null → runtime 500s = silent degradation) |
| Secrets management | ⚠️ PARTIAL | Secrets in env (correct), but `ADMIN_PASSWORD` compared plaintext/timing-unsafe; no rotation story; no boot-time completeness check |

**Net: 0 fully compliant, 5 partial, 10 absent/violated.**

## Remediation order (why this order)

1. **Route auth wrapper + unauthenticated self-test** — closes live security holes; cheapest highest-severity fix.
2. **Boot-time config validation** — kills the silent-null-provider class of failure everywhere at once.
3. **Event outbox + audit consumer** — one mechanism unlocks audit logging, decision ledger, and graph projection later; build before more features multiply inline side-effects.
4. **Job queue (pg-boss)** — port the LMS cron jobs; every job gets terminal status.
5. **Capability registry + health probes + /health** — makes claim-vs-runtime drift visible permanently.
6. **Provider extraction** — mechanical once interfaces exist; do it as each domain is touched rather than big-bang.
7. Policy engine + decision ledger — required before AI departments go live, not before.

## Standing verification jobs (the platform tests itself)

- Nightly: unauthenticated probe of every route (expect 401/403 unless `public(reason)`).
- Nightly: env-vs-manifest dependency diff (L-001) + advisory version check (L-002).
- Hourly: provider health probes → capability status flips + alert on degrade.
- Weekly: cron-expression audit — expression wall-clock == commented intended local time (L-007).
- Per-deploy: smoke test exercising one real request per API consumer (L-008 — after auth changes, every client is re-verified).
