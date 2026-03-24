# Sports Booking Platform - Frontend

A modern React frontend for the Sports Booking Platform, built with Vite, TypeScript, and Tailwind CSS 4. This application serves three main user roles: Players (booking sports facilities), Owners (managing complexes and sub-fields), and Admins (platform oversight).

## Project Overview

- **Core Technologies:** React 19, Vite 7, TypeScript 5, Tailwind CSS 4.
- **State Management:** Zustand (with persistence for authentication).
- **Routing:** React Router 7 (Data APIs with `createBrowserRouter`).
- **UI Components:** Radix UI primitives, customized with Shadcn UI patterns.
- **Form Handling:** React Hook Form with Zod validation.
- **API Client:** Axios with interceptors for token refresh and unified error handling.
- **Styling:** Tailwind CSS 4 with `@tailwindcss/vite` plugin.
- **Icons:** Lucide React.

## Architecture

The project follows a feature-based structure within the `src` directory:

- `components/`: Reusable UI components.
    - `shared/`: Components used across multiple roles (e.g., `ComplexCard`, `BookingModal`).
    - `ui/`: Base UI primitives (Radix UI + Shadcn).
    - `owner/`, `player/`: Role-specific components.
- `layouts/`: Main layout wrappers (`MainLayout` for public/player, `DashboardLayout` for owner/admin, `AuthLayout` for login/register).
- `pages/`: Page components organized by feature and role.
- `services/`: API service layers for interacting with the backend.
- `store/`: Zustand stores for global state (Auth, Complex, Subfield, etc.).
- `types/`: TypeScript interfaces and types, matching backend models where applicable.
- `validations/`: Zod schemas for form validation and API data integrity.
- `lib/`: Utility functions and configuration (Axios, Tailwind merge).
- `hooks/`: Custom React hooks.

## Key Features

- **Multi-Role Dashboards:** Specialized views for Players, Owners, and Admins.
- **Dynamic Booking System:** Interactive time slot selection with real-time pricing calculation.
- **Complex Management:** Owners can manage complexes, sub-fields, and sophisticated pricing rules.
- **Stripe Integration:** Integrated payment flow for bookings and owner onboarding.
- **Authentication:** Persistent login with JWT, automatic token refresh, and role-based access control.
- **Responsive Design:** Fully mobile-responsive layouts using Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running (default: `http://localhost:3000/api/v1`)

### Key Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

## Development Conventions

- **API Responses:** All API calls expect a standardized format: `{ success: boolean, data: T, message: string }`. Use the `ApiResponse<T>` type.
- **Error Handling:** Errors are handled globally in `lib/axios.ts` using `sonner` toasts. Component-level errors should be caught and handled if specific logic is required.
- **Path Aliases:** Use the `@/` alias to reference files within the `src` directory (e.g., `@/components/ui/button`).
- **Validation:** Always use Zod schemas from `src/validations` for forms and sensitive data processing.
- **Styling:** Adhere to the Tailwind CSS 4 utility-first approach. Use the `cn()` utility from `lib/utils.ts` for dynamic class merging.
- **Role-Based Access:** Use the `ProtectedRoute` component in `src/routes/routes.tsx` to restrict access based on user roles.
- **Type Safety:** Prioritize explicit typing for all props, states, and API responses. Avoid `any`.

## Environment Variables

Create a `.env` file in the root directory (based on `.env.example` if available):

- `VITE_API_URL`: The base URL for the backend API.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Public key for Stripe integration.
