# Giải pháp kỹ thuật cho định hướng tương lai

Tài liệu này trình bày các giải pháp kiến trúc và thuật toán chi tiết cho 3 định hướng phát triển của hệ thống Sports Booking Platform:
1. **Xử lý hoàn tiền & Tích hợp thêm cổng thanh toán nội địa (Momo, VNPay)**
2. **Nâng cao khả năng chịu tải và khả năng mở rộng (Scalability & Load Capacity)**
3. **Phát triển tính năng ghép kèo theo điểm xếp hạng (Skill-based Matchmaking)**

---

## 1. Xử lý hoàn tiền & Tích hợp thêm cổng thanh toán nội địa

### 1.1. Kiến trúc Tích hợp Cổng thanh toán (Strategy Pattern)
Để dễ dàng mở rộng và bảo trì khi thêm nhiều cổng thanh toán (Stripe, VNPay, Momo, ShopeePay), chúng ta áp dụng **Strategy Pattern**:

```
 ┌───────────────────┐
 │  PaymentContext   │
 └─────────┬─────────┘
           │
           ▼
 ┌───────────────────┐
 │  PaymentStrategy  │◄──────────────────────────────┐
 └─┬───────────────┬─┘                               │
   │               │                                 │
   ▼               ▼                                 ▼
┌──────────────┐┌──────────────┐             ┌──────────────┐
│StripeStrategy││VnpayStrategy │             │ MomoStrategy │
└──────────────┘└──────────────┘             └──────────────┘
```

*   **Interface `PaymentStrategy`**:
    ```typescript
    interface PaymentStrategy {
      createCheckoutUrl(params: {
        paymentId: string;
        amount: number;
        description: string;
        returnUrl: string;
        ipAddress: string;
      }): Promise<string>;

      handleWebhook(payload: any): Promise<{
        success: boolean;
        transactionCode: string;
        rawResponse: any;
      }>;

      refund(params: {
        transactionCode: string;
        amount: number;
        reason: string;
      }): Promise<{
        success: boolean;
        refundRef: string;
      }>;
    }
    ```

*   **Payment Registry / Factory**: Đăng ký các strategy tương ứng. Khi người dùng chọn phương thức thanh toán, `PaymentContext` sẽ gọi strategy tương ứng mà không làm thay đổi logic nghiệp vụ đặt sân.

### 1.2. Giải pháp Xử lý hoàn tiền (Refund Flow)
Việc hoàn tiền có hai luồng chính tùy thuộc vào cơ chế của từng cổng:

1.  **Hoàn tiền tự động qua API (Stripe, Momo/VNPay Business):**
    *   Khi người dùng hủy đặt sân hợp lệ (trước giờ thi đấu X tiếng):
        *   Hệ thống gọi API `refund` của cổng tương ứng.
        *   Sử dụng **Idempotency Key** dạng `refund:booking_id` để tránh việc hoàn tiền trùng lặp khi người dùng click nhiều lần hoặc do lỗi retry mạng.
        *   Cập nhật trạng thái `Payment` thành `REFUNDED` và `Booking` thành `CANCELED`.
2.  **Khấu trừ công nợ đối với Payout thủ công (Áp dụng cho cổng thu hộ nội địa):**
    *   Tiền thanh toán của người dùng hiện đang nằm trong tài khoản Platform (Admin), và đã ghi nhận công nợ `OwnerPayout` (90% cho chủ sân).
    *   **Nếu đợt quyết toán của chủ sân chưa thanh toán (`PENDING`/`REQUESTED`):**
        *   Admin duyệt hủy đặt sân -> Cập nhật trạng thái `OwnerPayout` của giao dịch đó thành `CANCELLED`.
        *   Hệ thống tự động thực hiện lệnh hoàn tiền cho người dùng (hoặc tích lũy vào ví điểm/số dư ví của Player).
    *   **Nếu đợt quyết toán của chủ sân đã thanh toán (`PAID`):**
        *   Hệ thống tạo một bản ghi `OwnerPayout` mới với số tiền âm (ví dụ: `-180,000 VND`) và lý do `"Khấu trừ hoàn tiền Booking #ID"`.
        *   Số tiền âm này sẽ tự động được trừ vào tổng số dư khả dụng (`availableBalance`) trong đợt rút tiền kế tiếp của chủ sân.

---

