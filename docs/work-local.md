# Hướng dẫn chạy và làm việc ở môi trường Local với Docker Compose

Tài liệu này hướng dẫn cách thiết lập, khởi chạy và kiểm thử hệ thống **Sports Booking Platform** ở môi trường local sử dụng Docker Compose. 

Môi trường local được cấu hình mô phỏng môi trường production với **2 instance Backend** được cân bằng tải qua **Nginx**, đồng bộ thông báo thời gian thực qua **Redis Adapter** và hỗ trợ tìm kiếm gợi ý bằng **pgvector**.

---

## 1. Kiến trúc môi trường Local Development

Sơ đồ kết nối giữa các dịch vụ khi chạy `docker compose`:

```mermaid
graph TD
    Browser[Trình duyệt máy Host]
    
    subgraph Docker Network [sports-booking-network]
        NginxDev[nginx-dev: Cổng 3000]
        Backend1[backend-1: Cổng 3001]
        Backend2[backend-2: Cổng 3002]
        Frontend[frontend: Cổng 5173]
        Postgres[postgres-db: Cổng 5432]
        Redis[redis: Cổng 6379]
    end

    Browser -->|Tải trang & HMR| Frontend
    Browser -->|Gửi API & WebSockets| NginxDev
    
    NginxDev -->|Cân bằng tải ip_hash| Backend1
    NginxDev -->|Cân bằng tải ip_hash| Backend2
    
    Backend1 & Backend2 -->|Lưu trữ dữ liệu & pgvector| Postgres
    Backend1 & Backend2 -->|Đồng bộ Socket.io & Cache| Redis
```

*   **postgres-db**: Sử dụng image `pgvector/pgvector:pg16` để lưu trữ dữ liệu và tính toán vector cosine similarity.
*   **redis**: Bộ nhớ đệm và pub/sub cho Socket.io Redis Adapter.
*   **backend-1 & backend-2**: Hai instance Node.js chạy song song chế độ dev (`tsx watch`), tự động cập nhật khi sửa code trên máy host.
*   **nginx-dev**: Cổng gateway trên cổng `3000`, tự động phân phối tải và hỗ trợ kết nối WebSocket.
*   **frontend**: Chạy Vite Dev Server trên cổng `5173`.

---

## 2. Chuẩn bị File Môi trường (.env)

Trước khi khởi chạy, bạn cần cấu hình các file `.env` ở các thư mục tương ứng.

### 2.1. File `.env` tại thư mục gốc (Root)
Dùng để cấu hình các dịch vụ Docker (PostgreSQL, Redis) và các cổng trên máy host.
Tạo file `.env` từ file mẫu:
```bash
cp .env.example .env
```
Đảm bảo các biến sau được khai báo chính xác:
```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=sports_db
POSTGRES_PORT=5432

REDIS_PORT=6379

SERVER_PORT=3000      # Cổng chạy của Nginx Gateway
CLIENT_PORT=5173      # Cổng chạy của Vite Frontend
```

### 2.2. File `apps/backend/.env`
Dùng cho Backend và các script chạy từ máy host (như migrate db, seeding).
Tạo file từ file mẫu:
```bash
cd apps/backend
cp .env.example .env
```
Cấu hình quan trọng:
```env
# DATABASE_URL kết nối tới localhost từ máy host
DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/sports_db?schema=public

REDIS_URL=redis://localhost:6379
SERVER_PORT=3000
```
> [!NOTE]
> Khi chạy trong container, Docker Compose sẽ tự động ghi đè `DATABASE_URL` sang `postgres-db:5432` và `REDIS_URL` sang `redis:6379` thông qua các biến môi trường cấu hình trong file `docker-compose.yml`. Vì vậy, file `.env` ở backend chỉ cần cấu hình `localhost` phục vụ cho các câu lệnh chạy trực tiếp từ máy host.

