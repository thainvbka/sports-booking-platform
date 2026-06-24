# Báo cáo Phân tích Luồng Dữ liệu (Data Flow Analysis) — Nghiệp vụ Thanh toán & Quản lý Dòng tiền (Payment & Payout)

Báo cáo này được thực hiện dựa trên hướng dẫn của skill **Data Flow Checker**, phân tích luồng di chuyển, biến đổi và tính nhất quán của dữ liệu liên quan đến nghiệp vụ Thanh toán đặt sân qua cổng Stripe, VNPAY và đối soát dòng tiền cho chủ sân (Owner Payout) xuyên suốt từ lớp cơ sở dữ liệu lên đến giao diện người dùng.

---

## 1. Các lớp được phân tích (Layers Analyzed)

Báo cáo phân tích đầy đủ các tệp nguồn sau:
*   **Database (Prisma Schema)**: `apps/backend/prisma/schema.prisma` (Models: `Payment`, `OwnerPayout`, `PayoutBatch`, `Booking`).
*   **Backend Router & Controllers**: 
    *   `apps/backend/src/routes/v1/payment.routes.ts`
    *   `apps/backend/src/controllers/v1/payment.controller.ts`
    *   `apps/backend/src/controllers/v1/admin.controller.ts`
*   **Backend Service Layer**: 
    *   `apps/backend/src/services/v1/payment.service.ts`
    *   `apps/backend/src/services/v1/admin.service.ts` (Hàm `getPayments`)
    *   `apps/backend/src/services/v1/cron.service.ts` (Dọn dẹp booking hết hạn thanh toán)
*   **Frontend Type Definitions**: `apps/frontend/src/types/admin.types.ts` (Interfaces: `AdminPayment`, `LinkedBooking`).
*   **Frontend API Client & State Store**:
    *   `apps/frontend/src/services/booking.service.ts`
    *   `apps/frontend/src/store/admin/useAdminPaymentStore.ts`
*   **Frontend Hooks & Pages**:
    *   *Hooks*: `usePaymentFlow.ts`, `useAdminPaymentsData.ts`, `usePaymentColumns.tsx`
    *   *Pages*: `PaymentSuccessPage.tsx`, `PaymentFailedPage.tsx`, `AdminPaymentsPage.tsx`
    *   *Components*: `PaymentDetailDialog.tsx`, `LinkedBookingsList.tsx`

---

## 2. Khái quát Luồng Dữ liệu (Pipeline Summary)

Hệ thống hỗ trợ 2 phương thức thanh toán chính: **Stripe (Connect)** và **VNPAY**. Hai phương thức này có thiết kế luồng dữ liệu khác biệt về cả khởi tạo trạng thái lẫn xử lý dòng tiền của chủ sân:

```
[STRIPE FLOW]
1. POST /payments/checkout-session -> Tạo Stripe Checkout Url (Booking expires_at gia hạn +30 phút)
2. Redirect đến Stripe Gateway
3. Webhook (checkout.session.completed) -> Tạo Payment (SUCCESS) -> Booking COMPLETED -> Auto-routed via Connect

[VNPAY FLOW]
1. POST /payments/vnpay/checkout-session -> Tạo Payment (FAILED) & VNPAY URL (Booking expires_at gia hạn +30 phút)
2. Redirect đến VNPAY Gateway
3. Webhook/IPN (/payments/vnpay/ipn) -> Cập nhật Payment (SUCCESS) -> Booking COMPLETED -> Tạo OwnerPayout (PENDING)
```

1.  **Khởi tạo Phiên Thanh toán (Checkout Session Creation)**:
    *   Người chơi chọn một hoặc nhiều booking ở trạng thái `PENDING` và nhấn Thanh toán.
    *   Hệ thống gọi API tạo session (`/checkout-session` cho Stripe hoặc `/vnpay/checkout-session` cho VNPAY).
    *   Để đảm bảo sân không bị hủy giữa chừng khi khách hàng đang nhập thông tin thẻ, hệ thống tự động cộng thêm **30 phút** (`BOOKING_TIMEOUT.PAYMENT`) vào trường `expires_at` của các booking liên quan.
