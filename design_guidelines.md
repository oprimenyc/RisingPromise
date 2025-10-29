# Rising Promise Website - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Nonprofit Storytelling + Modern Web Best Practices)

Drawing inspiration from mission-driven organizations like charity: water, Pencils of Promise, and DoSomething.org - organizations that combine emotional storytelling with clean, modern design and clear calls-to-action.

**Core Principles:**
- Emotion-first, human-centered design that empowers rather than pities
- Clear visual hierarchy that guides users through the story
- Generous whitespace to let powerful messaging breathe
- Action-oriented design with prominent CTAs throughout

---

## Typography System

**Font Families (Google Fonts via CDN):**
- Headers: Montserrat (weights: 600, 700, 800)
- Body: Open Sans (weights: 400, 600)

**Typography Scale:**
- Hero Headline: text-5xl md:text-6xl lg:text-7xl, font-bold (Montserrat)
- Section Headlines: text-3xl md:text-4xl lg:text-5xl, font-bold (Montserrat)
- Subsection Headlines: text-xl md:text-2xl lg:text-3xl, font-semibold (Montserrat)
- Body Large: text-lg md:text-xl (Open Sans)
- Body Regular: text-base md:text-lg (Open Sans)
- Small Text: text-sm md:text-base (Open Sans)
- Stat Numbers: text-4xl md:text-5xl lg:text-6xl, font-bold (Montserrat)

**Line Heights:**
- Headlines: leading-tight (1.25)
- Body text: leading-relaxed (1.75)
- Maximum text width: max-w-4xl for readability

---

## Layout System

**Spacing Primitives (Tailwind units):**
- Micro spacing: 2, 4 (gaps, small padding)
- Standard spacing: 8, 12, 16 (section padding, card spacing)
- Large spacing: 20, 24, 32 (section separators)
- Extra large: 40, 48 (hero padding)

**Container Strategy:**
- Full-width sections: w-full with inner max-w-7xl mx-auto px-6 md:px-12
- Content sections: max-w-6xl mx-auto px-6 md:px-8
- Text-focused sections: max-w-4xl mx-auto px-6
- Section vertical padding: py-16 md:py-24 lg:py-32

**Grid System:**
- Feature cards: grid-cols-1 md:grid-cols-3 gap-8
- Team cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8
- Two-column layouts: grid-cols-1 lg:grid-cols-2 gap-12

---

## Component Library

### Navigation
- **Sticky Header:** Starts at h-20, shrinks to h-16 on scroll with smooth transition
- **Logo:** text-2xl font-bold
- **Menu Items:** text-base font-semibold, uppercase tracking-wide, spacing-x-8
- **Mobile:** Hamburger menu (Font Awesome bars icon), full-screen overlay navigation
- **Behavior:** Background transitions from transparent to solid on scroll with backdrop blur

### Hero Section
- **Height:** min-h-screen with flex items-center justify-center
- **Background:** Full-width image with dark overlay (bg-black/60)
- **Content:** Centered, max-w-5xl
- **Buttons:** Large CTAs (px-8 py-4 text-lg) with blur background for readability
- **Layout:** Headline, subheadline (max-w-3xl), button group with gap-4

### Section Headers
- **Pattern:** Centered headline + optional subtext (max-w-3xl mx-auto)
- **Spacing:** mb-12 md:mb-16 after headline

### Feature Cards
- **Structure:** Icon/image at top, headline, description, optional CTA
- **Styling:** Rounded corners (rounded-xl), subtle border or shadow
- **Padding:** p-8 md:p-10
- **Hover:** Subtle lift effect (transform translateY(-4px) + shadow increase)

### Stat Cards
- **Layout:** Large number on top, label below
- **Styling:** Minimal with emphasis on typography
- **Alignment:** Centered text

### Team Cards
- **Image:** Circular photos (rounded-full, aspect-square)
- **Size:** 300x300px images
- **Layout:** Image, name (text-xl font-bold), title (text-base), quote (text-sm italic)
- **Styling:** Clean white background with subtle shadow

### Forms
- **Input Fields:** 
  - Full-width with rounded-lg borders
  - px-4 py-3 text-base
  - Focus states with border highlight
- **Buttons:** 
  - Primary: Solid background with hover darken
  - Secondary: Outlined with hover fill
  - px-8 py-3 rounded-lg font-semibold
