# D-007 — LMS stays a nested git repo through M0

**Date:** 2026-07-11  
**Area:** Migration  
**Status:** superseded by [D-010](D-010-monorepo-apps-lms-schema-per-domain.md)  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Keep `rpcourses` as a nested git repository inside the site repo through M0. Monorepo consolidation is deferred to early M1.

## Context

M0 is "stop the bleeding" — live PII exposure, compliance issues, and unmetered AI spend. Restructuring a multi-repo layout mid-hotfix would have mixed concerns, complicated rollback, and potentially broken the deployment pipeline for an already-live system.

## Consequences

- Hotfixes deploy safely with no structural changes.
- Dual-repo complexity persists through M0.
- Superseded in M1 (D-010): rpcourses was absorbed as `apps/lms` in an npm workspace on one Postgres cluster, with LMS tables in schema `lms`. Git history from the nested repo was preserved at `../rpcourses-git-history-backup`.

## Alternatives considered

- Consolidate in M0: too risky; mixing structural and hotfix changes on a live system.
