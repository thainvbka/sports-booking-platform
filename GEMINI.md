# Sports Booking Platform - Master Instructions

This repository is a comprehensive sports facility booking and management platform. It is structured as a monorepo containing a TypeScript/Express backend, a React frontend, and extensive project documentation.

## Project Overview

- **Purpose:** A centralized platform for players to find and book sports fields (Football, Badminton, Pickleball, etc.), for owners to manage complexes and pricing, and for administrators to oversee operations.
- **Key Features:**
    - **Multi-Role RBAC:** Admin, Owner, and Player roles with specialized dashboards and permissions.
    - **Real-time Booking:** Prevent overlaps using Redis Lock and PostgreSQL pessimistic locking.
    - **Dynamic Pricing:** Segmented pricing based on time, day of the week, and sport type.
    - **Recommendation System:** Personalized facility suggestions using PostgreSQL `pgvector` and Gemini AI reranking.
    - **Payment Integration:** Support for Stripe and VNPay.
    - **Matchmaking:** Social features for players to find teammates and opponents.

## Repository Structure

- `apps/backend/`: Node.js Express API. Uses Prisma ORM, PostgreSQL, and Redis.
    - [Backend Documentation](./apps/backend/GEMINI.md)
- `apps/frontend/`: React SPA built with Vite. Uses Zustand, Tailwind CSS 4, and Radix UI.
    - [Frontend Documentation](./apps/frontend/GEMINI.md)
- `baocao/`: Comprehensive project report and functional specifications (Vietnamese).
- `docs/`: Technical documentation and diagrams.
- `images/`: Architecture diagrams, use case diagrams, and UI screenshots.
- `docker-compose.yml`: Infrastructure orchestration (Postgres, Redis, Backend, Frontend).

## Technical Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js (v5), TypeScript, Prisma ORM |
| **Frontend** | React 19, Vite 7, TypeScript, Zustand, Tailwind CSS 4 |
| **Database** | PostgreSQL (with `pgvector` extension) |
| **Cache & Locks** | Redis |
| **Infrastructure** | Docker, Docker Compose |
| **External APIs** | Stripe, VNPay, Cloudinary, Gemini AI |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v20+) for local development
- Environment variables configured in `.env` files (see `.env.example` in root and apps)

### Running the Entire Stack

You can spin up the full infrastructure (Database, Redis, Backend, Frontend) using Docker Compose:

```bash
docker-compose up --build
```

- **Backend API:** `http://localhost:3000/api/v1`
- **Frontend App:** `http://localhost:5173`
- **Prisma Studio:** `http://localhost:5555`

## Development Conventions

- **Type Safety:** Strictly use TypeScript across the entire stack. Avoid `any`.
- **Validation:** Use **Zod** for both request validation (backend) and form validation (frontend).
- **Time Management:** All time-related logic must account for the `Asia/Ho_Chi_Minh` (UTC+7) timezone.
- **Service Layer:** Business logic belongs in services, not in controllers or UI components.
- **Consistency:** Follow the standardized response format defined in the backend for all API interactions.

## Key Sub-Guides

For specific implementation details, coding standards, and role-based logic, refer to:
1. [Backend GEMINI.md](./apps/backend/GEMINI.md)
2. [Frontend GEMINI.md](./apps/frontend/GEMINI.md)
