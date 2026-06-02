# Sports Booking Platform

A comprehensive, multi-tenant sports facility booking platform designed for players, facility owners, and platform administrators.

## Project Overview

This is a monorepo containing a full-stack application built with modern technologies. It features a robust booking engine, dynamic pricing, real-time match-making, and seamless payment integration.

### Core Architecture

- **Backend:** Express.js (v5) with TypeScript, Prisma ORM, and PostgreSQL.
- **Frontend:** React (v19) with Vite, TypeScript, Tailwind CSS (v4), and Zustand.
- **Database:** PostgreSQL with `pgvector` for recommendation features.
- **Caching:** Redis for session and data caching.
- **Integrations:** Stripe for payments, Cloudinary for media, and Socket.io for real-time updates.

## Repository Structure

- `apps/backend/`: Express.js API service. [See Backend Guide](./apps/backend/GEMINI.md)
- `apps/frontend/`: React frontend application. [See Frontend Guide](./apps/frontend/GEMINI.md)
- `docs/`: Project documentation and diagrams.
- `nginx/`: Nginx configuration for production deployment.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18+) and npm (for local development outside Docker)

### Running with Docker

The easiest way to start the entire stack is using Docker Compose:

```bash
# Start all services in development mode
docker-compose up
```

This will spin up:
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`
- Backend API at `localhost:3000`
- Prisma Studio at `localhost:5555`
- Frontend application at `localhost:5173`

### Environment Configuration

1. Copy `.env.example` to `.env` in the root directory.
2. Copy `apps/backend/.env.example` to `apps/backend/.env`.
3. Copy `apps/frontend/.env.example` to `apps/frontend/.env`.

## Key Features

- **Facility Management:** Owners can manage sports complexes, sub-fields, and pricing rules.
- **Booking Engine:** Supports single and recurring (weekly/monthly) bookings with overlap prevention.
- **Pricing Engine:** Segmented pricing based on time of day and day of the week.
- **Match-Making:** Players can create or join matches to find partners/opponents.
- **Payments:** Secure transaction handling via Stripe.
- **Notifications:** Multi-role notification system for system alerts and booking updates.
- **Recommendations:** AI-powered recommendations using `pgvector` for sports complexes.

## Development Conventions

### General

- **TypeScript:** Strict typing is enforced across the codebase. Avoid `any`.
- **Validation:** Zod is used for schema validation on both frontend and backend.
- **Time Handling:** Default timezone is `Asia/Ho_Chi_Minh` (UTC+7). Use helpers in `apps/backend/src/helpers/time.helper.ts` and `apps/frontend/src/utils/` for date/time operations.

### Backend

- Follow the **Controller-Service-Repository** pattern.
- All API responses follow a standardized JSON format.
- Use `asyncHandler` for Express route handlers.
- [Detailed Backend Instructions](./apps/backend/GEMINI.md)

### Frontend

- Use **Zustand** for state management.
- **Tailwind CSS 4** for utility-first styling.
- **React Router 7** for navigation.
- [Detailed Frontend Instructions](./apps/frontend/GEMINI.md)

## Deployment

Production deployment is managed via Docker Compose (`docker-compose.prod.yml`) and Nginx. CI/CD workflows are located in `.github/workflows/deploy.yml`.
