# Báo cáo Phân tích Luồng Dữ liệu (Data Flow Analysis) — Nghiệp vụ Tạo, Quản lý và Tham gia Kèo (Match Making)

Báo cáo này được thực hiện dựa trên hướng dẫn của skill **Data Flow Checker**, phân tích luồng di chuyển, biến đổi và tính nhất quán của dữ liệu liên quan đến nghiệp vụ Tìm kèo, ghép đối giao hữu (Match & Match Participation) xuyên suốt từ lớp cơ sở dữ liệu lên đến giao diện người dùng.

---

## 1. Các lớp được phân tích (Layers Analyzed)

Báo cáo phân tích đầy đủ các tệp nguồn sau:
*   **Database (Prisma Schema)**: `apps/backend/prisma/schema.prisma` (Models: `Match`, `MatchParticipant`).
*   **Backend Validation (Zod Schemas)**: `apps/backend/src/validations/match.schema.ts`.
*   **Backend Service Layer**: `apps/backend/src/services/v1/match.service.ts`.
*   **Backend Controller Layer**: `apps/backend/src/controllers/v1/match.controller.ts`.
*   **Frontend Type Definitions**: `apps/frontend/src/types/match.type.ts`.
*   **Frontend API Client**: `apps/frontend/src/services/match.service.ts`.
*   **Frontend State Store (Zustand)**: `apps/frontend/src/store/useMatchStore.ts`.
*   **Frontend Player Hook**: `apps/frontend/src/hooks/player/useMyMatches.ts`.
*   **Frontend Pages & Components**:
    *   *Pages*: `MatchListPage.tsx`, `MatchDetailPage.tsx` (Public/Player pages).
    *   *Components*: `CreateMatchDialog.tsx`, `JoinMatchDialog.tsx`, `MatchCard.tsx`, `MatchCreatorPanel.tsx`, `MyMatchGridItem.tsx`, `MyMatchTypeTabs.tsx`, `MatchParticipantsAvatarGroup.tsx`.
*   **Socket & Notification Integration**:
    *   *Backend Socket*: `apps/backend/src/libs/socket.ts`.
    *   *Backend Notification Service*: `apps/backend/src/services/v1/notification.service.ts`.
    *   *Frontend Notification Store*: `apps/frontend/src/store/useNotificationStore.ts`.

---

## 2. Khái quát Luồng Dữ liệu (Pipeline Summary)

Nghiệp vụ Kèo giao hữu được xây dựng trên luồng tương tác thời gian thực giữa hai bên: **Chủ kèo (Creator)** và **Thành viên tham gia (Participant)**.

```
+--------------------+        POST /matches        +---------------------+
| CreateMatchDialog  | --------------------------> | match.service (BE)  |
| (Frontend Form)    |                             | - Validates booking |
+--------------------+                             | - Creates Match     |
                                                   +---------------------+
                                                              |
                                                              v
+--------------------+      POST /matches/:id/join  +---------------------+
|  JoinMatchDialog   | --------------------------> | joinMatch (BE)      |
| (Frontend Request) |                             | - Creates Member    |
|                    |                             | - Emits Socket Event|
+--------------------+                             +---------------------+
                                                              |
                                                              v
+--------------------+   PATCH /.../accept|reject   +---------------------+
| MatchCreatorPanel  | --------------------------> | approveMember (BE)  |
|  (Owner Approval)  |                             | - Updates Status    |
+--------------------+                             | - Emits Socket Event|
```

1.  **Khởi tạo Kèo (Match Creation)**:
    *   Player sở hữu lịch đặt sân thành công (status `CONFIRMED` or `COMPLETED`) có thể mở kèo ghép đối bằng cách nhấn nút tại trang Lịch sử đặt sân.
    *   Form `CreateMatchDialog.tsx` cho phép thiết lập Tiêu đề, Số lượng người cần thêm (`slots_needed`), Trình độ (`skill_level`), Hạn chót nhận đăng ký (`join_deadline`), và Mô tả.
    *   Gọi `POST /matches` qua client `createMatch`. Zod Schema kiểm tra tính hợp lệ của `booking_id` và các mốc thời gian. Bản ghi `Match` được lưu trữ với trạng thái mặc định là `OPEN`.