### 2.3. File `apps/frontend/.env`
Dùng cho Vite Client kết nối đến Gateway.
Tạo file từ file mẫu:
```bash
cd apps/frontend
cp .env.example .env
```
Nội dung:
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000
```

---

## 3. Các Mô hình Khởi chạy & Phát triển Local

Dự án hỗ trợ 2 mô hình phát triển ở local tùy theo nhu cầu của bạn:

*   **Mô hình A (Full Docker)**: Chạy tất cả dịch vụ trong Docker. Thích hợp khi cần test tính năng cân bằng tải (2 instances backend) và đồng bộ websocket Nginx.
*   **Mô hình B (Hybrid - Hỗn hợp)**: Chỉ chạy Database và Redis trong Docker, còn Backend và Frontend chạy trực tiếp trên máy Host bằng lệnh `npm run dev`. Thích hợp khi code hàng ngày để có tốc độ build nhanh nhất và dễ dàng debug.

---

### MÔ HÌNH A: Chạy toàn bộ bằng Docker Compose

#### Bước A.1: Khởi động toàn bộ container
Tại thư mục gốc của dự án, chạy lệnh:
```bash
docker compose up -d --build
```

#### Bước A.2: Đồng bộ Database & Sinh dữ liệu mẫu (Seeding)
Chạy trực tiếp từ máy host thông qua kết nối port đã map:
```bash
cd apps/backend
npx prisma db push
npx tsx prisma/seed.ts
npm run populate:embeddings
```

---

### MÔ HÌNH B: Chạy Hỗn hợp (Docker DB/Redis + Host App) - Khuyên dùng khi Dev

#### Bước B.1: Chỉ khởi động Postgres và Redis bằng Docker
Tại thư mục gốc của dự án, chạy lệnh:
```bash
docker compose up postgres-db redis -d
```
Lệnh này chỉ khởi động container chứa Database (có sẵn pgvector) và Redis cache, giải phóng tài nguyên CPU/RAM trên máy host.

#### Bước B.2: Chạy Backend trực tiếp trên máy Host
Mở một Terminal mới, di chuyển vào thư mục backend và thực hiện:
```bash
cd apps/backend
# Cài đặt thư viện nếu chưa cài
npm install

# Đồng bộ schema và nạp dữ liệu mẫu
npx prisma db push
npx tsx prisma/seed.ts
npm run populate:embeddings

# Chạy Backend dev server (Lắng nghe tại cổng 3000)
npm run dev
```

#### Bước B.3: Chạy Frontend trực tiếp trên máy Host
Mở thêm một Terminal khác, di chuyển vào thư mục frontend và thực hiện:
```bash
cd apps/frontend
# Cài đặt thư viện nếu chưa cài
npm install

# Chạy Frontend dev server (Lắng nghe tại cổng 5173)
npm run dev
```

> [!TIP]
> Khi chạy ở **Mô hình B (Hybrid)**, Frontend sẽ giao tiếp trực tiếp với Backend ở địa chỉ `http://localhost:3000/api/v1` mà không cần đi qua cổng trung gian của Nginx. Cách này giúp bạn xem console log của Backend ngay tại terminal máy host và dễ đặt breakpoint debug trên IDE.

---

## 4. Kiểm thử các tính năng đặc thù ở Local

> [!IMPORTANT]
> Các phần **4.1 (Kiểm thử Cân bằng tải)** và **4.2 (Kiểm thử Đồng bộ thông báo qua Redis Adapter)** chỉ áp dụng khi bạn chạy ở **Mô hình A (Full Docker)**. 
> 
> Nếu chạy ở **Mô hình B (Hybrid)**, bạn chỉ chạy duy nhất **1 instance backend** trên host ở cổng 3000, do đó request luôn đi thẳng vào instance này mà không qua Nginx load balancer và cũng không cần đồng bộ giữa các backend khác nhau.

### 4.1. Kiểm thử Cân bằng tải & Hot-reloading *(Chỉ có ở Mô hình A)*
*   Truy cập frontend tại: `http://localhost:5173`
*   Mở console của trình duyệt và thực hiện các thao tác đặt sân hoặc tải trang.
*   Nginx Gateway sẽ phân phối các API request luân phiên về `backend-1` và `backend-2`.
*   Bạn có thể xem log của từng backend riêng biệt để kiểm tra luồng đi của request:
    ```bash
    # Xem log của Backend 1
    docker logs -f sports-booking-backend-1

    # Xem log của Backend 2
    docker logs -f sports-booking-backend-2
    ```
*   Khi bạn thay đổi code ở thư mục `apps/backend/src` trên máy host, cả hai container backend sẽ tự động reload lại ngay lập tức nhờ cơ chế Bind Mount.

### 4.2. Kiểm thử Đồng bộ thông báo qua Redis Adapter *(Chỉ có ở Mô hình A)*
*   Đăng nhập tài khoản Player ở một trình duyệt ẩn danh (ví dụ: Chrome Incognito) và tài khoản Owner ở một trình duyệt khác (ví dụ: Firefox).
*   Khi Player tiến hành đặt sân thành công, một sự kiện socket sẽ được gửi lên hệ thống.
*   Dù Player kết nối tới `backend-1` và Owner đang kết nối tới `backend-2`, nhờ vào **Redis Adapter**, sự kiện thông báo sẽ được đồng bộ thông qua kênh pub/sub của Redis. Owner sẽ nhận được thông báo đặt sân mới ngay lập tức trên màn hình mà không bị trễ hoặc mất kết nối.