2.  **Xác thực và Cập nhật Kết quả (Webhook & IPN Webhook)**:
    *   **Stripe**: Khi thanh toán thành công, Stripe gửi sự kiện `checkout.session.completed` về webhook backend. Backend tạo bản ghi `Payment` với trạng thái `SUCCESS` và đổi trạng thái các booking liên quan thành `COMPLETED`, đồng thời cập nhật `paid_at`.
    *   **VNPAY**: Backend tạo bản ghi `Payment` với trạng thái `FAILED` ngay khi người chơi bấm nút (làm chỗ chờ). Khi thanh toán xong, VNPAY redirect khách hàng về `/bookings/success` kèm mã chữ ký số. Frontend gọi API `/payments/vnpay/ipn` gửi kèm query để backend xác thực chữ ký. Đồng thời, VNPAY cũng gửi một request IPN trực tiếp từ server tới server vào cùng endpoint này để đảm bảo dữ liệu không bị thất thoát nếu người dùng tắt trình duyệt.
3.  **Hoàn trả Thời gian Khóa Sân khi Thất bại (Timeout Rollback)**:
    *   Nếu thanh toán thất bại hoặc người chơi chủ động hủy, frontend gọi `/stripe/cancel-checkout`. Backend sẽ tính toán thời gian còn lại gốc (ban đầu là 5 phút) để rút ngắn `expires_at` trở lại nhằm giải phóng sân sớm cho người khác thuê, kèm grace period tối thiểu là 1 phút (`BOOKING_TIMEOUT.MIN_GRACE_PERIOD`).
    *   Nếu người chơi đóng trình duyệt, Cron job của hệ thống quét mỗi phút và tự động hủy các booking quá hạn. Ngoài ra, khi người chơi quay lại app, frontend sẽ kiểm tra `sessionStorage` xem có giao dịch dang dở không và gửi lệnh hủy để giải phóng sân ngay lập tức (`recoverPendingCheckout`).
4.  **Duyệt và Chia sẻ Doanh thu (Owner Payout)**:
    *   **Stripe**: Sử dụng mô hình **Stripe Connect**. Tiền được tự động chia trực tiếp: chuyển vào tài khoản Connect của chủ sân sau khi đã trừ đi 10% phí nền tảng (`platformFee`). Do đó, không cần đối soát thủ công trên DB.
    *   **VNPAY**: Toàn bộ dòng tiền chảy vào tài khoản ngân hàng của nền tảng. Khi giao dịch thành công, backend tạo một bản ghi nợ `OwnerPayout` với trạng thái `PENDING` trị giá 90% số tiền đặt sân. Admin hệ thống sẽ duyệt thủ công để chuyển khoản cho chủ sân sau đó.

---

## 3. Các vấn đề phát hiện (Issues Found)

### 🔴 [CRITICAL / WARNING] Bất nhất dữ liệu nghiêm trọng trong khởi tạo trạng thái VNPay khiến sai lệch thống kê Admin
*   **Lớp ảnh hưởng**: Backend Service (`payment.service.ts` L666) & Admin Dashboard Stats (`admin.service.ts` L1005)
*   **Mô tả**:
    Khi người chơi tạo phiên thanh toán VNPay, hệ thống lập tức chèn bản ghi vào bảng `Payment` với trạng thái mặc định là `FAILED`:
    ```typescript
    const newPayment = await tx.payment.create({
      data: {
        amount: expectedAmount,
        provider: PaymentProvider.VNPAY,
        transaction_code: transactionCode,
        status: PaymentStatus.FAILED,
      },
    });
    ```
    *   **Semantic Error**: Mặc dù giao dịch mới bắt đầu và đang chờ người dùng nhập mã OTP/ATM tại cổng VNPay (tức trạng thái đúng phải là `PENDING`), hệ thống lại đánh dấu là `FAILED`.
    *   **Lệch dữ liệu Stripe vs VNPay**: Stripe chỉ tạo bản ghi `Payment` khi đã nhận được webhook thành công (`SUCCESS`). Điều này có nghĩa là mọi giao dịch Stripe bị bỏ dở hoặc lỗi sẽ không bao giờ xuất hiện trong DB. Ngược lại, mọi giao dịch VNPay dù chỉ mới bấm vào xem (chưa trả tiền) đều được ghi nhận là `FAILED`.
    *   **Hậu quả**: Số liệu "Giao dịch lỗi" (`failedCount`) trên màn hình quản trị Admin bị phóng đại và sai lệch hoàn toàn. Mọi lượt bấm thanh toán VNPay rồi tắt tab của khách đều bị tính là lỗi hệ thống, gây khó khăn cho việc đối soát và phân tích tỷ lệ chuyển đổi.