2.  **Danh sách & Xem chi tiết (Listing & Details)**:
    *   Dữ liệu danh sách công khai hiển thị trên `MatchListPage.tsx` thông qua `GET /public/matches` và lưu vào Redis Cache.
    *   Xem chi tiết một kèo (`MatchDetailPage.tsx`) sẽ gọi `GET /public/matches/:id` (hoặc `GET /matches/:id` nếu là Player đã đăng nhập). Route Player sẽ tự động truy vấn thêm trạng thái tham gia của riêng người đó (`my_participation_status`) để hiển thị các nút thao tác thích hợp (Hủy yêu cầu / Rời kèo).
3.  **Đăng ký & Rời kèo (Join & Leave Match)**:
    *   Người chơi nhấn "Tham gia" sẽ gửi một payload giới thiệu ngắn qua `POST /matches/:id/join`. Một bản ghi `MatchParticipant` được khởi tạo với trạng thái `PENDING`.
    *   Backend tự động gửi Socket notification tới tài khoản của chủ kèo thông qua room ID của socket.
    *   Người chơi có thể rút đơn bằng cách bấm "Rời kèo" (`DELETE /matches/:id/join`), bản ghi sẽ cập nhật trạng thái sang `WITHDRAWN`.
4.  **Duyệt & Quản lý (Approval)**:
    *   Chủ kèo truy cập vào trang chi tiết sẽ tải toàn bộ danh sách yêu cầu đăng ký (`GET /matches/:id/participants`).
    *   Chủ kèo có quyền Phê duyệt (`accept`) hoặc Từ chối (`reject`). Khi một người được nhận, `slots_filled` tăng thêm 1. Nếu `slots_filled >= slots_needed`, trạng thái của kèo tự động chuyển sang `FULL`.
    *   Hệ thống gửi tin nhắn thông báo cập nhật qua Socket về cho thành viên để kích hoạt sự kiện tự động load lại dữ liệu trên trang chi tiết của họ.

---

## 3. Các vấn đề phát hiện (Issues Found)

### 🔴 [CRITICAL] Lệch múi giờ trầm trọng khi tính toán Hạn đăng ký (`join_deadline`) mặc định trên frontend
*   **Lớp ảnh hưởng**: Frontend Component (`CreateMatchDialog.tsx` L68)
*   **Mô tả**:
    Khi khởi tạo form tạo kèo, mã nguồn tự động đề xuất một hạn chót đăng ký mặc định bằng cách lấy ngày bắt đầu trận đấu trừ đi 2 tiếng:
    ```typescript
    const startTime = new Date(booking.start_time);
    const deadlineDate = new Date(startTime.getTime() - 2 * 60 * 60 * 1000);
    defaultDeadline = deadlineDate.toISOString().slice(0, 16);
    ```
    Hàm `.toISOString()` trả về chuỗi thời gian chuẩn UTC. Do đó `slice(0, 16)` cắt ra một chuỗi không có đuôi múi giờ (Ví dụ: `2026-06-25T15:00`).
    *   Khi đưa chuỗi này vào thuộc tính `value` của thẻ `<input type="datetime-local">`, trình duyệt khách hàng hiển thị nó dưới dạng **giờ địa phương của người dùng**. Ví dụ, người chơi ở Việt Nam (UTC+7) sẽ nhìn thấy hiển thị là 15:00. Nhưng thực tế 15:00 UTC phải tương đương với **22:00 giờ Việt Nam**. Giao diện hiển thị sớm hơn mong muốn 7 tiếng!
    *   Nếu người chơi nhấn gửi mà không sửa đổi, dữ liệu gửi đi là `2026-06-25T15:00`. Khi đi qua hàm submit: `new Date(data.join_deadline).toISOString()`, Javascript parse chuỗi này dựa trên **múi giờ client** (ví dụ UTC+7), tạo ra một đối tượng Date mới có giá trị là `2026-06-25T08:00:00.000Z` (8:00 AM UTC, tức 15:00 PM Việt Nam).
    *   **Hậu quả**: Hạn chót đăng ký bị dịch chuyển sớm hơn 7 tiếng so với thực tế dự định của hệ thống.
