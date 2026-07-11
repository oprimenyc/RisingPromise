# RP_MASTER_ARCHITECTURE — Canonical Architecture for the Rising Promise Platform

Status: canonical. All other RP_*.md documents derive from this one.
Companion audit: RP_PLATFORM_AUDIT.md (what exists today).

## 0. Design thesis

Rising Promise today is two disconnected Replit-generated apps (public site + WIOA LMS) with no shared identity, data, or infrastructure. The mission requires a **nonprofit operating platform**: one identity, one data spine, many program surfaces. The controlling constraints:

1. **A 501(c)(3) with near-zero engineering headcount.** Every architectural decision must minimize custom code that must be *operated*. Google/Microsoft nonprofit grants are already approved — they are free, SLA-backed infrastructure. WHY: custom code is a liability the org must staff; granted SaaS is a liability the vendor staffs.
2. **Compliance is the product.** WIOA reporting, IRS receipting, state raffle law, grant reporting — funders pay for provable outcomes. Therefore auditability, evidence collection, and runtime verification are first-class, not add-ons (VERIDIAN: runtime is the proof).
3. **One person's data appears in many programs.** A veteran may be a CNA student, a housing resident, a volunteer, and later a donor. A person-centric graph is the only model that supports wraparound services. WHY: siloed per-app user tables (the current state) make wraparound coordination and outcome reporting impossible.

## 1. Target topology

```
┌──────────────────────────────────────────────────────────────┐
│  SURFACES (thin, replaceable)                                │
│  Public site │ LMS │ Staff console │ Donor portal │ Volunteer │
├──────────────────────────────────────────────────────────────┤
│  RP CORE (one TypeScript monorepo service, "rp-core")        │
│  Identity & RBAC │ Person Graph │ Event Bus │ Job Queue      │
│  Feature Registry │ Policy Engine │ Decision Ledger │ Audit  │
├──────────────────────────────────────────────────────────────┤
│  PROVIDER LAYER (standardized interfaces, RP_PROVIDER_SPEC)  │
│  google │ microsoft │ stripe │ resend/brevo │ docusign │ ... │
├──────────────────────────────────────────────────────────────┤
│  DATA SPINE: one Postgres (Neon) cluster, schema-per-domain  │
│  core │ programs │ lms │ donors │ grants │ volunteers │ audit│
└──────────────────────────────────────────────────────────────┘
```

### Decisions and WHY

**D1 — Modular monolith, not microservices.** One deployable `rp-core` service (Express/TS, matching existing skills and code), internal domain modules with enforced boundaries. WHY: tens of thousands of users is small for one Postgres + one Node service; microservices multiply ops burden the org cannot staff. Boundaries are enforced by module/import rules so extraction later stays possible.

**D2 — One Postgres cluster, one identity.** Merge App A and App B databases into one cluster with per-domain schemas and a single `core.persons` / `core.identities` model. WHY: wraparound services, deduplication, and the knowledge graph all require one person-key. Dependency: this is the prerequisite for donors↔students↔volunteers linkage; nothing in Parts 8–11 works without it.

**D3 — Identity provider = Google Workspace (Cloud Identity) via OIDC, replacing Replit Auth.** Staff/volunteers get Workspace accounts (free, granted); students/donors authenticate with email-magic-link or Google sign-in through the same OIDC broker. WHY: Replit Auth locks the LMS to Replit hosting (audit §3); Workspace is already owned, gives SSO, MFA, device policy, and offboarding for free. Roles live in `core.roles`, not in the IdP — providers must stay swappable.

**D4 — Buy/grant before build.** Each capability first asks: does a granted tool (Workspace, SharePoint, Givebutter, DocuSign nonprofit) already do this? Custom code is reserved for (a) the data spine, (b) the LMS student experience, (c) glue/automation. WHY: Constitution §2 — engineering time is the scarcest resource; revenue/grant-readiness first.

**D5 — Everything emits events.** All domain mutations publish to an event bus (Postgres-backed outbox table + worker; no Kafka). Consumers: audit log, knowledge graph, email automations, dashboards. WHY: this single mechanism supplies observability, the decision ledger, and automation triggers without N point-to-point integrations. Postgres-backed because it must not add an ops dependency.

**D6 — Jobs are durable.** Replace in-process node-cron (dies with the process, no retry — audit §3) with a Postgres-backed queue (e.g. pg-boss/graphile-worker) with terminal SUCCESS/FAILED status per Constitution §1. Cron entries follow LESSONS L-007 (wall-clock + timezone, never pre-converted).

**D7 — Auth is opt-out.** Every route registers through a wrapper that requires an explicit role or an explicit `public("reason")` marker (LESSONS L-003). A runtime self-test hits every route unauthenticated and fails CI unless non-marked routes 401/403.

