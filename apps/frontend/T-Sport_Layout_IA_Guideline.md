# T-Sport — Layout & Information Architecture Refactor Guide
> Cấp độ: Layout · Spacing · Visual Hierarchy · IA · Production Quality
> Phiên bản 2.0 | Tailwind CSS + shadcn/ui

---

## PHẦN 1 — ĐÁNH GIÁ TỔNG THỂ LAYOUT HIỆN TẠI

### 1.1 Chẩn đoán nhanh — Tại sao trông như "demo"?

Nhìn tổng thể 14 trang, có 5 hội chứng đặc trưng của prototype chưa đạt production:

**Hội chứng 1 — "Island Layout"**
Mỗi section nằm biệt lập trong card trắng, không có sự kết nối thị giác giữa các phần. Trang không có nhịp điệu — mắt người dùng bị "nhảy cóc" từ block này sang block khác mà không có luồng dẫn dắt tự nhiên.

**Hội chứng 2 — Density Inconsistency**
Một số trang quá thưa (trang booking review chỉ có 1 card ở giữa, 70% blank space), một số trang quá dày (Chi tiết kèo, Quản lý kèo có quá nhiều section chồng chất). Không có quy chuẩn density nhất quán.

**Hội chứng 3 — Hierarchy Collapse**
Tất cả text gần như cùng kích thước. Page title, section title, card title, label — tất cả visual weight gần bằng nhau. Mắt không biết đọc gì trước.

**Hội chứng 4 — Width Anarchy**
Container width không nhất quán. Trang booking review dùng card ~600px, trang tìm sân dùng full width, trang lịch sử dùng max ~1200px. Người dùng cảm giác đang dùng nhiều ứng dụng khác nhau.

**Hội chứng 5 — Action Orphan**
CTA chính (Đặt sân ngay, Tham gia kèo, Xác nhận) đặt không đúng vị trí trong luồng đọc. User phải scroll để tìm button, thay vì button luôn nằm trong tầm mắt.

---

### 1.2 Bảng đánh giá chi tiết

| Tiêu chí | Vấn đề cốt lõi | Mức độ |
|---|---|---|
| **Container consistency** | 4–5 giá trị max-width khác nhau trên 14 trang | 🔴 Nghiêm trọng |
| **Section spacing** | Khoảng cách giữa section không đồng đều (24px–80px) | 🔴 Nghiêm trọng |
| **Typography hierarchy** | ≤ 3 distinct visual weight trong toàn trang | 🔴 Nghiêm trọng |
| **Sidebar usage** | Sidebar (Tóm tắt đơn) không sticky → mất context khi scroll | 🟡 Quan trọng |
| **Content density** | Dao động từ quá thưa (booking review) đến quá dày (chi tiết kèo) | 🟡 Quan trọng |
| **Grid alignment** | Card grid không đồng đều chiều cao, column count inconsistent | 🟡 Quan trọng |
| **Navigation context** | Breadcrumb thiếu trên nhiều trang nested | 🟡 Quan trọng |
| **Empty space usage** | Blank space không có mục đích, không tạo breathing room | 🟠 Trung bình |
| **Mobile breakpoint** | Layout chưa có responsive consideration | 🟠 Trung bình |

---

## PHẦN 2 — PHÂN TÍCH THEO TỪNG LOẠI TRANG

### 2.1 Trang Chủ (Homepage)

**Vấn đề layout:**

```
HIỆN TẠI — Cấu trúc:
[Hero fullwidth — ảnh blur + text + search] ✓ Tốt
[Section: Khám phá theo môn — 5 card icon] ← Card quá nhỏ, padding lớn → trông trống
[Section: Sân đang trống — 4 cột grid]    ← Title "Sân đang trống" quá sát edge
[Section: Khu phức hợp nổi bật — 4 cột]  ← Không có header context đủ mạnh
[Section: Quy trình đặt sân — 3 bước]    ← Layout 3 icon + text quá sơ sài
[Section: CTA — "Sẵn sàng ra sân?"]      ← OK nhưng padding trên/dưới quá lớn
[Footer]
```

**Vấn đề cụ thể:**
- Section "Khám phá theo môn" — 5 item icon dàn ngang không tận dụng được horizontal space, item quá nhỏ so với chiều rộng trang
- Section title như "Sân đang trống" thiếu section-level CTA ("Xem tất cả") nằm đúng vị trí, không có sub-description đủ ngắn/súc tích
- Giữa các section: khoảng cách không nhất quán — đôi khi 40px, đôi khi 80px → không có nhịp
- Section "Quy trình 3 bước" trông như placeholder — số icon, text description quá ngắn, không có visual treatment đủ mạnh
- Sport icon (cầu lông, bóng rổ...) chỉ là emoji/icon nhỏ, không có hover state rõ ràng → UX feedback kém

**Luồng mắt (Visual Flow):**
- F-pattern hiện tại bị phá vỡ tại section "Khám phá theo môn" — eye movement nhảy không tự nhiên từ search bar xuống 5 icon ngang

---

### 2.2 Trang Tìm Sân

**Vấn đề layout:**

```
HIỆN TẠI:
[Page Title "Tìm kiếm sân thể thao" — left aligned]
[Search bar fullwidth + dropdown "Tất cả môn" + button "Lọc"]
[Tab: Khu phức hợp (19) | Sân lẻ (82)]
[Grid 4 cột — card list]
[Pagination]
```

