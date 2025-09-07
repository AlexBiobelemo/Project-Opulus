# Overview

This is a social media algorithm simulator built with React and Express. The application allows users to visualize and experiment with how different algorithm parameters affect content distribution and engagement in a simulated social media environment. The system features AI-powered bots that create posts and engage with content, while providing real-time analytics and algorithm visualization.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite for bundling and development
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Updates**: WebSocket connection for live data streaming from the simulation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: TSX for running TypeScript directly in development
- **Production Build**: ESBuild for bundling server code
- **WebSocket**: Built-in WebSocket server for real-time communication
- **Storage**: In-memory storage with interface for potential database integration

## Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL dialect configured
- **Database**: Neon Database (serverless PostgreSQL) via connection string
- **Migration**: Drizzle Kit for schema management and migrations
- **Current Implementation**: In-memory storage class implementing database interface for development/testing
- **Schema**: Comprehensive data models for bots, posts, engagements, algorithm configuration, and simulation statistics

## Core Simulation Services
- **Bot Engine**: Manages AI bot personalities, content generation, and posting behavior with configurable personality types (casual, influencer, power_user, lurker)
- **Algorithm Engine**: Calculates content scoring based on weighted factors (engagement, recency, relevance) and simulates organic engagement patterns
- **Real-time Broadcasting**: Continuous data streaming to frontend clients via WebSocket for live dashboard updates

## Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Express session configuration present but not actively used
- **Future Integration**: Architecture supports adding authentication middleware

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database for production data persistence
- **Connection**: @neondatabase/serverless driver for optimized serverless connections

## UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration
- **shadcn/ui**: Pre-built component library with consistent styling and accessibility

## Development Tools
- **Vite**: Fast development server and build tool with React plugin
- **Replit Integration**: Custom plugins for Replit development environment
- **TypeScript**: Full type safety across frontend, backend, and shared code

## Real-time Communication
- **ws**: WebSocket library for real-time bidirectional communication
- **TanStack Query**: Intelligent caching and synchronization for server state

## Data Management
- **Drizzle ORM**: Type-safe database operations with automatic TypeScript inference
- **Zod**: Schema validation for API requests and data transformation
- **date-fns**: Date manipulation utilities for timestamp calculations