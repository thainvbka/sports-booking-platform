# Báo cáo Phân tích Luồng Dữ liệu (Data Flow Analysis) — Nghiệp vụ Đặt Lịch Sân (Court Booking)

Báo cáo này được thực hiện dựa trên hướng dẫn của skill **Data Flow Checker**, phân tích luồng di chuyển, biến đổi và tính nhất quán của dữ liệu đặt lịch sân (gồm cả đặt lịch đơn lẻ - Single Booking và đặt lịch định kỳ - Recurring Booking) qua toàn bộ hệ thống từ cơ sở dữ liệu lên đến giao diện người dùng.

---

# Báo cáo Phân tích Luồng Dữ liệu (Data Flow Analysis) — Nghiệp vụ Đặt Lịch Sân (Court Booking)

Báo cáo này được thực hiện dựa trên hướng dẫn của skill **Data Flow Checker**, phân tích luồng di chuyển, biến đổi và tính nhất quán của dữ liệu đặt lịch sân (gồm cả đặt lịch đơn lẻ - Single Booking và đặt lịch định kỳ - Recurring Booking) qua toàn bộ hệ thống từ cơ sở dữ liệu lên đến giao diện người dùng.

---

## 1. Các lớp được phân tích (Layers Analyzed)

Báo cáo phân tích đầy đủ các tệp nguồn sau:
*   **Database (Prisma Schema)**: `apps/backend/prisma/schema.prisma` (Models: `Booking`, `RecurringBooking`, `BookingAddon`, `Payment`).
*   **Backend Validation (Zod Schemas)**: `apps/backend/src/validations/booking.schema.ts`, `apps/backend/src/validations/recurring_booking.schema.ts`.
*   **Backend Service Layer**: `apps/backend/src/services/v1/booking.service.ts`, `apps/backend/src/services/v1/recurring_booking.service.ts`.
*   **Backend Controller Layer**: `apps/backend/src/controllers/v1/booking.controller.ts`, `apps/backend/src/controllers/v1/admin.controller.ts`.
*   **Frontend Type Definitions**: `apps/frontend/src/types/booking.types.ts`, `apps/frontend/src/types/index.ts`.
*   **Frontend API Client**: `apps/frontend/src/services/booking.service.ts`, `apps/frontend/src/services/admin.service.ts`.
*   **Frontend State Stores (Zustand)**: `apps/frontend/src/store/owner/useBookingStore.ts`, `apps/frontend/src/store/admin/useAdminBookingStore.ts`.
*   **Frontend Player Hooks**:
    *   `apps/frontend/src/hooks/player/useBookingActions.ts` (Quản lý hủy, đánh giá và match tạo mới)
    *   `apps/frontend/src/hooks/player/useBookingAddons.ts` (Quản lý số lượng và payload add-ons)
    *   `apps/frontend/src/hooks/player/useBookings.ts` (Quản lý danh sách, phân trang và cập nhật trạng thái đặt sân của player)
    *   `apps/frontend/src/hooks/player/useBookingSubmit.ts` (Xử lý submit payload đặt sân đơn/định kỳ)
    *   `apps/frontend/src/hooks/player/useBookingTimePricing.ts` (Xử lý luật giá và giờ đặt sân động)
    *   `apps/frontend/src/hooks/player/useBookingWizard.ts` (Quản lý các bước Stepper của form đặt sân)
*   **Frontend Components & Pages**:
    *   *Pages*: `BookingPage.tsx`, `BookingReviewPage.tsx`, `RecurringBookingReviewPage.tsx` (Player pages), `OwnerBookingsPage.tsx` (Owner page), `AdminBookingsPage.tsx` (Admin page).
    *   *Components*: `BookingDetailDialog.tsx` (Shared component), `useBookingColumns.tsx`, `useOwnerBookings.ts` (Owner hooks).

---

## 2. Khái quát Luồng Dữ liệu (Pipeline Summary)

Nghiệp vụ đặt lịch sân được chia làm hai luồng chính:

