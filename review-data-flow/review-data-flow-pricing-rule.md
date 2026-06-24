# Báo cáo Phân tích Luồng Dữ liệu (Data Flow Analysis) — Nghiệp vụ Quản lý Bảng giá & Tính giá Đặt sân (Pricing Rule & Booking Price Calculation)

Báo cáo này được thực hiện dựa trên hướng dẫn của skill **Data Flow Checker**, phân tích luồng di chuyển, biến đổi và tính nhất quán của dữ liệu liên quan đến nghiệp vụ cấu hình bảng giá giờ hoạt động của chủ sân và tính toán chi tiết giá tiền đặt sân của người chơi xuyên suốt từ lớp cơ sở dữ liệu lên đến giao diện người dùng.

---

## 1. Các lớp được phân tích (Layers Analyzed)

Báo cáo phân tích đầy đủ các tệp nguồn sau:
*   **Database (Prisma Schema)**: `apps/backend/prisma/schema.prisma` (Models: `PricingRule`, `Booking`, `RecurringBooking`).
*   **Backend Validation & Helpers**:
    *   `apps/backend/src/validations/pricing_rule.schema.ts`
    *   `apps/backend/src/helpers/pricing.helper.ts`
    *   `apps/backend/src/helpers/time.helper.ts`
*   **Backend Service Layer**:
    *   `apps/backend/src/services/v1/pricing_rule.service.ts`
    *   `apps/backend/src/services/v1/booking.service.ts` (Hàm `createBooking` và `updateBooking`)
    *   `apps/backend/src/services/v1/recurring_booking.service.ts` (Hàm `createRecurringBooking`)
*   **Frontend Type Definitions**: `apps/frontend/src/types/index.ts` (Interface: `PricingRule`).
*   **Frontend API Client & State Store**:
    *   `apps/frontend/src/services/owner.service.ts`
    *   `apps/frontend/src/store/owner/usePricingStore.ts`
*   **Frontend Hooks & Pages**:
    *   *Hooks*: `useBookingTimePricing.ts`, `useTimelineSegments.ts`, `usePricingColumns.tsx`
    *   *Pages/Components*:
        *   `SubFieldDetailPage.tsx` (Dashboard quản trị sân con của chủ sân)
        *   `SubFieldPricingConsole.tsx`, `PricingConsoleHeader.tsx`, `CopyPricingDropdown.tsx`, `PricingRuleFormDialog.tsx`, `SubFieldTimelineHeatmap.tsx`
        *   `BookingPage.tsx` (Trang đặt lịch của player)
        *   `BookingScheduleStep.tsx`, `SubFieldPricingTabs.tsx`, `TimeSlotsGrid.tsx`

---

## 2. Khái quát Luồng Dữ liệu (Pipeline Summary)

Nghiệp vụ cấu hình bảng giá và tính giá đặt sân hoạt động theo mô hình khép kín: Chủ sân cấu hình khung giờ và đơn giá $\rightarrow$ Người chơi xem bảng giá, chọn giờ $\rightarrow$ Giao diện tính nháp giá hiển thị tạm thời $\rightarrow$ Hệ thống tính chính xác và lưu vào DB khi đặt sân thành công.

Sơ đồ luồng di chuyển dữ liệu:

