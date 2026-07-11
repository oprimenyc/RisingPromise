# RP_DONOR_PLATFORM — Donor Ecosystem

Today: one-time Stripe Checkout donations with webhook confirmation and a Resend receipt, plus a raffle. No donor records (only donation rows keyed by email), no recurring giving, no segmentation, no stewardship. The raffle admin list is the closest thing to a CRM.

Strategy: **own the donor data spine internally; buy the campaign surfaces.** WHY: donor relationships are a decade-scale asset that must not live inside a vendor; but campaign pages, P2P, and Giving Tuesday microsites are commodity UI Givebutter provides free.

## 1. Donor CRM (donors schema, on the person graph)

- Donors are `core.persons` with a donor role — so a graduate who later gives, or a volunteer who converts to donor, is one record. This linkage is the entire point of the unified spine.
- `gifts` (person, amount, type: one_time|recurring|sponsorship|in_kind|raffle, campaign, source, paymentRef, receiptedAt) — existing `donations` and `raffle_entries` tables migrate in as gift types.
- `recurring_plans` (Stripe subscription ref, cadence, status, dunning state)
- `campaigns` (name, goal, channel, QR-code slugs — QR campaign = campaign + short URL + source attribution)
- `segments` (rule-based: first-time, lapsed 12mo, monthly, major-gift threshold, program-affinity from graph)
- `stewardship_touches` (person, type: receipt|thanks|impact_report|call, dueAt, completedAt)
- `pledges` / `sponsorships` (corporate: company entity, contact persons, benefits owed, fulfillment status)

## 2. Giving capabilities

| Capability | Implementation | WHY |
|---|---|---|
| One-time | keep existing Stripe Checkout (works) → events → CRM | already verified in runtime |
| Recurring | Stripe subscriptions via payments capability; donor self-service portal (Stripe billing portal — zero build) | monthly donors are the highest-LTV segment; currently impossible |
| Employer matching | Double the Donation search widget on confirmation page + Benevity org listing | found money; no build beyond a widget |
| Corporate sponsorship | CRM pledges + esign for sponsorship agreements + benefits checklist | sponsorships fail on unfulfilled benefits, not on asks |
| Giving Tuesday / campaigns | Givebutter campaign pages, webhook → `gifts` | commodity UI |
| P2P fundraising | Givebutter P2P, webhook ingest | same |
| QR campaigns | internal short-link service `/g/<slug>` with attribution → checkout | attribution must land in our data, not a vendor's |
| Raffle | keep; harden (crypto-random entry codes, state raffle-law compliance review, per-state eligibility) | working revenue; legal risk noted in RP_UNKNOWN_UNKNOWNS |

## 3. Automated stewardship (event consumers, not cron sprawl)

- `gift.recorded` → receipt (exists) + IRS-compliant year-end statement job (Jan; required language re: goods/services — currently missing from receipts) 
- first gift → welcome series (mail.marketing provider)
- recurring failed → dunning sequence
- 90 days pre-lapse → re-engagement segment
- gift ≥ major threshold → task for ED (human call, not email) + Decision Ledger note
- donor who was a program participant → impact story matching their program (graph query)

## 4. Major donor cultivation

Pipeline stages (identify → qualify → cultivate → solicit → steward) as `major_donor_pipeline` rows with owner + next action + notes. The Development department agent drafts briefs before meetings (giving history, relationships from graph, program affinity). Human relationship stays human; the platform removes the research burden.

## 5. Compliance & trust

- State charitable solicitation registration tracked in `compliance` provider — soliciting nationally online triggers multi-state registration duty (see RP_UNKNOWN_UNKNOWNS).
- Receipts must carry EIN + no-goods-or-services language.
- Candid/GuideStar profile kept current (Seal level) — donors check it; it's a conversion factor.
- PCI: never touch card data (Checkout/Givebutter hosted only) — preserves current posture.

Dependencies: core identity/person graph, event bus, payments + mail + esign providers. Buildable in parallel with Grant OS; shares the funder/stewardship machinery.
