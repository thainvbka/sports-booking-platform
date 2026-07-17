# Hướng dẫn Backup & Restore Database PostgreSQL

Tài liệu này hướng dẫn cách sao lưu (Backup) và khôi phục (Restore) cơ sở dữ liệu PostgreSQL cho dự án **Sports Booking Platform** trên cả môi trường Local và Production (EC2).

---

## Phương pháp 1: Sử dụng dòng lệnh Docker CLI (Khuyên dùng)

Đây là phương pháp nhanh nhất, ổn định nhất và không đòi hỏi cài đặt thêm bất kỳ công cụ PostgreSQL client nào trên máy cá nhân của bạn.

### 1. Sao lưu dữ liệu (Backup / Dump)

Chạy lệnh dưới đây trực tiếp trên môi trường đang chạy cơ sở dữ liệu (Local hoặc SSH vào EC2):

```bash
# Lệnh tổng quát
docker exec -t <tên_container_db> pg_dump -U <user_db> -d <tên_db> > backup.sql

# Ví dụ trên Production (EC2):
docker exec -t sports-booking-db pg_dump -U postgres -d sports-booking > ~/backup.sql
```

*Trong đó:*
* `-U postgres`: Tên Username của database (lấy từ biến `POSTGRES_USER` trong file `.env.production`).
* `-d sports-booking`: Tên cơ sở dữ liệu (lấy từ biến `POSTGRES_DB`).
* `~/backup.sql`: File kết quả được ghi ra thư mục Home của server.

> [!TIP]
> Bạn có thể sử dụng các công cụ quản lý file như **Termius (SFTP)** hoặc **VS Code Remote - SSH** để tải file `backup.sql` này về máy cá nhân lưu trữ.

---

### 2. Khôi phục dữ liệu (Restore)

Khi muốn khôi phục lại dữ liệu từ một file `.sql` có sẵn:

1. Đảm bảo file `backup.sql` đã được đưa lên server (ví dụ đặt tại thư mục `~/backup.sql`).
2. Chạy lệnh sau để nhập ngược dữ liệu vào container:

```bash
# Lệnh tổng quát
cat <đường_dẫn_file_sql> | docker exec -i <tên_container_db> psql -U <user_db> -d <tên_db>

# Ví dụ trên Production (EC2):
cat ~/backup.sql | docker exec -i sports-booking-db psql -U postgres -d sports-booking
```

---

## Phương pháp 2: Sử dụng công cụ DBeaver (Giao diện đồ họa)

Nếu bạn muốn quản lý trực quan bằng giao diện của DBeaver:

### 1. Xuất dữ liệu (Backup)
1. Trong cột **Database Navigator** bên trái, click chuột phải vào Connection hoặc Tên Database muốn sao lưu.
2. Chọn **Tools** -> **Backup**.
3. Chọn các bảng/schema cần sao lưu (thường tích chọn toàn bộ schema `public`). Nhấn **Next**.
4. Cấu hình định dạng đầu ra (Output settings):
   * **Format:** Chọn `SQL` (để xuất ra file lệnh dạng văn bản dễ đọc) hoặc `Custom` (dạng nén nhị phân của Postgres).
   * **Output folder:** Chọn đường dẫn thư mục lưu file trên máy cá nhân của bạn.
5. Nhấn **Start** để chạy.

> [!NOTE]
> Nếu DBeaver yêu cầu thiết lập đường dẫn Client Tool (`pg_dump`), bạn cần tải thư viện tương ứng qua gợi ý của DBeaver hoặc trỏ tới file cài đặt cục bộ của postgres trên máy của bạn (ví dụ `/usr/bin/pg_dump` trên Linux Fedora/Ubuntu).

---

### 2. Nhập dữ liệu (Restore)
1. Để tránh xung đột dữ liệu cũ, nhấp chuột phải vào Database đích -> Chọn **Tools** -> **Truncate** để làm sạch dữ liệu cũ (hoặc chuẩn bị một Database trống mới).
2. Click chuột phải vào Database đích -> Chọn **Tools** -> **Restore**.
3. Tại ô chọn file, tìm và chọn đường dẫn tới file `.sql` hoặc file backup đã lưu trước đó.
4. Nhấn **Start** để tiến hành khôi phục.