```
[CHỦ SÂN CẤU HÌNH GIÁ]
1. Giao diện (PricingRuleFormDialog) nhập: days[], start_time, end_time, base_price
2. API (POST /pricing-rules) -> Gửi payload lên Backend
3. Backend validate định dạng HH:mm, parse về UTC Date 1970-01-01 -> Check overlap -> Lưu DB.
4. Xóa Cache (Redis) của Subfield + Pricing rules.

[NGƯỜI CHƠI XEM & ĐẶT SÂN]
1. Người chơi chọn ngày trên Lịch (date: Date)
2. Frontend fetch bảng giá qua API: /pricing-rules?sub_field_id=X&day_of_week=Y
3. Hook useBookingTimePricing lọc rules theo date.getDay() -> Tạo timeOptions và tính nháp giá tạm thời.
4. Người chơi nhấn đặt sân -> POST /bookings (Single) hoặc /bookings/recurring (Recurring).
5. Backend gọi helper fetchAndCalculatePrice:
   a. Xác định thứ trong tuần theo múi giờ VN (getVietnamDayOfWeek).
   b. Lấy các PricingRules từ DB.
   c. Map khoảng giờ đặt sân của khách (startTime -> endTime) vào các PricingRules tương ứng (bước 30 phút).
   d. Cộng tổng tiền và trả về kết quả lưu vào bản ghi Booking.
```

---

## 3. Các vấn đề phát hiện (Issues Found)

### 🔴 [CRITICAL] Múi giờ không đồng bộ ở giao diện (Timezone inconsistency in date.getDay() causing pricing and UI mismatch)
*   **Lớp ảnh hưởng**: Giao diện & Hooks Frontend (`useBookingTimePricing.ts`, `SubFieldPricingTabs.tsx`, `BookingScheduleStep.tsx`, `CopyPricingDropdown.tsx`, `PricingConsoleHeader.tsx`, `SubFieldPricingConsole.tsx`)
*   **Mô tả**:
    Tất cả các tệp phía frontend hiện đang gọi hàm mặc định `.getDay()` trên đối tượng JS Date của trình duyệt (chứa múi giờ địa phương của máy khách).
    *   **Khi chủ sân cấu hình giá**: Nếu chủ sân ở múi giờ khác Việt Nam tải dashboard cấu hình giá, `new Date().getDay()` sẽ trả về thứ của múi giờ máy khách. Điều này dẫn tới việc dashboard hiển thị hoặc thay đổi sai ngày cấu hình so với mong muốn.
    *   **Khi người chơi đặt sân**: Ví dụ, người chơi chọn ngày Thứ Tư, ngày 24/06/2026 05:00 UTC (tức 12:00 trưa Thứ Tư ở Việt Nam). Nếu trình duyệt của người chơi ở múi giờ Pacific Time (PDT, UTC-7), thời gian địa phương lúc đó là 22:00 Thứ Ba, ngày 23/06/2026. Lúc này `date.getDay()` trả về `2` (Thứ Ba).
    *   **Hậu quả**:
        *   Frontend lọc và hiển thị bảng giá và khung giờ của **Thứ Ba**.
        *   Người chơi chọn giờ, thấy giá nháp tính theo bảng giá Thứ Ba.
        *   Khi gửi yêu cầu đặt sân lên Backend, Backend nhận thời gian UTC, parse sang giờ Việt Nam thành 12:00 Thứ Tư, lấy bảng giá **Thứ Tư** để tính giá thực tế và validate.
        *   Nếu bảng giá Thứ Ba và Thứ Tư khác nhau, sẽ xảy ra **mismatch (lệch giá)** giữa màn hình xem và lúc thanh toán, hoặc hệ thống báo lỗi không tìm thấy khung giờ hoạt động hợp lệ do Thứ Tư sân không mở cửa giống Thứ Ba.
*   **Bằng chứng (Evidence)**:
    *   `useBookingTimePricing.ts` dòng 57:
        ```typescript
        .filter((rule) => rule.day_of_week === date.getDay())
        ```
    *   `SubFieldPricingTabs.tsx` dòng 65:
        ```typescript
        setActivePricingDay(String(selectedDate.getDay()));
        ```
    *   `CopyPricingDropdown.tsx` dòng 29:
        ```typescript
        const currentDayOfWeek = date.getDay();
        ```
    *   `SubFieldPricingConsole.tsx` dòng 60:
        ```typescript
        fetchPricingRules(subfieldId, date.getDay());
        ```
