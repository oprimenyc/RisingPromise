# RP_PLATFORM_AUDIT — Current State Inventory

Date: 2026-07-11. Source: full read of this repository. Everything below was verified in code, not inferred from docs. Where docs (PLATFORM_DOCUMENTATION.md) claim features the code does not implement, that is noted — runtime is the proof.

## 1. The repo actually contains TWO applications

| | App A — Public Site (repo root) | App B — LMS (`rpcourses/`) |
|---|---|---|
| Purpose | Marketing site, donations, raffle, program applications | WIOA CompTIA Tech+ learning platform |
| Stack | Express + Vite/React 18 + Drizzle/Neon Postgres | Same stack, separate package.json / DB / schema |
| Auth | None (admin = shared password) | Replit Auth (OIDC) via `replitAuth.ts` |
| Deploy | Railway (`railway.json`, `nixpacks.toml`) | Replit-origin, deployment target unclear |
| Shared code | **Zero.** No shared identity, DB, email templates, or types | — |

This split is the single most important architectural fact: “Rising Promise” is not one platform today; it is two disconnected Replit-generated apps plus static HTML artifacts.

## 2. App A — Public Site inventory

### Pages (`client/src/pages/`)
- `home.tsx` — full marketing homepage driven by `siteConfig` sections (hero, story, whoWeSee, whatWeDo, impact, team, joinUs)
- `about.tsx`, `programs.tsx`, `program-cna.tsx`, `program-it.tsx`, `program-via.tsx`, `program-housing.tsx`, `via.tsx`
- `raffle.tsx` (public raffle purchase), `adminRaffle.tsx` (password-gated entry list), `not-found.tsx`
- `INTEGRATION_GUIDE.md` sitting inside `pages/` — a manual copy-paste integration doc (evidence pages were generated externally and pasted in)
- Static: `rising_promise_executive_bible_v3.1.html` (untracked), `/execbible` redirect route, `public/`

### API surface (`server/routes.ts`, 361 lines total)
| Route | Auth | Notes |
|---|---|---|
| `POST /api/newsletter/signup` | none | dedupe by email |
| `POST /api/programs/apply` | none | CNA/IT application intake + confirmation email |
| `POST /api/raffle/create-checkout-session` | none | Stripe Checkout, pending raffle entry row |
| `POST /api/donations/create-checkout-session` | none | Stripe Checkout, pending donation row |
| `POST /api/webhooks/stripe` | signature-verified | marks donation succeeded / assigns raffle entry codes (RP-XXXX), sends receipt |
| `POST /api/admin/verify-password` | shared `ADMIN_PASSWORD` | plaintext compare |
| `GET /api/admin/raffle-entries` | `x-admin-password` header | plaintext compare |
| Commented-out admin routes | — | newsletter list, application list/status — disabled pending auth (“TODO: Add authentication”) |

### Database models (`shared/schema.ts`)
`newsletter_signups`, `program_applications` (status workflow pending→reviewed→accepted/rejected exists in schema but no UI/API to drive it), `donations`, `raffle_entries`. Plus a large Zod `siteConfigSchema` — the CMS is a typed config file, not a DB.

### Integrations
- **Stripe** — one-time card checkout only (donations, raffle). No recurring, no Payment Element, no customer objects.
- **Resend** — transactional email (`server/email.ts`): donation receipt, application confirmation, raffle confirmation. Hand-built HTML tables, from `info@risingpromise.org`.
- **Neon Postgres** via `@neondatabase/serverless` + Drizzle; `db:push` migrations only.
- Session packages installed (`express-session`, `passport`, `connect-pg-simple`, `memorystore`) but **unused** — ghost dependencies (cf. LESSONS L-001 pattern).

### Automations / scheduled tasks
None. No cron, no queues, no background jobs.

## 3. App B — LMS (`rpcourses/`) inventory

### Pages
`landing`, `dashboard`, `course-viewer`, `payment`, `admin-dashboard`, `bulk-admin`, `ai-workplace`, `career-success-hub`, `interview-mastery`, `job-search`, `resume-builder`, `not-found`.

