# D-008 — V.I.A. / N.O.B.L.E. / Workforce are independent program types on shared infrastructure

**Date:** 2026-07-11  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Owner + Claude (M1)  
**Milestone:** M1  

## Decision

V.I.A. (school), N.O.B.L.E. (community), and Workforce Development (CompTIA/CNA/WIOA) are independent program types that share the Rising Promise core infrastructure — they are not separate applications, separate databases, or separate stacks.

V.I.A. and N.O.B.L.E. are "prepare, do not implement" until the programs have operational volume. Workflow definitions for them are deliberately absent from `server/core/workflow.ts`.

## Context

Owner directive based on the one-spine/many-surfaces thesis in `RP_MASTER_ARCHITECTURE`. Building separate applications per program creates duplicated identity, event, and compliance infrastructure — exactly the class of technical debt this platform is designed to eliminate.

## Consequences

- All programs share `core_persons`, events, policy, workflow, and notification infrastructure.
- Program-specific surfaces (LMS for CompTIA/CNA, future V.I.A. school app) are skins on the same spine.
- V.I.A./N.O.B.L.E. workflows are intentionally absent until the programs operate at scale — prevents building for a hypothetical shape.
- Cross-program identity (a person in both CNA and V.I.A.) is handled natively via participations + the knowledge graph.

## Alternatives considered

- Separate apps per program: commonly done in nonprofits; produces five identity systems, five audit trails, and five compliance stacks — rejected by owner.
- Single monolithic application: this is effectively what the decision describes, but with explicit program-type boundaries enforced via the participation model rather than hard-coded conditionals.
