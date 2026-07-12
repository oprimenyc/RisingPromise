# D-011 — Six-state provider lifecycle with degraded grace and operator kill-switch

**Date:** 2026-07-12  
**Area:** Provider  
**Status:** accepted  
**Actor:** Claude (M1)  
**Milestone:** M1  

## Decision

Every provider moves through an explicit six-state lifecycle: `disabled` → `development` → `configured` → `verified` → `degraded` → `failed`. Transitions:

- `disabled`: operator kill-switch via `PROVIDERS_DISABLED` env list; never probed.
- `development`: credentials absent; activation-ready, missing keys named explicitly.
- `configured`: config present but not runtime-verifiable (manual channels, e.g. TechSoup), or probe not yet executed.
- `verified`: live probe against the real vendor API passed within the latency threshold.
- `degraded`: probe succeeded but slow (> `PROVIDER_DEGRADED_MS`, default 5000ms), **or** first failure after a verified/degraded run (transient grace).
- `failed`: second consecutive failure after a degraded state, or unambiguous hard failure.

Provider status is persisted in `core_capabilities` including `consecutiveFailures`, so the degraded→failed transition survives process restarts.

## Context

Mission requirement: no provider may silently fail or silently succeed without credentials. The previous state was binary (configured/unconfigured) and did not distinguish between "never probed," "slow," and "broken." Transient vendor blips must not immediately page the team; repeated failures must.

## Consequences

- `development` state with named missing keys makes activation a checklist, not a mystery.
- `degraded` absorbs transient vendor blips (vendor maintenance windows, slow responses) without masking real outages.
- The `PROVIDERS_DISABLED` kill-switch allows operators to disable a misbehaving provider without a deployment.
- Business logic imports capability lookups from the registry; it never imports vendor SDKs directly. If the capability is not `verified` or `degraded`, the feature reports `unavailable` with a reason.

## Alternatives considered

- Three states (unconfigured/healthy/failed): loses the distinction between "never tried" and "tried and broken," and has no graceful degradation window.
- Always-probe at request time: too slow; boot-time + scheduled probes with persistence is the right cadence.