*   **Cách khắc phục**:
    Đổi trạng thái khởi tạo mặc định của Payment VNPay thành `PENDING`. Khi Cron job quét dọn dẹp các booking quá hạn hoặc khi nhận được callback báo lỗi/hủy từ VNPay, lúc đó mới cập nhật trạng thái `Payment` thành `FAILED`.

---

### 🟡 [WARNING] Lãng phí truy vấn DB do hủy bỏ giá trị trả về của `Promise.all` trong `admin.service.ts`
*   **Lớp ảnh hưởng**: Backend Service (`admin.service.ts` L953 & L990)
*   **Mô tả**:
    Trong hàm `getPayments` lấy danh sách thanh toán của trang Admin, mã nguồn sử dụng `Promise.all` để chạy đồng thời 4 truy vấn DB. Tuy nhiên, ở phần khai báo destructuring đầu ra, lập trình viên chỉ gán cho 3 biến đầu tiên và bỏ quên phần tử thứ 4:
    ```typescript
    const [payments, total, paymentStats] = await Promise.all([
      prisma.payment.findMany(...),
      prisma.payment.count(...),
      prisma.payment.aggregate(...),
      prisma.payment.groupBy({ by: ["status"], _count: { id: true } }), // Bị bỏ qua
    ]);
    ```
    Do giá trị của câu lệnh `groupBy` thứ tư bị vứt bỏ, ngay bên dưới hàm lại phải thực thi đồng bộ thêm một câu lệnh tương tự:
    ```typescript
    const statusCounts = await prisma.payment.groupBy({
      by: ["status"],
      _count: { id: true },
    });
    ```
    *   **Hậu quả**: Gây lãng phí hiệu năng hệ thống khi chạy truy vấn gom nhóm (`groupBy`) hai lần liên tiếp cho mỗi lượt tải trang quản lý thanh toán của Admin.
*   **Cách khắc phục**:
    Khai báo thêm biến nhận kết quả thứ tư trực tiếp trong mảng destructuring của `Promise.all` và xóa bỏ câu lệnh gọi đơn lẻ phía dưới:
    ```typescript
    const [payments, total, paymentStats, statusCounts] = await Promise.all([
      prisma.payment.findMany(...),
      prisma.payment.count(...),
      prisma.payment.aggregate(...),
      prisma.payment.groupBy({ by: ["status"], _count: { id: true } }),
    ]);
    ```

---

### 🟡 [WARNING] Các thẻ thống kê doanh thu Admin không thay đổi linh hoạt theo bộ lọc tìm kiếm
*   **Lớp ảnh hưởng**: Backend Service (`admin.service.ts` L979-986)
*   **Mô tả**:
    Hàm `getPayments` hỗ trợ các bộ lọc `search` (tìm theo tên khách, email, mã giao dịch) và `status` (trạng thái thanh toán) được định nghĩa trong đối tượng `where`.
    *   Tuy nhiên, các câu lệnh tính toán tổng doanh thu (`paymentStats`) và đếm số lượng trạng thái (`statusCounts`) hoàn toàn bỏ qua đối tượng `where` này mà chỉ truy vấn tĩnh trên toàn bộ database.
    *   **Hậu quả**: Khi Admin gõ tìm kiếm một khách hàng cụ thể hoặc lọc theo một tiêu chí nào đó, danh sách bảng bên dưới thay đổi tương ứng, nhưng 4 ô thống kê phía trên (Tổng doanh thu, Thành công, Thất bại, Hoàn tiền) vẫn đứng im hiển thị số tổng của toàn hệ thống, tạo cảm giác dữ liệu bất đồng bộ.
*   **Cách khắc phục**:
    Truyền đối tượng `where` vào các truy vấn aggregate và groupBy của `Promise.all` (riêng truy vấn gom nhóm trạng thái cần loại bỏ thuộc tính `status` ra khỏi `where` để đếm đầy đủ các trạng thái của tập kết quả tìm kiếm).

---