### Luồng Đặt Lịch Đơn Lẻ (Single Booking)
1.  **Frontend (Wizard & Setup)**: Player chọn ngày, giờ bắt đầu/kết thúc và các dịch vụ đi kèm (Add-ons) trong `BookingPage.tsx` thông qua sự hỗ trợ của các hook `useBookingTimePricing` (tính giá sân tạm tính), `useBookingAddons` (tính giá trị phụ kiện), và `useBookingWizard` (quản lý bước). Dữ liệu được đóng gói thành định dạng `CreateBookingData`.
2.  **API Call & Validation**: Gọi `POST /bookings/:subfieldId` thông qua hook `useBookingSubmit`. Đầu vào được kiểm thực bởi Zod Schema (`createBookingSchema`), kiểm tra các quy tắc múi giờ Việt Nam, mốc 30 phút và độ dài đặt sân.
3.  **Backend Service (Business Logic)**:
    *   Dữ liệu giờ Việt Nam được đồng bộ hóa múi giờ bằng `toZonedTime` và `fromZonedTime`.
    *   Áp dụng Redis Distributed Lock trên sân (`lock:booking:subfield:${sub_field_id}`) để tránh ghi đè đồng thời.
    *   Khởi chạy database transaction (`FOR UPDATE` trên SubField) để khóa dòng dữ liệu, kiểm tra xung đột trùng lịch (overlap).
    *   Tính toán giá tiền sân dựa trên các cấu hình giá động (`PricingRule`), trừ lượng hàng trong kho của các Add-ons, rồi tạo bản ghi `Booking` (status: `PENDING`) và các bản ghi `BookingAddon`.
4.  **Checkout & Review**: Phản hồi từ backend trả về thông tin booking vừa tạo. Frontend chuyển hướng đến trang xem lại `/booking-review/:id`. Trang này tải chi tiết thanh toán từ `GET /bookings/review/:id` để hiển thị trước khi thanh toán.
5.  **Payment & Confirm**: Người dùng tiến hành thanh toán qua Stripe hoặc VNPay. Khi thanh toán thành công, trạng thái booking được chuyển sang `COMPLETED` (chờ duyệt) và sau đó chủ sân duyệt sẽ chuyển sang `CONFIRMED`.

### Luồng Đặt Lịch Định Kỳ (Recurring Booking)
1.  **Frontend**: Player điền ngày bắt đầu/kết thúc và chu kỳ (`WEEKLY` hoặc `MONTHLY`) thông qua Form lựa chọn trên UI.
2.  **API Call**: Gọi `POST /bookings/recurring/:subfieldId` qua hook `useBookingSubmit`. Dữ liệu được kiểm tra qua `createRecurringBookingSchema` (không được phép chọn Add-ons tại bước này).
3.  **Backend Service**:
    *   Áp dụng thuật toán tạo danh sách lịch (slots) trong khoảng thời gian áp dụng.
    *   Sử dụng Distributed Lock và Transaction để phòng tránh trùng lịch với bất kỳ lịch đơn lẻ hoặc định kỳ nào khác.
    *   Tạo bản ghi `RecurringBooking` cha và tạo hàng loạt (batch insert) các bản ghi `Booking` con tương ứng với mỗi slot (đều ở trạng thái `PENDING` liên kết qua `recurring_booking_id`).
4.  **Review & Checkout**: Player xem lại danh sách tất cả các slot tại `/booking-review/recurring/:id` trước khi thanh toán gộp cho toàn bộ chuỗi đặt sân.

---

## 3. Các vấn đề phát hiện (Issues Found)

### 🔴 [CRITICAL] Lỗi mức ưu tiên toán tử hiển thị sai hóa đơn tại `BookingReviewPage.tsx`
*   **Lớp ảnh hưởng**: Giao diện người dùng (`BookingReviewPage.tsx` L79)
*   **Mô tả**:
    Trong JavaScript/TypeScript, toán tử hiệu `-` có mức ưu tiên cao hơn (precedence 11) so với toán tử nullish coalescing `??` (precedence 3).
    Dòng mã tính toán giá trị tiền sân (chưa gồm add-on):
    `const fieldTotal = Math.max(booking?.total_price ?? 0 - addonTotal, 0);`
    bị trình dịch hiểu thành:
    `const fieldTotal = Math.max(booking?.total_price ?? (0 - addonTotal), 0);`
    Vì `booking.total_price` luôn luôn là một số hợp lệ (ví dụ: `200.000` VND), biểu thức luôn chọn `booking.total_price` làm giá trị trả về. Kết quả là giá trị **Tiền sân** hiển thị trên UI chính là **Tổng thanh toán** (đã cộng gộp Add-on), trong khi Add-on vẫn được liệt kê riêng ở dưới, tạo cảm giác người dùng bị tính tiền 2 lần hoặc sai lệch toán số.
