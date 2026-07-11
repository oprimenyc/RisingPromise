# RP_AI_DEPARTMENTS — AI Department Architecture

Model: each "department" is a **role-scoped agent** with (a) a charter, (b) read access to a bounded slice of the graph/data, (c) a set of draft-producing automations, and (d) a hard rule: **agents draft, humans approve anything external, financial, or person-affecting** (Policy Engine enforced). Agents run on the `ai.*` provider (metered, spend-capped per L-005), triggered by events or schedules through the job queue, and log every action to the Decision Ledger. WHY this shape: a small nonprofit's constraint is staff attention; agents that produce *reviewed drafts and prioritized queues* multiply staff, while autonomous external action would be a compliance and trust catastrophe.

Common structure per department: **Responsibilities / Inputs / Outputs / Automations / Provider deps / Knowledge / Approvals / Metrics.** Below, condensed; shared fields noted once:
- All read the knowledge graph scoped to their domain; all write drafts + Decision Ledger entries; all use `ai.*`, mail, docs providers.

## Chief of Staff (cross-cutting, sits above departments)
Aggregates department outputs into a daily/weekly brief for the ED; runs impact analysis via graph ("what breaks if we cancel the Tuesday cohort?"); watches the capability registry health board. Approval: none needed (read-only + briefs).

## Executive Director support
- Resp: board brief prep, KPI digest, decision memos. Inputs: all department metrics, Decision Ledger. Outputs: weekly org dashboard, board packet drafts (docs.generate). Metrics: on-time board packets, KPI freshness.

## Development & Fundraising
- Resp: pipeline hygiene, meeting briefs, lapsed-donor lists. Inputs: donors schema, gift events. Outputs: major-donor briefs, campaign performance summaries, draft appeal copy. Automations: `gift.recorded` ≥ threshold → ED task + brief; monthly lapsed-segment refresh. Approvals: any donor-facing message. Metrics: retention rate, LTV, pipeline velocity.

## Grant Writing
- Resp: opportunity scoring, draft narratives, report assembly. Inputs: opportunities, evidence_items, narrative library, past proposals. Outputs: go/no-go recommendations (→ Decision Ledger), proposal drafts, report drafts. Automations: grants.gov poll scoring; deadline escalations. Approvals: ED sign-off before submission (hard gate). Metrics: submission rate, win rate, on-time reports = 100%.

## Communications & Marketing
- Resp: newsletter drafts, social calendar, impact stories, Ad Grants copy. Inputs: program events (graduations, milestones), brand guidelines (design_guidelines.md → knowledge), Canva provider. Outputs: draft posts/newsletters/certificate graphics. Approvals: all public content (publishing is irreversible). Metrics: Ad Grant utilization, email engagement, site conversion (GA4).

## Programs (Education + Housing share the pattern)
- Education: at-risk student detection (progress + attendance events) → instructor intervention queue; cohort health reports; WIOA report pre-fill. Approvals: none for internal queues; any student-facing message reviewed by staff. Metrics: completion, certification pass, placement rate.
- Housing: occupancy tracking, case-note summarization for staff, resident milestone tracking, maintenance/task queues. **Extra guardrail: resident data is the most sensitive in the org — agent access is summary-level, staff-initiated only.** Metrics: housing stability at 6/12mo.

## Volunteer Services
- Resp: applicant triage, screening-status chase, shift-fill alerts, recognition drafts. Automations: unfilled shift T-72h → targeted ask list; hours milestones → certificates. Metrics: fill rate, retention, hours logged (grant match value).

## Finance
- Resp: reconciliation prep (Stripe payouts vs gifts), restricted-fund tracking flags, budget-vs-actual summaries from accounting exports. **No transaction execution ever.** Approvals: everything advisory-only. Metrics: unreconciled days, restricted-fund exceptions = 0.

## Compliance
- Resp: registration/renewal watch (SAM.gov, state charity registration, IRS filings calendar, insurance), policy attestation tracking, audit-readiness checks (runtime probes from RP_RUNTIME_COMPLIANCE). Automations: `compliance.expiring` escalation ladder — this agent is allowed to be *loud*. Metrics: zero lapsed registrations, 990 on time.

## Board Administration
- Resp: meeting scheduling, packet assembly, minutes drafting (from staff notes), resolution/vote record keeping, term/officer tracking. Approvals: minutes approved by board secretary. Metrics: quorum rate, packet lead time.

## Community Outreach / Government Relations / Partnerships
- Combined "External Relations" agent initially (WHY: at current org size these are one staff hat; split when volume demands). Resp: partner CRM (orgs as graph entities), MOU tracking (esign), gov-contract opportunity watch (SAM.gov contract search), meeting briefs. Approvals: all external correspondence. Metrics: active MOUs, contract pipeline.

## Guardrails summary (apply to every department)
1. Per-agent token budget + org daily spend cap w/ alert (L-005).
2. No agent sends external communication, moves money, submits filings, or changes person records without named-human approval recorded in the Decision Ledger.
3. Every agent output cites its data sources (graph node ids) — auditable reasoning.
4. Agents degrade gracefully: if `ai.*` is down, queues still populate from raw events (automation ≠ intelligence dependency).
