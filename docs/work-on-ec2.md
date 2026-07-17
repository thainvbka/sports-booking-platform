# Hướng dẫn Làm việc và Vận hành Hệ thống trên EC2

Tài liệu này cung cấp hướng dẫn toàn diện từ cơ bản đến nâng cao để quản trị, xem log, debug và thao tác với các dịch vụ (Backend, Frontend, Database, Redis) trên máy chủ EC2.

---

## 1. Kết nối SSH vào máy chủ EC2
Để thực hiện bất kỳ lệnh nào bên dưới, trước tiên bạn cần kết nối từ máy cá nhân vào EC2:
```bash
ssh -i "~/.ssh/<your-key>.pem" ubuntu@<your-ec2-ip-or-domain>
```

Sau khi kết nối thành công, di chuyển vào thư mục dự án:
```bash
cd ~/sports-booking-platform
```

---

## 2. Quản lý trạng thái các Dịch vụ (Docker Compose)
Dự án chạy ở Production sử dụng file `.env.production`, do đó mọi lệnh Docker Compose bắt buộc phải đi kèm tham số cấu hình:

* **Xem trạng thái các container đang chạy:**
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production ps
  ```
* **Khởi động lại toàn bộ hệ thống:**
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart
  ```
* **Khởi động lại một dịch vụ cụ thể (ví dụ: backend-1 và backend-2):**
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart backend-1 backend-2
  ```

---

## 3. Cách xem và theo dõi Logs trên EC2 (Quan trọng nhất để Debug)

Khi gặp lỗi trên giao diện Web (ví dụ: không load được dữ liệu, lỗi 500, lỗi kết nối), việc đầu tiên bạn cần làm là xem log của Backend.

### 3.1 Xem log thời gian thực (Real-time logs)
Để theo dõi log liên tục khi bạn thao tác trên web (giống như terminal chạy dev ở local):
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=100 backend-1 backend-2
```
* `-f`: Theo dõi thời gian thực (nhấn `Ctrl + C` để thoát).
* `--tail=100`: Chỉ hiển thị 100 dòng log gần nhất để tránh tràn màn hình.

### 3.2 Tìm kiếm lỗi trong log (Grep Errors)
Để lọc ra các dòng log chứa lỗi hoặc từ khóa cụ thể:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs backend-1 backend-2 | grep -i "error"
```

### 3.3 Xem log của Nginx (Frontend & Routing)
Nếu nghi ngờ lỗi do cấu hình tên miền, SSL hoặc reverse proxy:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=100 frontend
```

---

## 4. Quản lý Cơ sở dữ liệu và Chạy Seed

### 4.1 Vào giao diện dòng lệnh của Postgres (psql)
```bash
docker exec -it sports-booking-db psql -U your_db_user -d sports_db
```
*(Để thoát gõ `\q` rồi nhấn Enter)*

### 4.2 Chạy lệnh Seed thủ công
Nếu cần nạp lại dữ liệu giả lập ban đầu:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 npx prisma db seed
```

### 4.3 Xem trạng thái đồng bộ cơ sở dữ liệu
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec -T backend-1 npx prisma migrate status
```

---

## 5. Dọn dẹp tài nguyên & Tiết kiệm dung lượng ổ cứng (Disk Management)
Do mỗi lần deploy Docker sẽ kéo phiên bản mới về và giữ lại phiên bản cũ, ổ cứng EC2 của bạn có thể bị đầy sau một thời gian.

* **Kiểm tra dung lượng đĩa của EC2:**
  ```bash
  df -h
  ```
* **Dọn dẹp sạch sẽ toàn bộ Docker images/containers/networks rác không sử dụng:**
  ```bash
  docker system prune -af
  ```
  *(Lệnh này cực kỳ an toàn, chỉ xoá những gì không hoạt động, không ảnh hưởng đến các container đang chạy).*

---

## 6. Quy trình chuẩn bắt buộc sau khi Seed/Reset Database

Mỗi lần bạn chạy lệnh seed hoặc import lại database mới, các bản ghi cũ sẽ bị xóa và toàn bộ ID (UUID) sẽ được sinh ngẫu nhiên lại từ đầu. Để tránh tình trạng dính cache ID cũ ở trang chủ/gợi ý (lỗi 404) và thiếu dữ liệu Vector tìm kiếm AI, bạn **bắt buộc** phải thực hiện quy trình 3 bước sau:

### Bước 1: Đồng bộ hóa Vector Embeddings cho Hệ thống gợi ý
Khi chạy Seed qua Prisma CLI, các Hook của Express không tự động kích hoạt nên cột `embedding` trong DB của các sân bóng sẽ bị `NULL`. Do Container Production không chứa mã nguồn TypeScript gốc (`src/`) mà chỉ chứa mã nguồn JavaScript đã biên dịch (`dist/`), bạn chạy lệnh sau để tính toán lại vector:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 node dist/scripts/populate-subfield-embeddings.js
```
*(Hoặc sau khi bạn deploy bản cập nhật `package.json` mới nhất, bạn có thể chạy lệnh rút gọn: `docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 npm run populate:embeddings:prod`)*.

### Bước 2: Xoá sạch toàn bộ Cache cũ trong Redis
Xoá cache để tránh việc trang chủ/trang tìm kiếm tải thông tin hoặc ID cũ từ cache trước lúc seed (nguyên nhân gây lỗi 404 hoặc không tìm thấy khu phức hợp):
```bash
docker exec -it sports-booking-redis redis-cli -a your_redis_password flushall
```
*(Nếu bạn cấu hình mật khẩu Redis khác trong `.env.production`, hãy thay thế mật khẩu tương ứng)*.

### Bước 3: Khởi động lại dịch vụ Backend
```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart backend-1 backend-2
```

---

## 7. Các lỗi thường gặp khi thao tác (Troubleshooting)

### 7.1 Lỗi 404 khi bấm Đặt sân / Lỗi "Không tìm thấy khu phức hợp" ở trang Tìm kiếm
* **Hiện tượng:** Click vào một số sân gợi ý (Popular courts) hoặc sân hiển thị ở trang chủ thì báo 404 Not Found.
* **Lý do:** Redis đang cache danh sách sân có ID cũ của đợt seed trước đó. 
* **Cách sửa:** Chạy lệnh xóa cache Redis (`flushall` - xem mục 6).

### 7.2 Không gửi được Email đăng ký / Kích hoạt tài khoản
* **Hiện tượng:** Đăng ký tài khoản không thấy có email gửi về.
* **Cách kiểm tra:** 
  1. Xem log backend lúc bấm đăng ký (`docker compose ... logs -f backend-1 backend-2`).
  2. Nếu có lỗi `Invalid login: 535-5.7.8 Username and Password not accepted`, mật khẩu ứng dụng Gmail (App Password) của bạn đã bị Google thu hồi hoặc hết hạn.
  3. **Cách sửa:** Tạo lại App Password mới từ trang quản lý tài khoản Google, cập nhật vào biến `MAIL_PASS` trong file `.env.production` trên EC2, sau đó restart backend.
