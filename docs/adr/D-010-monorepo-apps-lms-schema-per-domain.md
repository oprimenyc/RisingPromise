# D-010 — rpcourses → apps/lms workspace; tables in schema `lms`; drizzle schemaFilter mandatory

**Date:** 2026-07-12  
**Area:** Migration  
**Status:** accepted (supersedes D-007)  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

Absorb `rpcourses` as `apps/lms` in an npm workspace (`rp-platform` root). LMS database tables live in the Postgres schema `lms` on the same cluster as the core `public` schema. `apps/lms/drizzle.config.ts` **must** carry `schemaFilter: ["lms"]` permanently — without it, `drizzle-kit push` drops every `public`-schema table.

Git history from the original nested repo is preserved at `../rpcourses-git-history-backup`.

## Context

Monorepo consolidation is required so that LMS code can import core modules (identity, events, jobs, policy) via relative paths in the same workspace. The schema-per-domain approach (`public` for site/core, `lms` for LMS, `jobs` for pg-boss) avoids naming collisions while keeping a single cluster.

The `schemaFilter` requirement was **proven destructively** on a throwaway Postgres 18 cluster: without the filter, drizzle-kit interprets the `lms` schema's tables as the full desired state and drops the `public` tables it does not know about. This is not a drizzle bug to be fixed upstream; it is the intended behavior of the `--schema` flag. The filter is the correct guard.

## Consequences

- LMS and site share one database connection pool, one schema migration path (two drizzle configs), and one event outbox.
- LMS logins and enrollments map into `core_persons` + `core_identities`.
- `StudentEnrolled` and `CourseCompleted` events flow through the shared outbox into the knowledge graph.
- **Non-negotiable constraint:** anyone running `drizzle-kit push` on the LMS config must understand the schemaFilter; removing it silently destroys production data.
- drizzle-kit's differ is broken against PostgreSQL 18 named NOT NULL constraints (tries `ALTER … DROP CONSTRAINT *_not_null`, errors on PKs). Workaround: drop/recreate the local DB and push fresh rather than diffing.

## Alternatives considered

- Separate clusters per app: correct isolation but doubles ops cost and breaks the one-spine thesis (D-008).
- Single drizzle config for both schemas: would require merging all LMS and core schemas, creating tight coupling.
