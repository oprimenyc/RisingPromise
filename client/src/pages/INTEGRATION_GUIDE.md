# Rising Promise — New Pages Integration Guide
# Generated: April 2026
# Add these files to the existing React/Vite app on Railway

## 1. COPY FILES INTO THE PROJECT

Place these files in: `client/src/pages/`

| File | Route |
|---|---|
| `programs.tsx` | `/programs` |
| `program-cna.tsx` | `/programs/cna` |
| `program-it.tsx` | `/programs/it` |
| `program-via.tsx` | `/programs/via` |
| `program-housing.tsx` | `/programs/housing` |
| `about.tsx` | `/about` |

---

## 2. UPDATE App.tsx — ADD ROUTES

Find the `<Switch>` block in `client/src/App.tsx` and add these routes:

```tsx
import Programs from "@/pages/programs";
import ProgramCNA from "@/pages/program-cna";
import ProgramIT from "@/pages/program-it";
import ProgramVIA from "@/pages/program-via";
import ProgramHousing from "@/pages/program-housing";
import About from "@/pages/about";

// Inside <Switch>:
<Route path="/programs" component={Programs} />
<Route path="/programs/cna" component={ProgramCNA} />
<Route path="/programs/it" component={ProgramIT} />
<Route path="/programs/via" component={ProgramVIA} />
<Route path="/programs/housing" component={ProgramHousing} />
<Route path="/about" component={About} />
```

---

## 3. UPDATE Header/Nav — ADD NAVIGATION LINKS

In `client/src/components/Header.tsx`, add these nav items:

```tsx
<Link href="/about">Our Story</Link>
<Link href="/programs">Programs</Link>
```

The existing "Donate" and other links stay as-is.

---

## 4. UPDATE LANDING PAGE — ADD PROGRAM LINKS

In `client/src/pages/landing.tsx`:

- The "Explore Our Programs" button should link to `/programs`
- The "Our Team" section — link each name to `/about`
- Any "Learn More" or "Get Involved" CTAs should link to `/get-involved`

---

## 5. BRAND/FONT NOTE

All new pages use inline CSS and reference:
- `'DM Sans', 'Inter', sans-serif` — verify this is loaded in `client/index.html`
  or `client/src/index.css`
- Colors: `#0D1B2A` (navy), `#c9a84c` (gold), `#1B9CE5` (sky blue)
  These match the existing Rising Promise brand.

If DM Sans isn't installed, add to `client/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@400;600;700;900&display=swap" rel="stylesheet">
```

---

## 6. GET-INVOLVED PAGE

The existing `/get-involved` or `/donate` page already exists.
Verify it has:
- Email signup form (for program waitlist)
- Donate button (Stripe)
- Raffle link (when active)
- Partner/contact form

All new pages route to `/get-involved` for CTAs.

---

## 7. RPCOURSES INTEGRATION (FUTURE — AUDIT PENDING)

Once the CompTIA platform audit is complete:
- Deploy rpcourses to `courses.risingpromise.org` (subdomain)
- The IT program page (`/programs/it`) CTA button can be updated to:
  `<a href="https://courses.risingpromise.org">Access Course Platform</a>`
- No code changes needed to the main site until then

---

## 8. PAGE STATUS SUMMARY

| Page | Voice | Status Flag |
|---|---|---|
| /programs | Mission-first overview | Live when routes added |
| /programs/cna | "In Development" — honest | Audit status banner |
| /programs/it | "Under Audit" — honest | Platform exists, being reviewed |
| /programs/via | "Phase 2 — Planned" | Waitlist open |
| /programs/housing | "Planning Phase" | Partner outreach encouraged |
| /about | Personal, direct | Team bios + org values |

---

## NOTE ON WIOA BRANDING

None of the new public-facing pages mention WIOA prominently.
WIOA is referenced only as a funding mechanism in program detail pages
(buried in the "Funding Options" section where it belongs).
The student-facing platform (rpcourses) handles WIOA compliance reporting
in its admin dashboard — not the public site.
