# Overview

TechyDhamaka is a modern news aggregation web application that curates and displays articles from various categories including news, gaming, technology, and entertainment. The application fetches content from multiple RSS feeds and presents it in a clean, user-friendly interface with dark/light theme support and responsive design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Radix UI components with shadcn/ui for consistent, accessible design system
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom theme provider with localStorage persistence supporting light/dark modes

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints for article management and feed refresh operations
- **Data Storage**: In-memory storage using Map data structure (temporary storage solution)
- **Feed Processing**: RSS parser for aggregating content from multiple news sources
- **Error Handling**: Centralized error middleware with structured error responses

## Data Layer
- **Database Schema**: Drizzle ORM configured for PostgreSQL (schema defined but using memory storage currently)
- **Storage Interface**: Abstract storage interface allowing easy transition from memory to database storage
- **Data Models**: Zod schemas for runtime validation of article data and API requests

## Development Architecture
- **Build System**: Vite with React plugin for fast HMR and optimized production builds
- **Monorepo Structure**: Shared schemas and types between client and server
- **Development Tools**: ESBuild for server bundling, TypeScript for type safety
- **CSS Processing**: PostCSS with Tailwind CSS and Autoprefixer

## Component Architecture
- **Design System**: Comprehensive UI component library based on Radix primitives
- **Component Structure**: Atomic design with reusable components for cards, headers, and layouts
- **Responsive Design**: Mobile-first approach with adaptive layouts and touch-friendly interfaces
- **Accessibility**: ARIA-compliant components with keyboard navigation support

# External Dependencies

## RSS Feed Sources
- **News**: BBC News, CNN, Reuters RSS feeds
- **Gaming**: GameSpot, IGN Gaming, Polygon RSS feeds  
- **Technology**: TechCrunch, Wired, Ars Technica RSS feeds
- **Entertainment**: Variety, Hollywood Reporter, Entertainment Weekly RSS feeds

## Database Services
- **Neon Database**: Serverless PostgreSQL configured via Drizzle ORM
- **Connection**: Environment-based DATABASE_URL configuration

## UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Inter font family for typography

## Development and Build Tools
- **Vite**: Frontend build tool with React plugin and development server
- **TanStack Query**: Data fetching and caching library for API state management
- **Wouter**: Lightweight routing library for client-side navigation
- **RSS Parser**: Library for parsing and processing RSS/XML feeds
- **Drizzle Kit**: Database migrations and schema management

## Runtime and Deployment
- **Express.js**: Web server framework with middleware support
- **Axios**: HTTP client for external API requests
- **Date-fns**: Date manipulation and formatting utilities
- **Zod**: Runtime schema validation for type safety