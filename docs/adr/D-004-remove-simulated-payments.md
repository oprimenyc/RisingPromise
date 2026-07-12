# D-004 — Remove simulated payment path entirely

**Date:** 2026-07-11  
**Area:** Compliance  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Delete the simulated private-pay tuition payment path. All documentation and API responses now state explicitly that payments are not implemented.

## Context

The LMS contained a fake payment flow that produced simulated `$8,500` transaction records. These records were appearing in WIOA funding reports and creating a compliance liability — inflated program revenue figures in federal reports are a legal risk. There was also a general trust issue: production systems must never simulate real financial outcomes.

## Consequences

- No fake transaction records can be generated.
- WIOA funding reports are accurate.
- A real payment path (Stripe) is a deliberate M2 item, gated on an ED decision about tuition licensing (⚖️ flagged in the roadmap).
- Staff attempting to use the payment feature will receive a clear "not implemented" error rather than a fake success.

## Alternatives considered

- Flag it clearly and leave the code: code that exists gets used; removal is the only guarantee.
- Implement real Stripe immediately: M2 scope; tuition licensing question must be answered first.