**Vấn đề cụ thể:**
- **Thiếu sidebar filter hoàn toàn.** Filter chỉ có search + 1 dropdown inline → không đủ power. Các marketplace thật (Airbnb, Grab,...) đều có sidebar filter hoặc filter panel phía trên với nhiều dimension
- Tab "Khu phức hợp | Sân lẻ" đặt dưới search bar quá sát → không đủ visual separation, trông như afterthought
- Grid 4 cột: ở viewport 1280px, 4 cột khiến mỗi card hơi chật (≈ 250px). 3 cột ở desktop sẽ cho card nhiều không gian hơn và tăng visual quality
- Không có result count rõ ràng và sort option đủ nổi bật ("Sắp xếp theo: Giá / Đánh giá / Gần nhất")
- Page title "Tìm kiếm sân thể thao" quá generic — cần hero search context hoặc breadcrumb context rõ hơn

---

### 2.3 Chi Tiết Sân Con (Subfield Detail)

**Vấn đề layout:**

```
HIỆN TẠI:
[Hero image fullwidth ~500px height]
[Badge + Title + Location — dưới hero, left aligned]
[Review section — list dạng flat]

[Sidebar — float right]:
  [Giá + Button "Đặt sân ngay"]
  [Rating]
  [Thông tin: Sức chứa, Giờ hoạt động]
  [Bảng giá theo ngày — tab T2...T7/CN]
```

**Vấn đề cụ thể:**
- **Sidebar KHÔNG sticky.** Đây là vấn đề UX nghiêm trọng nhất — khi user scroll xuống đọc review, button "Đặt sân ngay" biến mất khỏi viewport. Trên Airbnb, Booking.com, sidebar luôn sticky với price + CTA
- Hero image cao quá (tràn viewport trên 1080p) → mất toàn bộ "above the fold" cho content thực sự
- Tab giá theo ngày (CN/T2/.../T7) có 7 tabs trên 1 row — trên viewport nhỏ hơn bị overflow không xử lý
- Review section phía dưới là flat list, không có rating summary (distribution chart), không có filter đủ nổi bật
- Thiếu section: **"Sân liên quan"** hoặc **"Các sân khác trong cùng khu phức hợp"** — cross-sell/upsell opportunity quan trọng

---

### 2.4 Chi Tiết Khu Phức Hợp (Complex Detail)

**Vấn đề layout:**

```
HIỆN TẠI:
[← Quay lại]
[Complex Title + Address]
[Section: "Các Sân Có Sẵn"]
[Filter search sân con]
[Grid 2 cột — card sân con]
```

**Vấn đề cụ thể:**
- **Trang này thiếu "identity" của complex hoàn toàn.** Không có hero image, không có rating tổng, không có description — chỉ jump thẳng vào list sân. Người dùng không có context về complex đang xem
- Không có map location hoặc địa chỉ clickable
- Không có thông tin operating hours, facilities (bãi đỗ xe, phòng thay đồ, căn tin...)
- Grid 2 cột với card nhỏ — quá nhiều whitespace bên phải khi chỉ có 2 sân

**Thiếu section quan trọng:**
- Complex hero (ảnh + tên + rating + địa chỉ + operating hours)
- Complex amenities/facilities
- Reviews tổng cho complex
- Map embed hoặc link Google Maps

---

### 2.5 Luồng Đặt Sân — 3 Bước

**Bước 1 — Chọn lịch:**
```
HIỆN TẠI:
[Step indicator 1→2→3]
[2 cột: Left=Calendar+slots | Right=Summary sidebar + Reviews]
```

**Vấn đề:**
- Left panel và Right panel (Summary sidebar) chia 65/35 — tỷ lệ này ổn, nhưng sidebar không sticky
- Time slot grid: 30-minute slots dàn ngang theo dạng chip — đọc theo hàng rất khó scan. Ở viewport 1280px, 6 slots/hàng khá OK nhưng thiếu visual grouping theo khung giờ (sáng/chiều/tối)
- Pricing table trong left panel (Bảng giá hôm nay) đặt dưới date picker — tốt về logic, nhưng visual hierarchy của section này quá flat (màu nền xanh nhạt không tạo đủ emphasis)
- "Đặt một lần / Đặt định kỳ" toggle: 2 option button sát nhau, không clear về visual difference khi selected

**Bước 2 — Add-on:**
```
HIỆN TẠI:
[Step indicator]
[Left: List add-on items với +/- quantity]
[Right: Summary sidebar (giống bước 1)]
```

**Vấn đề:**
- Add-on item list: image thumbnail + name + price + quantity control là đúng pattern. Nhưng image thumbnail đang là icon placeholder chưa đẹp
- Chưa có subtotal update realtime khi thay đổi quantity trong sidebar
- "Quay lại" button quá nhỏ và đặt không nổi bật — primary action là "Tiếp tục", secondary là "Quay lại" → cần size/position differentiation rõ hơn

**Bước 3 — Xác nhận:**
```
HIỆN TẠI:
[Step indicator (cả 3 đều có checkmark/active)]
[Left: Confirmation info table (label-value pairs)]
[Right: Summary sidebar + Reviews]
```

**Vấn đề:**
- Confirmation step chỉ có 4 rows thông tin (Sân, Hình thức, Ngày, Khung giờ) trong 1 table — quá ít content, quá nhiều whitespace
- "Xác nhận và tiếp tục thanh toán" button: đặt dưới table OK, nhưng button full-width trong panel 65% → quá rộng

---

### 2.6 Trang Booking Review (Xác nhận thanh toán)

**Vấn đề layout — NGHIÊM TRỌNG nhất:**

```
HIỆN TẠI:
[Centered card ~600px wide]
  [← Quay lại]
  [Title: "Xác nhận đặt sân"]
  [Complex name + address block]
  [Booking details — 2 cột: Sân / Thời gian / Ngày / Hạn thanh toán]
  [Chi tiết add-on]
  [Price summary]
  [2 buttons: Quay lại | Thanh toán ngay]
```

