# RP_UNKNOWN_UNKNOWNS — Hidden Assumptions, Risks, Blind Spots

Ordered by (likelihood × damage). Items marked ⚖️ need counsel/CPA, not code.

## Legal & compliance
1. ⚖️ **Raffle legality.** Online paid-entry raffles are regulated per state; many prohibit online sale or require gaming permits. Current mitigation is a 500-char legal string in Stripe metadata. If entries were sold across state lines, exposure may already exist. Needs: counsel review, state gating, permit records, and "no purchase necessary" AMOE actually operationalized (the text claims it; no free-entry mechanism exists in code — a claim without runtime, and legally load-bearing).
2. ⚖️ **Charitable solicitation registration.** A national donate button triggers registration duties in ~40 states (or at least the Charleston-principles analysis). No evidence of registrations. Donor platform scale-up multiplies this.
3. ⚖️ **CNA program state approval.** CNA training requires state board approval, approved clinical sites, licensed instructor ratios, and mandated hour counts. The platform can track all of it, but the *approval itself* is a prerequisite — building CNA features before confirming approval status wastes the build.
4. **WIOA data handling.** WIOA participants' PII/outcome data carries federal handling requirements; it currently sits behind a missing admin check (live breach risk) and flows through CSVs with no access log.
5. ⚖️ **$8,500 private-pay tuition with a stubbed payment system.** If any student was ever onboarded through the simulated payment path, there are revenue-recognition and consumer-protection questions. Also: charging tuition may trigger state postsecondary/proprietary-school licensing — verify exemption status.
6. **IRS receipt language.** Current donation receipts likely lack the required "no goods or services were provided" statement; raffle payments are **not tax-deductible at all** and receipts must not imply they are.
7. **Insurance blind spot.** Volunteers in clinical settings, housing residents, drivers — general liability/D&O/abuse coverage status unknown to the platform; track policies + renewals in the compliance provider.

## Governance
8. **Bus-factor of one.** Everything (repo, Railway, Stripe, domain, admin password) appears controlled by one person. A recovery plan (documented credential escrow, second admin, board access to critical accounts) is a governance requirement funders ask about.
9. **Decision provenance.** Exec Bible v3.1 HTML floats untracked in the repo root and `/execbible` is publicly reachable by URL guess (`/execbible.html` served from public assets, only "not linked in nav") — internal strategy docs behind obscurity, not auth.
10. **Board records.** No minutes/resolution system; 990 and audits will ask.

## Donor & funder trust
11. **Impact numbers on the site are config strings** (`impactSchema` stats), not derived from data. Funders diligence these; the evidence pipeline must eventually back every public number.
12. **Email deliverability** — SPF/DKIM/DMARC posture for risingpromise.org unverified; receipts in spam = donor churn + missed acknowledgments.

## Technical & scalability
13. **The two-app split itself** — dual user identities guarantee data quality debt that compounds with every new signup; this is why identity unification leads the roadmap.
14. **Neon serverless cold-start + Railway sleep behavior** during a Giving Tuesday spike is untested; donation checkout is the one flow that must survive burst load (Cloudflare + load test before first campaign).
15. **`Math.random()` raffle codes** — predictable RNG in a money-linked drawing is both an integrity and optics problem.
16. **No backups verified.** Neon has PITR, but restore has never been exercised; an unexercised backup is a claim.
17. **OpenAI spend unbounded** per authenticated user (L-005 class).
18. **OneDrive-synced git repo** (repo lives under OneDrive Desktop) — sync conflicts can corrupt `.git`; move canonical clone out of synced folders or exclude it.
19. **Windows/dev vs Linux/prod** (`NODE_ENV=development tsx` scripts use POSIX env syntax that fails in PowerShell) — dev environment friction signals untested local dev path.

## Operational
20. **Program application dead-ends.** `program_applications` rows have a status workflow but no admin UI and disabled routes — applicants may currently apply into a void. This is a today problem, fixable in days, and it damages the exact population the mission serves.
21. **Single email inbox coupling** — info@ is the reply-to for everything; no ticketing/triage as volume grows.
22. **No offboarding** — departing volunteer/staff access removal is manual and unverifiable until identity unification + Admin SDK automation.
