# RP_VOLUNTEER_PLATFORM — Volunteer Operating System

Today: nothing exists (no volunteer table, form, or page). Volunteers matter doubly here: they are labor (instructors, mentors, housing support) *and* the top of the donor/board funnel.

## 1. Lifecycle model (volunteers schema, on the person graph)

```
application → screening → onboarding → active (shifts/hours) → recognition → leadership/board pipeline
```

- `volunteer_applications` (person, interests[], skills, availability, source: volunteermatch|site|referral)
- `screenings` (person, backgroundCheckStatus + provider reference — **never store the report**, only pass/fail/date/ref; required for roles touching students, minors-adjacent foster youth, or housing residents)
- `agreements` (waiver, confidentiality, code of conduct — esign provider, signed doc in Drive)
- `role_assignments` (role: instructor|mentor|event|admin|driver, requiresScreening flag enforced by Policy Engine — an unscreened person **cannot** be assigned a screened role; this is a hard invariant, not a warning)
- `shifts` (program, datetime, capacity, location) + `shift_signups` + Calendar provider sync
- `hours_log` (person, program, hours, verified) → feeds grant match/in-kind evidence (`evidence_items`) at the IRS/Independent Sector volunteer-hour rate
- `trainings` (delivered through the LMS — volunteers are just learners in volunteer-track courses; zero new infrastructure) 
- `recognition` (milestones: 10/50/100 hrs → certificate via docs.generate, shout-out task for Communications)

## 2. Sourcing & communication

- VolunteerMatch/Idealist listings (listing-only provider; applications still land on-platform).
- Segments + campaigns via mail.marketing; shift reminders via sms.messaging (Twilio) — no-show rates are the #1 volunteer ops problem and SMS is the fix.
- Bookings (Microsoft provider) for volunteer interview scheduling.

## 3. Retention & leadership pipeline

Event-driven signals: no shift in 60 days → re-engagement; high-hours + instructor-rated → flagged to Volunteer Services agent as leadership candidate; leadership candidates surface in the board-development pipeline (Board Administration department). Volunteer→donor conversion: annual impact summary with soft ask (segment excludes anyone with an active hardship-program participation — the graph knows; asking a current housing resident for money is a trust violation).

## 4. Dependencies

Core identity/graph, Policy Engine (screening invariant), LMS (training), esign + backgroundcheck + calendar + sms providers, evidence pipeline (hours → grants). Builds after LMS migration; the screening invariant and hours→evidence link are the two pieces that must be right on day one.
