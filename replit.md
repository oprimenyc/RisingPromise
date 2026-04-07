# Rising Promise Website

## Overview

Rising Promise is a nonprofit website designed to empower vulnerable populations through workforce training and community support. The application is a modern, mobile-optimized single-page React application with a content management system built around a centralized configuration file (`siteConfig.ts`). The design emphasizes emotional storytelling, clean aesthetics, and ease of content updates without requiring code changes.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Visual & Cosmetic Revamp (April 2026)
- **Fonts**: Switched to DM Serif Display (headings) + DM Sans (body) from Google Fonts
- **Color System**: Full palette update
  - Primary: #1A56DB (deep electric blue)
  - Secondary/dark sections: #0B1F3A (near-black navy)
  - Accent: #E8A020 (warm amber/gold)
  - Background: #FAFAF9 (warm white), Surface-alt: #F4F4F2
- **Border Radius**: 8px cards (lg), 4px buttons (md), 2px (sm) — no pill shapes
- **Framer Motion Animations**: Replaced useScrollReveal hook with Framer Motion
  - Hero: staggered fade+rise on page load
  - Sections: `whileInView` with `viewport={{ once: true }}`
  - Cards: staggered children with 0.1s delay between
  - Respects `prefers-reduced-motion`
- **Hero Section**: Left-aligned layout, dark gradient background, hero image at 15% opacity as texture, noise overlay, amber label + accent bar above headline, sharp-edge buttons
- **Section Watermarks**: Large faint numerals (01, 02, 03) behind Story, What We Do, Team sections
- **Navigation**: Always-dark (#0B1F3A) header, amber hover underline on links, shadow added on scroll
- **Who We See**: Now a dark section with amber left-borders on each paragraph, amber highlighted box
- **What We Do Cards**: White cards with 3px blue top accent bar, icon in amber-light square, hover shadow
- **Impact Section**: Dark bg, stat numbers in amber at 4rem DM Serif, vertical dividers, italic closing paragraph
- **Team Cards**: Amber ring on photos, decorative quote mark in amber
- **Join Us**: Left card has blue top accent, right card has amber top accent; action buttons are text-style with arrow (except "Donate Now" which stays filled)
- **Footer**: Social icons amber on hover, all text white/muted
- **StatCounter**: Added `style` prop support for arbitrary inline styles

### Donation System Implementation (October 31, 2025)
- **Stripe Integration**: Configured Stripe payment processing for nonprofit donations
  - Installed Stripe packages and blueprint integration
  - Requires three environment secrets: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`, `STRIPE_WEBHOOK_SECRET`
  
- **Database Schema**: Added `donations` table to track all donation transactions
  - Fields: donorName, donorEmail, amount, currency, stripeSessionId, stripePaymentIntentId, stripePaymentStatus
  - Status tracking: pending → succeeded (via webhook confirmation)
  
- **Backend API Endpoints**:
  - `POST /api/donations/create-checkout-session`: Creates Stripe Checkout session and redirects to hosted payment page
  - `POST /api/webhooks/stripe`: Receives Stripe webhook events with signature verification (security-critical)
  
- **Frontend Features**:
  - Donation dialog with preset amounts ($25, $50, $100, $250, $500) and custom amount option
  - Donor name (optional) and email (required for tax receipt) collection
  - Integration with "Donate Now" button in Join Us section
  - Redirects to Stripe Checkout for secure payment processing
  
- **Security**: 
  - Webhook signature verification using `stripe.webhooks.constructEvent` to prevent forged payment confirmations
  - Raw body preservation in Express middleware for signature validation
  
- **Future Enhancements**:
  - Email confirmation with tax receipt (requires email service integration like SendGrid or Resend)
  - 501(c)(3) status disclosure included in donation dialog

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured for fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing (single-page application with `/` route)
- **TanStack Query v5** for server state management and data fetching

**UI Component Library**
- **shadcn/ui** components built on Radix UI primitives
- Components follow the "New York" style variant
- Extensive component library including forms, dialogs, navigation, data display, and feedback components
- All UI components are located in `client/src/components/ui/`

**Styling System**
- **Tailwind CSS** for utility-first styling with custom configuration
- Custom design tokens for colors, spacing, typography, and border radius
- CSS variables for theming (light/dark mode support)
- Typography: Montserrat (headings) and Open Sans (body text) via Google Fonts CDN
- Design guidelines documented in `design_guidelines.md` emphasizing nonprofit storytelling aesthetic

**Content Management**
- Centralized configuration in `client/src/lib/siteConfig.ts`
- TypeScript schemas in `shared/schema.ts` define all content structure
- Feature toggles allow enabling/disabling sections (raffle, programs, applications)
- All text, images, links, and settings editable through single configuration file
- No HTML/CSS editing required for content updates

**State Management**
- React hooks for local component state
- TanStack Query for server state and caching
- Custom hooks in `client/src/hooks/` (mobile detection, toast notifications)

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for HTTP server
- Minimal API surface - primarily serves static React application
- Development server integrates Vite middleware for HMR
- Production build serves pre-compiled static assets

**API Design**
- RESTful API structure (routes prefixed with `/api`)
- Placeholder route registration in `server/routes.ts`
- Request/response logging middleware
- Storage abstraction layer in `server/storage.ts`

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development
- Storage interface designed for CRUD operations (users as example)
- Ready for database integration via storage interface pattern

### External Dependencies

**Database**
- **Drizzle ORM** (v0.39.1) configured for PostgreSQL
- Schema definitions in `shared/schema.ts`
- Migration configuration in `drizzle.config.ts`
- **Neon Serverless PostgreSQL** driver (@neondatabase/serverless)
- Database provisioning expected via `DATABASE_URL` environment variable
- Note: Database may not be actively used yet; Drizzle setup is infrastructure-ready

**Third-Party Services & APIs**
- **Stripe** - Payment processing for donations (v17.4.0)
  - Stripe Checkout for hosted payment pages
  - Webhook signature verification for secure payment confirmations
  - Test mode configured for development (requires STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY, STRIPE_WEBHOOK_SECRET)
- **Google Fonts CDN** - Montserrat and Open Sans typography
- **Unsplash** - Stock photography for hero images and backgrounds
- **Font Awesome** - Icon library (referenced in static HTML files in `public/`)

**Development Tools**
- **Replit-specific plugins**:
  - `@replit/vite-plugin-runtime-error-modal` - Error overlay
  - `@replit/vite-plugin-cartographer` - Development mapping
  - `@replit/vite-plugin-dev-banner` - Development banner
- **tsx** - TypeScript execution for development server
- **esbuild** - Production server bundling

**UI Component Dependencies**
- **Radix UI** - Comprehensive headless UI primitives (20+ component packages)
- **Embla Carousel** - Carousel/slider functionality
- **React Hook Form** with Zod resolvers - Form validation and management
- **class-variance-authority** & **clsx** - Dynamic className composition
- **cmdk** - Command palette interface
- **Lucide React** - Icon system
- **date-fns** - Date manipulation utilities

**Session Management** (Infrastructure Ready)
- **connect-pg-simple** - PostgreSQL session store for Express
- Ready for session-based authentication implementation

### Build & Deployment

**Development**
- `npm run dev` - Runs development server with Vite HMR on Express backend
- TypeScript type checking via `npm run check`
- Database schema push via `npm run db:push`

**Production**
- `npm run build` - Compiles Vite frontend to `dist/public/` and bundles Express server to `dist/`
- `npm start` - Runs production server from compiled bundle
- Static assets served from `dist/public/`
- Server bundle uses ESM format with external package resolution

### Project Structure

```
client/               # Frontend React application
  src/
    components/ui/    # shadcn/ui component library
    hooks/           # Custom React hooks
    lib/             # Utilities and configuration
      siteConfig.ts  # Central content management file
    pages/           # Route components
    App.tsx          # Root application component
    main.tsx         # React entry point
    index.css        # Global styles and Tailwind imports

server/              # Backend Express application
  routes.ts          # API route registration
  storage.ts         # Data storage abstraction
  vite.ts            # Vite dev server integration
  index.ts           # Express server entry point

shared/              # Shared TypeScript definitions
  schema.ts          # Data schemas and types (Zod + Drizzle)

public/              # Legacy static HTML files (migration in progress)
  css/, js/          # Legacy stylesheets and JavaScript
  *.html             # Static HTML pages (index, programs, raffle)

attached_assets/     # Project documentation and requirements
```

### Notable Architectural Decisions

**Single Configuration Source**
- Chosen to enable non-technical content updates
- All editable content centralized in `siteConfig.ts`
- TypeScript provides type safety and IDE autocomplete for content editing
- Alternative of CMS was rejected to maintain simplicity and reduce dependencies

**Hybrid Static/Dynamic Architecture**
- Static React SPA for performance and simplicity
- Express backend provides flexibility for future API endpoints
- Current implementation is content-focused with minimal server interaction
- Allows future expansion to dynamic features (form submissions, authentication)

**Component Library Strategy**
- shadcn/ui chosen for customizability (copy components vs. package dependency)
- Comprehensive component set included preemptively for rapid development
- Radix UI primitives ensure accessibility compliance
- Tailwind CSS integration provides consistent styling

**Legacy Code Coexistence**
- `public/` directory contains original static HTML implementation
- React SPA in `client/` is the active implementation
- Dual implementation suggests migration in progress
- Legacy files maintained for reference or gradual transition

**Database Readiness**
- Drizzle ORM configured but not actively used in current implementation
- Storage abstraction layer allows easy database integration
- In-memory storage suitable for current content-driven use case
- Infrastructure ready for user data, form submissions, or dynamic content