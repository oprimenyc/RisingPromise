# RP_CAPABILITY_GRAPH — Capability Registry + Organizational Knowledge Graph

Two related but distinct artifacts. The **capability registry** answers "what can the platform do and is it actually working right now." The **knowledge graph** answers "how is everything in the organization connected and what is the impact of a change."

## 1. Capability Registry

Table `core.capabilities`:
```
id, name, domain, status: claimed|verified|degraded|dormant,
provider_deps[], feature_flags, health_probe (fn ref), owner (department),
last_verified_at, evidence (probe output)
```
- Every feature registers itself at boot; a scheduled job runs each health probe and flips status. `claimed ≠ verified` is surfaced on the Chief of Staff board — this is the VERIDIAN "runtime is the proof" mechanism made concrete. The audit found exactly this failure mode already: docs claim Stripe LMS payments; runtime has a stub. The registry makes that class of lie structurally visible.
- Dormant capabilities (SCORM, Power BI, Benevity API) are registered with `status: dormant` so options stay documented, not forgotten.

## 2. Knowledge Graph

### Storage decision
Postgres tables (`graph.nodes`, `graph.edges` with typed labels + JSONB properties + recursive-CTE queries), **not** a graph database. WHY: node counts (tens of thousands) are trivial; a second database engine is an ops burden violating the buy/operate constraint; projection from the event bus keeps it consistent. The user's existing `/graphify` tooling can consume exports for visualization.

### Node types
Person (student, donor, volunteer, staff, board, resident — one node, many roles), Organization (funders, employers, clinical sites, sponsors, vendors), Program, Course/Cohort, Grant/Opportunity/Award, Gift/Campaign, Document (Drive fileId refs: policies, MOUs, proposals), Workflow/Automation, Provider/Capability, Policy, Property/Unit (housing), Event (class session, board meeting).

### Edge types (illustrative)
`PARTICIPATES_IN` (person→program, with period + outcome), `FUNDED_BY` (program→award), `EMPLOYED_BY` (person→org, outcome evidence), `INSTRUCTS`, `DONATED_TO`, `SPONSORS`, `SIGNED` (person→document), `DEPENDS_ON` (capability→provider), `REQUIRES` (role→screening), `GOVERNED_BY` (workflow→policy), `EVIDENCES` (event→grant metric).

### Population
Never hand-entered as a separate chore. Graph nodes/edges are **projections of event-bus events** (`gift.recorded` → Person—DONATED_TO→Campaign edge). WHY: a manually curated graph rots in a month; a projected graph is exactly as current as the operational data.

### The Chief-of-Staff impact query
The design requirement "understand operational impact before changes are made" becomes concrete graph queries:
- *Cancel Tuesday cohort?* → cohort → enrolled persons → their funding awards → those awards' outcome commitments → affected report cycles.
- *Instructor resigns?* → INSTRUCTS edges → cohorts → sessions without coverage → volunteer candidates with matching skills.
- *Grant not renewed?* → award → FUNDED_BY programs → participants → dependent staff/contracts.
Implemented as parameterized recursive queries exposed to the Chief of Staff agent and a staff UI ("what depends on X?").

### Consent & sensitivity
Nodes carry sensitivity class (public | internal | restricted). Housing-resident and screening edges are restricted: excluded from agent context unless the requesting role holds clearance; never exported. The graph must never become the tool that recompiles a vulnerable person's whole life for the wrong audience — this is a hard policy, encoded in the query layer, not a guideline.