**Vấn đề:**
- Trang này quá narrow (≈600px) so với toàn bộ viewport — 40% content, 60% grey background → trông như modal/overlay chứ không phải một trang hoàn chỉnh
- Thiếu trust signals hoàn toàn: không có "Thanh toán an toàn", không có SSL badge, không có payment method icons
- "Hạn thanh toán: 15:29 20/04/2026" màu cam — đây là urgency signal quan trọng nhưng bị bury trong grid 2 cột, người dùng dễ bỏ qua
- Tổng thanh toán hiển thị sai: "Tiền sân: 117.500đ" + "Add-on: 35.000đ" nhưng "Tổng thanh toán: 117.500đ" — số sai hoặc display logic sai, đây là bug UX nghiêm trọng
- Không có confirmation checkbox ("Tôi đã đọc và đồng ý với điều khoản")

---

### 2.7 Trang Kèo Đấu (Match Discovery)

**Vấn đề layout:**

```
HIỆN TẠI:
[Hero section — gradient bg với stat cards]
  [Badges: Match Discovery | Danh sách realtime]
  [Title: "Kèo đấu sôi động mỗi ngày"]
  [Description]
  [Step chips: 1. Chọn bộ lọc → 2. Xem kèo → 3. Tham gia]
  [3 stat cards: Tổng kèo | Đang mở | Kèo sắp full]
  [Info chips: "3 chỗ trống đang chờ bạn" | "Realtime update"]
[Filter section]
[Card list — 1 cột (?)]
```

**Vấn đề:**
- Hero section quá "busy" — chứa quá nhiều element (badges, title, description, step chips, stat cards, info chips) trong 1 hero block
- Stat cards (Tổng kèo: 1 / Đang mở: 1 / Kèo sắp full: 0) với số "1" và "0" trông như loading state — cần design cho trường hợp số nhỏ
- Filter section sau hero: filter bar dạng inline (text input + 2 dropdowns + 2 buttons) — quá nhiều element trên 1 hàng, cần grouping rõ hơn
- Kèo card list: chỉ 1 cột (~320px wide) trong content area 1200px → 73% wasted space. Nên là grid 3 cột ở desktop
- Thiếu: "Tạo kèo mới" CTA nổi bật trên trang này

---

### 2.8 Chi Tiết Kèo

**Vấn đề layout:**

```
HIỆN TẠI:
[Hero card fullwidth — gradient bg]
  [Badges: môn + trạng thái]
  [Title (to)]
  [Description]
  [2 cột: BẮT ĐẦU | HẠN THAM GIA]
  [ĐỊA ĐIỂM]
  [Countdown]
  [Sidebar: Creator + Participants]

[3 stat cards: Đã chấp nhận | Đang chờ duyệt | Chỗ trống]
[Thông tin trận đấu section]    ← Sidebar: Hành động + Thông tin sân
[Quản lý kèo section]           ← Full width
[Danh sách thành viên table]    ← Full width
```

**Vấn đề:**
- Layout phức tạp nhất site — nhưng đang dùng layout "stacked sections" thay vì master-detail layout phù hợp
- Hero section: sidebar (Creator + Participants) nằm trong hero → sau khi scroll qua hero, context về creator bị mất
- 3 stat cards dưới hero: chiều cao không đều, font size không nhất quán
- "Hành động của bạn" sidebar nằm phía phải nhưng chỉ chứa 1 info box nhỏ → waste 30% width
- Table thành viên: cột "Hành động" có 3 buttons (Chờ duyệt / Từ chối / Chấp nhận) trong 1 ô — quá chật, khó click
- Trang không có clear "back to list" context — breadcrumb chỉ là "← Quay lại danh sách kèo" flat link

---

### 2.9 Kèo Của Tôi (My Matches)

**Vấn đề layout:**

```
HIỆN TẠI:
[Page title + "Xem tất cả kèo" button]
[Tabs: Kèo tôi tạo (4) | Kèo đã vào (...) | Đang chờ duyệt (...)]
[Filter: dropdown "Tất cả trạng thái"]
[Grid 3 cột — kèo cards]
[Pagination]
```

**Vấn đề:**
- "Xem tất cả kèo" button ở top-right nhưng cùng level với page title → không clear về context (link đến đâu?)
- Tab badges: "Kèo tôi tạo 4" badge number ổn, nhưng "Kèo đã vào (...)" với "..." trông như loading/error
- Grid 3 cột: khi có 4 item (3+1), item thứ 4 nằm ở hàng dưới bên trái — tạo ra visual imbalance lớn
- Kèo card: top border color (xanh/cam/đỏ) là differentiation tốt nhưng thiếu label giải thích ý nghĩa màu
- Không có "Tạo kèo mới" CTA button nổi bật — đây là action chính của trang này

---

### 2.10 Lịch Sử Đặt Sân

**Vấn đề layout:**

```
HIỆN TẠI:
[Page title + description]
[3 stat cards: Chờ thanh toán | Đã xác nhận | Có thể hủy]
[Info text: "Hiển thị 8 booking..."]
[Table: STT | Loại | Sân | Thời gian | Giá tiền | Trạng thái | Actions]
[Pagination]
```

**Vấn đề:**
- Stat cards phía trên table là improvement tốt (đã có ở version mới) — nhưng thiếu clickable filter (click "Đã xác nhận" → filter table)
- Table: column "Loại" chứa badge "Đặt một lần" màu xanh link trên mọi row → redundant và gây confusion (trông như link)
- Column "Sân" chứa 2 dòng text (Complex name + subfield) không đủ min-width → text bị truncate trên viewport nhỏ
- "..." action button ở cuối mỗi row không clear về options — cần tooltip hoặc inline reveal
- Pagination "Trang 1/3" dạng text → cần proper pagination component
- Thiếu: date range filter, search by venue

