# Sports Booking Platform - Frontend

A modern React frontend for a comprehensive sports facility booking platform. Built with a focus on type safety, responsive design, and robust state management.

## Project Overview

- **Core Technologies:** React 19, Vite 7, TypeScript 5, Tailwind CSS 4.
- **Roles:** Player (Facility discovery & booking), Owner (Facility & pricing management), Admin (Platform oversight).
- **State Management:** **Zustand** (Feature-based stores, persistence for auth).
- **Routing:** **React Router 7** (`createBrowserRouter` with Data APIs).
- **UI Components:** **Radix UI** primitives, customized with **Shadcn UI** patterns.
- **Form Handling:** **React Hook Form** with **Zod** validation.
- **API Client:** **Axios** with centralized interceptors.
- **Styling:** **Tailwind CSS 4** utility-first approach.
- **Icons:** **Lucide React**.

## Building and Running

### Prerequisites

- Node.js (v18+)
- Backend server (default: `http://localhost:3000/api/v1`)

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

## Architecture & File Structure

- `src/components/`: Reusable UI components.
  - `ui/`: Base Radix/Shadcn primitives.
  - `shared/`: Role-agnostic components (e.g., `ComplexCard`, `BookingModal`).
  - `player/`, `owner/`, `admin/`: Role-specific logic.
- `src/services/`: API service layers using a centralized Axios instance.
- `src/store/`: Zustand stores for global state (Auth, Booking, Complex, etc.).
- `src/layouts/`: Context-specific wrappers (`MainLayout`, `OwnerLayout`, `AuthLayout`).
- `src/pages/`: Page-level components organized by feature and role.
- `src/routes/`: Routing configuration and `ProtectedRoute` for role-based access.
- `src/types/`: Centralized TypeScript definitions, matching backend models.
- `src/validations/`: Zod schemas for form validation and data integrity.
- `src/lib/`: Core library configurations (Axios, Tailwind utilities).

## Development Conventions

### API & Error Handling

- **Axios Interceptor (`src/lib/axios.ts`):**
  - Automatically attaches `Authorization: Bearer <token>` from `localStorage`.
  - Handles **401 Unauthorized** with automatic token refresh (`/auth/refresh-token`).
  - Provides global error notification via `sonner` toasts.
- **Response Format:** All API responses expect a standardized format: `{ success: boolean, data: T, message: string }`. Use the `ApiResponse<T>` type.
- **Service Pattern:** Services should return `response.data` for consistency with store error handling.

### State Management (Zustand)

- Stores are located in `src/store/`.
- Use `persist` middleware for states that should survive page reloads (e.g., `useAuthStore`).
- Implement `isLoading` and `error` states within stores for consistent UI feedback.

### UI & Styling

- **Tailwind CSS 4:** Use utility-first styling. Prefer the `cn()` utility from `@/lib/utils` for dynamic class merging.
- **Responsive Design:** Prioritize mobile-friendly layouts.
- **Icons:** Use `lucide-react`.

### Role-Based Access Control

- Restrict access to routes using the `ProtectedRoute` component in `src/routes/routes.tsx`.
- Roles: `PLAYER`, `OWNER`, `ADMIN`.

### Type Safety

- **Strict Typing:** Avoid `any`. Use interfaces from `src/types`.
- **Zod Validation:** Always validate form inputs and API payloads using schemas in `src/validations`.

## Environment Variables

- `VITE_API_URL`: Backend API base URL.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Public key for Stripe integration.
