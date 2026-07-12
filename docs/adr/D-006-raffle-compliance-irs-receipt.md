# D-006 — Crypto-random raffle codes, IRS receipt language, no body logging

**Date:** 2026-07-11  
**Area:** Compliance  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

1. Generate raffle ticket codes using `crypto.randomBytes` (not Math.random or sequential integers).
2. Add IRS-required "no goods or services were provided in exchange for this contribution" language to donation receipts.
3. Add raffle non-deductibility notice (raffle tickets are not tax-deductible charitable contributions).
4. Stop logging API response bodies (which contained PII).

## Context

Sequential or Math.random raffle codes are predictable — a motivated participant could enumerate valid codes. IRS receipt language is legally required for charitable contributions. Raffle tickets are legally distinct from donations and must be explicitly noted as non-deductible. Response body logging was emitting PII to server logs.

## Consequences

- Drawing integrity ensured cryptographically.
- IRS receipt compliance for charitable contributions.
- Legal distinction between donations and raffle purchases is clear to participants.
- PII no longer reaches server logs.
- Multi-state raffle sales are flagged ⚖️ for counsel review before expanding (legal question #1 in RP_UNKNOWN_UNKNOWNS).

## Alternatives considered

- UUID v4 for raffle codes: acceptable entropy, but crypto.randomBytes is more direct for this use case.
- Structured logging with PII masking: correct long-term approach; blanket response-body exclusion is safer for M0.