---

### 2.11 Trang Liên Hệ

**Vấn đề layout:**

```
HIỆN TẠI:
[Page hero: badge + Title + description]
[2 cột 50/50:
  Left: Thông tin liên hệ card + FAQ card
  Right: Form "Gửi tin nhắn"
]
```

**Đây là trang layout ổn nhất trong hệ thống.** Vẫn có thể improve:
- FAQ section: 4 Q&A items có content thật → đây là điểm mạnh nhưng dùng flat card (accordion) chưa tối ưu — nên dùng Accordion component của shadcn
- Form: field "Chủ đề" là text input free-form → nên là dropdown (Đặt sân / Thanh toán / Kỹ thuật / Khác) để categorize ticket tốt hơn
- Trang này thiếu mobile phone number clickable (`href="tel:..."`)

---

### 2.12 Về Chúng Tôi

**Vấn đề layout:**

```
HIỆN TẠI:
[Hero fullwidth blue — title + subtitle]
[Section: "Kết nối đam mê" — 2 cột: text left / image right]
[Section: "Con số ấn tượng" — 4 stat cards]
[Section: "Nguyên tắc định hướng" — 3 cards]
[Section: "Tham gia cùng chúng tôi" — CTA fullwidth blue]
```

**Vấn đề:**
- Hero: blue gradient ổn, nhưng không có visual element (ảnh, pattern, illustration) — trông như landing page template
- Section "Câu chuyện của chúng tôi": ảnh đội Real Madrid rõ ràng là placeholder/copyright issue — cần replace
- Stat cards: 4 cột với số lớn OK, nhưng thiếu microinteraction (count-up animation khi vào viewport)
- "Nguyên tắc định hướng": 3 cards với icon nhỏ + title + description — padding card quá lớn so với content → trống
- CTA section cuối: button "Tìm sân ngay" màu vàng không khớp với brand primary blue

---

## PHẦN 3 — ĐỀ XUẤT LAYOUT CHUẨN PRODUCTION

### 3.1 Trang Chủ — Wireframe đề xuất

```
┌─────────────────────────────────────────────────────────┐
│ HERO — fullwidth, min-height: 520px                      │
│  Background: ảnh thể thao chất lượng + dark overlay 50%  │
│  Center content:                                          │
│    [Eyebrow: "Nền tảng #1 Việt Nam"]                     │
│    [H1: 2 dòng, max 56px]                                │
│    [Subtitle: 1 dòng, text-lg, opacity-80]               │
│    [Search bar: 720px wide, pill shape, elevated shadow]  │
│    [Sport chips dưới search: Cầu lông · Bóng đá · ...]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ SPORT CATEGORY — bg: surface-2, py-16                    │
│  Container 1280px                                         │
│  Title "Khám phá theo môn" — center                      │
│  5 card lớn hơn: icon 48px + label + số sân              │
│  Hover: scale-105 + shadow                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ AVAILABLE COURTS — bg: white, py-16                      │
│  Container 1280px                                         │
│  Header row: [Title + subtitle] ————————— [Xem tất cả →]│
│  Grid 3 cột (không phải 4), gap-6, card với aspect-ratio │
│  Pagination hoặc "Xem thêm" button                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FEATURED COMPLEXES — bg: surface-2, py-16                │
│  Container 1280px                                         │
│  Horizontal scroll cards (4 visible, arrow nav)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ HOW IT WORKS — bg: white, py-16                          │
│  3 bước: icon lớn (64px) + số + title + description     │
│  Arrow connector giữa các bước                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CTA BANNER — bg: primary gradient, py-20                 │
│  [H2 centered, text-white]                               │
│  [2 buttons: "Đặt sân ngay" (white) | "Tìm kèo" (ghost)]│
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 Trang Tìm Sân — Wireframe đề xuất

```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER — bg: surface-2, py-8                        │
│  Container 1280px                                         │
│  [Search bar fullwidth + môn dropdown + Tìm kiếm button] │
│  [Result tabs: Khu phức hợp (19) | Sân lẻ (82)]         │
└─────────────────────────────────────────────────────────┘

┌──────────┬──────────────────────────────────────────────┐
│ SIDEBAR  │ MAIN CONTENT                                  │
│ 280px    │ flex-1                                        │
│          │                                               │
│ [Filter  │ [Sort bar: "19 khu phức hợp" + dropdown Sort]│
│  Panel]  │                                               │
│ • Môn    │ [Grid 3 cột, gap-5]                          │
│ • Quận   │  [Card][Card][Card]                           │
│ • Giá    │  [Card][Card][Card]                           │
│ • Rating │  ...                                          │
│ • Tiện   │                                               │
│   ích    │ [Pagination]                                  │
│          │                                               │
│ [Áp dụng]│                                               │
└──────────┴──────────────────────────────────────────────┘
```

**Tailwind implementation:**
```tsx
<div className="max-w-screen-xl mx-auto px-6 py-8">
  <div className="flex gap-8">
    {/* Sidebar */}
    <aside className="w-72 shrink-0 self-start sticky top-24">
      <FilterPanel />
    </aside>
    {/* Main */}
    <main className="flex-1 min-w-0">
      <SortBar />
      <div className="grid grid-cols-3 gap-5 mt-5">
        {courts.map(c => <CourtCard key={c.id} {...c} />)}
      </div>
      <Pagination className="mt-8" />
    </main>
  </div>
