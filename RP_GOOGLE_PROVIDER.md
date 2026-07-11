# RP_GOOGLE_PROVIDER — Google for Nonprofits as Infrastructure

Premise: Google for Nonprofits is approved but, per the audit, **nothing in the codebase touches any Google API**. Treat Workspace as the org's operating substrate; the platform integrates rather than replaces it.

## 1. Capability-by-capability determination

| Google capability | Status today | Determination | WHY |
|---|---|---|---|
| Workspace (Gmail/Drive/Docs/Sheets/Slides) | Owned, unintegrated | **Adopt as system of record for documents.** Shared drives per department (Grants, Board, Programs, Finance). | Free, permissioned, familiar to nonprofit staff/volunteers; custom DMS is wasted engineering |
| Cloud Identity / OIDC | Unused | **Integrate — becomes `identity.oidc` provider.** Replaces Replit Auth. | Kills Replit lock-in; SSO+MFA+offboarding for free |
| Admin SDK | Unused | **Integrate (staff lifecycle automation):** provisioning/deprovisioning Workspace accounts from `core.persons` role changes | Orphaned accounts are the #1 small-org security hole |
| Drive API | Unused | **Provider module `storage.files`.** Evidence vault for grants, student documents, housing files — DB stores metadata + Drive fileId | Grant reporting requires organized evidence; Drive already granted |
| Docs API | Unused | **Provider module `docs.generate`.** Template-merge for award letters, certificates, receipts, MOUs | Staff edit templates in Docs without engineering |
| Sheets API | Unused | **Integrate (export surface).** Every registry/report exportable to Sheets | Board and case workers live in spreadsheets; cheaper than building admin tables for every dataset |
| Forms | Unused | **Optional.** Internal/volunteer quick surveys only. Public intake stays on-platform | On-platform forms feed the person graph; Forms data would silo |
| Calendar API | Unused | **Integrate.** Class schedules, clinical rotations, volunteer shifts, grant deadlines as shared calendars written by the platform | Deadlines that live only in a DB get missed; calendars are where humans look |
| Meet | Owned | Adopt operationally (virtual instruction, board). No API work | Link storage only |
| Groups | Owned | Adopt: role-based lists (board@, instructors@) synced from RBAC via Admin SDK | One source of truth for "who is on the board" |
| Apps Script | Unused | **Constrain.** Allowed for staff self-serve spreadsheet tooling; forbidden as platform runtime | Unversioned Script sprawl becomes shadow IT |
| Gemini | Granted in Workspace | Optional secondary `ai.*` provider + staff document assistance | Diversity behind the AI interface |
| Maps | Unused | Later: housing/service-area mapping. Not a milestone | No current consumer |
| GA4 / Tag Manager / Search Console | Not installed | **Integrate immediately** on public site | Prerequisite for Ad Grants; measures donation funnel |
| Looker Studio | Unused | **Adopt as dashboard layer** over Postgres read-replica/Sheets exports | Free BI; avoids building custom dashboards for board/funders |
| Google Ad Grants ($10k/mo) | Unclaimed value | **Activate** (needs site quality + GA4 + conversion goals) | Free student/donor acquisition — highest-ROI marketing asset available |
| YouTube (nonprofit program) | Unused | **Integrate as `video.hosting`** for LMS module videos (unlisted) + donation cards on public videos | Replaces bare `videoUrl` strings; free CDN + captions |

## 2. What is missing entirely (Google-side)
- No org-wide DLP/retention policy on Drive (student PII will end up there — configure Vault/retention before evidence vault goes live).
- No conversion tracking → Ad Grants ineligible today.
- Domain email auth (SPF/DKIM/DMARC) must be verified for both Gmail and Resend sending domains — donation receipts landing in spam is a donor-trust failure.

## 3. Provider module surface

```ts
providers/google/
  identity.ts    // OIDC broker (staff + optional public "Sign in with Google")
  adminsdk.ts    // account provisioning, group sync   [staff-scoped service account]
  drive.ts       // evidence vault: ensureFolder, storeFile, link
  docs.ts        // generateFromTemplate(templateId, mergeFields) -> pdf/docx
  sheets.ts      // exportDataset(name, rows)
  calendar.ts    // upsertEvent(calendarId, event)  [L-007 rules apply to any recurrence]
  youtube.ts     // resolveVideo(videoId) -> playable embed metadata
  analytics.ts   // server-side GA4 events (donation_completed, application_submitted)
```

Scopes: one service account with domain-wide delegation, narrowest scopes per module, keys in secret manager, every call audited. Admin SDK actions (account create/suspend) require Policy Engine approval (they are destructive-class operations).
