# Hướng dẫn sử dụng Prisma CLI trong dự án

Tài liệu này cung cấp đầy đủ các lệnh Prisma CLI cần thiết để làm việc với Database (PostgreSQL) trong môi trường phát triển (Development) và triển khai (Production) của dự án **Sports Booking Platform**.

> [!IMPORTANT]
> Tất cả các lệnh Prisma dưới đây **phải được chạy từ thư mục của backend**:
> ```bash
> cd apps/backend
> ```

---

## 1. Môi trường Phát triển (Development)

### 1.1. Tạo Migration và Đồng bộ Database
Khi bạn thay đổi file `prisma/schema.prisma` (thêm bảng, sửa cột, thêm enum...), hãy dùng lệnh này để tạo file SQL migration và áp dụng vào DB local:
```bash
npx prisma migrate dev --name <tên_migration_viết_thường_không_dấu>
```
*Ví dụ:* `npx prisma migrate dev --name add_pending_payment_status`

> [!NOTE]
> Nếu Database ở local bị lệch lịch sử (Drift), Prisma sẽ yêu cầu **Reset database** (Xóa toàn bộ dữ liệu hiện tại để tạo lại sạch sẽ). Đồng ý bằng cách chọn `y` (vì chúng ta có thể nạp lại dữ liệu test bằng hạt giống - Seed).

### 1.2. Đồng bộ trực tiếp không tạo file Migration
Dùng lệnh này khi bạn muốn đẩy trực tiếp cấu trúc schema.prisma vào database local mà không cần lưu lại file lịch sử `.sql`. Thường dùng khi đang thử nghiệm (Prototyping) hoặc khi phát hiện lệch lịch sử mà không muốn reset DB:
```bash
npx prisma db push
```

### 1.3. Đồng bộ lại lịch sử Migration (Khi bị Drift)
Nếu DB local bị lỗi đồng bộ hoặc cấu trúc không đồng nhất với các file `.sql` cũ trong git, hãy chạy lệnh này để xóa sạch DB local và chạy lại tất cả các file migration từ đầu:
```bash
npx prisma migrate reset --force
```

### 1.4. Tạo hạt giống dữ liệu (Seed)
Nạp dữ liệu giả lập/thử nghiệm (Accounts, Complexes, Bookings, Reviews...) vào Database:
```bash
npx prisma db seed
```

### 1.5. Tạo lại Prisma Client (TypeScript Types)
Tái sinh các kiểu dữ liệu TypeScript tự động cho `@prisma/client` để code backend nhận diện đúng cấu trúc DB mới nhất:
```bash
npx prisma generate
```

### 1.6. Giao diện quản lý Database (Prisma Studio)
Mở một giao diện Web trực quan để xem, sửa, xóa dữ liệu trực tiếp trong database local cực kỳ nhanh chóng:
```bash
npx prisma studio
```
*Mặc định giao diện sẽ chạy tại cổng http://localhost:5555*

---

## 2. Môi trường Triển khai (Staging / Production)

> [!WARNING]
> Tuyệt đối **không chạy** các lệnh mang tính chất phá hủy như `prisma migrate dev` hoặc `prisma db push` trên môi trường Production vì có nguy cơ làm mất/thay đổi dữ liệu thực tế của người dùng.

### 2.1. Triển khai các bản nâng cấp Database (Deploy Migrations)
Áp dụng các file migration SQL chưa chạy từ thư mục `prisma/migrations` vào Database Production một cách an toàn (giữ nguyên dữ liệu hiện tại):
```bash
npx prisma migrate deploy
```

*Trong môi trường Docker Compose Production, lệnh này được chạy thông qua container backend:*
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy
```

### 2.2. Kiểm tra trạng thái Migration trên Server
Kiểm tra xem Database Production đã chạy đủ các bản Migration hay chưa:
```bash
npx prisma migrate status
```

---

## 3. Các lệnh xử lý sự cố thường gặp (Troubleshooting)

### 3.1. Tạo Migration mới mà không chạy (Create-only)
Dùng khi bạn muốn viết một file migration tùy chỉnh (ví dụ thêm các câu lệnh SQL cài đặt extension đặc biệt như `pgvector` trước khi tạo bảng):
```bash
npx prisma migrate dev --create-only
```
Sau khi file SQL trống được sinh ra trong thư mục `migrations/`, bạn mở ra viết thêm câu lệnh SQL tùy chỉnh, sau đó chạy `npx prisma migrate dev` để áp dụng.

### 3.2. Cập nhật schema từ Database có sẵn (Introspect)
Nếu bạn thay đổi cấu trúc bảng trực tiếp trên Database bằng SQL bên ngoài, hãy chạy lệnh này để Prisma tự quét DB và cập nhật lại file `schema.prisma` cho bạn:
```bash
npx prisma db pull
```
