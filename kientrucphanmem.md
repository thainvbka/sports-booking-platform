# PHÂN TÍCH KIẾN TRÚC PHẦN MỀM THỰC TẾ DỰ ÁN SPORTS BOOKING PLATFORM

## 1. Kiến trúc được nhận diện

Hệ thống đặt lịch sân thể thao được thiết kế và phát triển dựa trên **Kiến trúc phân lớp (Layered Architecture)**, cụ thể là biến thể **Kiến trúc ba lớp (3-Tier Architecture) mở rộng** nhằm đảm bảo tính độc lập về chức năng và khả năng bảo trì hệ thống. Ba lớp chính bao gồm:
*   **Tầng trình diễn (Presentation Tier / Client-side):** Ứng dụng trang đơn (Single Page Application) xây dựng trên nền tảng React, đảm nhận nhiệm vụ hiển thị giao diện người dùng và quản lý trạng thái hiển thị cục bộ.
*   **Tầng logic nghiệp vụ (Application/Business Logic Tier / Server-side):** Máy chủ dịch vụ Express.js (Node.js) đóng vai trò trung tâm thực thi toàn bộ các quy tắc nghiệp vụ của hệ thống và xử lý logic tính toán.
*   **Tầng dữ liệu (Data Tier):** Hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL chịu trách nhiệm lưu trữ bền vững, kết hợp cùng Prisma ORM đóng vai trò là cơ chế trừu tượng hóa và truy xuất dữ liệu.

Sự phân tách rõ ràng giữa các tầng này giúp cô lập hoàn toàn logic xử lý giao diện tại trình duyệt của người dùng với các logic xử lý nghiệp vụ phức tạp và lưu trữ dữ liệu tại máy chủ.

## 2. Các bằng chứng trong source code và ánh xạ cụ thể

Sự tồn tại của các thành phần kiến trúc phân lớp này được minh chứng cụ thể qua cấu trúc thư mục và ánh xạ các tệp mã nguồn thực tế trong dự án:

### a. Tầng trình diễn (Presentation Tier - Lớp View)
Đảm nhận chức năng hiển thị giao diện, nhập liệu và xử lý các hành vi tương tác của người chơi, chủ sân và quản trị viên tại máy khách.
*   **Các trang giao diện chính (Pages):** `ComplexesPage.tsx` (trang tìm sân của người chơi), `SubFieldDetailPage.tsx` (trang chi tiết sân con), `BookingHistory.tsx` (lịch sử đặt sân), `OwnerBookingsPage.tsx` (quản lý lịch đặt của chủ sân), `OwnerFieldsPage.tsx` (quản lý cụm sân của chủ sân), `AdminComplexesPage.tsx` (kiểm duyệt sân của admin), `AdminPayoutsPage.tsx` (đối soát tài chính của admin), và `MatchmakingPage.tsx` (ghép kèo thi đấu).
*   **Định tuyến phía khách (Routing):** Nằm tại thư mục `apps/frontend/src/routes/` để chuyển hướng người dùng qua các trang.
*   **Quản lý trạng thái chia sẻ (Zustand Stores):** Tệp `useAuthStore.ts` lưu thông tin phiên đăng nhập của người dùng.
*   **Dịch vụ API phía khách (Service Client):** Thư mục `apps/frontend/src/services/` đóng gói các yêu cầu HTTP gửi đến máy chủ.

### b. Tầng logic nghiệp vụ (Application/Business Logic Tier - Lớp Controller và Service)
Tiếp nhận yêu cầu từ tầng trình diễn, thực thi các quy tắc nghiệp vụ và điều phối kết quả. Lớp này được chia thành hai lớp thành phần tại máy chủ:
*   **Lớp điều phối (Controller Layer):** Chịu trách nhiệm trích xuất dữ liệu yêu cầu HTTP, kiểm định sơ bộ và đóng gói dữ liệu phản hồi dạng JSON. Các lớp điều phối chính bao gồm: `AuthController`, `AccountController`, `BookingController`, `MatchController`, `ComplexController`, `SubFieldController`, `PaymentController`, `PayoutController` và `PricingRuleController`.
*   **Lớp dịch vụ (Service Layer):** Chứa toàn bộ các logic xử lý nghiệp vụ cốt lõi của ứng dụng. Các lớp dịch vụ chính bao gồm: `AuthService`, `AccountService`, `BookingService`, `MatchService`, `ComplexService`, `SubFieldService`, `PaymentService`, `PayoutService`, `PricingRuleService` và `RecommendationService`.

### c. Tầng dữ liệu (Data Tier - Lớp Data Access và Database)
Thực hiện các tương tác đọc và ghi cơ sở dữ liệu bền vững.
*   **Trừu tượng hóa dữ liệu (Prisma ORM):** Lược đồ cơ sở dữ liệu vật lý được khai báo tập trung tại tệp `prisma/schema.prisma` định nghĩa cấu trúc của 19 bảng quan hệ. Khởi tạo Prisma Client để truy vấn dữ liệu an toàn kiểu được thực hiện tại tệp `src/libs/prisma.ts`.
*   **Cơ sở dữ liệu vật lý (PostgreSQL):** Hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL lưu trữ bền vững dữ liệu, hỗ trợ giao dịch toàn vẹn ACID và lưu trữ vector ngữ nghĩa đề xuất qua `pgvector`.

---

## 3. Các điểm điều chỉnh hoặc mở rộng

Để giải quyết các yêu cầu phi chức năng phức tạp như hiệu năng cao, bảo mật, thời gian thực và xử lý đồng thời, dự án đã bổ sung năm thành phần phụ trợ (Auxiliary Layers / Cross-Cutting Concerns) quan trọng so với kiến trúc phân lớp truyền thống:

*   **Validation Layer (Zod):** Sử dụng thư viện **Zod** tại thư mục `apps/backend/src/validations/` (như `booking.schema.ts`, `match.schema.ts`) để định nghĩa cấu trúc dữ liệu yêu cầu HTTP, ngăn chặn dữ liệu không hợp lệ đi sâu vào hệ thống.
*   **Middleware Layer:** Thực hiện kiểm tra mã JWT xác thực người dùng và phân quyền truy cập theo vai trò (RBAC) tại thư mục `apps/backend/src/middlewares/` (như `auth.middleware.ts`, `error.middleware.ts`).
*   **Cache & Locking Layer (Redis):** Sử dụng cơ sở dữ liệu in-memory **Redis** tại tệp `apps/backend/src/libs/redis.ts` để lưu trữ bộ đệm danh sách sân trống và thiết lập khóa phân tán (Distributed Lock) ngăn ngừa hiện tượng đặt trùng sân (Double-booking) trong `booking.service.ts`.
*   **Real-time Socket Layer (WebSockets):** Thiết lập kết nối hai chiều song song qua **Socket.io** tại tệp `apps/backend/src/libs/socket.ts` để truyền thông báo thời gian thực ngay khi có sự kiện.
*   **Third-party Integrations:** Chuẩn hóa giao tiếp API bên ngoài tại thư mục `apps/backend/src/libs/` gồm cổng thanh toán Stripe (`stripe.ts`), VNPay (`vnpay.ts`), đám mây tối ưu ảnh Cloudinary (`cloudinary.ts`) và Gemini AI (`gemini.ts`) để xếp hạng lại danh sách gợi ý sân đấu.