*   **Cách khắc phục**:
    Định dạng ngày mặc định dựa trên giờ địa phương thực tế của đối tượng `Date` thay vì dùng hàm UTC `toISOString()`:
    ```typescript
    const year = deadlineDate.getFullYear();
    const month = String(deadlineDate.getMonth() + 1).padStart(2, "0");
    const day = String(deadlineDate.getDate()).padStart(2, "0");
    const hours = String(deadlineDate.getHours()).padStart(2, "0");
    const minutes = String(deadlineDate.getMinutes()).padStart(2, "0");
    defaultDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
    ```

---

### 🟡 [WARNING] Dữ liệu chi tiết kèo bị stale khi đồng bộ hóa trạng thái bằng Cron job
*   **Lớp ảnh hưởng**: Backend Service (`match.service.ts` L1587)
*   **Mô tả**:
    Hàm tự động quét định kỳ `syncMatchStatusesByTime` cập nhật các kèo quá hạn đăng ký sang `EXPIRED`, kèo có người tham gia sang `CLOSED`, hoặc kèo đã đá xong sang `COMPLETED` thông qua lệnh `updateMany` của Prisma.
    Ngay sau khi chạy xong, hàm gọi:
    ```typescript
    await invalidateMatchCaches();
    ```
    Hàm `invalidateMatchCaches()` khi không truyền tham số `matchId` sẽ chỉ thực hiện xóa cache danh sách kèo (`CACHE_KEYS.PATTERNS.MATCHES_LIST`).
    *   Các bản ghi cache chi tiết của từng kèo cụ thể (`match:${matchId}:detail`) được tạo bởi `getPublicMatchById` (TTL 5 phút) **hoàn toàn không bị xóa**.
    *   **Hậu quả**: Người dùng vào xem chi tiết một trận đấu đã quá hạn hoặc đã kết thúc vẫn có thể thấy trạng thái là `OPEN` hoặc hiển thị nút "Tham gia" trong tối đa 5 phút tiếp theo, gây ra trải nghiệm lỗi hoặc các API request lỗi vô ích (do database đã cập nhật trạng thái thực tế).
*   **Cách khắc phục**:
    Trước khi thực hiện `updateMany`, hãy query danh sách các Match ID sắp sửa bị cập nhật trạng thái, tiến hành update và lặp qua các ID đó để xóa cache chi tiết tương ứng:
    ```typescript
    const matchesToUpdate = await prisma.match.findMany({
      where: {
        status: { in: [MatchStatus.OPEN, MatchStatus.FULL] },
        // ... các điều kiện thời gian tương ứng ...
      },
      select: { id: true }
    });
    
    // Thực hiện logic updateMany ...
    
    // Invalidate cache chi tiết cho từng ID
    for (const item of matchesToUpdate) {
      await invalidateMatchCaches(item.id);
    }
    ```

---

### 🟡 [WARNING] Logic phân trang trả về sai `total_items` trong `getMyMatches` của Backend Service
*   **Lớp ảnh hưởng**: Backend Service (`match.service.ts` L934)
*   **Mô tả**:
    Hàm `getMyMatches` trả về danh sách các kèo liên quan đến một người chơi (do họ tạo, đã tham gia, hoặc đang chờ phê duyệt).
    Đoạn code tính toán biến `total` phục vụ phân trang như sau:
    ```typescript
    const total =
      query.type === "created"
        ? createdCount
        : query.type === "joined"
          ? joinedCount
          : pendingCount;
    ```
    *   Trong trường hợp tham số `query.type` không được truyền vào (hoặc là chuỗi không hợp lệ), do validate router mặc định gán hoặc do gọi trực tiếp từ tầng service, biến `where` tìm kiếm sẽ rỗng (lấy toàn bộ các kèo của cả 3 nhóm).
    *   Tuy nhiên, do biểu thức điều kiện trên chỉ check `"created"` và `"joined"`, biến `total` sẽ mặc định rơi vào nhánh else và lấy giá trị `pendingCount`.
    *   **Hậu quả**: Phân trang hiển thị trên UI bị lỗi do số lượng bản ghi thực tế trả về là tổng của cả 3 loại, nhưng tổng số lượng trang và số lượng bản ghi báo về frontend chỉ tương đương với số bản ghi đang ở trạng thái `PENDING`.
