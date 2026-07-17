# Hướng dẫn kiểm thử chống trùng lặp thanh toán (Payment Webhook Idempotency)

Tài liệu này hướng dẫn cách kiểm thử cơ chế chống trùng lặp (Idempotency) khi hệ thống xử lý Webhook thanh toán từ bên thứ ba (Stripe và VNPay). Đây là một cơ chế quan trọng giúp hệ thống không xử lý một giao dịch nhiều lần (ví dụ: tạo nhiều bản ghi thanh toán, cộng tiền/gửi thông báo trùng lắp cho người bán/người chơi) khi nhà cung cấp thanh toán gọi lại webhook nhiều lần do lỗi mạng.

---

## 1. Cơ chế chống trùng lặp (Idempotency) hiện tại

### 1.1. Đối với Stripe Webhook
* **Giải pháp:** Sử dụng mã Checkout Session ID (`session.id`) làm khóa duy nhất (`transaction_code`) trong bảng `Payment`.
* **Luồng xử lý:** Khi nhận webhook sự kiện `checkout.session.completed`, hệ thống truy vấn bảng `Payment` với `transaction_code = session.id`.
  * Nếu đã tồn tại bản ghi, backend nhận biết đây là request bị gửi lặp (retry), lập tức in log: `Webhook retried for <session_id>, skipping` và trả về `200 OK` để xác nhận với Stripe mà không thực hiện lại các thao tác ghi DB hoặc gửi thông báo.
  * Nếu chưa tồn tại, hệ thống chạy transaction cập nhật trạng thái Booking sang `COMPLETED`, tạo bản ghi `Payment` và tạo `OwnerPayout`.

### 1.2. Đối với VNPay IPN Callback
* **Giải pháp:** Sử dụng mã `vnp_TxnRef` ánh xạ đến bản ghi `Payment` đã được tạo trước lúc sinh link thanh toán.
* **Luồng xử lý:** VNPay IPN gửi truy vấn dạng `GET` chứa mã kết quả giao dịch.
  * Hệ thống truy vấn trạng thái `Payment` hiện tại. Nếu trạng thái đã là `SUCCESS` hoặc `FAILED`, hệ thống trả về ngay lập tức mã phản hồi chuẩn của VNPay: `{ RspCode: "02", Message: "Order already confirmed" }`.
  * Nếu trạng thái đang là `PENDING`, hệ thống tiến hành kiểm tra chữ ký bảo mật và cập nhật trạng thái Booking/Payment tương ứng.

---

## 2. Kịch bản kiểm thử (Integration Test)

Hệ thống đã được trang bị một tập lệnh kiểm thử tích hợp (Integration Test) tại địa chỉ:
`apps/backend/src/tests/payment-idempotency.ts`

Script này thực hiện kiểm thử tự động hai trường hợp:
1. **Stripe Test:** Tạo booking giả lập $\rightarrow$ Tạo payload webhook chứa chữ ký hợp lệ $\rightarrow$ Gọi xử lý lần 1 (Kỳ vọng: thành công, booking chuyển thành `COMPLETED`, payment được tạo) $\rightarrow$ Gọi xử lý lần 2 trùng lặp (Kỳ vọng: bỏ qua, không nhân bản payment) $\rightarrow$ Dọn dẹp dữ liệu.
2. **VNPay Test:** Tạo booking & payment `PENDING` giả lập $\rightarrow$ Tạo chữ ký HMAC-SHA512 hợp lệ $\rightarrow$ Gọi xử lý IPN lần 1 (Kỳ vọng: trả về `RspCode: "00"`) $\rightarrow$ Gọi xử lý IPN lần 2 trùng lặp (Kỳ vọng: trả về `RspCode: "02"`) $\rightarrow$ Dọn dẹp dữ liệu.

---

## 3. Hướng dẫn chạy Test

Chạy lệnh sau tại thư mục root của Backend:

```bash
cd apps/backend
npx tsx src/tests/payment-idempotency.ts
```

### Kết quả đầu ra kỳ vọng (Console Log):