*   **Cách khắc phục**:
    Thêm helper `getVietnamDayOfWeek(date: Date): number` vào frontend `time.util.ts` bằng cách sử dụng `toZonedTime` của thư viện `date-fns-tz` (đã được cài đặt và import ở đầu file `time.util.ts`):
    ```typescript
    export const getVietnamDayOfWeek = (date: Date): number => {
      const zonedDate = toZonedTime(date, VN_TIMEZONE);
      return zonedDate.getDay();
    };
    ```
    Thay thế toàn bộ các lời gọi `date.getDay()` liên quan đến tính toán/lọc pricing rule hoặc lấy ngày bằng `getVietnamDayOfWeek(date)`.

---

### 🟡 [WARNING] Bất đồng bộ trong gán State ban đầu khi `timeOptions` thay đổi trong `useBookingTimePricing.ts`
*   **Lớp ảnh hưởng**: Frontend Hook (`useBookingTimePricing.ts` L114-145)
*   **Mô tả**:
    Trong `useBookingTimePricing.ts`, khi danh sách `timeOptions` thay đổi (chẳng hạn khi người chơi chuyển từ ngày này sang ngày khác có khung giờ hoạt động khác biệt), `useEffect` tự động gán lại giờ bắt đầu và kết thúc mặc định.
    Tuy nhiên:
    *   Hàm check `timeOptions.includes(prev)` chỉ kiểm tra xem giá trị cũ có nằm trong danh sách giờ mới không. Nếu không, nó tự động fallback về `timeOptions[0]` cho start time và `timeOptions[1]` cho end time.
    *   Vấn đề phát sinh khi một ngày cụ thể chỉ có duy nhất 1 khung giờ kéo dài 30 phút (ví dụ 17:30 - 18:00), lúc đó `timeOptions` chỉ có 2 phần tử `["17:30", "18:00"]`. Nếu người chơi chọn start time là `"17:30"`, end time sẽ tự động fallback về `timeOptions[1]` tức là `"18:00"`. Tuy nhiên, nếu ngày đó không có khung giờ nào hợp lệ hoặc cấu hình giờ bị gián đoạn, việc gán cứng `timeOptions[0]` và `timeOptions[1]` có thể chọn phải các mốc giờ không liên tục hoặc không thuộc cùng một pricing rule, dẫn đến breakdown trả về `null` và chặn người dùng bấm tiếp tục đặt sân mà không có cảnh báo rõ ràng.
    *   Ngoài ra, biến state `hasAppliedInitial` khóa cứng khởi tạo ban đầu (chỉ cho phép gán `initialStartTime` một lần duy nhất khi mount). Khi người dùng thay đổi ngày, `hasAppliedInitial` vẫn là `true`, làm mất đi khả năng áp dụng lại `initialStartTime/EndTime` từ URL query params nếu có.
*   **Bằng chứng (Evidence)**:
    *   `useBookingTimePricing.ts` L131-138:
        ```typescript
        setCustomStartTimeState((prev) =>
          prev && timeOptions.includes(prev) ? prev : timeOptions[0],
        );

        setCustomEndTimeState((prev) => {
          if (prev && timeOptions.includes(prev)) return prev;
          return timeOptions[1];
        });
        ```
*   **Cách khắc phục**:
    *   Khi gán giá trị mặc định, nên tìm cặp start - end liền kề thuộc cùng một Pricing Rule có sẵn thay vì chỉ lấy bừa 2 phần tử đầu tiên của mảng `timeOptions`.
    *   Nên reset hoặc cập nhật lại `hasAppliedInitial` khi `date` thay đổi hoặc khi subfield thay đổi để đảm bảo nếu URL params thay đổi, hook vẫn nhận diện được.

---