</div>
```

---

### 3.3 Chi Tiết Sân Con — Wireframe đề xuất

```
┌─────────────────────────────────────────────────────────┐
│ HERO IMAGE — aspect-ratio 21/9, max-height: 480px        │
│  Image gallery (1 main + 4 thumbnails) hoặc single img  │
│  [← Quay lại] overlay top-left                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────┐
│ MAIN CONTENT — flex-1            │ STICKY SIDEBAR — 380px│
│                                  │  position: sticky     │
│ [Sport badge + Title H1]         │  top: 88px            │
│ [Location + Rating inline]       │                       │
│ [Divider]                        │  [Giá từ + unit]      │
│                                  │  [Button "Đặt ngay"]  │
│ [Section: Thông tin sân]         │  ─────────────────    │
│  Grid 2x2: Sức chứa/Giờ hoạt    │  [Rating stars]       │
│  động/Môn/...                    │  [Sức chứa + Giờ]     │
│                                  │  ─────────────────    │
│ [Section: Bảng giá]              │  [Bảng giá tab]       │
│  (di chuyển vào sidebar)         │   CN T2 T3 T4 T5 T6 T7│
│                                  │  [Price table]        │
│ [Divider]                        │                       │
│                                  │                       │
│ [Section: Đánh giá — 7 đánh giá]│                       │
│  [Rating summary: 3.6 ★ + bar]  │                       │
│  [Filter: Sao / Ảnh / Mới nhất] │                       │
│  [Review cards]                  │                       │
│  [Pagination]                    │                       │
│                                  │                       │
│ [Section: Sân liên quan]         │                       │
└──────────────────────────────────┴──────────────────────┘
```

---

### 3.4 Chi Tiết Khu Phức Hợp — Wireframe đề xuất

```
┌─────────────────────────────────────────────────────────┐
│ COMPLEX HERO — fullwidth                                 │
│  Image gallery (3 ảnh: 1 large left + 2 stacked right)  │
│  Overlay bottom: Badge địa chỉ                           │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────┐
│ MAIN INFO                        │ SIDEBAR               │
│                                  │                       │
│ [Complex Title H1]               │ [Giờ hoạt động]      │
│ [Rating + số đánh giá]           │ [Địa chỉ + Map link] │
│ [Address]                        │ [Amenities icons]    │
│ [Description paragraph]          │ [Contact]            │
│                                  │                       │
│ [Tab: Sân có sẵn | Đánh giá]    │                       │
│                                  │                       │
│ [Search sân con]                 │                       │
│ [Grid 2-3 cột sân con cards]     │                       │
└──────────────────────────────────┴──────────────────────┘
```

---

### 3.5 Luồng Đặt Sân — Layout chuẩn

```
┌─────────────────────────────────────────────────────────┐
│ PAGE HEADER (không scroll)                               │
│  [← Tên sân] ──────────────────── [Badge sport type]    │
│  [Step indicator: ●Chọn lịch ──── ○Add-on ──── ○Xác nhận]│
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────┐
│ MAIN STEP CONTENT — flex-1       │ STICKY SIDEBAR — 360px│
│                                  │                       │
│ BƯỚC 1: Chọn lịch                │ [Tóm tắt đơn]        │
│  [Toggle: Một lần | Định kỳ]    │  Hình thức: ...       │
│  [Date picker]                   │  Sân: ...             │
│  [Time slot grid]                │  Ngày: ...            │
│   Grouping: Sáng | Chiều | Tối  │  Giờ: ...             │
│  [Pricing table]                 │  ─────────────────    │
│  [Giờ bắt đầu + Giờ kết thúc]  │  Tiền sân: ...đ       │
│                                  │  Add-on:   ...đ       │
│ BƯỚC 2: Add-on                   │  ─────────────────    │
│  [List items với quantity]       │  TỔNG: ...đ           │
│                                  │                       │
│ BƯỚC 3: Xác nhận                 │ [Đánh giá nổi bật]   │
│  [Confirmation info]             │  (collapsed)          │
│                                  │                       │
│ [← Quay lại] ──── [Tiếp tục →]  │                       │
└──────────────────────────────────┴──────────────────────┘
```

---

### 3.6 Trang Booking Review — Layout chuẩn

```
Vấn đề hiện tại: card quá hẹp (600px) giữa trang lớn
Giải pháp: Max-width 760px nhưng thêm context sidebar

┌──────────────────────────────────┬──────────────────────┐
│ BOOKING CONFIRMATION — 580px     │ TRUST SIDEBAR — 240px │
│                                  │                       │
│ [Title "Xác nhận đặt sân"]       │ [🔒 Thanh toán bảo  │
│ [Complex + address card]         │    mật SSL]           │
│                                  │ [✓ Hoàn tiền 100%   │
│ [Booking details grid]           │    nếu hủy đúng hạn] │
│  Sân / Ngày / Giờ                │ [📞 Hotline hỗ trợ] │
│  [⚠ Hạn TT: prominent]          │                       │
│                                  │ [Cần giúp đỡ?]       │
│ [Add-on section — nếu có]        │  0862 821 861         │
│                                  │                       │
│ [Price summary]                  │                       │
│  Tiền sân: ...                   │                       │
│  Add-on: ...                     │                       │
│  ─────────────                   │                       │
│  TỔNG: ... (to, primary color)   │                       │
│                                  │                       │
│ [Checkbox: Đồng ý điều khoản]    │                       │
│ [Button: "Thanh toán ngay" full] │                       │
│ [Link: ← Quay lại]               │                       │
└──────────────────────────────────┴──────────────────────┘
```

---

### 3.7 Chi Tiết Kèo — Layout chuẩn

```
┌─────────────────────────────────────────────────────────┐
│ MATCH HERO — Condensed, không fullwidth                  │
│  [← Quay lại danh sách kèo]                             │
│  [Sport badge + Status badge]    ← top, compact          │
│  [Title H1 — 40px]                                       │
│  [Description — muted]                                   │
│  [Info grid 2x2: Bắt đầu / Hạn tham gia / Địa điểm/--] │
│  [Countdown bar — prominent]                             │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────┬──────────────────────┐
│ MAIN CONTENT                     │ ACTION SIDEBAR — 320px│
│                                  │  (sticky)             │
│ [3 stat chips: Accepted/Pending/ │                       │
│  Available — inline horizontal]  │ [Progress: N/4]       │
│                                  │ [Tham gia kèo button] │
│ [Section: Thông tin trận đấu]    │ ─────────────────     │
│                                  │ [Creator info]        │
│ [Section: Người tham gia]        │ [Participants list]   │
│  Progress bar                    │ ─────────────────     │
│  Avatar stack                    │ [Thông tin sân]       │
│                                  │  Complex name         │
│ [Section: Quản lý kèo]           │  Subfield             │
│  (chỉ hiện với creator)          │  Địa chỉ             │
│  Action buttons: Đóng/Mở/Hủy    │  Booking ID           │
│  Member table                    │                       │
└──────────────────────────────────┴──────────────────────┘
```

---

## PHẦN 4 — QUY CHUẨN LAYOUT & SPACING

### 4.1 Container System

```tsx
// Chỉ dùng 3 container width, không sáng tạo thêm:

