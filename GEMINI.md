# Sports Booking Platform - Project Overview

A comprehensive sports facility booking platform built with a modern TypeScript architecture. The project supports multiple user roles (Admin, Owner, Player) and various sports (Football, Basketball, Tennis, Badminton, Volleyball, Pickleball).

## Project Structure

This project is organized into two main applications and shared infrastructure:

- `apps/backend`: Express.js server (v5.1.0), Prisma ORM, PostgreSQL.
- `apps/frontend`: React 19 (Vite), Tailwind CSS 4, Shadcn UI, Zustand, React Router 7.
- `docker-compose.yml`: Orchestration for local development (Postgres, Backend, Frontend).
- `docs/`: Technical design documents and feature plans.

## Tech Stack

### Backend
- **Framework:** Express.js (v5.1.0)
- **Language:** TypeScript
- **ORM:** Prisma with PostgreSQL
- **Authentication:** JWT with refresh token support (stored in HTTP-only cookies and database)
- **Validation:** Zod for strict request/response validation
- **Storage:** Cloudinary for image uploads
- **Payments:** Stripe integration with webhook support
- **Background Tasks:** node-cron for automated cleanup of expired bookings and system maintenance
- **Time Management:** date-fns and date-fns-tz (Primary timezone: `Asia/Ho_Chi_Minh`)

### Frontend
- **Framework:** React 19 + Vite 7
- **Routing:** React Router 7 (using `createBrowserRouter`)
- **State Management:** Zustand (feature-based stores)
- **Styling:** Tailwind CSS 4 with Shadcn UI (Radix UI primitives)
- **API Client:** Axios with centralized interceptors for token refresh and global error handling
- **Forms:** React Hook Form + Zod

## Building and Running

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- `.env` file (copied from `.env.example` at the root and within apps)

### Using Docker (Recommended)
```bash
# Start all services (Postgres, Backend, Frontend)
docker-compose up -d
```

### Manual Local Development
**Backend:**
```bash
cd apps/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Frontend:**
```bash
cd apps/frontend
npm install
npm run dev
```

## Core Features
- **Multi-Role RBAC:** Dedicated dashboards for Admin, Owner (Facility Manager), and Player (Customer).
- **Facility Management:** Owners can manage "Complexes" (venues) and "Sub-fields" with specific sport types and capacity.
- **Dynamic Pricing Engine:** Advanced pricing rules based on `day_of_week` and time segments.
- **Booking System:**
  - Support for single and recurring (weekly/monthly) bookings.
  - Automated expiration of pending bookings.
  - Integration with Stripe for secure payments and refunds.
- **Matchmaking:** Players can create or join matches to find teammates or opponents.
- **Reviews & Ratings:** Comprehensive review system for facilities.
- **Notification System:** In-app and email notifications via Nodemailer.

## Development Conventions

### Standardized API Response
The backend returns a consistent JSON structure via the `SuccessResponse` class and `errorHandler` middleware:
- **Success:** `{ success: true, status: 200, code: 200, message: "...", data: { ... }, reason: "..." }`
- **Failure:** `{ success: false, status: 4xx/5xx, code: 4xx/5xx, message: "...", data: null, reason: "..." }`

### Error Handling
- **Backend:** Use `asyncHandler` for all route handlers. Throw specialized error classes (e.g., `BadRequestError`, `NotFoundError`) from `src/utils/error.response.ts`.
- **Frontend:** Axios interceptor in `src/lib/axios.ts` automatically handles 401 Unauthorized errors by attempting a token refresh and redirects to login if it fails. It also provides global error notifications via `sonner` toasts.

### Database Patterns
- Access the database using the singleton Prisma client in `apps/backend/src/libs/prisma.ts`.
- Use Enums for all status and type fields (e.g., `SportType`, `BookingStatus`, `PaymentStatus`).
- Implement caching at the database level for frequent lookups (e.g., `min_price`, `max_price`, `avg_rating` in the `Complex` model).

### Environment Variables
Key variables required in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secrets for authentication
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image management
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: For payment processing
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`: For email notifications
