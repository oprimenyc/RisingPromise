# Rising Promise Website

## Overview

Rising Promise is a nonprofit website designed to empower vulnerable populations through workforce training and community support. The application is a modern, mobile-optimized single-page React application with a content management system built around a centralized configuration file (`siteConfig.ts`). The design emphasizes emotional storytelling, clean aesthetics, and ease of content updates without requiring code changes.

## User Preferences

Preferred communication style: Simple, everyday language.

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