// Standard pages (tìm sân, lịch sử, kèo đấu...)
<div className="max-w-screen-xl mx-auto px-6">  // 1280px + 48px padding

// Narrow pages (booking review, auth pages)  
<div className="max-w-2xl mx-auto px-6">         // 672px

// Full-bleed sections (hero, CTA banner)
<div className="w-full">                          // 100%
  <div className="max-w-screen-xl mx-auto px-6"> // content inside

// KHÔNG dùng max-w-7xl, max-w-6xl, max-w-4xl, max-w-3xl tùy tiện
// Chỉ: max-w-screen-xl (1280px) | max-w-2xl (672px) | full
```

### 4.2 Grid System — 12 Columns

```tsx
// Desktop (≥1280px):
// - Sidebar layout: [280px sidebar] + [flex-1 main]
// - Card grid: 3 cột (trang tìm sân, homepage)
// - Card grid: 4 cột (chỉ dùng khi card nhỏ: sport icons)
// - 2-column: 50/50 hoặc 60/40 (trang Liên hệ, Về chúng tôi)

// Tablet (768px–1279px):
// - Card grid: 2 cột
// - Sidebar collapse vào filter panel/drawer

// Mobile (<768px):
// - Card grid: 1 cột
// - Sidebar: bottom sheet/drawer

// Implementation:
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

// Gap chuẩn:
// Card grid: gap-5 (20px)
// Section content: gap-6 (24px) hoặc gap-8 (32px)
// Form fields: space-y-4 (16px)
// Inline elements: gap-2 (8px) hoặc gap-3 (12px)
```

### 4.3 Spacing Scale — Áp dụng nhất quán

```
// VERTICAL SPACING (section to section):
Section gap (major):  py-16 (64px) — giữa các section lớn trang chủ
Section gap (minor):  py-12 (48px) — giữa content trong trang detail
Content gap:          py-8 (32px)  — giữa subsections
Element gap:          py-4 (16px)  — giữa items trong section

// HORIZONTAL SPACING (padding trong elements):
Card padding:         p-5 (20px) — tất cả card
Card tight:           p-4 (16px) — compact card (list view)
Section padding-x:    px-6 (24px) — container standard

// SPACING RULES:
// - Spacing trong cùng 1 nhóm: nhỏ (8-12px)
// - Spacing giữa 2 nhóm: lớn hơn (24-32px)  
// - Spacing giữa sections: lớn nhất (48-64px)
// → Nguyên tắc: "Những thứ liên quan thì gần nhau"

// KHÔNG dùng: p-3, p-7, p-9, p-11 (odd spacing)
// KHÔNG dùng: mt-5, mb-7 tùy tiện
// CHỈ dùng: bội số của 4: p-1(4px) p-2(8px) p-3(12px) p-4(16px) 
//           p-5(20px) p-6(24px) p-8(32px) p-10(40px) p-12(48px) p-16(64px)
```

### 4.4 Sidebar Pattern — Sticky Implementation

```tsx
// Áp dụng cho: Chi tiết sân, Đặt sân (tất cả bước), Chi tiết kèo

<div className="max-w-screen-xl mx-auto px-6 py-8">
  <div className="flex gap-8 items-start">
    
    {/* Main content */}
    <main className="flex-1 min-w-0 space-y-6">
      {/* content */}
    </main>

    {/* Sticky sidebar */}
    <aside className="w-96 shrink-0 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
      <div className="rounded-xl border bg-white shadow-card p-5 space-y-4">
        {/* sidebar content */}
      </div>
    </aside>

  </div>
</div>

// Sidebar width guide:
// Chi tiết sân: w-96 (384px)
// Đặt sân — tóm tắt đơn: w-80 (320px)  
// Chi tiết kèo: w-80 (320px)
// Booking review trust sidebar: w-60 (240px)
```

### 4.5 Page Structure Template

```tsx
// Mọi trang dùng structure này:

export default function PageName() {
  return (
    <>
      {/* Optional: Page hero / header section — fullbleed */}
      <section className="bg-surface-2 border-b">
        <div className="max-w-screen-xl mx-auto px-6 py-8">
          <PageHeader />  {/* breadcrumb + title + description */}
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <PageContent />
      </main>
    </>
  )
}

// PageHeader pattern:
<div className="space-y-1">
  <Breadcrumb />  {/* Trang chủ > Tìm sân > ... */}
  <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
  <p className="text-muted-foreground text-sm">Sub description</p>