### 🔵 [INFO] Cứng hóa tỷ lệ phí dịch vụ nền tảng (Platform Fee)
*   **Lớp ảnh hưởng**: Backend Service (`payment.service.ts` L363 & L798)
*   **Mô tả**:
    Phí dịch vụ thu từ chủ sân hiện đang được tính cứng trực tiếp bằng code nhân với tỉ lệ `0.1` (10% tổng hóa đơn) ở cả hai nơi tạo checkout session của Stripe và xử lý IPN của VNPay.
    *   **Hậu quả**: Nếu sau này nền tảng muốn thay đổi chiến lược kinh doanh (ví dụ tăng phí lên 12% hoặc giảm xuống 5% để thu hút chủ sân), nhà phát triển bắt buộc phải sửa đổi mã nguồn ở nhiều nơi và deploy lại backend, tăng rủi ro sai lệch số tiền.
*   **Cách khắc phục**:
    Định nghĩa tỉ lệ phí dịch vụ trong tệp cấu hình hệ thống hoặc biến môi trường `process.env.PLATFORM_FEE_RATE` (mặc định là `0.1`) và gọi biến này khi tính toán platform fee.

---

### 🔵 [INFO] Sự phân tách cơ chế chi trả doanh thu cho chủ sân
*   **Lớp ảnh hưởng**: Kiến trúc Dòng tiền (Architecture)
*   **Mô tả**:
    Dữ liệu ghi nhận doanh thu nợ (`OwnerPayout`) chỉ được tạo ra khi thanh toán qua cổng VNPay. Khi thanh toán qua Stripe, nhờ tính năng Connect Direct Charges, tiền đã được phân chia tự động ngay trên gateway và chuyển thẳng vào tài khoản ngân hàng của chủ sân.
    *   Do đó, bảng `OwnerPayout` chỉ phản ánh dòng tiền VNPay. Đây là một quyết định thiết kế hợp lý tránh trùng lặp đối soát, nhưng cần được ghi chú kỹ trong tài liệu vận hành cho đội ngũ tài chính của Admin.

---

## 4. Bảng Theo dõi Trường Dữ liệu (Fields Trace Summary)

| Trường dữ liệu | Prisma (DB) | Service (BE) | Controller | Frontend Type | Component / Hook | Trạng thái (Status) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `id` | `Uuid` | ✅ | ✅ | `string` | ✅ | OK |
| `amount` | `Decimal` | ✅ | ✅ | `string \| number` | ✅ `formatPrice` | OK (Chuyển đổi kiểu phù hợp) |
| `provider` | `Enum` | ✅ | ✅ | `string` | ✅ Render logo | OK |
| `transaction_code`| `String` (Unique)| ✅ | ✅ | `string` | ✅ Render mã giao dịch | OK |
| `status` | `Enum` | ✅ | ✅ | `string` | 🔴 Lệch thống kê | ⚠️ Cần khởi tạo VNPay PENDING |
| `platform_fee` | `Decimal` | ✅ | ✅ | N/A (Chỉ BE/Admin)| N/A | 🔵 Phí cứng 10% |
| `payout_amount` | `Decimal` | ✅ | ✅ | N/A (Chỉ BE/Admin)| N/A | OK |

---

## 5. Khuyến nghị và Giải pháp (Recommendations)

1.  **Đồng nhất Trạng thái Khởi tạo VNPay (Ưu tiên 1 - Thực hiện ngay)**:
    Sửa đổi giá trị `status` khi tạo Payment VNPay tại `createVnpayCheckoutSession` từ `PaymentStatus.FAILED` thành `PaymentStatus.PENDING`. Cập nhật logic reset timeout hoặc IPN để chuyển về `FAILED` khi hết hạn hoặc thất bại.
2.  **Tối ưu hóa Truy vấn `Promise.all` (Ưu tiên 2)**:
    Sửa đổi destructuring trong hàm `getPayments` của `admin.service.ts` để hứng kết quả của truy vấn `groupBy` thứ tư, đồng thời xóa bỏ câu lệnh query dư thừa ngay phía dưới nhằm tăng tốc độ tải trang.
3.  **Áp dụng Bộ lọc Tìm kiếm cho Thẻ Thống kê (Ưu tiên 3)**:
    Truyền đối tượng `where` vào các truy vấn `aggregate` và `groupBy` phục vụ tính toán KPI trên trang Admin thanh toán để số liệu hiển thị khớp với tập kết quả tìm kiếm.
4.  **Cấu hình hóa Tỷ lệ Phí Dịch vụ (Platform Fee) (Ưu tiên 4)**:
    Đưa tỉ lệ 10% ra biến môi trường hoặc cấu hình hệ thống để dễ dàng thay đổi mà không cần can thiệp code logic.
