# RP_IMPLEMENTATION_ROADMAP — Dependency-Driven Milestones

Ordering logic: Constitution §2 (protect revenue/security first, then create revenue, then leverage) crossed with hard dependencies (identity → everything; event bus → evidence → grants). No milestone starts before its dependencies land. Sizes are relative effort, not dates — this org's velocity is unknown.

```
M0 ──► M1 ──► M2 ──┬─► M3 (Grants) ──► M6
security  spine  LMS ├─► M4 (Donors)
                     └─► M5 (Volunteers)
```

## M0 — Stop the bleeding — ✅ DONE & VERIFIED 2026-07-11 (see RP_M0_VERIFICATION.md; items 4's legal review, SPF/DKIM DNS fix, and production env/db:push deploy steps remain owner actions)
1. Add admin-role check to `rpcourses` `/api/admin/*` routes (users table gains `role`); until then, take bulk-import offline. **Live PII exposure.**
2. Replace shared-password site admin with at minimum hashed password + rate limit; move exec bible behind it.
3. Per-user rate limit + daily spend cap on OpenAI endpoints.
4. Crypto-random raffle codes; pause multi-state raffle sales pending counsel (⚖️ RP_UNKNOWN_UNKNOWNS #1).
5. Re-enable program-application admin (view + status) behind auth — applicants currently apply into a void.
6. Remove ghost deps; add required IRS receipt language; verify SPF/DKIM/DMARC.
Exit criteria: unauthenticated probe of every route passes; no unmetered paid endpoint.

## M1 — Core spine (the architectural milestone; everything leans on it)
1. Monorepo consolidation (site + rpcourses under one workspace), one Postgres cluster, schema-per-domain.
2. `core.persons`/identities + RBAC; OIDC via Google Cloud Identity; migrate LMS users off Replit Auth (L-008: re-verify every client after the auth change).
3. Route auth wrapper (`public(reason)` pattern) + nightly self-tests; boot-time config validation.
4. Event outbox + audit-log consumer; pg-boss job queue (port LMS crons, L-007 audit).
5. Capability registry + /health + uptime alerting; Cloudflare in front.
Leverage: every later milestone consumes identity, events, jobs, registry. Nothing user-visible ships here except stability — resist scope creep.

## M2 — LMS completion (existing revenue program made real)
1. Provider extraction as touched: payments, mail, ai.
2. Real Stripe payments or formal removal of private-pay path (decision for ED — ⚖️ tuition licensing check first).
3. Assessments + certificates (CompTIA complete); YouTube video provider.
4. Cohorts/attendance/skills/clinical schema (CNA-ready) — build only after CNA state-approval status confirmed.
5. Instructor role + dashboard.
Dependency: M1 identity. Leverage: emits the evidence events grants need.

## M3 — Grant OS (revenue engine)
Pipeline schema → compliance provider (SAM.gov/registration renewals + alerting: cheapest highest-stakes automation, build first) → evidence_items from LMS events → Drive/Docs/Calendar providers → discovery polling → proposal drafting agent (needs Policy Engine, below).

## M4 — Donor platform (parallel with M3 after M1; shares stewardship machinery)
Donor CRM migration of donations/raffle rows → recurring giving (Stripe subscriptions) → stewardship event consumers → Givebutter campaigns/P2P → matching widget → GA4 + Ad Grants activation (marketing prerequisite anyway) → major-donor pipeline.

## M5 — Volunteer OS (after M2, since training uses LMS)
Applications/screening invariant → agreements (esign) → shifts + hours → evidence link → recognition.

## M6 — Intelligence layer (only after data exists to be intelligent about)
1. Policy engine + decision ledger (prerequisite for agents; pull earlier if M3 proposal drafting wants it).
2. Knowledge graph projection + Chief-of-Staff impact queries.
3. AI departments, phased: Compliance and Grant Writing first (highest leverage per RP_AI_DEPARTMENTS), then Development, Programs, Communications; External Relations combined-agent last.
4. Looker Studio dashboards for board/funders.

## Standing rules across all milestones
- Every milestone ends with: self-tests green, capability registry entries `verified`, docs updated, handoff note (Constitution §4).
- Spend decisions (Instrumentl, paid tools, Azure moves) and anything ⚖️-tagged go to the ED before work starts (§3).
- Housing gets richer tooling only when the housing program has real operational volume — until then it is participation records + Drive files. WHY: building for a program's future shape before it operates is how nonprofits accumulate dead software.

## What NOT to do first (explicit anti-priorities)
Knowledge graph UI, AI departments, SCORM, Power BI, Benevity API, Maps, custom dashboards — all have hard dependencies on M1–M4 data and would be built on sand today.
