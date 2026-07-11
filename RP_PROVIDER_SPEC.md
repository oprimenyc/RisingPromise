# RP_PROVIDER_SPEC — Provider Abstraction Layer

Rule: **no business logic may import a vendor SDK.** Today this rule is violated everywhere (Stripe in `server/routes.ts`, Resend in `server/email.ts`, OpenAI inside `rpcourses/server/storage.ts`, Replit OIDC in `replitAuth.ts`). WHY the rule: vendors change terms (Replit lock-in already blocks migration), nonprofit grants come and go, and testability requires fakes.

## 1. Contract shape

Every provider module lives in `providers/<name>/` and exports:

```ts
interface Provider {
  name: string;                 // "stripe", "google", ...
  capabilities(): CapabilityId[];   // registered in capability registry
  health(): Promise<HealthStatus>;  // real runtime probe, not "configured"
  config: z.ZodSchema;              // typed env requirements; boot fails loudly if unmet
}
```

Business logic depends only on **capability interfaces**, resolved from a registry:

```ts
const payments = registry.get<PaymentsCapability>("payments");   // stripe|paypal|givebutter behind it
const mail     = registry.get<TransactionalMail>("mail.transactional");
```

Rules:
- Capability interfaces defined in `core/capabilities/*.ts`; providers implement them.
- Every provider call is wrapped: timeout, retry policy, structured log, event on failure (Constitution §1 — degraded modes visible).
- Fakes: each capability ships an in-memory fake for tests and a `sandbox` mode for staging.
- Secrets: providers read only their declared config keys; boot-time validation lists missing keys explicitly (current code silently sets `stripe = null` and 500s later — forbidden going forward).

## 2. Capability → provider matrix

| Capability | Primary | Secondary/optional | WHY primary |
|---|---|---|---|
| `identity.oidc` | Google Cloud Identity | Microsoft Entra | Workspace already the org's email/docs home |
| `payments.checkout`, `payments.recurring` | Stripe (nonprofit rate) | PayPal Giving Fund | Already integrated & webhook-verified |
| `donations.campaigns`, `donations.p2p` | Givebutter | — | Free for nonprofits; avoids building campaign UI |
| `matching.corporate` | Benevity (listing) + Double the Donation widget | — | Employer matching is found money; listing-only, no build |
| `mail.transactional` | Resend (exists) | Brevo | Working today; keep |
| `mail.marketing` | Brevo | Mailchimp | Nonprofit pricing; API for segments |
| `sms.messaging` | Twilio (nonprofit credits) | SignalWire | Attendance nudges, raffle/class reminders |
| `esign` | DocuSign nonprofit | Adobe Sign | Housing agreements, volunteer waivers, MOUs |
| `docs.generate` | Google Docs API (template merge) | docx skill pipeline | Free; templates staff can edit themselves |
| `storage.files` | Google Drive (shared drives) | SharePoint | Granted 30TB-class storage; permission model exists |
| `video.hosting` | YouTube unlisted | Drive streaming | Free CDN; replaces raw `videoUrl` strings in LMS |
| `ai.chat`, `ai.generate` | Anthropic Claude | Gemini (granted), OpenAI (exists) | Behind one interface; per-user metering + daily spend cap mandatory (L-005) |
| `analytics.web` | GA4 + Search Console | — | Already grantable; Ads Grant requires it |
| `ads.grants` | Google Ad Grants ($10k/mo) | Microsoft Ads for Social Impact | Free acquisition for programs + donors |
| `crm.donors` | internal `donors` schema | (evaluate Bloomerang later) | Data spine ownership; see RP_DONOR_PLATFORM.md |
| `volunteers.sourcing` | VolunteerMatch (listing) | Idealist | Listing-only integration |
| `background.checks` | Sterling Volunteers | Checkr | Store status+reference only, never raw reports |
| `grants.discovery` | Grants.gov API + Candid FDO | Instrumentl (paid, later) | Grants.gov has a real public API |
| `compliance.registry` | SAM.gov entity API, IRS Pub 78, Candid/GuideStar profile | state registries (manual + calendar) | Automated "are we still valid" checks |
| `design.assets` | Canva API (nonprofit) | Adobe Express | Programmatic social/cert graphics |
| `edge.dns.security` | Cloudflare (Project Galileo) | — | Free WAF/rate limiting in front of Railway |
| `automation.flows` | internal job queue | Power Automate, Apps Script | Internal first; vendor flows only where staff self-serve |

## 3. Provider module design notes

- **TechSoup, Candid, GuideStar, IRS, SAM.gov, state registrations** are mostly *compliance data sources*, not runtime dependencies. Model them as a single `compliance` provider that (a) stores credentials/registration numbers + renewal dates in `core.registrations`, (b) runs scheduled verification jobs (SAM.gov status, Pub 78 listing), (c) emits `compliance.expiring` events 60/30/7 days out. WHY: a lapsed SAM.gov registration silently kills government contracting — this is the highest-leverage automation per line of code.
- **Stripe webhook handling** stays exactly as implemented (signature verification is correct today) but moves into `providers/stripe/webhooks.ts` and publishes `payments.succeeded` events instead of directly calling storage + email — decoupling fulfillment (raffle codes, receipts, donor CRM update) into event consumers.
- **Deferred providers** (documented, not built until a real consumer exists): Benevity API, VolunteerMatch API, Adobe, SignalWire, PayPal. WHY: Constitution §2 — speculative integration is tier-5 work.