*   **Cách khắc phục**:
    Tính toán thêm giá trị tổng số bản ghi phù hợp với biến `where` thực tế khi `query.type` không tồn tại:
    ```typescript
    let total = pendingCount;
    if (query.type === "created") {
      total = createdCount;
    } else if (query.type === "joined") {
      total = joinedCount;
    } else if (!query.type) {
      total = await prisma.match.count({ where });
    }
    ```

---

### 🔵 [INFO] Mất mát dữ liệu `participants_preview` khiến frontend luôn hiển thị avatar giả
*   **Lớp ảnh hưởng**: API Contract / Service Mapper (`match.service.ts` BE & FE)
*   **Mô tả**:
    Trang danh sách kèo (`MatchCard`) và trang chi tiết kèo hiển thị số lượng người đã tham gia kèm theo các avatar nhỏ của họ (sử dụng trường `participants_preview` trong type `Match` ở frontend).
    *   Tại backend, query `matchListSelect` và `matchDetailSelect` hoàn toàn không select quan hệ `participants` để giảm tải dữ liệu. Hàm mapper `mapMatchListItem` cũng bỏ qua trường này.
    *   Do API không bao giờ trả về danh sách người chơi, frontend map luôn gán mảng này bằng rỗng (`[]`).
    *   Vì mảng rỗng, component `MatchParticipantsAvatarGroup.tsx` bắt buộc phải tự động sinh ra các avatar giả lập "Người chơi 1", "Người chơi 2",... dựa vào số lượng `slots_filled` để lấp đầy giao diện.
    *   **Ý nghĩa**: Đây không phải lỗi crash hệ thống mà là một điểm tối ưu hóa quá mức gây mất tính năng hiển thị ảnh đại diện thật của người chơi.
*   **Cách khắc phục**:
    Nếu muốn hiển thị avatar thật, hãy cập nhật `matchDetailSelect` tại backend để chọn quan hệ `participants` (giới hạn lấy tối đa 4-5 người chơi đã được duyệt `ACCEPTED`), sau đó bổ sung mapping cho mảng `participants_preview` tại backend mapper.

---

## 4. Bảng Theo dõi Trường Dữ liệu (Fields Trace Summary)

| Trường (Field) | Prisma (DB) | Service (BE) | Controller | Frontend Type | Component | Trạng thái (Status) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `booking_id` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `slots_needed` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `slots_filled` | ✅ | ✅ | ✅ | ✅ | ✅ | OK |
| `join_deadline` | ✅ | ✅ | ✅ | ✅ | 🔴 Lệch múi giờ | ⚠️ Cần chuẩn hóa format |
| `status` | ✅ | ✅ | ✅ | ✅ | 🟡 Cache stale | ⚠️ Stale trên Cron |
| `participants_preview`| ❌ Không có | ❌ Bị bỏ qua | ❌ Không có | ✅ Khai báo | 🔵 Hiển thị avatar ảo | ⚠️ Thiếu dữ liệu thật |

---

## 5. Khuyến nghị và Giải pháp (Recommendations)

1.  **Sửa lỗi múi giờ `join_deadline` (Ưu tiên 1 - Thực hiện ngay)**:
    Sửa đổi hàm khởi tạo giá trị mặc định của `join_deadline` tại `CreateMatchDialog.tsx` để tạo chuỗi định dạng local ISO cho input `datetime-local` thay vì sử dụng hàm UTC `.toISOString().slice(0, 16)`.
2.  **Sửa lỗi Stale Cache ở Cron Job (Ưu tiên 2)**:
    Cập nhật logic `syncMatchStatusesByTime` trong backend service để query lấy danh sách ID các Match thay đổi trạng thái và invalidate cache chi tiết của chúng.
3.  **Sửa logic tính tổng phân trang `getMyMatches` (Ưu tiên 3)**:
    Sửa điều kiện gán biến `total` ở service `getMyMatches` để bảo toàn tính nhất quán khi tham số `type` không được gửi lên.
4.  **Cân nhắc bổ sung `participants_preview` (Ưu tiên 4)**:
    Bổ sung một select limit nhỏ các participant có status `ACCEPTED` kèm avatar của họ tại backend `matchDetailSelect` để hiển thị avatar thực tế trên trang chi tiết kèo thay vì chỉ hiển thị avatar giả lập.
