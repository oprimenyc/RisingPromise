# D-002 — Site admin auth: SHA-256 + rate limit, exec bible behind auth

**Date:** 2026-07-11  
**Area:** Security  
**Status:** accepted  
**Actor:** Claude (M0)  
**Milestone:** M0  

## Decision

Replace the shared-cleartext admin password with timing-safe SHA-256 comparison against `ADMIN_PASSWORD_SHA256`. Add a per-IP rate limit on the admin authentication endpoint. Move the exec bible (sensitive operational documentation) behind this auth layer and remove it from the static client build.

## Context

The site admin used a plaintext password comparison vulnerable to timing attacks and had no rate limiting, enabling brute-force. The exec bible was accessible without authentication in the compiled client bundle.

## Consequences

- Timing and enumeration attacks on the admin password are closed.
- Brute-force significantly impeded by rate limiting.
- Exec bible no longer shipped in the public bundle.
- This is a stopgap; the full session auth system (Google OIDC + Policy Engine) shipped in M1 (D-012, D-013). Admin surfaces will migrate onto broker sessions in a follow-on pass once Google credentials are activated.

## Alternatives considered

- bcrypt: correct for password storage, but the secret is already an env variable under operator control — SHA-256 is sufficient for a bearer token comparison and avoids a new dependency.
- Remove the admin UI entirely: too disruptive to operations.