*   **Minh chứng**:
    Nếu giá trị sân là `150.000` VND, add-on là `50.000` VND, tổng giá trị là `200.000` VND:
    *   Thực tế hiển thị: *Tiền sân = 200.000 VND*, *Add-on = 50.000 VND*, *Tổng = 200.000 VND* (Sai lệch logic cộng trừ).
*   **Cách khắc phục**:
    Đặt ngoặc bao quanh biểu thức nullish coalescing trước khi thực hiện phép trừ:
    ```typescript
    const fieldTotal = Math.max((booking?.total_price ?? 0) - addonTotal, 0);
    ```

---

### 🟡 [WARNING] Rủi ro lệch ngày trong tuần do lệch múi giờ (Timezone Discrepancy) tại `useBookingTimePricing.ts`
*   **Lớp ảnh hưởng**: Frontend React Hook (`useBookingTimePricing.ts` L57)
*   **Mô tả**:
    Bộ lọc luật giá (`availableRules`) dùng `date.getDay()` để lọc các cấu hình giá của ngày được chọn. Tuy nhiên, `date` được truyền vào là một đối tượng `Date` cục bộ của trình duyệt khách hàng (múi giờ local). Nếu người chơi ở múi giờ khác múi giờ Việt Nam (`Asia/Ho_Chi_Minh`, UTC+7) - ví dụ khách hàng nước ngoài đặt sân trước hoặc giả lập múi giờ khác - thì `date.getDay()` có thể trả về sai thứ trong tuần so với ngày thực tế tại Việt Nam.
    *Ví dụ*: Một trận đấu lúc 6:00 sáng Thứ Hai (UTC+7) tương ứng với 23:00 tối Chủ Nhật ở UTC. Nếu trình duyệt người dùng ở múi giờ UTC, `date.getDay()` trả về `0` (Chủ Nhật) thay vì `1` (Thứ Hai), dẫn đến hiển thị sai luật giá của ngày Thứ Hai.
*   **Minh chứng**:
    Trong `useBookingTimePricing.ts` dòng 57:
    `return (pricingRules || []).filter((rule) => rule.day_of_week === date.getDay())`
*   **Cách khắc phục**:
    Trong codebase frontend đã có file tiện ích múi giờ `apps/frontend/src/utils/time.util.ts`. Ta nên bổ sung hàm tiện ích `getVnZonedDate` vào file đó để quy đổi ngày về múi giờ Việt Nam:
    ```typescript
    /**
     * Chuyển đổi một ngày bất kỳ sang đối tượng Date thuộc múi giờ Việt Nam
     */
    export const getVnZonedDate = (date: Date | string | number): Date => {
      return toZonedTime(new Date(date), VN_TIMEZONE);
    };
    ```
    Sau đó, trong hook `useBookingTimePricing.ts`, import hàm này và thực hiện chuyển đổi ngày trước khi lấy thứ trong tuần (`getDay()`):
    ```typescript
    import { getVnZonedDate } from "@/utils/time.util";
    
    // Khi lọc rules:
    const zonedDate = getVnZonedDate(date);
    return (pricingRules || []).filter((rule) => rule.day_of_week === zonedDate.getDay());
    ```

---

### 🟡 [WARNING] Bất nhất cấu trúc dữ liệu Slot đặt sân định kỳ giữa trang Review và trang Lịch sử đặt sân
*   **Lớp ảnh hưởng**: Backend Service (`recurring_booking.service.ts`) $\rightarrow$ Frontend Types (`booking.types.ts`) $\rightarrow$ Components (`BookingDetailDialog.tsx`).
*   **Mô tả**:
    Đối tượng "Slot đặt sân" của đặt định kỳ được trả về với hai cấu trúc khác nhau tùy thuộc vào API endpoint:
    1.  **Trang xem lại thanh toán (Review)**: API trả về qua `reviewRecurringBookingService` có dạng:
        ```typescript
        slots: {
          id: string;
          startTime: string; // camelCase
          endTime: string;   // camelCase
          price: number;     // dùng tên field "price"
        }[]
        ```
    2.  **Trang danh sách / lịch sử đặt sân (History/Detail)**: API định dạng qua helper `formatRecurringBooking` có dạng:
        ```typescript
        bookings: {
          id: string;
          start_time: string; // snake_case
          end_time: string;   // snake_case
          total_price: number; // dùng tên field "total_price"
        }[]
        ```
    Sự bất nhất này dẫn đến việc định nghĩa giao diện TypeScript bị phân mảnh và tăng rủi ro lỗi hiển thị khi chuyển đổi dữ liệu.
