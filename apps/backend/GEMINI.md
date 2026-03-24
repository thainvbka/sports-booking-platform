# Sports Booking Platform - Backend Architecture

This is the core backend service for the Sports Booking Platform, built with a robust TypeScript and Express.js stack.

## Technical Stack

- **Framework:** Express.js (v5.1.0)
- **Language:** TypeScript
- **ORM:** Prisma with PostgreSQL
- **Authentication:** JWT (JSON Web Tokens) with refresh token support
- **Validation:** Zod for schema validation
- **Storage:** Cloudinary for image uploads
- **Payments:** Stripe integration
- **Email:** Nodemailer
- **Background Tasks:** node-cron for automated cleanup of expired bookings
- **Logging:** Morgan for HTTP request logging
- **Security:** Helmet, CORS, and Express-rate-limit

## Core Features

- **Multi-Role RBAC:** Supports Admin, Owner, and Player roles with specialized controllers.
- **Complex & Sub-field Management:** Owners can manage complexes and their sub-fields (football, basketball, etc.).
- **Dynamic Pricing:** Advanced pricing rules based on time of day and day of week.
- **Booking System:** 
  - Real-time availability checking.
  - Support for single and recurring bookings.
  - Automated expiration and cleanup of pending bookings.
- **Payment Integration:** Secure checkout and webhook handling for Stripe.
- **Notification System:** In-app notifications for booking statuses and system alerts.

## Project Structure

- `src/controllers/v1/`: Request handlers categorized by role or entity.
- `src/services/v1/`: Business logic layer.
- `src/routes/v1/`: API route definitions.
- `src/validations/`: Zod schemas for request validation.
- `src/libs/`: Third-party library initializations (Prisma, Stripe, Cloudinary, etc.).
- `src/middlewares/`: Custom middlewares (Auth, Error handling, Validation, etc.).
- `src/utils/`: Standardized response classes (`SuccessResponse`, `ErrorResponse`).
- `src/helpers/`: Utility functions for time, pricing, and caching.
- `prisma/`: Database schema and migration files.

## API Conventions

### Standardized Response Format

All API endpoints return a consistent JSON structure:

**Success:**
```json
{
  "success": true,
  "status": 200,
  "code": 200,
  "message": "Success message",
  "reason": "OK",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "status": 400,
  "code": 400,
  "message": "Error message",
  "reason": "BAD_REQUEST",
  "data": null
}
```

### Authentication

Protected routes require a Bearer token in the `Authorization` header.
```http
Authorization: Bearer <access_token>
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL instance
- Cloudinary, Stripe, and Mailer credentials in `.env`

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

### Development

```bash
# Run in watch mode using tsx
npm run dev
```

### Build and Start

```bash
# Compile TypeScript to JavaScript
npm run build

# Start production server
npm run start
```

## Development Workflow

1.  **Validation:** Always define a Zod schema in `src/validations/` and use the `validate` middleware in the route definition.
2.  **Controller & Service Separation:** Controllers should handle request parsing and response sending, while Services should contain the actual business logic and Prisma calls.
3.  **Error Handling:** Use the `asyncHandler` wrapper for all route handlers and throw specialized error classes from `src/utils/error.response.ts` (e.g., `BadRequestError`, `NotFoundError`).
4.  **Pricing Helper:** Use `src/helpers/pricing.helper.ts` for any logic involving price calculation to ensure consistency.
5.  **Time Helper:** Use `src/helpers/time.helper.ts` for date and time manipulations, as the system relies on specific formatting for pricing rules.
