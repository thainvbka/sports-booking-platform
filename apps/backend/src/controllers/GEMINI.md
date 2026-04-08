# Controllers - Context & Guidelines

This directory contains the controller layer of the Sports Booking Platform backend. Controllers are responsible for handling incoming HTTP requests, extracting data, and delegating business logic to the service layer.

## Directory Structure

- `v1/`: Contains the first version of the API controllers.
    - `account.controller.ts`: User profile and account management.
    - `admin.controller.ts`: Administrative operations and dashboards.
    - `auth.controller.ts`: Authentication (login, signup, refresh token, password reset).
    - `booking.controller.ts`: Single and recurring booking management for players and owners.
    - `complex.controller.ts`: Sports complex management for owners.
    - `match.controller.ts`: Match matching and teammate/opponent finding.
    - `payment.controller.ts`: Stripe payment processing and webhooks.
    - `pricing_rule.controller.ts`: Management of dynamic pricing rules.
    - `public.controller.ts`: Publicly accessible endpoints for browsing facilities.
    - `review.controller.ts`: Review and rating system for complexes.
    - `subfield.controller.ts`: Management of individual sub-fields (courts/pitches).

## Development Conventions

### 1. Naming and Exports
- Controllers should be exported as named constants.
- Function names must end with `Controller` (e.g., `createBookingController`).
- Files are named according to the entity they manage (e.g., `booking.controller.ts`).

### 2. Responsibility
- **Thin Controllers:** Keep controllers thin. They should primarily:
    - Extract path parameters (`req.params`), query strings (`req.query`), and body data (`req.body`).
    - Handle file uploads via `req.files` (Multer).
    - Call the appropriate service function(s).
    - Return a standardized response.
- **Service Delegation:** All business logic, database queries (via Prisma), and complex calculations must reside in the `services/` layer.

### 3. Request Context
- **Authentication:** For protected routes, the `authenticate` middleware attaches user data to `req.user`.
- **Role-Based Access:** Access specific profiles via `req.user?.profiles` (e.g., `playerId`, `ownerId`, `adminId`).

### 4. Standardized Responses
- Use the response utility classes from `../../utils/success.response`:
    - `SuccessResponse`: Standard 200 OK response.
    - `Created`: 201 Created response.
- Format:
    ```typescript
    return new SuccessResponse({
      message: "Action performed successfully",
      data: { ...result },
    }).send(res);
    ```

### 5. Error Handling
- Controllers do not typically use `try...catch` blocks.
- They rely on the `asyncHandler` wrapper in the routes and the global `errorHandler` middleware.
- Throw specialized errors from `../../utils/error.response` (e.g., `BadRequestError`, `NotFoundError`, `ForbiddenError`) within services or controllers to trigger specific HTTP status codes.

### 6. Parameter Parsing
- Manually parse and provide defaults for common query parameters like `page`, `limit`, and `search`:
    ```typescript
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const search = (req.query.search as string) || "";
    ```

## Example Controller Pattern

```typescript
import { Request, Response } from "express";
import { someServiceFunction } from "../../services/v1/some.service";
import { SuccessResponse } from "../../utils/success.response";

export const someActionController = async (req: Request, res: Response) => {
  const entityId = req.params.id;
  const data = req.body;
  const userId = req.user?.id;

  const result = await someServiceFunction(userId, entityId, data);

  return new SuccessResponse({
    message: "Action completed",
    data: result,
  }).send(res);
};
```
