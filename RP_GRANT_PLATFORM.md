# RP_GRANT_PLATFORM — Grant Operating System

Today: nothing exists. Not a table, not a spreadsheet integration. Yet grants are a named revenue pillar. Design principle: **grants are a pipeline + an evidence problem**, not a document problem. Proposals get written once; evidence gets requested by every funder forever. Build the evidence spine first.

## 1. Pipeline model (grants schema)

```
opportunity → qualification → application → award → reporting cycles → renewal/closeout
```

- `funders` (type: federal|state|foundation|corporate, relationship owner, contacts)
- `opportunities` (funder, program area, amount range, deadline, source: grants.gov|candid|manual, cfda/alnumber)
- `qualifications` (opportunity, fit score, eligibility checklist result, go/no-go decision → **Decision Ledger entry with rationale**) — WHY: no-go reasons are institutional memory; re-evaluating the same bad-fit grant yearly wastes the scarcest staff
- `applications` (opportunity, status, narrative doc links, budget sheet link, submittedAt, submissionConfirmation fileId)
- `awards` (application, amount, period, restrictions, reportingSchedule[])
- `report_cycles` (award, due date, type: narrative|financial|outcome, status, submitted evidence links)
- `grant_tasks` (generic tasks with owner + due date, feeding calendar provider)

All deadlines project into a shared Google Calendar and emit `grants.deadline.approaching` events (60/30/14/7/1 days) → Grant Writing department agent + staff email. WHY calendar: humans miss DB rows, not calendars.

## 2. Evidence collection (the moat)

`evidence_items` (program, metric, period, value, sourceEvent(s), fileIds): automatically accumulated from platform events —
- `lms.enrollment.created` / `lms.certificate.issued` → training outcomes
- `lms.attendance.recorded` → contact hours
- `outcomes.employment.recorded` → placement rates
- `housing.occupancy.*` → housing stability metrics
- `volunteers.hours.logged` → match/in-kind value

WHY: the current WIOA CSV generator proves the pattern works for one funder; generalize it so *every* proposal and report pulls live, auditable numbers instead of staff reconstructing them quarterly. This is the single biggest structural advantage the platform gives fundraising.

## 3. Proposal generation

- Narrative library: canonical org boilerplate (mission, history, DEI, financials, board list, logic models) stored versioned in Drive; `docs.generate` merges boilerplate + opportunity-specific sections.
- Grant Writing AI agent (RP_AI_DEPARTMENTS) drafts opportunity-specific sections from: opportunity requirements + evidence metrics + past funded proposals. **Human approval mandatory before anything leaves the org** (Policy Engine rule; submission is an external, irreversible act).
- Budget assistance: template Sheets with program cost models; agent fills draft, finance reviews.

## 4. Discovery & qualification

- Grants.gov Search API polled by scheduled job with saved queries (workforce development, housing, veterans, foster youth) → creates `opportunities` rows scored by the agent against an eligibility profile (501(c)(3) age, budget size, geography, UEI/SAM current, audit status).
- Candid/FDO used manually at first (no affordable API); paid tools (Instrumentl) deferred until pipeline volume justifies cost (spend decision — ask first, Constitution §3).
- SAM.gov/UEI/CAGE renewal tracking lives in the `compliance` provider — a lapsed SAM registration invalidates all federal applications; it gets the loudest alerting in the system.

## 5. Reporting & relationship management

- Each award auto-creates its report cycles; a report is assembled from evidence_items filtered to the award's programs/period, generated via docs template, reviewed, submitted, and the confirmation archived to Drive.
- `funder` records track every touchpoint (thank-you sent, site visit, report delivered) — funders are donors with paperwork; stewardship logic shared with RP_DONOR_PLATFORM.

## 6. Dependencies

Requires: core identity/RBAC, event bus, evidence events from LMS (hence LMS migration precedes grant OS), Drive + Docs + Calendar providers, Policy Engine (submission approvals). Roadmap places Grant OS immediately after core spine — it is the revenue engine (Constitution §2 tier-3).
