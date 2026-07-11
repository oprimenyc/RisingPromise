# RP_COURSE_PLATFORM — Unified Learning Platform

Starting point: `rpcourses/` is a real, working video-LMS for CompTIA Tech+ (courses → modules → video progress, study sessions, WIOA enrollments + CSV reporting, email automation, OpenAI tutor/resume tools). It is the most valuable code in the repo. Strategy: **migrate and extend it, do not rebuild** — but its data model is video-centric and cannot express CNA as-is.

## 1. Gap analysis vs. requirements

| Requirement | Today | Gap |
|---|---|---|
| CompTIA delivery | video modules + progress | works; needs assessments + real payments |
| CNA delivery | nothing | needs attendance, skills checklists, **clinical hour tracking**, state-exam readiness — CNA is a hands-on program; a video LMS cannot certify it |
| Assessments | none (docs imply, code lacks) | quiz engine (item banks, attempts, pass thresholds) |
| Certificates | none | completion cert generation via `docs.generate` provider (Google Docs template → PDF), verifiable ID + public verify URL |
| Instructor dashboards | none (only admin) | instructor role: roster, attendance entry, skills sign-off, gradebook |
| Attendance/Scheduling | none | session calendar (Calendar provider) + per-session attendance records — WIOA and CNA state approval both require attendance evidence |
| Volunteer instructors | none | instructor role assignable to volunteers (person graph link to RP_VOLUNTEER_PLATFORM) |
| Voucher management | none | CompTIA/Prometric voucher inventory: purchased → assigned → redeemed → result |
| Payments | **stubbed** (`paymentService.ts` simulates) | real Stripe checkout via payments capability; WIOA-funded path bypasses with funder record instead of fake txn |
| SCORM | none | **defer.** Adopt SCORM/xAPI only when importing third-party courseware; native content doesn't need it. Record as dormant capability |
| Auth | Replit-locked | move to core identity (D3) |
| Admin security | `isAuthenticated` only — critical hole | RBAC from core; fix precedes ANY new feature |

## 2. Target data model (lms schema, extending existing tables)

Keep: `courses`, `modules`, `enrollments`, `user_progress`, `study_sessions`, `email_*`, `wioa_reports`.
Change: `users` → replaced by `core.persons` + `core.identities`; `enrollments.userId` → personId. `enrollments` gains `fundingSource` (WIOA | private | scholarship | voucher) replacing the user-level `fundingType` — **funding is a property of an enrollment, not a person** (a person can be WIOA-funded for CompTIA and private-pay for CNA).

Add:
- `cohorts` (course, start/end, instructorIds, capacity, modality) — CNA runs in cohorts; CompTIA can be self-paced (cohortId nullable)
- `class_sessions` (cohort, datetime, location, type: lecture|lab|clinical) + `attendance` (session, person, status, recordedBy)
- `skill_checklists` + `skill_signoffs` (person, skill, instructor, date) — CNA state skills validation
- `clinical_hours` (person, site, date, hours, supervisor, verified) — state boards require documented clinical hours
- `assessments`, `questions`, `attempts`, `attempt_answers`
- `certificates` (person, course, issuedAt, verificationCode, docFileId)
- `vouchers` (vendor, code-ref, cost, assignedTo, redeemedAt, examResult)
- `partner_sites` (clinical partners, MOU doc link via esign provider)

Every mutation emits events (`lms.attendance.recorded`, `lms.certificate.issued`…) consumed by audit, graph, and department automations.

## 3. Experience surfaces

- **Student dashboard** (exists — extend): progress, upcoming sessions, assessments due, certificate wallet, career tools (existing resume-builder/interview pages kept, rewired to `ai.*` provider with metering).
- **Instructor dashboard** (new): today's session → roster → tap-to-mark attendance; skills sign-off; flag at-risk students (feeds Programs department agent).
- **Admin/compliance** (exists — secure + extend): WIOA CSV (keep), cohort management, voucher inventory, outcome recording (employment within N days — WIOA performance metric).

## 4. Future certification expansion

The cohort/session/skills/voucher model generalizes: adding a certification = new course + optional skills checklist + voucher vendor entry. No schema change. WHY this design: CNA forces the general shape (instructor-led, hands-on, externally examined) — build once for the hard case and CompTIA's self-paced case is the degenerate version.

## 5. Migration sequencing (feeds roadmap)

1. Fix admin RBAC hole (blocking; security tier-2 per Constitution).
2. Swap Replit Auth → core identity.
3. Move `rpcourses` into the monorepo, merge DB into `lms` schema, personId migration.
4. Real payments or removal of the private-pay claim (an $8,500 fake-payment path is a trust/compliance liability).
5. Assessments + certificates (completes CompTIA).
6. Cohorts/attendance/skills/clinical (unlocks CNA).
