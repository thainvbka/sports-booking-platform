# Sports Booking Platform - Project Overview

A comprehensive sports facility booking platform built with a modern TypeScript monorepo architecture. The project supports multiple user roles (Admin, Owner, Player) and various sports (Football, Basketball, Tennis, Badminton, Volleyball, Pickleball).

## Architecture

This is an **npm workspaces monorepo** with the following structure:

- `apps/backend`: Express.js server, Prisma ORM, PostgreSQL.
- `apps/frontend`: React (Vite), Tailwind CSS, Shadcn UI, Zustand.
- `packages/db`: Shared Prisma client.
- `packages/validation`: Shared Zod validation schemas.
- `docker/`: Infrastructure orchestration.

## Tech Stack

- **Backend:** Node.js, Express, Prisma (PostgreSQL), JWT, Stripe (Payments), Cloudinary (Image storage), Nodemailer (Email), Node-cron (Background tasks).
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Radix UI, Shadcn UI, React Hook Form, Zod, Axios.
- **Infrastructure:** Docker, Nginx (for production).

## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- `.env` file (see `.env.example` at the root)

### Installation

```bash
# Install dependencies for the entire monorepo
npm install
```

### Running the Project

**Using Docker (Recommended for Development):**

```bash
# Start the database, backend, and frontend
docker-compose up -d
```

**Manual (Local Development):**

```bash
# Root: Start backend in watch mode
cd apps/backend
npm run dev

# Root: Start frontend in dev mode
cd apps/frontend
npm run dev
```

### Database Management

The project uses Prisma for database management. The schema is located in `apps/backend/prisma/schema.prisma`.

```bash
# Generate Prisma Client
npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Run migrations
npx prisma migrate dev --schema=apps/backend/prisma/schema.prisma

# Open Prisma Studio (GUI)
npx prisma studio --schema=apps/backend/prisma/schema.prisma
```

## Key Features

- **Multi-Role Access Control:** Admin dashboard, Owner facility management, Player booking experience.
- **Facility Management:** Owners can create "Complexes" and "Sub-fields" with specific sport types and pricing rules.
- **Booking System:** Support for both single and recurring bookings.
- **Payment Integration:** Stripe integration for secure payments and refunds.
- **Authentication:** JWT-based auth with refresh tokens and social login support.
- **Notifications:** Email and in-app notifications.

## Development Conventions

- **Validation:** Use the shared Zod schemas in `packages/validation` for both backend and frontend.
- **Database:** Access the database through the shared client in `packages/db`.
- **API Design:** All endpoints follow a `/api/v1` versioning scheme.
- **Error Handling:** Use the `asyncHandler` and `errorHandler` middleware in the backend.
- **Styling:** Follow the existing Shadcn UI and Tailwind CSS patterns in the frontend.

## Environment Variables

Key variables required in `.env`:

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Auth secrets.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: For image uploads.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: For payments.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`: For email notifications.

### Standardized Response Format

Backend trả về format đồng nhất cho tất cả các endpoint:

- **Thành công:** `{ success: true, status: 200, code: 200, message: "...", data: { ... }, reason: "..." }`
- **Thất bại:** `{ success: false, status: 4xx/5xx, code: 4xx/5xx, message: "...", data: null, reason: "..." }`

### Frontend API & Error Handling Conventions

Để tận dụng format đồng nhất từ Backend, Frontend tuân thủ các quy tắc sau:

1.  **Axios Interceptor (`lib/axios.ts`):**
    - Tự động bắt lỗi và hiển thị `toast` với `message` từ Backend khi `success: false` hoặc HTTP status lỗi.
    - Xử lý Auto Refresh Token khi gặp lỗi 401.
    - Trả về `Promise.reject(response.data)` để Store/Component có thể catch lỗi và lấy đầy đủ thông tin `code`, `message`.

2.  **API Services:**
    - Luôn trả về toàn bộ đối tượng `response.data` (kiểu `ApiResponse<T>`).
    - Sử dụng `type-only import` cho các Interface từ `@/types` (để tương thích với `verbatimModuleSyntax`).

    ```typescript
    // Ví dụ trong Service
    getComplexes: async (params?: object) => {
      const res = await api.get<ApiResponse<DataType>>("/url", { params });
      return res.data; // Trả về ApiResponse object
    };
    ```

3.  **Zustand Stores / Components:**
    - Sử dụng `try...catch` với kiểu `unknown` cho biến error, sau đó ép kiểu sang `ApiError`.
    - Kiểm tra `res.success` nếu cần xử lý logic rẽ nhánh dựa trên kết quả.
    - Dữ liệu thực tế nằm trong `res.data`.

    ```typescript
    // Ví dụ trong Store
    try {
      const res = await service.getData();
      if (res.success) {
        set({ data: res.data, isLoading: false });
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      set({ error: apiError.message, isLoading: false });
    }
    ```

4.  **Types chuẩn hóa (`types/index.ts`):**
    - `ApiResponse<T>`: Định nghĩa cấu trúc response thành công.
    - `ApiError`: Định nghĩa cấu trúc response lỗi (không có trường `data`).
