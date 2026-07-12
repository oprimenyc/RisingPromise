# D-005 — DB driver selectable by hostname (node-postgres / Neon)

**Date:** 2026-07-11  
**Area:** Architecture  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Select the Postgres driver at boot based on `DATABASE_URL` hostname: use the Neon serverless driver for Neon/Railway cloud hostnames; use `node-postgres` for local hostnames (`localhost`, `127.0.0.1`). Log the chosen driver at startup.

## Context

The VERIDIAN doctrine ("runtime is the proof") requires that local development exercise the real schema against a real database. The Neon serverless driver uses HTTP and cannot reach a local Postgres instance — without this selector, engineers either ran against production or could not verify locally at all.

## Consequences

- Local verification against a throwaway Postgres 18 cluster is unambiguous and safe.
- Production uses Neon's optimized HTTP driver.
- A developer looking at logs can immediately confirm which driver is active.
- The schemaFilter finding (D-010) was discovered via this local-cluster workflow.

## Alternatives considered

- Always use node-postgres: works locally, but loses Neon's connection pooling in production.
- Environment flag: hostname is already the distinguishing fact; a redundant flag creates drift risk.