```text
[dotenv@17.3.1] injecting env (34) from .env
=== BẮT ĐẦU KIỂM THỬ PAYMENT WEBHOOK IDEMPOTENCY (DIRECT INVOCATION) ===
[Dữ liệu mẫu] Player ID: c5715789-0abe-49c8-819d-bc7fbd0593c1, SubField ID: 0d758b31-12b2-4bea-a1d9-a9b6296aeaf9

--- [Stripe] Bắt đầu test Webhook Idempotency ---
1. Đã tạo Booking PENDING cho Stripe: 8e8d2768-4238-4825-be49-c14b61d1ccf0
2. Gọi handleStripeWebhook lần thứ nhất...
   Webhook received for bookings: 8e8d2768-4238-4825-be49-c14b61d1ccf0
   Bookings paid successfully: cs_test_815ae727e579874d
   Lần 1: Xử lý thành công!
   Trạng thái Booking trong DB: COMPLETED (Kỳ vọng: COMPLETED)
   Bản ghi Payment được tạo: Có (Kỳ vọng: Có)
3. Gọi handleStripeWebhook lần thứ hai (Trùng lặp)...
   Webhook received for bookings: 8e8d2768-4238-4825-be49-c14b61d1ccf0
   Webhook retried for cs_test_815ae727e579874d, skipping
   Lần 2: Xử lý thành công (hoặc bỏ qua không lỗi)!
   Số lượng bản ghi Payment trong DB: 1 (Kỳ vọng: 1)
✅ KẾT QUẢ TEST STRIPE: THÀNH CÔNG (Đảm bảo Idempotency)
4. Đang dọn dẹp dữ liệu test Stripe...

--- [VNPay] Bắt đầu test IPN Webhook Idempotency ---
1. Đã tạo Booking PENDING và Payment PENDING trong DB. TxnRef: VNP_test_7d76b389244d3fae
2. Gọi handleVnpayIpn lần thứ nhất...
   ::: Received VNPAY IPN webhook signature verification request...
   ::: VNPAY IPN: Payment processed successfully: VNP_test_7d76b389244d3fae
   Kết quả lần 1: { RspCode: '00', Message: 'Confirm Success' }
   Trạng thái Booking trong DB: COMPLETED (Kỳ vọng: COMPLETED)
   Trạng thái Payment trong DB: SUCCESS (Kỳ vọng: SUCCESS)
3. Gọi handleVnpayIpn lần thứ hai (Trùng lặp)...
   ::: Received VNPAY IPN webhook signature verification request...
   ::: VNPAY IPN: Order already successfully processed. TxnRef: VNP_test_7d76b389244d3fae
   Kết quả lần 2: { RspCode: '02', Message: 'Order already confirmed' }
✅ KẾT QUẢ TEST VNPAY: THÀNH CÔNG (Đảm bảo Idempotency)
4. Đang dọn dẹp dữ liệu test VNPay...

=== TỔNG KẾT KIỂM THỬ ===
🎉 TẤT CẢ CÁC TEST CASE ĐÃ VƯỢT QUA THÀNH CÔNG!
```

---

## 4. Hướng dẫn chụp ảnh minh chứng cho Slide báo cáo

Để đưa kết quả vào slide báo cáo chứng minh tính đúng đắn của Webhook Idempotency, hãy thực hiện chụp các hình ảnh sau:

### 📸 Hình 1: Kết quả chạy Test tự động từ Terminal
* **Nội dung chụp:** Toàn bộ log chạy lệnh `npx tsx src/tests/payment-idempotency.ts`.
* **Điểm cần khoanh đỏ nhấn mạnh:**
  * Log của **Stripe**: Dòng log `Webhook retried for cs_test_..., skipping` và dòng khẳng định `Số lượng bản ghi Payment trong DB: 1`.
  * Log của **VNPay**: Kết quả lần 1 trả về `{ RspCode: '00', Message: 'Confirm Success' }`, kết quả lần 2 trả về `{ RspCode: '02', Message: 'Order already confirmed' }`.
  * Kết luận cuối cùng: `🎉 TẤT CẢ CÁC TEST CASE ĐÃ VƯỢT QUA THÀNH CÔNG!`.

### 📸 Hình 2: Cơ chế kiểm tra trong Code (Stripe)
* **Nội dung chụp:** Đoạn code kiểm tra trùng lặp trong tệp [payment.service.ts](../apps/backend/src/services/v1/payment.service.ts).
* **Điểm cần khoanh đỏ nhấn mạnh:** 
  * Khối lệnh truy vấn `prisma.payment.findUnique` với `transaction_code`.
  * Khối lệnh `if (existingPayment) { console.log('Webhook retried...', skipping); return; }`.

### 📸 Hình 3: Cơ chế phản hồi lỗi trong Code (VNPay)
* **Nội dung chụp:** Đoạn code kiểm tra trùng lặp IPN trong tệp [payment.service.ts](../apps/backend/src/services/v1/payment.service.ts).
* **Điểm cần khoanh đỏ nhấn mạnh:**
  * Khối lệnh kiểm tra `if (payment.status === PaymentStatus.SUCCESS) { return InpOrderAlreadyConfirmed; }`.
  * Trả về mã lỗi `02` (`InpOrderAlreadyConfirmed` đại diện cho mã phản hồi xác nhận đơn hàng đã được cập nhật trước đó).