### Backend services (`rpcourses/server/`)
- `replitAuth.ts` — OIDC via Replit; sessions in Postgres. **Hard dependency on Replit as IdP** — breaks anywhere else.
- `routes.ts` (558 lines) — auth/user, dashboard metrics, courses/modules, enrollments, progress, study sessions, AI chat + resume endpoints, payments, WIOA CSV report generation, admin bulk ops.
- `automationService.ts` — node-cron jobs + default email templates (welcome day 1, progress nudges, inactivity, completion) + default system settings. Note LESSONS L-007 (cron timezone double-shift) applies for review.
- `bulkOperationsService.ts` — CSV parse, bulk user import + enroll.
- `emailService.ts` — email sending w/ `email_log` table (statuses logged — good).
- `paymentService.ts` — **stubbed**: simulates payment, generates fake `txn_` ids, then creates the enrollment. Docs claim “integrated Stripe gateway ($8,500)”; the code does not implement it. Claim ≠ runtime.
- `errorHandler.ts` / `productionErrorHandler.ts` — centralized error handling (relatively mature).
- **OpenAI** used inside `storage.ts` (AI teaching assistant chat + AI resume builder), `gpt-` chat completions, key from `OPENAI_API_KEY`.

### Database models (`rpcourses/shared/schema.ts`)
`sessions`, `users` (fundingType WIOA|Private), `courses`, `modules` (video-based), `enrollments` (wioaFunding $8,500 default, caseWorkerName, programCode), `user_progress` (watch time), `study_sessions`, `email_templates`, `email_log`, `wioa_reports`, `system_settings`.

### Automations
node-cron scheduled email sequences and inactivity checks (in-process — die with the dyno, no persistence, no retry).

## 4. Gaps between claims and runtime (VERIDIAN test)

| Claim (docs/site) | Runtime reality |
|---|---|
| “Stripe checkout $8,500 for private-pay” (LMS) | `paymentService` is a simulation stub |
| “Role-based access control with audit logging” for `/admin` | No role check exists; `isAuthenticated` only. No audit log. |
| Admin management of applications/newsletter (site) | Routes commented out |
| “Production-ready LMS” | No assessments, no certificates, no SCORM, no instructor role, videos only |
| CNA program delivery | No LMS support at all (no attendance, clinical hours, skills checklists) |
| Users table has no `isAdmin`/`role` column | Any authenticated user hitting `/api/admin/*` succeeds |

## 5. Security findings (flagged per CONSTITUTION §3)

1. **CRITICAL — LMS admin routes unauthorized** (`rpcourses/server/routes.ts:454+`): bulk-import (create arbitrary users), bulk-enroll, and compliance-status (full student PII/WIOA data) require only login. Mirrors LESSONS L-003 (auth must be opt-out).
2. **HIGH — shared plaintext admin password** on site admin, compared with `!==` (timing-unsafe, unhashed, sent in a custom header, no rate limit, no lockout).
3. **HIGH — cost-abuse vector**: OpenAI chat/resume endpoints are authenticated but unmetered per user — a single student script can burn unbounded API budget (LESSONS L-005 requires ≥2 controls; only auth exists).
4. **MEDIUM — raffle entry codes from `Math.random()`** — not cryptographically random; also raffle legal compliance (state gaming law) is handled by a 500-char metadata string, not a compliance process.
5. **MEDIUM — donation/checkout endpoints unauthenticated & un-rate-limited** — spam rows in DB; Stripe absorbs card abuse but DB does not.
6. **MEDIUM — ghost deps** in App A (passport/express-session installed, unused) — audit blind spot (LESSONS L-001).
7. **LOW — response-body logging** in `server/index.ts` logs API JSON responses (truncated) — will leak PII into logs as the API grows.

## 6. Capability catalog (summary)

**Exists and works:** marketing site + typed content config; one-time Stripe donations; raffle w/ webhook fulfillment; program application intake; transactional email w/ logging (LMS side); video course delivery w/ progress + study-time tracking; WIOA CSV reporting; bulk CSV student import; cron email sequences; OpenAI tutor + resume builder.

**Exists but broken/unsafe:** all admin surfaces; LMS payments; Replit-locked auth.

**Absent entirely:** unified identity; recurring donations & donor CRM; grants; volunteers; CNA delivery (attendance/clinical/skills); assessments & certificates; document generation; knowledge graph; event bus; job queue; observability; secrets management discipline; Google/Microsoft integration of any kind despite both nonprofit grants being approved.