</div>
```

### 4.6 Breadcrumb — Áp dụng nhất quán

```tsx
// Tất cả trang level 2+ phải có breadcrumb:
// Trang chủ > Tìm sân
// Trang chủ > Tìm sân > Victory Sports Center EQ3
// Trang chủ > Tìm sân > Victory Sports Center EQ3 > Sân 1 (Pickleball)
// Trang chủ > Tìm sân > Victory Sports Center EQ3 > Sân 1 > Đặt sân

// Thay thế "← Quay lại" bằng breadcrumb đầy đủ
// "← Quay lại" chỉ dùng như shortcut bên cạnh breadcrumb trên mobile

import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
```

---

## PHẦN 5 — NGUYÊN TẮC THIẾT KẾ PRODUCTION QUALITY

### 5.1 Visual Hierarchy — 5 Cấp độ

```
Cấp 1 — Page Hero / Title: font-black, text-4xl-5xl, line-height-tight
Cấp 2 — Section Title:     font-bold, text-2xl, tracking-tight
Cấp 3 — Card Title:        font-semibold, text-base-lg
Cấp 4 — Body text:         font-normal, text-sm, text-foreground
Cấp 5 — Caption/Meta:      font-normal, text-xs, text-muted-foreground

// Rule: Mỗi trang có DUY NHẤT 1 Cấp 1, 2-4 Cấp 2, nhiều Cấp 3-5
// KHÔNG được: 2 cấp 1 trên cùng 1 trang
// KHÔNG được: section title và card title cùng cỡ chữ
```

### 5.2 Scanability Rules

```
1. F-Pattern cho trang listing (tìm sân, lịch sử):
   - Thông tin quan trọng nhất ở cột trái và dòng đầu
   - Price/Status luôn ở consistent position (right/bottom)

2. Z-Pattern cho trang landing/marketing (trang chủ, about):
   - Eye trace: top-left → top-right → bottom-left → bottom-right

3. Single Column cho trang form/checkout:
   - Booking review, confirmation: 1 cột dọc, không chia 2 cột
   - User đọc từ trên xuống dưới, không bị distract

4. Card scanning rules:
   - Ảnh: luôn ở top
   - Title: bold, 1-2 dòng, line-clamp
   - Meta info: icon + text, muted color
   - Price: luôn nổi bật, primary color hoặc bold
   - CTA: luôn ở bottom-right của card
```

### 5.3 Consistency Rules

```
1. Tất cả card trong cùng 1 grid PHẢI cùng height → dùng h-full + flex-col
2. Tất cả status badge dùng 1 component StatusBadge với variant prop
3. Tất cả price display dùng 1 format: "340.000 đ/h" (space, không gạch)  
4. Tất cả date display dùng 1 format: "29/04/2026" hoặc "Thứ Tư, 29/04"
5. Tất cả empty state dùng 1 EmptyState component
6. Tất cả loading dùng Skeleton component, không để blank
7. Navigation active state: font-semibold + primary color (không chỉ underline)
8. Icon size: 16px (w-4 h-4) cho inline, 20px (w-5 h-5) cho button, 24px (w-6 h-6) cho feature
```

### 5.4 Density Guidelines

```
// TRANG LISTING (tìm sân, kèo đấu, lịch sử):
→ Medium density: đủ info để scan + decide, không quá chi tiết
→ Card: ảnh + tên + 2-3 meta info + price + 1-2 actions

// TRANG DETAIL (chi tiết sân, chi tiết kèo):
→ High density: full info, grouped vào sections
→ Sidebar: key actions + summary luôn visible

// TRANG CHECKOUT (đặt sân, booking review):  
→ Low density: focus vào 1 task, ít distraction
→ Clear primary action, minimal secondary content