**D8 — AI is a provider, not a vendor call.** The current direct-OpenAI usage in LMS `storage.ts` moves behind an `ai` provider interface (models: Claude/Gemini/OpenAI swappable). All AI endpoints get per-user rate limits + org-level daily spend cap with alerting (LESSONS L-005). AI departments (RP_AI_DEPARTMENTS.md) consume only this interface.

## 2. Core services specification

| Core service | Responsibility | Backing |
|---|---|---|
| Identity & RBAC | OIDC broker, sessions, roles (student, instructor, staff, admin, board, volunteer, donor), permission checks | Postgres + Workspace OIDC |
| Person Graph | Canonical person record; program participations; relationships; consent flags | `core.*` schema; projected into knowledge graph |
| Event Bus | Transactional outbox, at-least-once delivery to consumers | Postgres |
| Job Queue | Durable scheduled/async work with retry + dead-letter + status | pg-boss |
| Feature/Capability Registry | Table of features with owner, status (claimed/verified), health-check fn, provider deps | Postgres + runtime probes |
| Policy Engine | Declarative rules: who may do what, which actions need approval (e.g. grant submission needs ED sign-off) | code-as-config, versioned |
| Decision Ledger | Append-only record of consequential decisions (human or AI), with actor, inputs, rationale | `audit.decisions` |
| Audit Log | Every privileged mutation: actor, before/after, timestamp | `audit.events`, written by event-bus consumer |
| Observability | Structured logs (PII-scrubbed), health endpoint per module, uptime + error alerting | pino + provider (e.g. Better Stack) |
| Config & Secrets | Typed config (extend existing `siteConfigSchema` pattern); secrets only in platform env/Google Secret Manager, never in code | existing pattern, hardened |

## 3. Domain modules

- **web** — public site (exists; keep, rewire onto core APIs)
- **lms** — course delivery (exists in rpcourses; migrate; see RP_COURSE_PLATFORM.md)
- **donors** — donations/CRM/stewardship (RP_DONOR_PLATFORM.md)
- **grants** — grant OS (RP_GRANT_PLATFORM.md)
- **volunteers** — (RP_VOLUNTEER_PLATFORM.md)
- **housing** — resident intake, occupancy, case notes (new; modeled as a program participation type first, custom UI later)
- **departments** — AI department agents (RP_AI_DEPARTMENTS.md)
- **graph** — knowledge graph projection + query (RP_CAPABILITY_GRAPH.md)

## 4. Non-negotiable invariants

1. No business logic imports a vendor SDK directly (RP_PROVIDER_SPEC.md).
2. No route without explicit auth or `public(reason)`.
3. No silent failures — Constitution §1 verbatim.
4. Every donation, grant dollar, and WIOA dollar traceable end-to-end in audit tables (funder-audit readiness).
5. PII: minimum collection, consent recorded, no PII in logs/URLs, encryption at rest (Neon default) + app-level field encryption for SSN-class data if ever collected (CNA background checks — prefer *not* storing, store provider reference instead).
6. Every cron: local wall-clock expression + timezone + comment of intended fire time (L-007).
7. Dependency hygiene: env-vs-manifest diff in CI (L-001); post-fix version verification (L-002).

## 5. What is explicitly NOT built

- No custom accounting (QuickBooks Nonprofit / Aplos).
- No custom email marketing engine (Brevo/Mailchimp via provider).
- No custom video infra (YouTube unlisted / Drive).
- No custom background-check handling (Sterling Volunteers/Checkr — store status + reference only).
- No Kafka/Redis/k8s. Postgres does queue+bus+graph until proven insufficient.

## 6. Document map

- RP_PLATFORM_AUDIT.md — current state (Part 1, 5, 12 evidence)
- RP_PROVIDER_SPEC.md — provider abstraction (Part 4)
- RP_GOOGLE_PROVIDER.md / RP_MICROSOFT_PROVIDER.md (Parts 2–3)
- RP_CAPABILITY_GRAPH.md — registry + knowledge graph (Part 11)
- RP_AI_DEPARTMENTS.md (Part 6)
- RP_COURSE_PLATFORM.md (Part 7)
- RP_GRANT_PLATFORM.md (Part 8)
- RP_DONOR_PLATFORM.md (Part 9)
- RP_VOLUNTEER_PLATFORM.md (Part 10)
- RP_RUNTIME_COMPLIANCE.md — VERIDIAN compliance (Part 5)
- RP_UNKNOWN_UNKNOWNS.md (Part 12)
- RP_IMPLEMENTATION_ROADMAP.md (Part 13)
