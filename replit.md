# Travel Management System

## Overview

This is a full-stack travel management application built with Express.js, React, and TypeScript. The system allows users to create and manage business trips with comprehensive traveler information, flight bookings, and other travel services. The application features a modern UI with shadcn/ui components and uses Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom SF Pro font system (Apple's San Francisco)
- **State Management**: React hooks and local component state
- **HTTP Client**: TanStack React Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: express-session with connect-pg-simple store
- **Development**: Hot module replacement via Vite middleware integration

### Database Architecture
- **Database**: PostgreSQL (configured via Neon Database serverless)
- **Schema Management**: Drizzle Kit for migrations and schema definitions
- **Current Schema**: Users table with authentication fields

## Key Components

### Data Models
- **Users**: Basic user authentication with username/password
- **Trip Management**: Complex form handling for domestic/international trips
- **Traveler Information**: Detailed traveler profiles with personal and contact data
- **Guest Travelers**: Support for multiple travelers with different types (adult/child/infant)

### Frontend Components
- **CreateTripForm**: Main trip creation interface with multi-step form
- **TravelerDetails**: Personal information collection with international/domestic variants
- **GuestTravelerManager**: Dynamic management of multiple travelers
- **FlightSearch**: Airport selection with comprehensive global airport database
- **FormField**: Reusable form input component with validation
- **DatePicker**: Custom date selection with constraint validation
- **SearchableDropdown**: Filterable dropdown with keyboard navigation

### Backend Services
- **Storage Interface**: Abstracted data layer with in-memory implementation
- **Route Registration**: Modular route handling system
- **Development Server**: Vite integration for SSR and HMR

## Data Flow

1. **Trip Creation Flow**:
   - User initiates trip creation from dashboard
   - Form collects basic trip information (dates, type, billing)
   - Traveler details are gathered with validation
   - Additional services (flights, hotels) can be configured
   - Data is validated and stored via storage interface

2. **Authentication Flow**:
   - User credentials stored in PostgreSQL via Drizzle ORM
   - Session management through connect-pg-simple
   - Route protection middleware (to be implemented)

3. **Data Validation**:
   - Frontend validation using React form handling
   - Backend validation via Drizzle Zod schema integration
   - Type safety enforced throughout with TypeScript

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: Via `@neondatabase/serverless` driver
- **Migration**: Drizzle Kit for schema changes

### UI Framework
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Modern icon library
- **Apple SF Font System**: iOS-native typography

### Development Tools
- **Replit Integration**: Development environment optimization
- **ESBuild**: Production bundling for server code
- **TypeScript**: Full-stack type safety

## Deployment Strategy

### Development Environment
- **Replit Platform**: Cloud development with PostgreSQL module
- **Hot Reload**: Vite middleware integration for instant updates
- **Port Configuration**: Express server on port 5000, external port 80

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`
- **Deployment**: Replit autoscale deployment target

### Build Process
1. Frontend assets compiled and optimized
2. Backend TypeScript transpiled to ES modules
3. Static assets served via Express in production
4. Database schema synchronized

## Changelog

```
Changelog:
- June 23, 2025. Initial setup
- June 23, 2025. Migration from Bolt to Replit completed:
  * PostgreSQL database integrated with Neon serverless
  * Storage layer upgraded from in-memory to database persistence
  * Green halo styling added to form buttons
  * Development environment fully configured and tested
- June 23, 2025. FlightSearchModal implementation completed:
  * Professional flight search popup with filters sidebar (20%) and results area (80%)
  * Round-trip and one-way trip support with proper validation
  * Corporate fare types (Corporate/Flexi/Retail) varying by airline
  * Clickable price boxes with flight details on top layout
  * Flight selection workflow with Continue button integration
  * Complete display code extracted for reference (FlightSearchModal_Display.tsx)
- June 24, 2025. Multi-City flight functionality and code quality improvements:
  * Added Multi-City trip type with dynamic segment management
  * Implemented Add/Remove segment controls for complex itineraries
  * Enhanced developer experience with concurrently for unified dev script
  * Added ESLint and Prettier for code quality and formatting
  * Configured security auditing and dependency management tools
  * Added Node.js version specification and private package protection
- June 25, 2025. Enhanced date picker functionality and user experience:
  * Converted calendar from disruptive modal to smooth dropdown positioning
  * Added intelligent viewport-aware positioning (above/below input based on available space)
  * Fixed timezone conversion issues for accurate boundary date selection
  * Implemented inclusive date validation for trip start/end dates
  * Added scroll and resize event handling for dynamic repositioning
  * Enhanced navigation allowing selection of any future month
  * Improved calendar integration with form layout for better context awareness
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Color palette requirements: Professional backgrounds only, suitable for large IT companies (no orange/bright colors).
Calendar preferences: Show 2 months (current and next), highlight today in light blue. Calendar design should be subtle and smoothly integrated, not glaring or prominent. Calendar should appear as dropdown positioned relative to input field with intelligent viewport-aware positioning.
Service selection styling: Colorful icons with subtle orange glow when selected (reduced intensity).
Tab navigation: After End Date field, Tab focuses on Services section (first service button) instead of Entity Information.
Airport data: IATA codes with city names, formatted as "IATA - City" with proper alignment, filtered by travel mode.
Field validation: Incomplete mandatory fields highlighted with subtle red colors and animated indicators.
Direct access: Application opens directly to trip creation form with no dashboard or intermediate pages.
Trip name generation: Auto-populates default trip name on page load and auto-generates trip names in format "TR - 22JUN2025 - A1001" with incremental sequencing.
Green halo styling: Form buttons display subtle green glow effect for enhanced visual appeal.
Keyboard navigation: Comprehensive tab order with arrow key support for service buttons and Enter key shortcuts.
Flight search modal: Professional popup with real flight data, filters, fare selection, and airline information matching industry standards. Defaults to non-stop filter and departure time sorting with working select functionality.
Flight search form: Includes mandatory passenger count and travel class as separate dropdowns. Corporate fare types (Corporate/Flexi/Retail) are displayed in column layout at individual flight level in search results, as different airlines offer different fare combinations. Each fare type includes hover tooltips explaining specific benefits and features. Selected flights are displayed in the flight search container with detailed information for both one-way and round-trip bookings.
Auto-progression: After selecting "From" airport, automatically opens "To" dropdown. After selecting "To", automatically opens departure date picker. For round-trip, automatically opens return date picker after departure date selection. After date completion, focuses on passengers dropdown for seamless user flow.
Flight selection workflow: When user clicks on a fare type box in flight search results, the selected flight appears at the bottom of the modal with flight details and an "Add to Trip" button. This replaces the previous tooltip-only interaction for better user experience.
Hotel search functionality: Comprehensive hotel search modal with destination selection, check-in/check-out dates, room and guest configuration. Features include advanced filtering (price range, star rating, category, amenities), sorting options, detailed hotel cards with room types, pricing, amenities, and reviews. Selected hotel appears at bottom with total price calculation and "Add to Trip" button.
Multi-city flight preference: Three-button toggle interface (Round Trip, One Way, Multi-City) with dynamic segment management for complex itineraries.
Code quality standards: ESLint and Prettier integration for consistent formatting and error detection across the codebase.
Date picker behavior: Calendar appears as dropdown below input field with intelligent positioning that adapts to viewport constraints. Supports navigation to any future month with timezone-safe date handling and inclusive boundary validation.
```