*   **Minh chứng**:
    Xem tệp `apps/frontend/src/types/booking.types.ts` định nghĩa hai interface khác nhau cho cùng một loại thông tin slot sân:
    *   `RecurringBookingReviewResponse['slots']` (L119-124) dùng `startTime`, `endTime`, `price`.
    *   `RecurringBookingResponse['bookings']` (L86-94) dùng `start_time`, `end_time`, `total_price`.
*   **Cách khắc phục**:
    Nên đồng bộ định dạng dữ liệu của slots trong `reviewRecurringBookingService` ở backend để trả về đồng nhất cấu trúc snake_case:
    ```typescript
    slots: recurringBooking.bookings.map((b) => ({
      id: b.id,
      start_time: b.start_time,
      end_time: b.end_time,
      total_price: b.total_price,
    })),
    ```
    Và cập nhật loại kiểu tương ứng ở frontend.

---

### 🟡 [WARNING] Tên thuộc tính bất nhất giữa DTO gửi lên và Tên cột cơ sở dữ liệu
*   **Lớp ảnh hưởng**: Backend Schema Validation (`recurring_booking.schema.ts`) $\rightarrow$ Database Model (`RecurringBooking`).
*   **Mô tả**:
    Trường chu kỳ đặt lịch định kỳ được đặt tên là `recurring_type` trong schema xác thực đầu vào (`CreateRecurringBookingInput`), nhưng trong cơ sở dữ liệu Prisma thì cột tương ứng tên là `recurrence_type`.
    Mặc dù backend service đã xử lý map thủ công bằng cách gán `recurrence_type: data.recurring_type` lúc tạo bản ghi, việc lệch tên trường này tạo ra sự bối rối không đáng có cho lập trình viên và dễ phát sinh lỗi khi viết các bộ lọc lọc dữ liệu động ở frontend.
*   **Minh chứng**:
    *   Trong `schema.prisma`:
        `recurrence_type   RecurrenceType`
    *   Trong `recurring_booking.schema.ts`:
        `recurring_type: z.nativeEnum(RecurringBookingType)`
*   **Cách khắc phục**:
    Đổi tên thuộc tính đầu vào của Zod validation và frontend DTO thành `recurrence_type` để đồng nhất 100% tên biến trên toàn bộ hệ thống.

---

### ℹ️ [INFO] Thiếu xử lý ngoại lệ (Unhandled Promise Rejection) khi Hủy đặt sân tại `useBookingActions.ts`
*   **Lớp ảnh hưởng**: Frontend React Hook (`useBookingActions.ts` L26-49)
*   **Mô tả**:
    Hàm `handleCancel` thực hiện gọi API hủy đơn nhưng sử dụng hàm bắt lỗi cục bộ `.catch()` để ném tiếp ra lỗi mới (`throw new Error(...)`). Do hàm cha không bao quanh bằng block `try...catch` ở cấp độ xử lý sự kiện, điều này sẽ tạo unhandled rejection khi API gặp sự cố mạng hoặc phản hồi lỗi 500.
*   **Cách khắc phục**:
    Chuyển đổi logic hàm sang cấu trúc `try...catch` đầy đủ thay vì ném lỗi mồ côi qua `.catch()`.

---

### ℹ️ [INFO] Độ trễ kiểm tra tồn kho Addon thực tế (Static Stock Check Latency) tại `useBookingAddons.ts`
*   **Lớp ảnh hưởng**: Frontend React Hook (`useBookingAddons.ts` L49)
*   **Mô tả**:
    Hàm `updateAddonQuantity` khống chế số lượng tối đa chọn addon dựa theo `product.stock` tĩnh tải từ trước. Nếu có biến động tồn kho thực tế do người chơi khác mua hết trước lúc submit, ứng dụng sẽ chỉ phát hiện lỗi khi gửi API tạo booking thay vì thông báo sớm trên UI.
*   **Cách khắc phục**:
    Đảm bảo backend trả về mã lỗi rõ ràng cho lỗi Out-of-Stock để frontend hiển thị đúng thông tin lỗi cho người chơi thay vì thông báo lỗi chung chung.

