
Tốt, bây giờ tôi đã nắm rõ toàn bộ cấu trúc. Hãy để tôi tổng hợp lại cho bạn:

---

Khi chạy ở **local**, bạn dùng **Stripe CLI** để bắt các sự kiện webhook và chuyển tiếp (forward) về backend. Đây là cơ chế dùng cho môi trường phát triển vì Stripe không thể gửi webhook đến `localhost`.

Khi lên **Production** (EC2), bạn **không cần Stripe CLI** nữa. Thay vào đó, bạn cần cấu hình trực tiếp trên **Stripe Dashboard** để Stripe gửi webhook thẳng đến server production của bạn qua internet.

### Các bước cần làm:

#### Bước 1: Tạo Webhook Endpoint trên Stripe Dashboard
1. Truy cập [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Nhấn **"Add endpoint"**
3. Điền URL endpoint:
   ```
   https://yourdomain.com/api/v1/payments/webhook
   ```
4. Chọn sự kiện (events) cần lắng nghe. Dựa trên code của bạn, bạn cần ít nhất:
   - `checkout.session.completed` (xác nhận thanh toán thành công)
   - `checkout.session.expired` (phiên thanh toán hết hạn — nếu bạn xử lý)
5. Nhấn **"Add endpoint"** để lưu

#### Bước 2: Lấy Webhook Signing Secret (Production)
Sau khi tạo endpoint, Stripe sẽ sinh ra một **Signing Secret** mới dành riêng cho endpoint production này, có dạng:
```
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
⚠️ **Lưu ý quan trọng:** Signing Secret này **khác hoàn toàn** so với cái `whsec_7afea...` bạn đang dùng ở local (cái kia là của Stripe CLI). Bạn **bắt buộc phải dùng cái mới** do Stripe Dashboard cấp.

#### Bước 3: Cập nhật `.env.production` trên EC2
SSH vào EC2 và cập nhật file `.env.production`:
```bash
nano ~/sports-booking-platform/.env.production
```
Tìm dòng `STRIPE_WEBHOOK_SECRET` và **thay bằng signing secret mới** từ Dashboard:
```env
STRIPE_WEBHOOK_SECRET=whsec_<signing_secret_moi_tu_dashboard>
```
Đồng thời kiểm tra luôn các biến Stripe khác:
```env
STRIPE_SECRET_KEY=sk_test_... (hoặc sk_live_... nếu bạn đã chuyển sang live mode)
CLIENT_URL=https://yourdomain.com
```

#### Bước 4: Restart backend trên EC2
```bash
cd ~/sports-booking-platform
docker compose -f docker-compose.prod.yml --env-file .env.production up -d backend
```

#### Bước 5: Kiểm tra webhook hoạt động
Quay lại Stripe Dashboard → mục **Webhooks** → nhấn vào endpoint bạn vừa tạo → nhấn **"Send test webhook"** → chọn event `checkout.session.completed` → nhấn **Send**.

Kiểm tra log backend trên EC2 để xem có nhận được không:
```bash
docker logs -f sports-booking-backend --tail=50
```

---

### Tóm lại sự khác biệt Local vs Production:

| | Local (Development) | Production (EC2) |
|---|---|---|
| **Cơ chế nhận webhook** | Stripe CLI forward đến `localhost` | Stripe gửi trực tiếp đến `https://yourdomain.com/...` |
| **STRIPE_WEBHOOK_SECRET** | `whsec_...` (do Stripe CLI sinh ra) | `whsec_...` (do Stripe Dashboard sinh ra) |
| **Cần chạy Stripe CLI?** | ✅ Có | ❌ Không |

Code backend của bạn **không cần sửa gì thêm** — route `/api/v1/payments/webhook` và hàm `handleStripeWebhook` đã được viết đúng chuẩn với `stripe.webhooks.constructEvent(data, sig, endpointSecret)`. Nginx cũng đã proxy `/api` sang backend rồi. Bạn chỉ cần thực hiện cấu hình trên Stripe Dashboard và cập nhật biến môi trường là xong.