// TRANG DASHBOARD (kèo của tôi, lịch sử):
→ Medium-high density: scannable table/cards với filter
→ Summary stats ở top, detail list bên dưới
```

---

## PHẦN 6 — CHECKLIST REFACTOR

### Phase 1 — Foundation (Làm trước, ảnh hưởng toàn site)

- [ ] **Container**: Chuẩn hóa `max-w-screen-xl mx-auto px-6` cho tất cả trang listing/detail
- [ ] **Container narrow**: `max-w-2xl mx-auto px-6` cho booking review, auth pages
- [ ] **Section spacing**: Chuẩn hóa `py-16` (major) / `py-12` (minor) / `py-8` (micro) giữa các section
- [ ] **Card height**: Thêm `h-full flex flex-col` vào tất cả card components; content `flex-1`; actions `mt-auto`
- [ ] **Breadcrumb**: Thêm breadcrumb navigation vào tất cả trang level 2+
- [ ] **Sticky sidebar**: Implement `sticky top-24` cho sidebar trên: chi tiết sân, đặt sân (3 bước), chi tiết kèo

### Phase 2 — Page Structure (Refactor từng trang)

- [ ] **Trang chủ**: Sửa sport category cards (lớn hơn), fix grid thành 3 cột, thêm arrow connector bước quy trình
- [ ] **Tìm sân**: Thêm filter sidebar bên trái, chuyển grid 4→3 cột, thêm sort bar
- [ ] **Chi tiết sân**: Hero image max-height 480px, make sidebar sticky, thêm rating summary distribution, thêm "Sân liên quan" section
- [ ] **Chi tiết complex**: Thêm hero section (ảnh + tên + rating + mô tả), thêm amenities, thêm map
- [ ] **Đặt sân bước 1**: Group time slots theo Sáng/Chiều/Tối, make summary sidebar sticky
- [ ] **Đặt sân bước 3**: Expand confirmation info (thêm thông tin sân đầy đủ), thu hẹp button width
- [ ] **Booking review**: Expand layout thêm trust sidebar, sửa tổng tiền (logic bug), thêm checkbox ToS
- [ ] **Kèo đấu**: Chuyển card list từ 1 cột → 3 cột grid, thêm "Tạo kèo" CTA nổi bật
- [ ] **Chi tiết kèo**: Chuyển sang master-detail layout, consolidate stat cards thành inline chips
- [ ] **Kèo của tôi**: Thêm "Tạo kèo mới" button, sửa tab badge "(...)" → số thực
- [ ] **Lịch sử đặt sân**: Làm stat cards clickable (filter table), sửa column "Loại" không dùng link color
- [ ] **Liên hệ**: Chuyển FAQ sang Accordion component, sửa field "Chủ đề" thành dropdown
- [ ] **Về chúng tôi**: Thêm count-up animation cho stat numbers, thay ảnh Real Madrid, fix CTA button color

### Phase 3 — Micro-improvements (Sau khi structure ổn)

- [ ] **Time slot grouping**: Thêm label "Sáng / Chiều / Tối" vào slot grid bước 1
- [ ] **Filter sidebar**: Thêm clear filters button, active filter count badge
- [ ] **Table rows**: Thêm `hover:bg-surface-2` cho tất cả table rows
- [ ] **Pagination**: Dùng Pagination component nhất quán (không dùng plain text "Trang 1/3")
- [ ] **Action menus**: Thay "..." button bằng DropdownMenu với options rõ ràng
- [ ] **Form validation**: Thêm inline error messages dưới mỗi field
- [ ] **Loading states**: Thêm Skeleton cho tất cả data-fetching sections
- [ ] **Empty states**: Thêm EmptyState component cho tất cả list/grid có thể rỗng
- [ ] **Responsiveness**: Test và fix breakpoints 768px và 1024px

### Phase 4 — Polish (Nâng cấp lên SaaS level)

- [ ] **Sidebar filter persistence**: Lưu filter state khi navigate back
- [ ] **Real-time summary**: Update price summary realtime khi chọn slot/add-on
- [ ] **Urgency signals**: Countdown timer trong booking review styled rõ (màu đỏ, bold)
- [ ] **Trust signals**: Thêm security badges vào booking review
- [ ] **Smart defaults**: Trang đặt sân pre-fill ngày = hôm nay
- [ ] **Keyboard navigation**: Tab order hợp lý trong forms
- [ ] **Toast confirmations**: Sonner toast sau mọi action thành công

---

## PHẦN 7 — COMPONENT LAYOUT PATTERNS

### Pattern A — List Page (Tìm sân, Kèo đấu)

```tsx
// Structure chuẩn cho mọi trang listing:
<PageLayout>
  <PageHeader title="..." description="..." actions={<CreateButton />} />
  
  <div className="flex gap-8">
    <FilterSidebar className="w-72 sticky top-24 self-start" />
    
    <div className="flex-1 min-w-0">
      <SortBar count={19} sortOptions={[...]} />
      <div className="grid grid-cols-3 gap-5 mt-5">
        {items.map(item => <ItemCard key={item.id} {...item} />)}
      </div>
      <Pagination className="mt-8" />
    </div>
  </div>
</PageLayout>
```

### Pattern B — Detail Page (Chi tiết sân, Chi tiết kèo)

```tsx
// Structure chuẩn cho mọi trang detail:
<PageLayout>
  <HeroSection />  {/* fullbleed, image */}
  
  <div className="max-w-screen-xl mx-auto px-6 py-8">
    <div className="flex gap-8 items-start">
      
      <main className="flex-1 min-w-0 space-y-8">
        <TitleSection />
        <InfoSection />
        <DetailSection />
        <ReviewSection />
        <RelatedSection />
      </main>
      
      <aside className="w-96 shrink-0 sticky top-24">
        <ActionCard />  {/* price + CTA */}
        <InfoCard />    {/* additional info */}
      </aside>
      
    </div>
  </div>
</PageLayout>
```

### Pattern C — Multi-step Form (Đặt sân)

```tsx
// Structure chuẩn cho form nhiều bước:
<div className="max-w-screen-xl mx-auto px-6 py-6">
  
  <StepHeader />  {/* Tên sân + step indicator */}
  
  <div className="flex gap-8 items-start mt-6">
    
    <main className="flex-1 min-w-0">
      <div className="bg-white rounded-xl border shadow-card p-6">
        <StepContent />  {/* Nội dung từng bước */}
        <StepActions />  {/* Quay lại + Tiếp tục */}
      </div>
    </main>
    
    <aside className="w-80 shrink-0 sticky top-24 space-y-4">
      <OrderSummaryCard />
      <ReviewsCard />  {/* collapsed by default */}
    </aside>
    
  </div>
</div>
```

### Pattern D — Dashboard Page (Kèo của tôi, Lịch sử)

```tsx
// Structure chuẩn cho trang dashboard/management:
<PageLayout>
  <div className="flex items-center justify-between mb-6">
    <PageTitle />
    <PrimaryAction />  {/* Tạo kèo mới, ... */}
  </div>
  
  <StatCards />  {/* 3-4 summary stats, clickable để filter */}
  
  <div className="mt-6 bg-white rounded-xl border shadow-card">
    <div className="p-4 border-b flex items-center justify-between">
      <Tabs />
      <FilterDropdown />
    </div>
    
    <DataTable />  {/* hoặc CardGrid */}
    
    <div className="p-4 border-t flex items-center justify-between">
      <ResultCount />
      <Pagination />
    </div>
  </div>
</PageLayout>
```

---

*T-Sport Layout & IA Guide v2.0 — Tạo bởi Claude, Anthropic | 20/04/2026*
*Áp dụng với: React + TailwindCSS + shadcn/ui*