---

### ℹ️ [INFO] Mất an toàn kiểu dữ liệu (Weak Typing) cho thực thể đặt sân phía Admin
*   **Lớp ảnh hưởng**: Admin State Store (`useAdminBookingStore.ts`) & Admin API Client (`admin.service.ts`).
*   **Mô tả**:
    Cửa hàng quản lý dữ liệu admin (`useAdminBookingStore`) khai báo mảng `bookings` kiểu `unknown[]` và gọi hàm `adminService.getBookings` trả về `ApiResponse<unknown>`. Do thiếu kiểu dữ liệu tường minh, tệp `AdminBookingsPage.tsx` buộc phải dùng các ép kiểu thủ công (`bookings as AdminBookingRow[]`), làm suy yếu khả năng kiểm soát tĩnh của TypeScript đối với dữ liệu từ API.
*   **Minh chứng**:
    *   Trong `useAdminBookingStore.ts`:
        `bookings: unknown[];` (L11)
    *   Trong `AdminBookingsPage.tsx`:
        `data={bookings as AdminBookingRow[]}` (L99)
*   **Cách khắc phục**:
    Khai báo kiểu dữ liệu trả về tường minh trong `admin.service.ts` và sử dụng kiểu `AdminBookingRow[]` hoặc `AdminRecurringRow[]` ngay trong `useAdminBookingStore.ts` thay vì `unknown[]`.

---

## 4. Bảng Theo dõi Trường Dữ liệu (Fields Trace Summary)

Bảng dưới đây theo dõi luồng thông tin của các thuộc tính cốt lõi trong nghiệp vụ đặt lịch đơn lẻ:

| Thuộc tính | Prisma Model | Service Layer | Controller (API Output) | Frontend Interface | Component (Giao diện) | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `start_time` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `end_time` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `total_price` | ✅ | ✅ | ✅ | ✅ | ⚠️ | **Lỗi toán tử hiển thị ở Review** |
| `status` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `expires_at` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `booking_addons` | ✅ | ✅ | ✅ | ✅ | ✅ | **OK** |
| `complex_name` | 🔗 (Relation) | ✅ (Flat) | ✅ | ✅ | ✅ | **OK** |
| `sub_field_name` | 🔗 (Relation) | ✅ (Flat) | ✅ | ✅ | ✅ | **OK** |

---

## 5. Khuyến nghị hành động (Recommendations)

1.  **Sửa ngay lập tức (Ưu tiên 1)**: Thêm dấu ngoặc đơn vào phép tính `fieldTotal` tại `apps/frontend/src/pages/player/booking/BookingReviewPage.tsx` dòng 79:
    `const fieldTotal = Math.max((booking?.total_price ?? 0) - addonTotal, 0);`
    để giải quyết triệt để lỗi hiển thị sai lệch hóa đơn thanh toán cho người dùng.
2.  **Chuẩn hóa múi giờ trong Hook (Ưu tiên 2)**: Thêm hàm tiện ích `getVnZonedDate` vào `time.util.ts` (sử dụng `toZonedTime` và `VN_TIMEZONE` có sẵn), sau đó import vào `useBookingTimePricing.ts` để chuẩn hóa đối tượng ngày `date` trước khi gọi `getDay()` lọc luật giá.
3.  **Tái cấu trúc API đặt lịch định kỳ (Ưu tiên 3)**: Chuyển cấu trúc trả về của thuộc tính `slots` trong `reviewRecurringBookingService` ở backend từ camelCase (`startTime`, `endTime`, `price`) sang snake_case (`start_time`, `end_time`, `total_price`) để đồng bộ với định dạng Booking chuẩn trên toàn hệ thống.
4.  **Đồng bộ tên biến (Ưu tiên 4)**: Sửa trường `recurring_type` của API request định kỳ thành `recurrence_type` để thống nhất với cột trong database.
5.  **Xử lý ngoại lệ an toàn (Ưu tiên 5)**: Bọc logic gọi API hủy trong block `try...catch` tường minh tại `useBookingActions.ts` để tránh Unhandled Promise Rejections.
6.  **Cải thiện Type-safety phía Admin (Ưu tiên 6)**: Cập nhật kiểu cho store và API quản trị đặt sân để loại bỏ hoàn toàn kiểu `unknown[]` và việc ép kiểu thủ công (`as AdminBookingRow[]`).

