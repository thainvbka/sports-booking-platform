# Hướng dẫn triển khai Sports Booking Platform lên EC2 mới từ đầu

Tài liệu này hướng dẫn chi tiết từng bước chuẩn bị hạ tầng, cấu hình bảo mật, cấp chứng chỉ SSL (Let's Encrypt) và tự động hóa CI/CD bằng GitHub Actions cho dự án **Sports Booking Platform** trên một EC2 duy nhất.

---

## Bước 1: Chuẩn bị hạ tầng trên AWS EC2

### 1.1 Khởi tạo EC2 Instance

1. Đăng nhập vào AWS Console, chọn **EC2** -> **Launch Instance**.
2. Chọn hệ điều hành: **Ubuntu 24.04 LTS** (được hỗ trợ tốt nhất).
3. Instance Type: Chọn **`t3.small`** (2 vCPUs, 2 GB RAM, giúp hệ thống vận hành cực kỳ ổn định, chạy song song 2 container backend và không lo bị tràn bộ nhớ RAM).
4. Key Pair (SSH): Chọn **Create new key pair**, đặt tên (ví dụ: `sports-key`), tải tệp `.pem` về máy (đây là khóa SSH Private Key của bạn).

### 1.2 Cấu hình Security Group (Mở các cổng mạng)

Trong phần cấu hình Security Group (hoặc sau khi tạo xong instance vào mục Security -> Security Groups), thêm các Rule inbound sau:

- **SSH (Cổng 22)**: Cho phép truy cập từ `My IP` (hoặc `0.0.0.0/0` nếu cần truy cập mọi nơi).
- **HTTP (Cổng 80)**: Cho phép truy cập từ `Anywhere-IPv4` (`0.0.0.0/0`).
- **HTTPS (Cổng 443)**: Cho phép truy cập từ `Anywhere-IPv4` (`0.0.0.0/0`).

---

## Bước 2: Cấu hình Tên miền (Domain Name)

1. Truy cập trang quản lý tên miền của bạn (ví dụ: Cloudflare, Namecheap,...).
2. Tạo 2 bản ghi **A Record** trỏ về địa chỉ **Public IP** của máy chủ EC2 mới:
   - Bản ghi 1: Name: `@` (hoặc `yourdomain.com`) -> Value: `<IP_EC2>`
   - Bản ghi 2: Name: `www` -> Value: `<IP_EC2>`

---

## Bước 3: Cấu hình GitHub Secrets

Vào Repository của bạn trên GitHub -> **Settings** -> **Secrets and variables** -> **Actions** -> Chọn **New repository secret** để thêm các biến sau:

| Tên Secret        | Giá trị                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOCKER_USERNAME` | Tên tài khoản Docker Hub của bạn                                                                                                             |
| `DOCKER_PASSWORD` | Mật khẩu hoặc Access Token của Docker Hub                                                                                                    |
| `EC2_HOST`        | Địa chỉ IP Public của EC2 hoặc tên miền `yourdomain.com`                                                                                     |
| `EC2_SSH_KEY`     | Mở tệp `.pem` đã tải ở bước 1 lên bằng Text Editor, copy **toàn bộ nội dung** (bao gồm cả dòng `-----BEGIN...` và `-----END...`) và dán vào. |
| `VITE_API_URL`    | `https://yourdomain.com/api/v1`                                                                                                              |
| `VITE_SOCKET_URL` | `https://yourdomain.com`                                                                                                                     |

---

## Bước 4: Chuẩn bị môi trường trên EC2 (SSH vào EC2)

Mở Terminal trên máy tính cá nhân của bạn và thực hiện các lệnh sau:

### 4.1 Kết nối SSH vào EC2

```bash
# Phân quyền cho file key pem (chỉ cần chạy trên Linux/macOS)
chmod 400 path/to/sports-key.pem

# Kết nối
ssh -i path/to/sports-key.pem ubuntu@<IP_EC2>
```

### 4.2 Cài đặt Docker và Docker Compose trên EC2

Sau khi SSH thành công vào EC2, chạy các lệnh sau:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2

# Cho phép user 'ubuntu' chạy Docker không cần sudo
sudo usermod -aG docker ubuntu

# Thoát ra và đăng nhập lại để cập nhật quyền truy cập Docker
exit
ssh -i path/to/sports-key.pem ubuntu@<IP_EC2>

# Kiểm tra Docker hoạt động không cần sudo
docker ps
```

### 4.3 Tạo thư mục dự án và file cấu hình môi trường

```bash
# Tạo thư mục dự án
mkdir -p ~/sports-booking-platform/certbot
cd ~/sports-booking-platform

# Tạo file biến môi trường sản xuất (.env.production)
nano .env.production
```

Sao chép nội dung cấu hình môi trường sản xuất thực tế của bạn, dán vào và lưu lại (Nhấn `Ctrl + O` -> `Enter` để lưu, `Ctrl + X` để thoát nano):

```
# DATABASE
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=<MẬT_KHẨU_DB_BẢO_MẬT_CỦA_BẠN>
POSTGRES_DB=sports_db
POSTGRES_PORT=5432
DATABASE_URL=

# REDIS CACHE
REDIS_PASSWORD=<MẬT_KHẨU_REDIS_BẢO_MẬT_CỦA_BẠN>
REDIS_URL=redis://:redis_password@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# SERVER CONFIG
NODE_ENV=production
SERVER_PORT=3000
CLIENT_PORT=80
CLIENT_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# SECURITY / JWT
JWT_ACCESS_SECRET=<MÃ_BÍ_MẬT_ACCESS_JWT_CỦA_BẠN>
JWT_REFRESH_SECRET=<MÃ_BÍ_MẬT_REFRESH_JWT_CỦA_BẠN>
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# STRIPE PAYMENT
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CLOUDINARY STORAGE
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=<MÃ_BÍ_MẬT_CLOUDINARY_CỦA_BẠN>

# EMAIL SERVICES (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASS=<MẬT_KHẨU_ỨNG_DỤNG_GMAIL>

# DOCKER HUB
DOCKER_USERNAME=your_docker_username
BACKEND_IMAGE=your_docker_username/sports-booking-backend
FRONTEND_IMAGE=your_docker_username/sports-booking-frontend

# GEMINI AI SERVICE
GEMINI_API_KEY=<KEY_GEMINI_CỦA_BẠN>
GEMINI_MODEL=gemini-2.0-flash
RECOMMENDATION_CACHE_TTL=21600
RECOMMENDATION_LOCK_TTL=30

# VNPAY PAYMENT
VNPAY_TMN_CODE=
VNPAY_SECURE_SECRET=
VNPAY_HOST=https://sandbox.vnpayment.vn
VNPAY_RETURN_URL=
```

---

## Bước 5: Tạo Chứng chỉ SSL Let's Encrypt (Giải quyết lỗi "con gà và quả trứng")

Nginx trong `docker-compose.prod.yml` yêu cầu file chứng chỉ SSL thực tế để khởi động thành công, trong khi Certbot lại cần Nginx chạy cổng 80 để xác thực tên miền. Ta giải quyết bằng mẹo tạo chứng chỉ giả (Self-Signed) để mồi Nginx khởi động trước:

### 5.1 Tạo chứng chỉ Self-Signed giả lập

```bash
DOMAIN="yourdomain.com"

# Tạo cấu trúc thư mục Certbot
mkdir -p ~/sports-booking-platform/certbot/conf/live/$DOMAIN

# Tạo cặp khóa tự ký giả lập
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
  -keyout ~/sports-booking-platform/certbot/conf/live/$DOMAIN/privkey.pem \
  -out ~/sports-booking-platform/certbot/conf/live/$DOMAIN/fullchain.pem \
  -subj "/CN=localhost"
```

Kiểm tra lại xem file đã được tạo chưa Gõ lệnh sau trên EC2 để kiểm tra:

```bash
ls -lh ~/sports-booking-platform/certbot/conf/live/$DOMAIN/
```

### 5.2 Kích hoạt CI/CD để triển khai ứng dụng lần đầu

Bây giờ, bạn hãy thực hiện **Git Commit & Push** toàn bộ code từ máy local lên nhánh `main` của GitHub. Điều này sẽ kích hoạt **GitHub Actions** tự động chạy:

1. Build các Docker image và đẩy lên Docker Hub.
2. Sao chép file `docker-compose.prod.yml` và thư mục `nginx/` sang EC2.
3. Khởi chạy các container trên EC2 với 2 thực thể backend độc lập (backend-1 và backend-2) đã được định nghĩa sẵn trong docker-compose.prod.yml, Nginx lúc này khởi động thành công nhờ có chứng chỉ giả lập mồi sẵn và tự động thực hiện cân bằng tải theo IP nguồn (ip_hash) giúp duy trì sticky session ổn định cho kết nối Socket.IO.

### 5.3 Cấp chứng chỉ SSL thực tế từ Let's Encrypt

Sau khi CI/CD chạy xong và container `sports-booking-frontend` đã hoạt động (kiểm tra bằng lệnh `docker ps`), chạy lệnh sau trực tiếp trên EC2 để lấy chứng chỉ SSL thật:

đầu tiên xóa thư mục chứng chỉ giả lập cũ:

```bash
sudo rm -rf ~/sports-booking-platform/certbot/conf/live/yourdomain.com
sudo rm -rf ~/sports-booking-platform/certbot/conf/archive/yourdomain.com
```

lệnh Certbot để lấy chứng chỉ xịn từ Let's Encrypt

```bash
# Thay đổi email thực của bạn
EMAIL="your-email@example.com"
DOMAIN="yourdomain.com"

docker run --rm \
  -v ~/sports-booking-platform/certbot/conf:/etc/letsencrypt \
  -v ~/sports-booking-platform/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN -d www.$DOMAIN \
  --force-renewal
```

note:
kết quả từ termial

```bash
docker run --rm \
  -v ~/sports-booking-platform/certbot/conf:/etc/letsencrypt \
  -v ~/sports-booking-platform/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN -d www.$DOMAIN \
  --force-renewal
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for yourdomain.com and www.yourdomain.com

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/yourdomain.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/yourdomain.com/privkey.pem
This certificate expires on 2026-09-09.
These files will be updated when the certificate renews.
NEXT STEPS:
- The certificate will need to be renewed before it expires. Certbot can automatically renew the certificate in the background, but you may need to take steps to enable that functionality. See https://certbot.org/renewal-setup for instructions.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
```

> [!NOTE]
> Chứng chỉ thật sẽ ghi đè lên chứng chỉ giả lập tự ký trước đó mà không làm lỗi cấu hình của Nginx.

### 5.4 Tải lại cấu hình Nginx để nhận chứng chỉ SSL thật

```bash
docker exec sports-booking-frontend nginx -s reload
```

Bây giờ trang web của bạn đã có biểu tượng ổ khóa HTTPS màu xanh an toàn!

---

## Bước 6: Thiết lập Tự động gia hạn SSL (Cron Job)

Chứng chỉ Let's Encrypt chỉ có thời hạn 90 ngày. Thiết lập cron job trên EC2 để tự động chạy Certbot gia hạn hàng tháng:

```bash
# Mở bảng cron job
crontab -e
```

Chọn editor (nano) và thêm dòng sau vào cuối file để tự động gia hạn lúc 3:00 sáng ngày mùng 1 hàng tháng:

```
0 3 1 * * docker run --rm -v ~/sports-booking-platform/certbot/conf:/etc/letsencrypt -v ~/sports-booking-platform/certbot/www:/var/www/certbot certbot/certbot renew --quiet && docker exec sports-booking-frontend nginx -s reload
```

Lưu lại và thoát ra. Quy trình gia hạn SSL hoàn toàn tự động đã được thiết lập xong!

---

Tên miền `yourdomain.com` **bắt buộc phải cấu hình** trỏ về địa chỉ IP của máy EC2 mới thì toàn bộ hệ thống mới hoạt động được bạn nhé.

Sở dĩ chúng ta sử dụng trực tiếp tên miền này trong cấu hình GitHub Secrets và các file cấu hình khác vì:

### 1. Bạn cần cấu hình DNS trên DNS Manager trước (Ví dụ: Cloudflare, tenten, matbao,...):

- Bạn phải đăng nhập vào nơi bạn quản lý tên miền `yourdomain.com`.
- Tạo bản ghi **A Record** trỏ tên miền này và `www.yourdomain.com` về **Public IP mới** của máy ảo EC2.
- _Nếu không trỏ bản ghi này, khi bạn chạy Certbot để xin cấp SSL hoặc người dùng truy cập trang web, trình duyệt sẽ không biết máy chủ EC2 của bạn ở đâu._

### 2. Tại sao phải đưa tên miền vào GitHub Secrets để build?

Do ứng dụng Frontend (React/Vite) chạy trực tiếp trên trình duyệt của người dùng cuối:

- Tại thời điểm build (trên GitHub Actions), React cần biết địa chỉ API thực tế ở đâu để đóng gói cứng địa chỉ đó vào các file JavaScript tĩnh.
- Nếu không truyền `VITE_API_URL=https://yourdomain.com/api/v1` vào lúc build, Frontend sẽ mặc định gọi về `http://localhost:3000/api/v1` và người dùng ngoài internet sẽ không thể gọi được API của backend.

### 3. Nginx và Certbot cần tên miền:

- Tệp `nginx.conf` cần khai báo `server_name yourdomain.com` để đón các request và trỏ đúng đường dẫn chứng chỉ SSL.
- Certbot cần tên miền để gửi yêu cầu đến tổ chức Let's Encrypt cấp chứng chỉ SSL mã hóa cho đúng tên miền đó.

---

## Bước 7: Cơ chế Cập nhật & Rollback nhanh khi có lỗi

Trong quá trình vận hành, nếu bản deploy mới nhất từ GitHub Actions xảy ra lỗi nghiêm trọng hoặc không hoạt động đúng kỳ vọng, bạn có thể nhanh chóng rollback (quay lui) về phiên bản chạy ổn định trước đó.

### 7.1 Cơ chế Rollback nhanh (Quick Rollback)

Do các Docker image được tag theo mã hash git commit (`github.sha`), bạn có thể chỉ định tag của phiên bản cũ để chạy lại mà không cần rebuild:

```bash
# SSH vào máy chủ EC2
cd ~/sports-booking-platform

# Chạy Docker Compose chỉ định IMAGE_TAG của commit ổn định trước đó
IMAGE_TAG=<SHA_cũ> docker compose -f docker-compose.prod.yml --env-file .env.production up -d --remove-orphans backend-1 backend-2
```

_Lưu ý: Thay thế `<SHA_cũ>` bằng mã SHA commit (ví dụ: `8a7f92b`) của bản build thành công trước đó trên Docker Hub._

### 7.2 Kiểm tra danh sách các phiên bản đã build

Bạn có thể xem danh sách các tag đã được đẩy lên Docker Hub tại:
`https://hub.docker.com/r/your_docker_username/sports-booking-backend/tags`
hoặc kiểm tra lịch sử deploy trên GitHub Actions để lấy mã SHA commit mong muốn.

## Bước 8: Quản trị và Vận hành Hệ thống trên EC2

Dưới đây là các lệnh cần thiết để bạn quản trị dự án, kiểm tra log, chạy dữ liệu mẫu (seed), và sao lưu cơ sở dữ liệu trực tiếp trên máy chủ EC2.

### 8.1 Quản lý các Container (Dịch vụ)

Mọi lệnh Docker Compose ở Production đều yêu cầu chỉ định tệp cấu hình và môi trường:

- **Kiểm tra trạng thái các container**:
  ```bash
  cd ~/sports-booking-platform
  docker compose -f docker-compose.prod.yml --env-file .env.production ps
  ```
- **Xem logs thời gian thực của Backend (Theo dõi lỗi runtime)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=100 backend-1 backend-2
  ```
- **Xem logs thời gian thực của Nginx/Frontend**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production logs -f --tail=100 frontend
  ```
- **Khởi động lại toàn bộ dịch vụ**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart
  ```
- **Khởi động lại một dịch vụ cụ thể (Ví dụ: backend-1 và backend-2)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production restart backend-1 backend-2
  ```

### 8.2 Quản trị Cơ sở dữ liệu (PostgreSQL & Prisma)

- **Khởi tạo dữ liệu mẫu (Seed Database)**:
  Nếu bạn cần chạy file seed (để chèn các dữ liệu sân bóng, tài khoản admin mẫu ban đầu), hãy chạy lệnh này:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 npx prisma db seed
  ```
- **Truy cập CLI của Database (psql)**:
  Nếu muốn vào trực tiếp giao diện dòng lệnh của Postgres để chạy các câu lệnh SQL:

  ```bash
  docker exec -it sports-booking-db psql -U your_db_user -d sports_db
  ```

  _(Để thoát gõ `\q` rồi nhấn Enter)._

- **Sao lưu dữ liệu (Database Backup - pg_dump)**:
  Lệnh xuất toàn bộ dữ liệu ra tệp tin SQL lưu trữ trên EC2:

  ```bash
  docker exec -t sports-booking-db pg_dump -U your_db_user -d sports_db > ~/db_backup_$(date +%F).sql
  ```

- **Khôi phục dữ liệu từ tệp sao lưu (Database Restore)**:
  Lệnh nạp ngược tệp SQL sao lưu vào cơ sở dữ liệu:

  ```bash
  cat ~/db_backup_yyyy-mm-dd.sql | docker exec -i sports-booking-db psql -U your_db_user -d sports_db
  ```

- **Áp dụng Migration thủ công (khi có thay đổi Schema)**:
  ```bash
  docker compose -f docker-compose.prod.yml --env-file .env.production run --rm backend-1 npx prisma migrate deploy
  ```

### 8.3 Tối ưu hóa bộ nhớ ảo (SWAP) cho EC2 (Khuyên dùng)

Để tránh trường hợp bộ nhớ vật lý của EC2 (2GB RAM) bị tràn gây tắt các container đột ngột (OOM), bạn hãy tạo thêm 2GB SWAP:

```bash
# Tạo tệp tin swap dung lượng 2GB
sudo fallocate -l 2G /swapfile

# Phân quyền bảo mật cho tệp swap
sudo chmod 600 /swapfile

# Khởi tạo swap
sudo mkswap /swapfile

# Kích hoạt swap
sudo swapon /swapfile

# Ghi cấu hình để tự động nhận swap sau khi restart EC2
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Kiểm tra lại bộ nhớ ảo
free -h
```
