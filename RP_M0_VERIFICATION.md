# RP_M0_VERIFICATION — Milestone 0 Runtime Verification Record

Date: 2026-07-11. All results below are from actual runtime execution on this machine (local throwaway Postgres 18 on :5599; site on :5000; LMS on :5100). Runtime is the proof.

## 1. Authorization matrix (as verified, not as claimed)

### Public site (root app)
| Route | Auth | Verified result |
|---|---|---|
| `GET /execbible`, `/execbible.html` | Basic auth (admin secret) | no auth → 401; wrong pass → 401; correct → 200. File removed from public build (`dist/public/execbible.html` absent) |
| `POST /api/newsletter/signup` | public + rate limit 10/min/IP | — |
| `POST /api/programs/apply` | public + rate limit 10/min/IP | — |
| `POST /api/{donations,raffle}/create-checkout-session` | public + rate limit 10/min/IP | without Stripe key → loud 500 + boot warning |
| `POST /api/webhooks/stripe` | Stripe signature (unchanged) | — |
| `POST /api/admin/verify-password` | timing-safe SHA-256 compare + 5/min/IP limit | wrong → 401; correct → 200; 6th in window → 429 (observed live) |
| `GET /api/admin/raffle-entries` | `x-admin-password` via same verifier | no header → 401/429; correct header → passes auth (500 only from fake DB) |
| `GET /api/newsletter/signups` (re-enabled) | admin | 401 unauthenticated |
| `GET/PATCH /api/programs/applications*` (re-enabled) | admin | 401 unauthenticated |

### LMS (rpcourses)
Unauthenticated probe of every sensitive route against the running server — all returned **401**:
`POST /api/admin/bulk-import`, `POST /api/admin/bulk-enroll`, `GET /api/admin/compliance-status`, `GET /api/wioa/reports`, `POST /api/wioa/generate-report`, `POST /api/wioa/submit-report`, `GET /api/email/templates`, `POST /api/email/send-welcome`, `POST /api/payments/process`, `POST /api/payments/wioa-enrollment`, `POST /api/admin/users/:id/role`, `GET /api/admin/ai-spend`, `POST /api/ai/chat`, `POST /api/ai/generate-resume`, `GET /api/courses`, `GET /api/auth/user`.

Role gates (beyond login): `requireAdmin` on bulk-import/bulk-enroll/compliance-status/role-grant; `requireStaff` on WIOA reports, email templates/triggers, WIOA enrollment, ai-spend.

### RBAC verification suite (`rpcourses/server/rbac.verify.ts`, run against real DB) — ALL PASS
- new users default to role=student
- role NOT settable via upsert (live privilege-escalation attempt blocked)
- student denied by requireAdmin/requireStaff (403); staff denied by requireAdmin (403)
- staff allowed by requireStaff; admin allowed by both
- unknown user → 403 (fail closed); missing identity → 401

### AI usage controls (`rpcourses/server/aiGuard.verify.ts`) — ALL PASS
- per-user hourly chat limit: calls ≤ cap pass, next → 429
- org-wide daily spend cap: trips across users → 503 + one loud ALERT log
- `GET /api/admin/ai-spend` (staff) reports `{estimatedSpendUsd, dailyCapUsd, capReached}`
- Limitation (documented): counters are in-memory, reset on restart; durable metering is M1 spine work

### Payments
- `paymentService.processPayment` executed directly: returns `success:false` with user-safe message + warn log. **The simulated-transaction path no longer exists.** Route returns 501.
- Bulk enroll without WIOA data now creates an explicit admin-granted enrollment with `wioaFunding: 0.00` (previously simulated an $8,500 payment, inflating WIOA funding reports).

## 2. Build / type verification
- Site: `tsc` exit 0; `npm run build` OK (dist/index.js 36.9kb; execbible.html absent from public output)
- LMS: `tsc` exit 0 (4 pre-existing errors also fixed to make the gate meaningful); `npm run build` OK (85.4kb)
- LMS schema pushed to Postgres; `users.role` column confirmed via `\d users` (`not null default 'student'`)

## 3. Boot-time capability verification
- Site boot logs: `STRIPE_SECRET_KEY not set — donation/raffle checkout DISABLED`, admin-password plaintext warning (observed)
- LMS boot logs: `[db] driver=… host=…` (never silent about which driver/DB), automation template/setting seeding, cron scheduling

## 4. Findings requiring OWNER action (not code)
1. **SPF/DMARC**: `risingpromise.org` SPF is `v=spf1 include:zoho.com ~all` — Resend is NOT authorized; receipts may fail SPF/DMARC alignment. Add Resend's include (per Resend domain settings) and consider moving DMARC beyond `p=none`. Verified via live DNS lookup.
2. **Raffle legality** (⚖️ RP_UNKNOWN_UNKNOWNS #1): code hardening done (crypto-random entry codes); multi-state sale legality and the advertised-but-nonexistent free entry method (AMOE) need counsel.
3. **Deploy steps**: set `ADMIN_PASSWORD_SHA256` (replacing `ADMIN_PASSWORD`), set `ADMIN_BOOTSTRAP_EMAILS` for the first LMS admin, run `npm run db:push` in rpcourses against production DB to add the `role` column, and set `AI_DAILY_SPEND_CAP_USD` to the intended budget.

## 5. Preserved functionality
Video delivery, progress, study sessions, WIOA CSV reporting, email automation, tutoring/resume tools, enrollment, donations, raffle, newsletter, applications — all code paths untouched except where auth/limits now wrap them. Admin UI clients (`adminRaffle.tsx` password flow, LMS admin pages) use the same request shapes as before.

**M0 STATUS: VERIFIED** (with the three owner actions above outstanding — none of them blocks M1 infrastructure work).
