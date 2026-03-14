# Hướng dẫn Tinh gọn Dự án (Refactor to Independent Projects)

Tài liệu này hướng dẫn chi tiết cách chuyển đổi từ mô hình **Monorepo (Workspaces)** sang mô hình **Polyrepo (Dự án độc lập)** để đơn giản hóa việc quản lý thư viện, chạy Docker và phát triển tính năng.

## Mục tiêu

1. Loại bỏ `npm workspaces`.
2. Đưa logic Database (`Prisma`) và `Validation` vào trực tiếp Backend.
3. Giúp Frontend và Backend hoạt động như 2 dự án riêng biệt, không phụ thuộc vào thư mục `packages/`.

---

## Bước 1: Di chuyển Database vào Backend

Hiện tại Prisma schema đã nằm trong `apps/backend/prisma/`, nhưng Client lại được sinh ra ở `packages/db`. Ta sẽ đưa tất cả về Backend.

1. **Cập nhật `apps/backend/prisma/schema.prisma`**:
   Sửa lại đường dẫn output của generator:
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   ```
2. **Di chuyển Client Instance**:
   Tạo file `apps/backend/src/lib/prisma.ts` (hoặc `db.ts`) với nội dung từ `packages/db/index.ts`:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   const prisma = new PrismaClient();
   export default prisma;
   ```
3. **Cài đặt thư viện**:
   Tại `apps/backend/`:
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

---

## Bước 2: Di chuyển Validation vào Backend & Frontend

### 2.1 Đối với Backend

1. Copy toàn bộ file `.ts` từ `packages/validation/` vào thư mục mới `apps/backend/src/validations/`.
2. Cập nhật các lệnh import trong Controller/Route:
   - _Từ:_ `import { ... } from '../../validations'`
   - _Thành:_ `import { ... } from '../../validations/...'` (đường dẫn tương đối).

### 2.2 Đối với Frontend

Vì không còn dùng chung package qua workspace, bạn có 2 lựa chọn:

- **Lựa chọn 1 (Đơn giản):** Copy thư mục `validations` vào `apps/frontend/src/validations/`.
- **Lựa chọn 2 (Sạch sẽ):** Nếu không muốn copy, bạn có thể dùng `npm install ../../packages/validation` (nhưng không khuyến khích vì Docker sẽ khó build).

---

## Bước 3: Loại bỏ Cấu trúc Workspace

1. **Root `package.json`**:
   Xóa bỏ trường `"workspaces": [...]`. Dự án gốc bây giờ chỉ đóng vai trò là "vỏ" chứa code.
2. **Backend `package.json`**:
   Xóa bỏ các dòng dependencies trỏ đến file:
   - `"../../libs/prisma": "file:../../packages/db"`
   - `"../../validations": "file:../../packages/validation"`
3. **Frontend `package.json`**:
   Tương tự, xóa các dependencies nội bộ nếu có.

---

## Bước 4: Cập nhật Dockerfile

Đây là phần giúp bạn "nhẹ đầu" nhất. Dockerfile bây giờ sẽ cực kỳ đơn giản vì nó không cần biết về các thư mục bên ngoài nữa.

**Ví dụ `apps/backend/Dockerfile.dev` mới:**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

_(Bạn không còn cần `COPY packages/ ...` rườm rà nữa)._

---

## Bước 6: Tách biệt Environment Variables (.env)

Việc dùng chung một file `.env` ở root là nguyên nhân khiến các câu lệnh Prisma và Docker trở nên phức tạp.

### 6.1 Đối với Backend

1. **Di chuyển file**: Copy file `.env` từ root vào `apps/backend/.env`.
2. **Cập nhật Code**: Mở file `apps/backend/src/configs/dotenv.ts` và sửa lại:
   - _Từ:_ `dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });`
   - _Thành:_ `dotenv.config();` (Prisma và Node sẽ tự tìm file `.env` trong cùng thư mục).
3. **Bảo mật**: Xóa các biến của Frontend (như `VITE_API_URL`) khỏi file `.env` của Backend.

### 6.2 Đối với Frontend

1. **Tạo file mới**: Tạo file `apps/frontend/.env`.
2. **Nội dung**: Chỉ giữ lại các biến cần thiết cho Frontend (thường bắt đầu bằng `VITE_`):
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
3. **Lưu ý**: Tuyệt đối không để Secret Key (Stripe, Cloudinary) vào file này vì chúng sẽ bị lộ ra trình duyệt.

---

## Bước 7: Cập nhật Dockerfile & Docker Compose

### 7.1 Dockerfile mới (Ví dụ cho Backend)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Không cần trỏ ra ngoài để tìm Prisma hay .env nữa
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### 7.2 Docker Compose mới

Bạn có thể rút gọn `volumes` và `env_file`:

```yaml
services:
  backend:
    build: ./apps/backend
    env_file: ./apps/backend/.env
    # ...
  frontend:
    build: ./apps/frontend
    env_file: ./apps/frontend/.env
    # ...
```

---

## Quy trình làm việc mới (New Workflow)

Bây giờ, mọi thứ trở nên cực kỳ quen thuộc:

1. **Cài thư viện mới cho Backend**:
   `cd apps/backend && npm install <tên-thư-viện>` (Không cần `--workspace`).
2. **Chạy dự án (Hybrid)**:
   - Terminal 1: `docker-compose up -d postgres-db`
   - Terminal 2: `cd apps/backend && npm run dev`
   - Terminal 3: `cd apps/frontend && npm run dev`
3. **Database Migration**:
   `cd apps/backend && npx prisma migrate dev` (Prisma sẽ tự tìm thấy file `.env` trong cùng thư mục).

---

_Lưu ý: Sau khi thực hiện, hãy đảm bảo cập nhật lại tất cả các đường dẫn Import trong code để tránh lỗi "Module not found"._