## 2. Nâng cao khả năng chịu tải và khả năng mở rộng

### 2.1. Giải pháp chống trùng lịch đặt sân (Race Condition) ở quy mô lớn
Khi hàng nghìn người cùng tranh chấp đặt một sân con vào cùng một khung giờ hot, việc lock ở tầng Database (`SELECT FOR UPDATE`) có thể gây nghẽn cổ chai (DB Bottleneck). Giải pháp là dịch chuyển việc kiểm tra và khóa lên tầng Memory sử dụng **Redis Distributed Lock (Redlock)** hoặc **BullMQ Queue**.

#### Giải pháp 1: Redis Distributed Lock (Khóa phân tán)
*   **Cơ chế**: Trước khi tạo đặt sân, Server tạo một lock key trong Redis có dạng:
    `lock:subfield:{sub_field_id}:slot:{date}:{start_time}`
*   **Các bước thực hiện**:
    1.  Client gửi yêu cầu đặt sân.
    2.  Server cố gắng ghi key trên Redis với thuộc tính `NX` (chỉ ghi nếu chưa tồn tại) và `PX` (thời gian hết hạn, ví dụ: 5000ms).
    3.  Nếu **thành công**: Tiến hành kiểm tra Database xem sân đó đã có ai đặt chưa. Nếu chưa, tạo bản ghi `Booking` với trạng thái `PENDING`, thiết lập thời gian hết hạn (`expires_at` sau 10-15 phút để chờ thanh toán) rồi giải phóng lock.
    4.  Nếu **thất bại**: Trả về lỗi ngay lập tức `"Khung giờ này đang có người thao tác, vui lòng thử lại sau"`.

#### Giải pháp 2: Asynchronous Booking Queue (Hàng đợi bất đồng bộ)
Đối với các sự kiện săn khuyến mãi sân lớn:
1.  Client gửi yêu cầu đặt sân -> Đẩy yêu cầu vào hàng đợi **BullMQ** (Redis backend).
2.  Server trả về mã hàng đợi và trạng thái `"Đang xử lý"` ngay lập tức cho client.
3.  Worker lấy yêu cầu từ hàng đợi và xử lý tuần tự (FIFO) cho từng sân. Điều này giúp loại bỏ hoàn toàn khả năng trùng lịch và giảm tải đột biến (spike) cho cơ sở dữ liệu.
4.  Khi Worker xử lý xong, thông báo kết quả (Đặt sân thành công/Thất bại) cho client qua **WebSockets** hoặc cập nhật trạng thái trên màn hình chờ của client thông qua Polling.

### 2.2. Kiến trúc mở rộng hệ thống (Scalability)
1.  **Read/Write Splitting (Tách biệt Đọc/Ghi dữ liệu):**
    *   **Primary Database (PostgreSQL)**: Chỉ nhận các tác vụ ghi (Tạo booking, cập nhật trạng thái thanh toán, cập nhật thông tin).
    *   **Replica Databases**: Nhận các tác vụ đọc (Tìm kiếm sân trống, xem danh sách sân, xem thông tin khuyến mãi). Prisma hỗ trợ cấu hình nhiều connection strings cho các tác vụ đọc/ghi.
2.  **Bộ nhớ đệm (Caching Strategy):**
    *   Cache các dữ liệu ít thay đổi hoặc tần suất đọc cực cao: Danh sách sân của khu phức hợp, Bảng giá cấu hình tĩnh, Đánh giá trung bình.
    *   Sử dụng cơ chế **Cache Eviction** (Xóa cache khi có cập nhật bảng giá hoặc xóa sân) hoặc **Time-to-Live (TTL)** ngắn cho danh sách sân trống.
3.  **Database Partitioning (Phân vùng dữ liệu):**
    *   Phân vùng bảng `Booking` theo thời gian (ví dụ: theo tháng hoặc theo năm) khi số lượng bản ghi đạt hàng triệu dòng, giúp tăng tốc truy vấn lịch sử đặt sân của người dùng và các tác vụ đối soát cuối tháng.

---

## 3. Tính năng ghép kèo theo điểm xếp hạng (Matchmaking System)

Để xây dựng tính năng ghép kèo (Matchmaking) công bằng, tương tự như các game thể thao điện tử, hệ thống cần hai thành phần: **Cách tính điểm xếp hạng (Skill Rating)** và **Thuật toán ghép cặp (Matchmaking Algorithm)**.

