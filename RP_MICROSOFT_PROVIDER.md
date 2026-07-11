# RP_MICROSOFT_PROVIDER — Microsoft for Nonprofits Analysis

Position: Rising Promise cannot afford to *operate two overlapping productivity stacks*. Google Workspace is designated primary (RP_MASTER_ARCHITECTURE D3). Microsoft's grant is still valuable — but for **specific, non-overlapping capabilities**, and several components should remain dormant options. WHY: dual-stack identity (Entra + Cloud Identity both live) is how small orgs end up with orphaned accounts and split document truth.

## 1. Component determinations

| Component | Determination | WHY |
|---|---|---|
| Azure (granted credits, ~$2k/yr) | **Integrate — infra escape valve.** Candidate for hosting `rp-core` (App Service/Container Apps) + Postgres backups to Azure Blob, reducing Railway spend | Granted credits offset real hosting cost; also a DR target |
| Entra ID | **Optional/dormant.** Do not run as second IdP. Revisit only if a government contract mandates Microsoft ecosystem | Two IdPs = orphaned-account risk with no offsetting benefit |
| SharePoint | **Do not adopt** for documents (Drive is primary). Exception: if a specific funder/partner requires SharePoint collaboration space | Split document truth is worse than either stack alone |
| Teams | **Do not adopt** internally (Meet/Chat). Exception: partner-facing calls hosted on the partner's stack | Same duplication logic |
| Power Automate | **Constrained adoption.** Allowed for staff self-serve flows touching *Microsoft-side* assets only; platform automations stay in the internal job queue | Vendor flows are unversioned, unobservable — violate VERIDIAN observability if they carry business logic |
| Power BI | **Optional secondary** to Looker Studio. Adopt only if a government funder requires .pbix deliverables (some do) | Real WIOA/gov reporting sometimes expects Power BI; keep the door open |
| Microsoft Forms | **Do not adopt.** Public intake stays on-platform | Data silo |
| Planner | **Do not adopt** (use whatever PM tool staff already use; not a platform concern) | — |
| Bookings | **Integrate — real gap-filler.** Advising appointments, CNA info sessions, volunteer interviews. Google has no free granted equivalent (Appointment Schedule is weaker for multi-staff) | Scheduling pages are pure bought-capability; zero build |
| Defender / Intune | **Adopt for org-owned devices** if/when the org issues laptops (housing staff, instructors). Not a platform integration | Device security matters once staff handle resident PII in the field |
| Microsoft 365 Copilot | **Do not purchase.** AI needs are met by the platform `ai.*` provider + Gemini in Workspace | Paying for a third AI surface duplicates granted capability |
| Microsoft Ads for Social Impact | **Activate** alongside Google Ad Grants | Additional free acquisition channel |

## 2. Provider module surface (deliberately small)

```ts
providers/microsoft/
  bookings.ts   // appointment types, booking webhooks -> person graph events
  graph.ts      // minimal MS Graph client underlying bookings; expansion point
  powerbi.ts    // (dormant) dataset push, built only when a funder requires it
```

Azure hosting/DR is an ops decision, not a code provider.

## 3. Summary rule

Microsoft components are adopted only where they are (a) genuinely free capability with no Google/internal equivalent (Bookings, Azure credits, MS Ads), or (b) mandated by a funder (Power BI, SharePoint, Entra). Everything else stays dormant, documented, and revisitable — recorded as `status: dormant` entries in the capability registry so the option is visible, not forgotten.