- **Validation:** Inline error messages below fields

### CTA Buttons
- **Primary:** Large, prominent (px-8 py-4), rounded-lg, font-semibold text-lg
- **Secondary:** Outlined variant or ghost style
- **Icon Buttons:** Icons from Font Awesome, left or right aligned with gap-2
- **States:** Distinct hover (slight scale/darken), active (slight scale down)

### Footer
- **Structure:** Multi-column layout (grid-cols-1 md:grid-cols-4)
- **Sections:** Logo/tagline, Quick links, Contact, Social
- **Styling:** Dark background with lighter text
- **Spacing:** py-16 with inner content spaced with gap-8

### Coming Soon Overlay
- **Implementation:** Fixed full-screen overlay (z-50) with backdrop blur
- **Content:** Centered message with "notify me" form
- **Control:** Toggle via config.js feature flag
- **Styling:** Semi-transparent dark background

---

## Images

**Hero Images:**
- Large, high-impact photography showing hope and forward movement
- 1920x1080 minimum, optimized for web
- Images should show: diverse people in learning/working environments, close-ups of hands working, bright natural lighting, hopeful expressions
- Avoid: sad/desperate imagery, institutional settings, stock photo clichés

**Team Photos:**
- Professional but warm portraits
- 400x400px, circular crop (rounded-full)
- Consistent lighting and background style across all team members
- Natural, approachable expressions

**Section Background Images:**
- Used sparingly for emotional impact (hero, possibly one accent section)
- Always with text-readable overlays (dark gradient or solid overlay at 60% opacity)

**Icons:**
- Font Awesome (via CDN) for all UI icons
- Size: text-4xl for feature card icons, text-xl for inline icons
- Style: Duotone or solid, consistent throughout

**Placeholders:**
- Use https://picsum.photos/ for development
- Hero: /1920/1080
- Team: /400/400
- Cards: /800/600

---

## Animations & Interactions

**Scroll Behavior:**
- Smooth scroll for anchor links (scroll-behavior: smooth)
- Fade-in on scroll for section content (use Intersection Observer)
- Stagger animation for card grids (50ms delay between cards)

**Header Behavior:**
- Transparent on hero, solid with shadow after scroll
- Height reduction on scroll with smooth transition
- Logo/nav items maintain readability throughout

**Hover States:**
- Cards: Subtle lift (translateY(-4px)) + shadow increase
- Buttons: Slight darken + optional scale(1.02)
- Links: Underline or color shift
- Duration: 200-300ms transitions

**Keep Minimal:**
- No parallax effects
- No complex scroll-triggered animations
- No auto-playing content
- Focus on performance and accessibility

---

## Accessibility

- Maintain WCAG AA contrast ratios throughout
- All interactive elements have focus states (outline with offset)
- Semantic HTML structure (header, nav, main, section, footer)
- Alt text for all images (managed via config.js)
- Form labels properly associated
- Keyboard navigation support for all interactions
- Skip-to-content link for screen readers

---

## Mobile Considerations

**Breakpoints:**
- Mobile: < 768px (base styles)
- Tablet: 768px (md:)
- Desktop: 1024px (lg:)
- Large: 1280px (xl:)

**Mobile-Specific Adjustments:**
- Stack all multi-column layouts to single column
- Hamburger navigation with full-screen menu
- Touch-friendly button sizes (minimum 44px height)
- Reduced padding/margins (use responsive spacing)
- Hero text scales down appropriately
- Team cards: 2 columns on tablet, 1 on mobile

---

## Page-Specific Notes

**Index.html:**
- 8 distinct sections with clear visual separation (alternating backgrounds optional)
- Generous spacing between sections (py-20 md:py-32)
- Strong vertical rhythm throughout
- Two-column Join Us section (stack on mobile)

**Raffle.html:**
- Pricing cards in 3-column grid (stack on mobile)
- Visual breakdown uses icon grid (4 columns → 2 → 1)
- Large CTA section with trust badges below

**Programs.html:**
- Expandable/collapsible "Learn More" sections (simple toggle)
- Program cards with consistent structure
- 3-step process with numbered badges and connecting line (mobile: vertical)
- Application form embedded or linked based on config toggle