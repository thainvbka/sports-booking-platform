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
- **Background Tasks:** node-cron for automated cleanup of expired bookings
- **Logging:** Morgan for HTTP request logging
- **Security:** Helmet, CORS, and Express-rate-limit
- **Time Management:** date-fns and date-fns-tz (Default timezone: `Asia/Ho_Chi_Minh`)

## Core Features

- **Multi-Role RBAC:** Supports Admin, Owner, and Player roles with specialized controllers and profiles.
- **Complex & Sub-field Management:** Owners can manage sports complexes and their individual sub-fields (Football, Basketball, Tennis, etc.).
- **Dynamic Pricing Engine:** Advanced pricing rules based on time segments and days of the week.
- **Booking System:** 
  - Real-time availability checking with overlap prevention.
  - Support for single and recurring (weekly/monthly) bookings.
  - Automated expiration and cleanup of pending bookings via `expires_at`.
- **Payment Integration:** Secure checkout and webhook handling for Stripe.
- **Match Matching:** Feature for players to create or join matches to find teammates/opponents.
- **Notification System:** In-app notifications for booking updates and system alerts.

## Project Structure

- `src/controllers/v1/`: Request handlers that parse input and call services.
- `src/services/v1/`: Core business logic layer, interacting with Prisma.
- `src/routes/v1/`: API route definitions with middleware application.
- `src/validations/`: Zod schemas for strict request validation.
- `src/libs/`: Third-party library initializations (Prisma, Stripe, Cloudinary, etc.).
- `src/middlewares/`: Custom middlewares (Auth, Error handling, Validation, Multer).
- `src/utils/`: Standardized response classes (`SuccessResponse`, `ErrorResponse`).
- `src/helpers/`: Utility functions for time normalization, pricing calculation, and caching.
- `prisma/`: Database schema, migrations, and seeding scripts.

## API Conventions

### Standardized Response Format

All API endpoints return a consistent JSON structure via the `SuccessResponse` and `errorHandler` middleware.

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
The `authenticate` middleware attaches the user and their profiles (playerId, ownerId, adminId) to `req.user`.

## Development Workflow

1.  **Validation First:** Always define a Zod schema in `src/validations/` and use the `validate` middleware in the route.
2.  **Controller-Service Separation:** Controllers handle Express-specific logic (req/res); Services handle pure business logic and DB operations.
3.  **Error Handling:** Use `asyncHandler` for all route handlers. Throw specialized error classes from `src/utils/error.response.ts` (e.g., `BadRequestError`, `NotFoundError`).
4.  **Time Handling:** Use `src/helpers/time.helper.ts` for all date/time logic. The system operates in `Asia/Ho_Chi_Minh` (UTC+7). Pricing rules are stored as UTC times but interpreted as "face value" for the local timezone.
5.  **Pricing Calculation:** Always use `calculatePrice` or `fetchAndCalculatePrice` from `src/helpers/pricing.helper.ts` to ensure consistent price segmenting.
6.  **Environment Variables:** Ensure `.env` is populated with `DATABASE_URL`, `JWT_ACCESS_SECRET`, `STRIPE_SECRET_KEY`, etc.

## Key Commands

- **Development:** `npm run dev` (uses `tsx watch`)
- **Build:** `npm run build` (compiles to `dist/`)
- **Production Start:** `npm run start`
- **Database Migrations:** `npx prisma migrate dev`
- **Database Studio:** `npx prisma studio`
- **Seeding:** `npx prisma db seed`