### 4.3. Kiểm thử Gợi ý sân bằng pgvector & Cosine Similarity *(Áp dụng cho cả 2 mô hình)*
*   Đảm bảo bạn đã chạy lệnh `npm run populate:embeddings` thành công.
*   Khi người dùng Player thực hiện đặt sân tối thiểu 3 lần, hệ thống sẽ tự động tổng hợp hành vi (loại thể thao yêu thích, giờ chơi, mức giá trung bình) thành một User Vector.
*   Hệ thống sẽ thực hiện truy vấn cosine similarity bằng cách so sánh User Vector này với Subfield Vectors trong database để trả về danh sách các sân đấu phù hợp nhất, sau đó dùng Gemini API để xếp hạng lại (rerank).

### 4.4. Kiểm thử Đặt sân Đồng thời (Concurrency/Race Condition) *(Áp dụng cho cả 2 mô hình)*
Để kiểm tra xem cơ chế khóa 2 lớp (**Redis Distributed Lock + Postgres FOR UPDATE**) trong [booking.service.ts](../apps/backend/src/services/v1/booking.service.ts) có hoạt động đúng và ngăn chặn được lỗi đặt trùng sân (**Double Booking**) hay không, dự án cung cấp sẵn một script kiểm thử mô phỏng.

**Cách thực hiện:**
1. Hãy chắc chắn rằng database và redis đang hoạt động (ở cả Mô hình A hoặc Mô hình B).
2. Tại thư mục gốc của dự án, chạy lệnh:
   ```bash
   npx tsx apps/backend/src/scripts/test-concurrency.ts
   ```
3. **Kịch bản của script:**
   * Script sẽ tự động tìm 2 tài khoản người chơi active khác nhau trong cơ sở dữ liệu.
   * Lấy ra 1 sân con bất kỳ đang hoạt động.
   * Sử dụng lệnh `Promise.allSettled` để **đồng thời gửi 2 yêu cầu đặt sân trên cùng một sân con, trong cùng một khung giờ** (vào ngày mai từ 10:00 đến 11:00) với độ lệch thời gian xử lý gần như bằng 0.
4. **Kết quả kỳ vọng:**
   * **Một request thành công**: Một đơn đặt sân được ghi nhận thành công vào database.
   * **Một request thất bại**: Người chơi thứ hai sẽ bị từ chối ngay lập tức và nhận được thông báo lỗi từ Redis Lock hoặc Postgres Transaction: *"Sân đang có nhiều người đặt cùng lúc. Vui lòng thử lại sau giây lát."* hoặc *"Đã có người đặt khoảng thời gian này..."*
   * Database chỉ lưu duy nhất **1 record đặt sân** (không xảy ra trùng lịch).
   * Script sẽ tự động xóa bản ghi vừa tạo để giữ sạch dữ liệu.

---

## 5. Các câu lệnh hữu ích khi làm việc

*   **Xem trạng thái các container**:
    ```bash
    docker compose ps
    ```
*   **Xem log thời gian thực của toàn bộ hệ thống**:
    ```bash
    docker compose logs -f
    ```
*   **Dừng hệ thống (nhưng giữ lại dữ liệu DB/Redis)**:
    ```bash
    docker compose down
    ```
*   **Dừng hệ thống và xóa toàn bộ dữ liệu DB/Redis (Khởi động lại từ đầu)**:
    ```bash
    docker compose down -v
    ```
*   **Mở Prisma Studio để xem dữ liệu dạng UI trực quan**:
    ```bash
    cd apps/backend
    npx prisma studio
    ```
    (Truy cập tại địa chỉ `http://localhost:5555`)

---

## 6. Xử lý sự cố thường gặp (Troubleshooting)

1.  **Lỗi: `Address already in use` hoặc `Port 3000/5173 is already allocated`**
    *   *Nguyên nhân*: Có ứng dụng khác đang chạy trên máy host chiếm cổng này (hoặc có phiên chạy dev local không qua Docker chưa tắt).
    *   *Cách sửa*: Tìm và tắt ứng dụng đó, hoặc sửa cổng tương ứng (`SERVER_PORT` hoặc `CLIENT_PORT`) trong file `.env` gốc rồi chạy lại.
2.  **Lỗi: `PrismaClientInitializationError` khi chạy migrate từ máy host**
    *   *Nguyên nhân*: Container `postgres-db` chưa khởi động xong hoặc sai thông tin đăng nhập trong file `apps/backend/.env`.
    *   *Cách sửa*: Kiểm tra `docker compose ps` để chắc chắn DB đang chạy. Kiểm tra kỹ `DATABASE_URL` trong file `apps/backend/.env` xem đã chỉ đúng về `localhost:5432` và đúng tài khoản chưa.
3.  **Lỗi: Không nhận được gợi ý sân cá nhân hóa**
    *   *Nguyên nhân*: Chưa chạy lệnh sinh embeddings hoặc tài khoản người chơi chưa đặt sân đủ 3 lần (điều kiện cold start).
    *   *Cách sửa*: Đảm bảo chạy lệnh `npm run populate:embeddings` và đặt thử ít nhất 3 sân khác nhau bằng tài khoản đó.