### 🟢 [INFO] Kiểu dữ liệu `base_price` bất nhất giữa cơ sở dữ liệu và Frontend
*   **Lớp ảnh hưởng**: Prisma Schema $\rightarrow$ Frontend Types & Components
*   **Mô tả**:
    Trường `base_price` trong DB được lưu dạng `Decimal` (`@db.Decimal(10, 2)`). Khi trả về qua JSON API, Prisma chuyển đổi kiểu Decimal thành chuỗi hoặc số, phụ thuộc vào cấu hình parser. Phía frontend, kiểu dữ liệu `PricingRule` định nghĩa `base_price: number`.
    Do đó, một số component frontend phòng hờ việc nhận về string đã bọc thêm hàm ép kiểu `Number(rule.base_price)`, trong khi một số khác sử dụng trực tiếp trường này dưới dạng số mà không ép kiểu. Điều này có thể dẫn tới lỗi hiển thị (ví dụ `.toLocaleString` bị crash nếu nhận vào một chuỗi string thay vì number).
*   **Bằng chứng (Evidence)**:
    *   Prisma Schema L278: `base_price   Decimal  @db.Decimal(10, 2)`
    *   Frontend `types/index.ts` L119: `base_price: number;`
    *   Frontend `SubFieldPricingConsole.tsx` L161: `const aPrice = Number(a.base_price);`
    *   Frontend `SubfieldPricingTabs.tsx` L199: `const rulePrice = Number(rule.base_price);`
    *   Frontend `BookingScheduleStep.tsx` L225: `Number(rule.base_price).toLocaleString("vi-VN")`
    *   Frontend `usePricingColumns.tsx` L121: `const price = Number(rule.base_price);`
*   **Cách khắc phục**:
    Chuyển đổi kiểu `base_price` sang kiểu số (`number`) ngay tại tầng API client (`owner.service.ts` và `public.service.ts` bằng cách map kết quả trả về), hoặc giữ nguyên việc ép kiểu phòng thủ `Number(...)` đồng bộ ở mọi component tiêu dùng.

---

## 4. Tóm tắt vết di chuyển của các trường chính (Fields Trace Summary)

| Trường (Field) | Prisma Model | Backend Service | API Response | Frontend Type | Component/Hook | Trạng thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `sub_field_id` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `day_of_week` | ✅ | ✅ | ✅ | ✅ | ⚠️ | **CẢNH BÁO (Sai lệch múi giờ ở Client)** |
| `start_time` | ✅ | ✅ (Date) | ✅ (ISO String) | ✅ | ✅ | OK (Đã có `formatTime` chuẩn hóa) |
| `end_time` | ✅ | ✅ (Date) | ✅ (ISO String) | ✅ | ✅ | OK (Đã có `formatTime` chuẩn hóa) |
| `base_price` | ✅ (Decimal) | ✅ (Decimal) | ✅ (String/Num) | ✅ (number) | ✅ | OK (Cần ép kiểu đồng nhất) |

---

## 5. Đề xuất cải tiến (Recommendations)

1.  **[Ưu tiên Cao nhất] Fix lỗi múi giờ**: Định nghĩa helper `getVietnamDayOfWeek` trong `apps/frontend/src/utils/time.util.ts` và thay thế toàn bộ lời gọi `.getDay()` trên frontend. Đây là sửa đổi cực kỳ quan trọng để đảm bảo tính nhất quán dữ liệu hiển thị giá cả giữa chủ sân và người chơi trên các múi giờ khác nhau.
2.  **[Ưu tiên Trung bình] Đồng bộ hóa kiểu dữ liệu Price**: Cấu hình Axios Interceptor hoặc hàm API Service map qua kết quả để tự động ép kiểu `base_price` từ API về `number` thuần túy, loại bỏ các dòng `Number(...)` rác tại các component.
3.  **[Ưu tiên Thấp] Cải tiến gán mặc định giờ đặt**: Sửa đổi `useBookingTimePricing.ts` để thông minh hơn trong việc chọn slot mặc định khi đổi ngày (chọn slot trống thực tế đầu tiên).
