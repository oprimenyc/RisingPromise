# Veridian Tech - WIOA CompTIA Tech+ Training Platform

## Overview

Veridian Tech is a complete, production-ready, government-certified IT training platform designed to provide WIOA-compliant CompTIA technical certification training. The platform serves as a comprehensive learning management system that tracks student progress, manages course content, and generates compliance reports required for government funding and oversight. 

**Brand Identity**: Veridian Tech combines patriotic professionalism with cutting-edge technology, featuring a refined color palette and modern design that builds trust with both government agencies and private students. The platform justifies premium pricing ($8,500) through AI-powered competitive advantages and comprehensive career development.

**Complete Integration**: This is a unified, production-ready platform with all modules fully integrated - from user authentication and course delivery to AI-powered features, career development, payment processing, and WIOA compliance reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom styling for accessibility and consistency
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript throughout the entire stack for consistency and type safety
- **Database Layer**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Replit Auth integration with OpenID Connect for secure user management
- **Session Management**: Express sessions with PostgreSQL storage for persistent user sessions

### Data Storage Solutions
- **Primary Database**: PostgreSQL for relational data storage
- **Database Hosting**: Neon serverless PostgreSQL for scalable cloud database
- **ORM**: Drizzle with schema-first approach for database operations
- **Migration Management**: Drizzle Kit for database schema migrations and versioning

### Authentication and Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Storage**: PostgreSQL-backed session store with configurable TTL
- **Security**: HTTP-only cookies with secure flags for production environments
- **Middleware**: Custom authentication middleware for route protection

### Core Data Models
- **Users**: Profile information, enrollment tracking, and progress monitoring
- **Courses**: CompTIA certification course content and metadata
- **Modules**: Individual learning units within courses with duration tracking
- **Enrollments**: WIOA compliance data including enrollment dates, completion status, and employment outcomes
- **Progress Tracking**: User progress through modules and courses
- **Study Sessions**: Time tracking for compliance reporting requirements

### Key Features
- **Student Dashboard**: Progress tracking, course access, and performance metrics
- **Course Viewer**: Video content delivery with progress tracking and module navigation
- **AI-Powered Learning Tools**: AI chatbot assistant and AI resume builder for competitive advantage
- **Payment Processing**: Integrated payment gateway supporting both direct payment and WIOA funding
- **WIOA Compliance**: Automated data collection and reporting for government compliance requirements
- **Admin Management**: Comprehensive dashboard with student analytics and compliance monitoring
- **Bulk Operations**: Admin tools for importing multiple users and managing enrollments at scale
- **Automated Communications**: Email automation system with welcome sequences and progress tracking
- **CSV Export**: Standardized reporting format for WIOA compliance submissions
- **Production Monitoring**: Health check endpoints and comprehensive error handling

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Replit Auth**: Authentication service for user management and security
- **Replit Platform**: Development and hosting environment with integrated tooling
- **OpenAI API**: AI-powered features including chatbot assistant and resume builder
- **SendGrid**: Email automation and communication services
- **Stripe**: Payment processing for course enrollments (ready for production integration)

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessible component foundation
- **Lucide React**: Icon library for consistent visual elements throughout the application
- **TailwindCSS**: Utility-first CSS framework for responsive design and theming

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **Vite**: Build tool with hot module replacement for development
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database migration and schema management tooling

### Runtime Dependencies
- **Express.js**: Web application framework for API endpoints
- **TanStack Query**: Client-side data fetching and caching
- **Wouter**: Lightweight routing for single-page application navigation
- **Zod**: Schema validation for API inputs and data integrity

## Production Features Completed

### Integration Status
- ✅ **Core Foundation**: User authentication, dashboard, and course viewer fully integrated
- ✅ **WIOA Compliance**: Automated reporting and data collection implemented
- ✅ **AI-Powered Features**: Chatbot assistant and resume builder deployed with OpenAI integration
- ✅ **Payment Gateway**: Stripe integration ready with both direct payment and WIOA funding support
- ✅ **Bulk Operations**: Admin tools for importing users and managing enrollments at scale
- ✅ **Email Automation**: Comprehensive communication system with welcome sequences and progress tracking
- ✅ **Error Handling**: Robust error boundaries and user-friendly error messages throughout
- ✅ **Production Monitoring**: Health check endpoints and comprehensive logging

### Security & Compliance
- Authentication protected routes with session management
- WIOA compliance data collection and reporting
- Secure environment variable configuration
- Input validation and sanitization throughout
- Error handling that prevents information leakage

### Scalability Features
- Bulk user import and enrollment capabilities
- Automated email campaigns and communications
- Database optimization with indexed queries
- Efficient caching with TanStack Query

### Business Value Proposition - Veridian Tech Brand
The platform justifies the $8,500 premium pricing through:
1. **AI-Powered Competitive Advantages**: Advanced chatbot teaching assistant and AI resume builder
2. **Complete Career Development Suite**: 4 comprehensive learning tracks including AI workplace skills
3. **Comprehensive WIOA Compliance**: Automated reporting and data collection meeting government requirements
4. **Premium Support Services**: Automated communications and progress tracking
5. **Professional Career Development**: Resume builder and job placement assistance
6. **Enterprise-Grade Features**: Bulk operations, admin dashboards, and scalable architecture
7. **Branded Professional Experience**: Veridian Tech brand commands premium positioning and trust

### Deployment Readiness
- All environment variables configured for production
- Database schema optimized and ready for scaling
- Error handling and monitoring in place
- Payment processing ready for live transactions
- Automated systems operational for ongoing management