### 3.1. Hệ thống Điểm xếp hạng (Elo Rating)
Hệ thống sẽ duy trì điểm Elo riêng cho từng người chơi đối với từng môn thể thao (`SportType`):

$$\text{Rating}_{\text{new}} = \text{Rating}_{\text{old}} + K \times (S - E)$$

Trong đó:
*   $K$: Hệ số phát triển (thường chọn $K = 32$).
*   $S$: Kết quả thực tế (1: Thắng, 0.5: Hòa, 0: Thua).
*   $E$: Xác suất thắng kỳ vọng của người chơi dựa trên sự chênh lệch điểm với đối thủ:
    $$E = \frac{1}{1 + 10^{(\text{Rating}_{\text{opponent}} - \text{Rating}_{\text{player}}) / 400}}$$

*   **Xác nhận kết quả trận đấu (Peer Review & Verification):**
    *   Sau khi trận đấu kết thúc, cả hai đội/người chơi tham gia xác nhận kết quả (Thắng/Thua/Tỷ số).
    *   Nếu có sự đồng thuận từ cả 2 bên -> Hệ thống tự động cập nhật điểm Elo.
    *   Nếu có tranh chấp (một bên báo thắng, một bên báo thua) -> Trận đấu chuyển sang trạng thái tranh chấp để Admin kiểm tra hoặc áp dụng cơ chế chấm điểm trung bình dựa trên đánh giá của các thành viên khác tham gia trận đấu.

### 3.2. Thuật toán ghép kèo tự động (Matchmaking Queue)

Sử dụng cơ chế hàng đợi tìm trận dựa trên **Redis Sorted Sets (ZSET)** để đảm bảo tốc độ xử lý nhanh.

#### Luồng hoạt động:
1.  **Người chơi tham gia hàng đợi:**
    *   Người chơi chọn "Tìm kèo nhanh" với các điều kiện lọc: Môn thể thao, Khu vực (Tọa độ GPS + Bán kính Y km), Khung giờ mong muốn.
    *   Hệ thống đẩy người chơi vào một Redis Queue phân loại theo `Môn_thể_thao` + `Khu_vực`. Điểm score trong Sorted Set chính là thời điểm bắt đầu tìm trận (`timestamp`).
2.  **Worker chạy định kỳ (Matchmaking Loop):**
    *   Cứ mỗi 5-10 giây, một Worker sẽ quét danh sách người chơi trong hàng đợi.
    *   **Nguyên tắc ghép cặp mở rộng (Expanding Search Window):**
        *   **Giai đoạn 1 (0 - 15 giây đầu)**: Chỉ tìm những người chơi có mức chênh lệch Elo cực nhỏ ($\Delta \text{Elo} \le 50$) và khoảng cách địa lý ngắn ($< 3\text{ km}$).
        *   **Giai đoạn 2 (15 - 45 giây)**: Nếu chưa tìm được kèo, nới rộng phạm vi tìm kiếm ($\Delta \text{Elo} \le 150$ và khoảng cách $< 5\text{ km}$).
        *   **Giai đoạn 3 (Sau 45 giây)**: Mở rộng tối đa mức chênh lệch ($\Delta \text{Elo} \le 300$ và khoảng cách $< 10\text{ km}$) để đảm bảo người chơi tìm được trận đấu.
3.  **Khởi tạo trận đấu (Match Creation):**
    *   Khi tìm đủ số lượng người chơi tương thích (ví dụ: đủ 10 người cho kèo bóng đá 5-5):
        *   Hệ thống tự động chọn một sân trống phù hợp nằm ở khu vực trung gian của các người chơi, tạo một `Booking` tạm thời (`status: PENDING`, giữ sân trong vòng 5 phút).
        *   Gửi thông báo Real-time (qua WebSockets) yêu cầu tất cả người chơi xác nhận tham gia và thanh toán phần tiền chia đều (split-payment) trong 5 phút.
        *   Nếu tất cả xác nhận -> Chuyển trạng thái `Booking` sang thành công, bắt đầu trận đấu. Nếu có người từ chối hoặc quá giờ không xác nhận -> Trả những người còn lại về đầu hàng đợi với độ ưu tiên cao, phạt người không xác nhận (ví dụ: cấm tìm trận trong 15 phút).
